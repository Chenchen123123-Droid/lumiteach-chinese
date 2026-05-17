import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GuessCharacterChallenge.css';

/**
 * 猜字大挑战游戏组件
 * 老师输入词语，系统用方块遮挡答案，逐步揭晓让学生猜词
 */

const DEFAULT_WORDS = ['苹果', '香蕉', '学校', '老师', '吃饭'];

// 难度配置：gridSize 和每次揭晓数量
const DIFFICULTY_CONFIG = {
  6:  { label: '简单', revealCount: 6 },
  8:  { label: '中等', revealCount: 8 },
  10: { label: '困难', revealCount: 10 },
  12: { label: '挑战', revealCount: 12 },
};

function GuessCharacterChallenge() {
  // 设置区状态
  const [rawText, setRawText] = useState('');
  const [difficulty, setDifficulty] = useState(8);

  // 游戏状态
  const [gameStarted, setGameStarted] = useState(false);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maskBlocks, setMaskBlocks] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [message, setMessage] = useState('');

  const timerRef = useRef(null);

  // 解析词语
  const parseWords = useCallback((text) => {
    if (!text.trim()) return [...DEFAULT_WORDS];
    const list = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
    return list.length > 0 ? list : [...DEFAULT_WORDS];
  }, []);

  // 获取词语数量
  const getWordCount = () => {
    if (!rawText.trim()) return DEFAULT_WORDS.length;
    const list = rawText.split('\n').map(w => w.trim()).filter(w => w.length > 0);
    return list.length > 0 ? list.length : DEFAULT_WORDS.length;
  };

  // 生成遮挡方块网格
  const generateMaskGrid = useCallback((size) => {
    const total = size * size;
    return Array.from({ length: total }, (_, i) => ({ id: i, visible: true }));
  }, []);

  // 开始计时
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, []);

  // 停止计时
  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
  }, []);

  // 开始游戏
  const startGame = () => {
    const wordList = parseWords(rawText);
    setWords(wordList);
    setCurrentIndex(0);
    setMaskBlocks(generateMaskGrid(difficulty));
    setGameStarted(true);
    setMessage('');
    startTimer();
  };

  // 逐步揭晓
  const revealStep = () => {
    const visibleBlocks = maskBlocks.filter(b => b.visible);
    if (visibleBlocks.length === 0) {
      setMessage('答案已经完全揭晓啦！');
      return;
    }

    const revealCount = DIFFICULTY_CONFIG[difficulty].revealCount;
    const count = Math.min(revealCount, visibleBlocks.length);

    // 随机挑选 count 个可见方块
    const shuffled = [...visibleBlocks].sort(() => Math.random() - 0.5);
    const toHide = new Set(shuffled.slice(0, count).map(b => b.id));

    setMaskBlocks(prev => prev.map(b =>
      toHide.has(b.id) ? { ...b, visible: false } : b
    ));
    setMessage('');
  };

  // 揭晓答案
  const revealAnswer = () => {
    setMaskBlocks(prev => prev.map(b => ({ ...b, visible: false })));
    setMessage('');
  };

  // 点击单个方块
  const handleBlockClick = (index) => {
    if (!maskBlocks[index].visible) return;
    setMaskBlocks(prev => prev.map((b, i) =>
      i === index ? { ...b, visible: false } : b
    ));
  };

  // 下一题
  const nextQuestion = () => {
    if (currentIndex >= words.length - 1) {
      setMessage('已经是最后一题啦！');
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setMaskBlocks(generateMaskGrid(difficulty));
    setMessage('');
    startTimer();
  };

  // 重新开始（从第一题重新开始）
  const restartGame = () => {
    setCurrentIndex(0);
    setMaskBlocks(generateMaskGrid(difficulty));
    setMessage('');
    startTimer();
  };

  // 结束游戏
  const endGame = () => {
    stopTimer();
    setGameStarted(false);
    setWords([]);
    setMaskBlocks([]);
    setCurrentIndex(0);
    setElapsedTime(0);
    setMessage('');
  };

  // 清理计时器
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // 根据词语长度计算字体大小
  const getFontSize = (word) => {
    const len = word.length;
    if (len <= 2) return '120px';
    if (len <= 4) return '90px';
    if (len <= 6) return '70px';
    if (len <= 8) return '55px';
    return '42px';
  };

  const currentWord = words[currentIndex] || '';

  // ===== 设置区 =====
  if (!gameStarted) {
    return (
      <div className="gcc-settings">
        <div className="gcc-settings-card">
          <h2 className="gcc-title">🧩 猜字大挑战</h2>
          <p className="gcc-description">
            输入词语，每行一个。游戏开始后，答案会被方块遮住。
            点击"逐步揭晓"，让学生边看边猜。
          </p>

          <div className="gcc-form">
            <div className="gcc-form-group">
              <label className="gcc-label">词语输入</label>
              <textarea
                className="gcc-textarea"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={"例如：\n苹果\n香蕉\n学校\n老师\n吃饭"}
                rows={8}
              />
              <div className="gcc-input-info">
                <span className="gcc-word-count">词语数量：{getWordCount()}</span>
                <span className="gcc-hint">留空将使用默认词语</span>
              </div>
            </div>

            <div className="gcc-form-group">
              <label className="gcc-label">难度设置</label>
              <div className="gcc-difficulty-control">
                <span className="gcc-diff-label">简单</span>
                <input
                  type="range"
                  min={6}
                  max={12}
                  step={2}
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="gcc-slider"
                />
                <span className="gcc-diff-label">困难</span>
              </div>
              <div className="gcc-diff-current">
                当前难度：{difficulty} x {difficulty}（{DIFFICULTY_CONFIG[difficulty].label}）
              </div>
            </div>

            <button className="gcc-btn gcc-btn-start" onClick={startGame}>
              🎮 开始游戏
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 游戏区 =====
  return (
    <div className="gcc-game">
      {/* 顶部状态栏 */}
      <div className="gcc-topbar">
        <button className="gcc-btn gcc-btn-back" onClick={endGame}>
          ← 返回设置
        </button>
        <div className="gcc-topbar-center">
          第 {currentIndex + 1} 题 / 共 {words.length} 题
        </div>
        <div className="gcc-timer">
          用时：{elapsedTime}s
        </div>
      </div>

      {/* 主画板区域 */}
      <div className="gcc-board-wrapper">
        <div className="gcc-board">
          {/* 答案文字层 */}
          <div
            className="gcc-answer-text"
            style={{ fontSize: getFontSize(currentWord) }}
          >
            {currentWord}
          </div>

          {/* 遮挡方块层 */}
          <div
            className="gcc-mask-grid"
            style={{
              gridTemplateColumns: `repeat(${difficulty}, 1fr)`,
              gridTemplateRows: `repeat(${difficulty}, 1fr)`,
            }}
          >
            {maskBlocks.map((block, index) => (
              <div
                key={block.id}
                className={`gcc-block ${block.visible ? 'gcc-block-visible' : 'gcc-block-hidden'}`}
                onClick={() => handleBlockClick(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      {message && (
        <div className="gcc-message">{message}</div>
      )}

      {/* 操作按钮 */}
      <div className="gcc-actions">
        <button className="gcc-btn gcc-btn-reveal" onClick={revealStep}>
          👁 逐步揭晓
        </button>
        <button className="gcc-btn gcc-btn-answer" onClick={revealAnswer}>
          💡 揭晓答案
        </button>
        <button className="gcc-btn gcc-btn-next" onClick={nextQuestion}>
          ▶ 下一题
        </button>
        <button className="gcc-btn gcc-btn-restart" onClick={restartGame}>
          🔄 重新开始
        </button>
        <button className="gcc-btn gcc-btn-end" onClick={endGame}>
          ⏹ 结束游戏
        </button>
      </div>
    </div>
  );
}

export default GuessCharacterChallenge;
