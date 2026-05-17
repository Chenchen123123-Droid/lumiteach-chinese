import React, { useState, useEffect, useCallback, useRef } from 'react';
import './WordCloudGenerator.css';

// localStorage key
const DRAFT_KEY = 'word_cloud_generator_draft';

// Default words
const DEFAULT_WORDS = [
  '苹果', '香蕉', '西瓜', '葡萄', '芒果', '橙子', '草莓', '菠萝',
  '学习', '中文', '课堂游戏', '重点词汇', '核心概念', '进步', '有趣'
];

// Shape definitions
const SHAPES = {
  circle: { nameZh: '圆形', nameEn: 'Circle' },
  heart: { nameZh: '心形', nameEn: 'Heart' },
  star: { nameZh: '星形', nameEn: 'Star' },
  square: { nameZh: '方形', nameEn: 'Square' },
  triangle: { nameZh: '三角形', nameEn: 'Triangle' },
  cloud: { nameZh: '云朵', nameEn: 'Cloud' },
  book: { nameZh: '书本', nameEn: 'Book' },
  bulb: { nameZh: '灯泡', nameEn: 'Light Bulb' }
};

// Color palettes
const COLOR_PALETTES = {
  colorful: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'],
  cool: ['#0ea5e9', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'],
  warm: ['#ef4444', '#f97316', '#f59e0b', '#facc15', '#fb7185'],
  forest: ['#166534', '#15803d', '#22c55e', '#65a30d', '#84cc16'],
  single: ['#3b82f6'],
  pink: ['#ec4899', '#f472b6', '#fb7185', '#f9a8d4', '#db2777'],
  fresh: ['#38bdf8', '#2dd4bf', '#a3e635', '#facc15', '#fb7185']
};

// Font families
const FONTS = {
  default: { nameZh: '系统默认', nameEn: 'System Default', family: 'system-ui, sans-serif' },
  heiti: { nameZh: '黑体', nameEn: 'Heiti', family: 'SimHei, "Microsoft YaHei", sans-serif' },
  songti: { nameZh: '宋体', nameEn: 'Songti', family: 'SimSun, serif' },
  kaiti: { nameZh: '楷体', nameEn: 'Kaiti', family: 'KaiTi, STKaiti, "Kaiti SC", serif' },
  rounded: { nameZh: '圆体', nameEn: 'Rounded', family: '"Microsoft YaHei", "PingFang SC", sans-serif' }
};

// Canvas sizes
const CANVAS_SIZES = {
  slide16x9: { nameZh: '课件横版 16:9', nameEn: 'Slide 16:9', width: 1200, height: 675, aspectRatio: 16/9 },
  square: { nameZh: '正方形', nameEn: 'Square', width: 1000, height: 1000, aspectRatio: 1 },
  a4_landscape: { nameZh: 'A4 横版', nameEn: 'A4 Landscape', width: 1123, height: 794, aspectRatio: 1123/794 },
  a4_portrait: { nameZh: 'A4 竖版', nameEn: 'A4 Portrait', width: 794, height: 1123, aspectRatio: 794/1123 }
};

// Quick background colors
const QUICK_BG_COLORS = [
  { name: '#ffffff', labelZh: '白色', labelEn: 'White' },
  { name: '#fafaf9', labelZh: '米色', labelEn: 'Beige' },
  { name: '#e0f2fe', labelZh: '浅蓝', labelEn: 'Light Blue' },
  { name: '#fce7f3', labelZh: '浅粉', labelEn: 'Light Pink' },
  { name: '#dcfce7', labelZh: '浅绿', labelEn: 'Light Green' },
  { name: '#f3e8ff', labelZh: '浅紫', labelEn: 'Light Purple' }
];

// Translations
const translations = {
  zh: {
    title: '词云生成器',
    subtitle: '输入词语，自动生成精美词云图片',
    wordInput: '词语输入',
    wordInputPlaceholder: '请输入词语，每行一个，例如：\n苹果\n香蕉\n西瓜\n葡萄\n学习\n课堂游戏',
    shape: '图形形状',
    colorPalette: '配色方案',
    background: '背景颜色',
    font: '字体',
    scale: '词云大小',
    allowRotation: '允许词语旋转',
    canvasSize: '画布尺寸',
    generate: '生成词云',
    shuffle: '打乱重新排列',
    download: '下载 PNG',
    clearDraft: '清空草稿',
    notGenerated: '请先生成词云'
  },
  en: {
    title: 'Word Cloud Generator',
    subtitle: 'Enter words and generate a beautiful word cloud image',
    wordInput: 'Word Input',
    wordInputPlaceholder: 'Enter words, one per line, for example:\n苹果\n香蕉\n西瓜\n葡萄\n学习\n课堂游���',
    shape: 'Shape',
    colorPalette: 'Color Palette',
    background: 'Background',
    font: 'Font',
    scale: 'Word Cloud Size',
    allowRotation: 'Allow Word Rotation',
    canvasSize: 'Canvas Size',
    generate: 'Generate',
    shuffle: 'Shuffle',
    download: 'Download PNG',
    clearDraft: 'Clear Draft',
    notGenerated: 'Please generate a word cloud first'
  }
};

function WordCloudGenerator() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('language') || 'zh';
    } catch {
      return 'zh';
    }
  });
  const t = translations[lang] || translations.zh;

  // State
  const [rawWords, setRawWords] = useState('');
  const [shape, setShape] = useState('circle');
  const [colorPalette, setColorPalette] = useState('colorful');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('default');
  const [scale, setScale] = useState(1.8);
  const [allowRotation, setAllowRotation] = useState(true);
  const [canvasSize, setCanvasSize] = useState('slide16x9');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [randomKey, setRandomKey] = useState(0);

  const canvasRef = useRef(null);

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const data = JSON.parse(draft);
        if (data.rawWords) setRawWords(data.rawWords);
        if (data.shape) setShape(data.shape);
        if (data.colorPalette) setColorPalette(data.colorPalette);
        if (data.backgroundColor) setBackgroundColor(data.backgroundColor);
        if (data.fontFamily) setFontFamily(data.fontFamily);
        if (data.scale) setScale(data.scale);
        if (data.allowRotation !== undefined) setAllowRotation(data.allowRotation);
        if (data.canvasSize) setCanvasSize(data.canvasSize);
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    try {
      const data = {
        rawWords, shape, colorPalette, backgroundColor,
        fontFamily, scale, allowRotation, canvasSize
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  }, [rawWords, shape, colorPalette, backgroundColor, fontFamily, scale, allowRotation, canvasSize]);

  // Parse words
  const parseWords = useCallback((text) => {
    if (!text.trim()) return DEFAULT_WORDS.map(w => ({ text: w, weight: 1 }));

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const wordMap = {};

    lines.forEach(line => {
      const parts = line.split('|');
      const word = parts[0].trim();
      const weight = parseInt(parts[1]) || 1;

      if (wordMap[word]) {
        wordMap[word] += weight;
      } else {
        wordMap[word] = weight;
      }
    });

    return Object.entries(wordMap).map(([text, weight]) => ({ text, weight }));
  }, []);

  // Check if point is in shape
  const isPointInShape = useCallback((x, y, shape, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.45;

    switch (shape) {
      case 'circle':
        return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= radius;

      case 'heart': {
        // Simplified heart shape
        const sx = (x - cx) / radius;
        const sy = (y - cy) / radius;
        return sy >= -Math.abs(sx) * (1 - Math.abs(sx) / 2) - 0.5 && sy <= 1.2;
      }

      case 'star': {
        // Simplified 5-point star
        const angle = Math.atan2(y - cy, x - cx);
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
        const starRadius = radius * (0.3 + 0.7 * Math.abs(Math.sin(normalizedAngle * 5 * Math.PI)));
        return dist <= starRadius;
      }

      case 'square':
        return x >= cx - radius && x <= cx + radius && y >= cy - radius && y <= cy + radius;

      case 'triangle': {
        // Simple triangle pointing up
        const halfWidth = radius * 0.9;
        const topY = cy - radius * 0.8;
        const bottomY = cy + radius * 0.6;
        const ratio = (y - topY) / (bottomY - topY);
        const halfAtY = halfWidth * ratio;
        return y >= topY && y <= bottomY && Math.abs(x - cx) <= halfAtY;
      }

      case 'cloud': {
        // Cloud: multiple circles
        const cloudCircles = [
          { x: cx - radius * 0.4, y: cy - radius * 0.3, r: radius * 0.35 },
          { x: cx + radius * 0.3, y: cy - radius * 0.2, r: radius * 0.3 },
          { x: cx - radius * 0.1, y: cy, r: radius * 0.35 },
          { x: cx - radius * 0.4, y: cy + radius * 0.1, r: radius * 0.25 }
        ];
        return cloudCircles.some(c => Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2) <= c.r);
      }

      case 'book': {
        // Book: two rectangles
        const leftPage = x >= cx - radius * 0.8 && x <= cx && y >= cy - radius * 0.7 && y <= cy + radius * 0.7;
        const rightPage = x >= cx && x <= cx + radius * 0.8 && y >= cy - radius * 0.7 && y <= cy + radius * 0.7;
        return leftPage || rightPage;
      }

      case 'bulb': {
        // Light bulb: circle + rectangle
        const bulbDist = Math.sqrt((x - cx) ** 2 + (y - cy + radius * 0.3) ** 2);
        const baseX = x >= cx - radius * 0.3 && x <= cx + radius * 0.3 && y >= cy + radius * 0.3 && y <= cy + radius * 0.7;
        return (bulbDist <= radius * 0.55) || baseX;
      }

      default:
        return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= radius;
    }
  }, []);

  // Generate word cloud
  const handleGenerate = useCallback(() => {
    const words = parseWords(rawWords);
    const size = CANVAS_SIZES[canvasSize];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = size.width;
    canvas.height = size.height;

    // Clear canvas with background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colors = COLOR_PALETTES[colorPalette];
    const font = FONTS[fontFamily];
    const [minFont, maxFont] = [18 * scale, 60 * scale];

    // Sort by weight
    const sortedWords = [...words].sort((a, b) => b.weight - a.weight);
    const maxWeight = sortedWords[0]?.weight || 1;
    const minWeight = sortedWords[sortedWords.length - 1]?.weight || 1;

    const placedWords = [];

    sortedWords.forEach((wordObj, idx) => {
      const fontSize = minFont + ((wordObj.weight - minWeight) / (maxWeight - minWeight + 0.01)) * (maxFont - minFont);
      ctx.font = `${fontSize}px ${font.family}`;

      const text = wordObj.text;
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      // Try to place the word
      let placed = false;
      let attempts = 0;
      const maxAttempts = 300;

      while (!placed && attempts < maxAttempts) {
        // Random position
        const margin = fontSize;
        const x = margin + Math.random() * (canvas.width - 2 * margin);
        const y = margin + Math.random() * (canvas.height - 2 * margin);

        // Check if in shape
        if (!isPointInShape(x, y, shape, canvas.width, canvas.height)) {
          attempts++;
          continue;
        }

        // Check overlap
        const padding = fontSize * 0.2;
        const bbox = {
          x: x - textWidth / 2 - padding,
          y: y - textHeight / 2 - padding,
          w: textWidth + 2 * padding,
          h: textHeight + 2 * padding
        };

        let overlaps = false;
        for (const pw of placedWords) {
          if (bbox.x < pw.bbox.x + pw.bbox.w &&
              bbox.x + bbox.w > pw.bbox.x &&
              bbox.y < pw.bbox.y + pw.bbox.h &&
              bbox.y + bbox.h > pw.bbox.y) {
            overlaps = true;
            break;
          }
        }

        if (overlaps) {
          attempts++;
          continue;
        }

        // Calculate rotation
        let rotation = 0;
        if (allowRotation && Math.random() > 0.5) {
          const angles = [0, 90, -90, 15, -15, 30, -30];
          rotation = angles[Math.floor(Math.random() * angles.length)];
        }

        // Pick color
        const color = colors[Math.floor(Math.random() * colors.length)];

        placedWords.push({
          text,
          x,
          y,
          fontSize,
          color,
          rotation,
          bbox,
          font: font.family
        });
        placed = true;
      }
    });

    // Draw words
    placedWords.forEach(pw => {
      ctx.save();
      ctx.translate(pw.x, pw.y);
      if (pw.rotation !== 0) {
        ctx.rotate(pw.rotation * Math.PI / 180);
      }
      ctx.fillStyle = pw.color;
      ctx.font = `${pw.fontSize}px ${pw.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pw.text, 0, 0);
      ctx.restore();
    });

    setHasGenerated(true);
  }, [rawWords, shape, colorPalette, backgroundColor, fontFamily, scale, allowRotation, canvasSize, parseWords, isPointInShape]);

  // Shuffle layout
  const handleShuffle = useCallback(() => {
    setRandomKey(k => k + 1);
    handleGenerate();
  }, [handleGenerate]);

  // Download PNG
  const handleDownload = useCallback(() => {
    if (!hasGenerated) {
      alert(lang === 'zh' ? t.notGenerated : translations.en.notGenerated);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'word-cloud.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [hasGenerated, lang, t]);

  // Clear draft
  const handleClearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setRawWords('');
      setShape('circle');
      setColorPalette('colorful');
      setBackgroundColor('#ffffff');
      setFontFamily('default');
      setScale(1.8);
      setAllowRotation(true);
      setCanvasSize('slide16x9');
      setHasGenerated(false);

      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch (e) {
      console.error('Error clearing draft:', e);
    }
  }, []);

  return (
    <div className="word-cloud-generator">
      {/* Left Settings Panel */}
      <div className="word-cloud-settings">
        <div className="settings-header">
          <h2>{t.title}</h2>
          <p className="subtitle">{t.subtitle}</p>
        </div>

        {/* Word Input */}
        <div className="settings-section">
          <h3>{t.wordInput}</h3>
          <textarea
            className="word-input"
            placeholder={t.wordInputPlaceholder}
            value={rawWords}
            onChange={(e) => setRawWords(e.target.value)}
          />
        </div>

        {/* Shape */}
        <div className="settings-section">
          <h3>{t.shape}</h3>
          <div className="shape-grid">
            {Object.entries(SHAPES).map(([key, shapeObj]) => (
              <button
                key={key}
                className={`shape-btn ${shape === key ? 'active' : ''}`}
                onClick={() => setShape(key)}
              >
                {lang === 'zh' ? shapeObj.nameZh : shapeObj.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="settings-section">
          <h3>{t.colorPalette}</h3>
          <div className="palette-grid">
            {Object.entries(COLOR_PALETTES).map(([key, colors]) => (
              <button
                key={key}
                className={`palette-btn ${colorPalette === key ? 'active' : ''}`}
                onClick={() => setColorPalette(key)}
              >
                <div className="palette-colors">
                  {colors.slice(0, 5).map((c, i) => (
                    <span key={i} style={{ background: c }}></span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Background */}
        <div className="settings-section">
          <h3>{t.background}</h3>
          <div className="bg-colors">
            {QUICK_BG_COLORS.map((bg, idx) => (
              <button
                key={idx}
                className={`bg-color-btn ${backgroundColor === bg.name ? 'active' : ''}`}
                style={{ background: bg.name }}
                onClick={() => setBackgroundColor(bg.name)}
                title={lang === 'zh' ? bg.labelZh : bg.labelEn}
              />
            ))}
            <input
              type="color"
              className="bg-color-picker"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
        </div>

        {/* Font */}
        <div className="settings-section">
          <h3>{t.font}</h3>
          <select
            className="font-select"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            {Object.entries(FONTS).map(([key, fontObj]) => (
              <option key={key} value={key}>
                {lang === 'zh' ? fontObj.nameZh : fontObj.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Scale */}
        <div className="settings-section">
          <h3>{t.scale}: {scale.toFixed(1)}x</h3>
          <input
            type="range"
            className="scale-slider"
            min="1"
            max="4"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
          />
        </div>

        {/* Rotation */}
        <div className="settings-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={allowRotation}
              onChange={(e) => setAllowRotation(e.target.checked)}
            />
            {t.allowRotation}
          </label>
        </div>

        {/* Canvas Size */}
        <div className="settings-section">
          <h3>{t.canvasSize}</h3>
          <select
            className="size-select"
            value={canvasSize}
            onChange={(e) => setCanvasSize(e.target.value)}
          >
            {Object.entries(CANVAS_SIZES).map(([key, sizeObj]) => (
              <option key={key} value={key}>
                {lang === 'zh' ? sizeObj.nameZh : sizeObj.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="settings-actions">
          <button className="btn-generate" onClick={handleGenerate}>
            {t.generate}
          </button>
          <button className="btn-shuffle" onClick={handleShuffle} disabled={!hasGenerated}>
            {t.shuffle}
          </button>
          <button className="btn-download" onClick={handleDownload} disabled={!hasGenerated}>
            {t.download}
          </button>
          <button className="btn-clear" onClick={handleClearDraft}>
            {t.clearDraft}
          </button>
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="word-cloud-preview">
        <div className="preview-canvas-container">
          <canvas
            ref={canvasRef}
            className="word-cloud-canvas"
          />
        </div>
      </div>
    </div>
  );
}

export default WordCloudGenerator;