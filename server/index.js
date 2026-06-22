import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import deepseekQuizHandler from '../api/deepseek-generate-quiz.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexFile = path.join(distDir, 'index.html');

const port = Number.parseInt(process.env.PORT || '8080', 10);
const host = '0.0.0.0';
const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '96kb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const rateLimitBuckets = new Map();
const aiRateLimitWindowMs = Number.parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || '600000', 10);
const aiRateLimitMax = Number.parseInt(process.env.AI_RATE_LIMIT_MAX || '8', 10);

function aiRateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const current = rateLimitBuckets.get(key);

  if (!current || now >= current.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + aiRateLimitWindowMs });
    return next();
  }

  if (current.count >= aiRateLimitMax) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      error: 'AI request limit reached. Please try again later.'
    });
  }

  current.count += 1;
  return next();
}

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (now >= bucket.resetAt) rateLimitBuckets.delete(key);
  }
}, Math.max(aiRateLimitWindowMs, 60000));
cleanupTimer.unref();

app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'hanclass',
    realtime: true,
    timestamp: new Date().toISOString()
  });
});

app.all('/api/deepseek-generate-quiz', aiRateLimit, deepseekQuizHandler);
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

app.use('/assets', express.static(path.join(distDir, 'assets'), {
  immutable: true,
  maxAge: '1y'
}));
app.use(express.static(distDir, {
  etag: true,
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

// React SPA fallback: direct visits such as /tools/pinyinwheel still load the app.
app.use((req, res, next) => {
  if (req.method !== 'GET' || !req.accepts('html')) return next();
  return res.sendFile(indexFile);
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

const io = new SocketIOServer(server, {
  cors: { origin: false },
  transports: ['websocket', 'polling']
});

const roomCodePattern = /^[A-Z0-9-]{3,32}$/;

function normalizeRoomCode(value) {
  const code = String(value || '').trim().toUpperCase();
  return roomCodePattern.test(code) ? code : null;
}

function emitRoomPresence(roomCode) {
  const count = io.sockets.adapter.rooms.get(roomCode)?.size || 0;
  io.to(roomCode).emit('room:presence', { roomCode, count });
}

io.on('connection', socket => {
  socket.emit('server:ready', { socketId: socket.id });

  socket.on('room:join', (payload = {}, acknowledge = () => {}) => {
    const roomCode = normalizeRoomCode(payload?.roomCode);
    if (!roomCode) {
      acknowledge({ ok: false, error: 'Invalid room code' });
      return;
    }

    socket.join(roomCode);
    emitRoomPresence(roomCode);
    acknowledge({ ok: true, roomCode });
  });

  socket.on('room:leave', (payload = {}, acknowledge = () => {}) => {
    const roomCode = normalizeRoomCode(payload?.roomCode);
    if (!roomCode) {
      acknowledge({ ok: false, error: 'Invalid room code' });
      return;
    }

    socket.leave(roomCode);
    emitRoomPresence(roomCode);
    acknowledge({ ok: true, roomCode });
  });

  socket.on('disconnecting', () => {
    for (const roomCode of socket.rooms) {
      if (roomCode !== socket.id) queueMicrotask(() => emitRoomPresence(roomCode));
    }
  });
});

server.listen(port, host, () => {
  console.log(`HanClass server listening on http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down HanClass server`);
  io.close(() => {
    server.close(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
