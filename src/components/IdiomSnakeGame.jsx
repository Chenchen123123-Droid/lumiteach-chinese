import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './IdiomSnakeGame.css';

/**
 * 成语贪吃蛇 - Idiom Snake Game
 * 控制小蛇按顺序吃掉汉字，完成成语挑战
 */
function IdiomSnakeGame() {
  const { lang, t } = useLanguage();
  const [screen, setScreen] = useState('setup');
  const [idiomInput, setIdiomInput] = useState('');
  const [idioms, setIdioms] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [displayMode, setDisplayMode] = useState('hint');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentIdiomIndex, setCurrentIdiomIndex] = useState(0);
  const [currentIdiom, setCurrentIdiom] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [snake, setSnake] = useState([]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [nextDirection, setNextDirection] = useState({ x: 1, y: 0 });
  const [charItems, setCharItems] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [completedIdioms, setCompletedIdioms] = useState([]);
  const [unfinishedIdioms, setUnfinishedIdioms] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeUsed, setTimeUsed] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState('');
  const audioContextRef = useRef(null);
  const timerRef = useRef(null);
  const timeTimerRef = useRef(null);
  const gridSize = 18;
  const cellSize = 28;

  const defaultIdioms = [
    '栩栩如生',
    '画蛇添足',
    '亡羊补牢',
    '井底之蛙',
    '一心一意',
    '三心二意',
    '守株待兔',
    '刻舟求剑',
    '杯弓蛇影',
    '对牛弹琴'
  ];

  const distractorChars = [
    '天', '地', '人', '山', '水', '火', '木', '金', '土',
    '日', '月', '心', '手', '口', '马', '牛', '羊', '鸟',
    '大', '小', '中', '上', '下', '东', '西', '南', '北',
    '学', '生', '老', '师', '书', '车', '家', '好'
  ];

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Load draft
  useEffect(() => {
    const saved = localStorage.getItem('idiom_snake_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.idiomInput) setIdiomInput(data.idiomInput);
        if (data.playerName) setPlayerName(data.playerName);
        if (data.difficulty) setDifficulty(data.difficulty);
        if (data.displayMode) setDisplayMode(data.displayMode);
        if (data.soundEnabled !== undefined) setSoundEnabled(data.soundEnabled);
      } catch (e) {
        console.error('加载草稿失败:', e);
      }
    }
  }, []);

  // Load leaderboard
  useEffect(() => {
    const saved = localStorage.getItem('idiom_snake_leaderboard');
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch (e) {
        console.error('加载排行榜失败:', e);
      }
    }
  }, []);

  // Save draft
  useEffect(() => {
    const draft = {
      idiomInput,
      playerName,
      difficulty,
      displayMode,
      soundEnabled
    };
    localStorage.setItem('idiom_snake_draft', JSON.stringify(draft));
  }, [idiomInput, playerName, difficulty, displayMode, soundEnabled]);

  // Play sound
  const playSound = useCallback((type) => {
    if (!soundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'eat':
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.08);
        break;
      case 'wrong':
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      case 'complete':
        [523, 659, 784].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.15);
        });
        break;
      case 'gameover':
        [300, 250, 200, 150].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.1);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.1);
        });
        break;
      default:
        break;
    }
  }, [soundEnabled]);

  // Parse idioms
  const parseIdioms = useCallback((text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    const seen = new Set();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split('|').map(p => p.trim());
      const text = parts[0];

      if (!text || seen.has(text)) continue;
      seen.add(text);

      parsed.push({
        id: `idiom_${Date.now()}_${i}`,
        text: text,
        explanation: parts[1] || '',
        chars: text.split('')
      });
    }

    return parsed.length > 0 ? parsed : defaultIdioms.map((text, i) => ({
      id: `idiom_default_${i}`,
      text,
      explanation: '',
      chars: text.split('')
    }));
  }, [defaultIdioms]);

  // Generate random position
  const generateRandomPosition = useCallback((occupied) => {
    let position;
    let attempts = 0;
    do {
      position = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
      attempts++;
    } while (occupied.some(p => p.x === position.x && p.y === position.y) && attempts < 100);
    return position;
  }, []);

  // Initialize level
  const initializeLevel = useCallback((idiom, displayModeValue, difficultyLevel) => {
    const items = [];
    const occupied = [];

    // Add snake initial position
    const initialPos = { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) };
    occupied.push(initialPos);

    // Add target characters
    idiom.chars.forEach((char, idx) => {
      const pos = generateRandomPosition(occupied);
      occupied.push(pos);
      items.push({
        id: `target_${idx}`,
        text: char,
        x: pos.x,
        y: pos.y,
        isTarget: true,
        targetIndex: idx
      });
    });

    // Add distractors
    const distractorCount = difficultyLevel === 'easy' ? 0 : difficultyLevel === 'medium' ? 4 : 8;
    const availableDistractors = distractorChars.filter(c => !idiom.chars.includes(c));

    for (let i = 0; i < distractorCount; i++) {
      if (availableDistractors.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableDistractors.length);
        const char = availableDistractors.splice(randomIndex, 1)[0];
        const pos = generateRandomPosition(occupied);
        occupied.push(pos);
        items.push({
          id: `distractor_${i}`,
          text: char,
          x: pos.x,
          y: pos.y,
          isTarget: false
        });
      }
    }

    // Set snake
    const initialSnake = [initialPos];
    setSnake(initialSnake);

    // Set display mode
    setCharItems(items.map(item => ({
      ...item,
      isRevealed: displayModeValue === 'hint' ? item.isTarget : true
    })));

    setCurrentProgress(0);
    setNextDirection({ x: 1, y: 0 });
    setDirection({ x: 1, y: 0 });
  }, [generateRandomPosition, gridSize]);

  // Start game
  const startGame = () => {
    const parsedIdioms = parseIdioms(idiomInput);
    if (parsedIdioms.length === 0) {
      setMessage(lang === 'zh' ? '请输入成语' : 'Please enter idioms');
      return;
    }

    setIdioms(parsedIdioms);
    setCurrentIdiomIndex(0);
    setCurrentIdiom(parsedIdioms[0]);
    setScore(0);
    setLives(difficulty === 'easy' ? 5 : 3);
    setCompletedIdioms([]);
    setUnfinishedIdioms([]);
    setIsGameOver(false);
    setTimeUsed(0);

    initializeLevel(parsedIdioms[0], displayMode, difficulty);
    setScreen('play');
    setMessage('');
  };

  // Move snake
  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver || !currentIdiom) return;

    const newDirection = { ...nextDirection };
    const head = snake[0];
    let newHead = {
      x: head.x + newDirection.x,
      y: head.y + newDirection.y
    };

    // Wrap around boundaries
    if (newHead.x < 0) newHead.x = gridSize - 1;
    if (newHead.x >= gridSize) newHead.x = 0;
    if (newHead.y < 0) newHead.y = gridSize - 1;
    if (newHead.y >= gridSize) newHead.y = 0;

    // Check collision with self
    if (snake.slice(1).some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      // In easy mode, just don't move into self
      return;
    }

    // Check collision with characters
    const charItem = charItems.find(item => item.x === newHead.x && item.y === newHead.y);

    if (charItem) {
      const expectedChar = currentIdiom.chars[currentProgress];

      if (charItem.isTarget && charItem.text === expectedChar) {
        // Correct!
        playSound('eat');
        setScore(prev => prev + 10);
        setCurrentProgress(prev => prev + 1);

        // Remove the eaten character
        setCharItems(prev => prev.filter(item => item.id !== charItem.id));

        // Check if idiom completed
        if (currentProgress + 1 >= currentIdiom.chars.length) {
          playSound('complete');
          setScore(prev => prev + 50);

          const newCompleted = [...completedIdioms, currentIdiom];

          if (currentIdiomIndex + 1 >= idioms.length) {
            // All completed!
            finishGame(newCompleted, []);
          } else {
            // Next idiom after delay
            setMessage(lang === 'zh' ? `完成：${currentIdiom.text}` : `Completed: ${currentIdiom.text}`);
            setTimeout(() => {
              goToNextIdiom(newCompleted, []);
            }, 1500);
          }
        }

        // Move snake with new segment
        setSnake(prev => [newHead, ...prev]);
      } else {
        // Wrong!
        playSound('wrong');
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            finishGame(completedIdioms, [...unfinishedIdioms, currentIdiom]);
          }
          return newLives;
        });
        setMessage(lang === 'zh' ? '吃错了！' : 'Wrong!');

        // Don't remove the character, don't grow snake
        setSnake(prev => [newHead, ...prev.slice(0, -1)]);
      }
    } else {
      // Just move
      setSnake(prev => [newHead, ...prev.slice(0, -1)]);
    }

    setDirection(newDirection);
  }, [isPaused, isGameOver, currentIdiom, charItems, currentProgress, snake, nextDirection, idioms, currentIdiomIndex, completedIdioms, unfinishedIdioms, playSound, lang]);

  // Go to next idiom
  const goToNextIdiom = (completed, unfinished) => {
    const nextIndex = currentIdiomIndex + 1;
    if (nextIndex >= idioms.length) {
      finishGame(completed, unfinished);
      return;
    }

    setCurrentIdiomIndex(nextIndex);
    setCurrentIdiom(idioms[nextIndex]);
    setCompletedIdioms(completed);
    setUnfinishedIdioms(unfinished);
    initializeLevel(idioms[nextIndex], displayMode, difficulty);
    setMessage('');
  };

  // Finish game
  const finishGame = (completed, unfinished) => {
    clearInterval(timerRef.current);
    clearInterval(timeTimerRef.current);
    setIsGameOver(true);
    playSound('gameover');

    const record = {
      id: `record_${Date.now()}`,
      playerName: playerName || 'Guest',
      score: score,
      completedIdioms: completed.length,
      difficulty: difficulty,
      displayMode: displayMode,
      timeUsed: timeUsed,
      date: new Date().toISOString()
    };

    const newLeaderboard = [...leaderboard, record].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.completedIdioms !== a.completedIdioms) return b.completedIdioms - a.completedIdioms;
      return a.timeUsed - b.timeUsed;
    }).slice(0, 20);

    setLeaderboard(newLeaderboard);
    setCompletedIdioms(completed);
    setUnfinishedIdioms(unfinished);
    localStorage.setItem('idiom_snake_leaderboard', JSON.stringify(newLeaderboard));

    setScreen('result');
  };

  // Restart
  const restartGame = () => {
    if (idioms.length === 0) return;

    setScore(0);
    setLives(difficulty === 'easy' ? 5 : 3);
    setIsGameOver(false);
    setTimeUsed(0);
    setCurrentIdiomIndex(0);

    setCompletedIdioms([]);
    setUnfinishedIdioms([]);

    initializeLevel(idioms[0], displayMode, difficulty);
    setScreen('play');
    setMessage('');
  };

  // Keyboard control
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (screen !== 'play' || isPaused || isGameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y !== 1) setNextDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y !== -1) setNextDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x !== 1) setNextDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x !== -1) setNextDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isPaused, isGameOver, direction]);

  // Game loop
  useEffect(() => {
    if (screen === 'play' && !isPaused && !isGameOver) {
      const speed = difficulty === 'easy' ? 220 : difficulty === 'medium' ? 160 : 120;
      timerRef.current = setInterval(moveSnake, speed);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, isPaused, isGameOver, difficulty, moveSnake]);

  // Timer
  useEffect(() => {
    if (screen === 'play' && !isPaused) {
      timeTimerRef.current = setInterval(() => {
        setTimeUsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timeTimerRef.current);
  }, [screen, isPaused]);

  // Direction buttons for mobile
  const handleDirection = (dir) => {
    if (isPaused || isGameOver) return;
    const currentDir = direction;
    if (dir.x === -currentDir.x && dir.y === -currentDir.y) return;
    setNextDirection(dir);
  };

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem('idiom_snake_draft');
    setIdiomInput('');
    setPlayerName('');
    setDifficulty('easy');
    setDisplayMode('hint');
    setMessage(lang === 'zh' ? '草稿已清除' : 'Draft cleared');
  };

  // Clear leaderboard
  const clearLeaderboard = () => {
    localStorage.removeItem('idiom_snake_leaderboard');
    setLeaderboard([]);
    setMessage(lang === 'zh' ? '排行榜已清除' : 'Leaderboard cleared');
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ===== Render Setup Page =====
  if (screen === 'setup') {
    return (
      <div className="snake-setup">
        <div className="setup-header">
          <h1>{lang === 'zh' ? '成语贪吃蛇' : 'Idiom Snake Game'}</h1>
          <p className="setup-subtitle">
            {lang === 'zh'
              ? '控制小蛇按顺序吃掉汉字，完成成语挑战'
              : 'Control the snake and collect characters in the correct order'}
          </p>
        </div>

        <div className="setup-content">
          <div className="input-section">
            <h3>{lang === 'zh' ? '成语输入' : 'Idiom Input'}</h3>
            <textarea
              value={idiomInput}
              onChange={(e) => setIdiomInput(e.target.value)}
              placeholder={lang === 'zh'
                ? '每行一个成语：\n栩栩如生|形容画面非常生动\n画蛇添足|比喻多此一举\n亡羊补牢'
                : 'One idiom per line:\n栩栩如生|vivid\n画蛇添足|to overdo\n亡羊补牢|better late than never'}
              rows={6}
            />
          </div>

          <div className="settings-row">
            <div className="setting-group">
              <label>{lang === 'zh' ? '玩家姓名' : 'Player Name'}</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={lang === 'zh' ? '例如：Alex' : 'e.g. Alex'}
              />
            </div>

            <div className="setting-group">
              <label>{lang === 'zh' ? '难度' : 'Difficulty'}</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">{lang === 'zh' ? '简单' : 'Easy'}</option>
                <option value="medium">{lang === 'zh' ? '中等' : 'Medium'}</option>
                <option value="hard">{lang === 'zh' ? '困难' : 'Hard'}</option>
              </select>
            </div>

            <div className="setting-group">
              <label>{lang === 'zh' ? '显示模式' : 'Display Mode'}</label>
              <select value={displayMode} onChange={(e) => setDisplayMode(e.target.value)}>
                <option value="hint">{lang === 'zh' ? '提示模式' : 'Hint Mode'}</option>
                <option value="challenge">{lang === 'zh' ? '挑战模式' : 'Challenge Mode'}</option>
              </select>
            </div>
          </div>

          <div className="setup-actions">
            <button className="btn-start" onClick={startGame}>
              {lang === 'zh' ? '开始游戏' : 'Start Game'}
            </button>
            <button className="btn-secondary" onClick={() => setScreen('leaderboard')}>
              {lang === 'zh' ? '排行榜' : 'Leaderboard'}
            </button>
            <button className="btn-clear" onClick={clearDraft}>
              {lang === 'zh' ? '清空草稿' : 'Clear Draft'}
            </button>
          </div>

          {message && <div className="message-toast">{message}</div>}
        </div>
      </div>
    );
  }

  // ===== Render Result Page =====
  if (screen === 'result') {
    return (
      <div className="snake-result">
        <div className="result-card">
          <h2>{lang === 'zh' ? '挑战结束！' : 'Game Over!'}</h2>

          <div className="result-stats">
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '玩家' : 'Player'}</span>
              <span className="stat-value">{playerName || 'Guest'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '得分' : 'Score'}</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '完成成语' : 'Completed'}</span>
              <span className="stat-value">{completedIdioms.length} / {idioms.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '用时' : 'Time'}</span>
              <span className="stat-value">{formatTime(timeUsed)}</span>
            </div>
          </div>

          {completedIdioms.length > 0 && (
            <div className="completed-section">
              <h3>{lang === 'zh' ? '已完成' : 'Completed'}</h3>
              <div className="idiom-list">
                {completedIdioms.map((idiom, idx) => (
                  <span key={idx} className="completed-idiom">{idiom.text}</span>
                ))}
              </div>
            </div>
          )}

          {unfinishedIdioms.length > 0 && (
            <div className="unfinished-section">
              <h3>{lang === 'zh' ? '未完成' : 'Unfinished'}</h3>
              <div className="idiom-list">
                {unfinishedIdioms.map((idiom, idx) => (
                  <span key={idx} className="unfinished-idiom">{idiom.text}</span>
                ))}
              </div>
            </div>
          )}

          <div className="result-buttons">
            <button className="btn-result primary" onClick={restartGame}>
              {lang === 'zh' ? '再玩一次' : 'Play Again'}
            </button>
            <button className="btn-result" onClick={() => setScreen('leaderboard')}>
              {lang === 'zh' ? '排行榜' : 'Leaderboard'}
            </button>
            <button className="btn-result secondary" onClick={() => setScreen('setup')}>
              {lang === 'zh' ? '返回设置' : 'Back to Setup'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Render Leaderboard Page =====
  if (screen === 'leaderboard') {
    return (
      <div className="snake-leaderboard">
        <div className="leaderboard-card">
          <h2>{lang === 'zh' ? '排行榜' : 'Leaderboard'}</h2>

          {leaderboard.length === 0 ? (
            <p className="no-records">
              {lang === 'zh' ? '暂无记录' : 'No records yet'}
            </p>
          ) : (
            <div className="leaderboard-table">
              <div className="leaderboard-header">
                <span>#</span>
                <span>{lang === 'zh' ? '玩家' : 'Player'}</span>
                <span>{lang === 'zh' ? '得分' : 'Score'}</span>
                <span>{lang === 'zh' ? '完成' : 'Done'}</span>
                <span>{lang === 'zh' ? '用时' : 'Time'}</span>
              </div>
              {leaderboard.map((record, idx) => (
                <div key={record.id} className={`leaderboard-row ${idx < 3 ? 'top-three' : ''}`}>
                  <span className="rank">#{idx + 1}</span>
                  <span className="name">{record.playerName}</span>
                  <span className="score">{record.score}</span>
                  <span className="completed">{record.completedIdioms}</span>
                  <span className="time">{formatTime(record.timeUsed)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="leaderboard-buttons">
            {leaderboard.length > 0 && (
              <button className="btn-leaderboard" onClick={clearLeaderboard}>
                {lang === 'zh' ? '清空排行榜' : 'Clear'}
              </button>
            )}
            <button className="btn-leaderboard secondary" onClick={() => setScreen('setup')}>
              {lang === 'zh' ? '返回' : 'Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Render Game Page =====
  return (
    <div className="snake-play">
      <div className="play-header">
        <div className="level-badge">{lang === 'zh' ? '关卡' : 'Level'}: {currentIdiomIndex + 1}</div>
        <div className="target-badge">
          {lang === 'zh' ? '目标' : 'Target'}: {currentIdiom?.text || ''}
        </div>
        <div className="progress-badge">
          {lang === 'zh' ? '进度' : 'Progress'}: {currentProgress} / {currentIdiom?.chars.length || 0}
        </div>
        <div className="score-badge">{lang === 'zh' ? '得分' : 'Score'}: {score}</div>
        <div className="lives-badge">
          {lang === 'zh' ? '生命' : 'Lives'}: {Array.from({ length: lives }).map((_, i) => '❤️').join('')}
        </div>
        <div className="time-badge">{lang === 'zh' ? '用时' : 'Time'}: {formatTime(timeUsed)}</div>
        <div className="sound-toggle" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? '🔊' : '🔇'}
        </div>
      </div>

      <div className="play-content">
        {message && <div className="message-popup">{message}</div>}

        <div className="game-grid" style={{
          gridSize: gridSize,
          cellSize: cellSize
        }}>
          {/* Render grid background */}
          {Array.from({ length: gridSize * gridSize }).map((_, idx) => (
            <div key={idx} className="grid-cell" />
          ))}

          {/* Render characters */}
          {charItems.map(item => (
            <div
              key={item.id}
              className={`char-cell ${item.isRevealed ? 'revealed' : ''} ${item.isTarget ? 'target' : 'distractor'}`}
              style={{
                left: item.x * cellSize,
                top: item.y * cellSize,
                width: cellSize,
                height: cellSize
              }}
            >
              {item.isRevealed ? item.text : '?'}
            </div>
          ))}

          {/* Render snake */}
          {snake.map((seg, idx) => (
            <div
              key={idx}
              className={`snake-segment ${idx === 0 ? 'head' : 'body'}`}
              style={{
                left: seg.x * cellSize,
                top: seg.y * cellSize,
                width: cellSize,
                height: cellSize
              }}
            />
          ))}
        </div>

        {difficulty === 'easy' && currentIdiom && (
          <div className="hint-display">
            {lang === 'zh' ? '下一字' : 'Next'}: {currentIdiom.chars[currentProgress]}
          </div>
        )}
        {difficulty !== 'easy' && (
          <div className="hint-display">
            {lang === 'zh' ? '请按顺序吃掉成语汉字' : 'Collect in order'}
          </div>
        )}

        <div className="direction-controls">
          <button onClick={() => handleDirection({ x: 0, y: -1 })}>⬆️</button>
          <button onClick={() => handleDirection({ x: -1, y: 0 })}>⬅️</button>
          <button onClick={() => handleDirection({ x: 0, y: 1 })}>⬇️</button>
          <button onClick={() => handleDirection({ x: 1, y: 0 })}>➡️</button>
        </div>

        <div className="play-actions">
          <button className="btn-action" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? (lang === 'zh' ? '继续' : 'Resume') : (lang === 'zh' ? '暂停' : 'Pause')}
          </button>
          <button className="btn-action" onClick={restartGame}>
            {lang === 'zh' ? '重新开始' : 'Restart'}
          </button>
          <button className="btn-action danger" onClick={() => { finishGame(completedIdioms, unfinishedIdioms); }}>
            {lang === 'zh' ? '结束游戏' : 'End Game'}
          </button>
          <button className="btn-action secondary" onClick={() => { setScreen('setup'); setIsPaused(false); }}>
            {lang === 'zh' ? '返回设置' : 'Back to Setup'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IdiomSnakeGame;