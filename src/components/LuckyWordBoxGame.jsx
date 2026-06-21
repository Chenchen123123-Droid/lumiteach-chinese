import React, { useState, useCallback, useEffect, useRef } from 'react';
import './LuckyWordBoxGame.css';

/**
 * 词语幸运盒游戏组件
 * 功能：每轮显示3个词语对应3个神秘盒，开奖时随机分配分数
 */

const DEFAULT_WORDS = ['苹果', '香蕉', '橘子', '西瓜', '葡萄'];

// 奖励配置
const REWARDS_CONFIG = [
  { score: 2, icon: '⭐', label: '2分' },
  { score: 1, icon: '💎', label: '1分' },
  { score: 0, icon: '☁️', label: '0分' }
];

/** 解析词语 */
function parseWords(text) {
  if (!text.trim()) return [];
  return text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
}

/** 从词语池随机抽取3个不同词语 */
function pickThreeWords(wordPool) {
  if (wordPool.length <= 3) return [...wordPool];
  const shuffled = [...wordPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

/** 打乱数组 */
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function LuckyWordBoxGame() {
  // 设置区状态
  const [rawText, setRawText] = useState('');

  // 游戏状态
  const [gameStarted, setGameStarted] = useState(false);
  const [words, setWords] = useState([]);
  const [round, setRound] = useState(1);
  const [currentWords, setCurrentWords] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [revealedBoxes, setRevealedBoxes] = useState([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [roundFinished, setRoundFinished] = useState(false);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('请选择一个词语，并把它写下来。开奖后看看你得几分！');

  // 获取词语数量
  const getWordCount = () => {
    const parsed = parseWords(rawText);
    return parsed.length > 0 ? parsed.length : DEFAULT_WORDS.length;
  };

  // 开始游戏
  const startGame = () => {
    const parsed = parseWords(rawText);
    let wordPool = parsed.length > 0 ? parsed : [...DEFAULT_WORDS];

    if (wordPool.length < 3) {
      setMessage('至少需要 3 个词语才能开始游戏。');
      return;
    }

    setWords(wordPool);
    const threeWords = pickThreeWords(wordPool);
    setCurrentWords(threeWords);
    setRewards([]);
    setRevealedBoxes([]);
    setRound(1);
    setRoundFinished(false);
    setHistory([]);
    setMessage('请选择一个词语，并把它写下来。开奖后看看你得几分！');
    setGameStarted(true);
  };

  // 生成本轮奖励
  const generateRewards = () => {
    // 固定 [2, 1, 0] 然后打乱
    const baseScores = [2, 1, 0];
    const shuffled = shuffleArray(baseScores);
    setRewards(shuffled);
    return shuffled;
  };

  // 开始开奖
  const startReveal = () => {
    if (isRevealing) return;

    setIsRevealing(true);
    setMessage('开奖中...');

    const roundRewards = generateRewards();
    const revealOrder = [0, 1, 2];
    let revealed = [];

    let delay = 0;
    revealOrder.forEach((index, i) => {
      setTimeout(() => {
        revealed = [...revealed, index];
        setRevealedBoxes(revealed);

        // 最后一个打开后
        if (i === revealOrder.length - 1) {
          setIsRevealing(false);
          setRoundFinished(true);
          setMessage('本轮开奖完成！看看你选择的词语得了几分。');

          // 记录历史
          const roundResult = currentWords.map((word, idx) => ({
            word,
            score: roundRewards[idx]
          }));
          setHistory(prev => [...prev, { round, results: roundResult }]);
        }
      }, delay);
      delay += 600;
    });
  };

  // 下一轮
  const nextRound = () => {
    const threeWords = pickThreeWords(words);
    setCurrentWords(threeWords);
    setRewards([]);
    setRevealedBoxes([]);
    setRoundFinished(false);
    setRound(prev => prev + 1);
    setMessage('请选择一个词语，并把它写下来。开奖后看看你得几分！');
  };

  // 重新开始
  const restartGame = () => {
    const threeWords = pickThreeWords(words);
    setCurrentWords(threeWords);
    setRewards([]);
    setRevealedBoxes([]);
    setRound(1);
    setRoundFinished(false);
    setHistory([]);
    setMessage('请选择一个词语，并把它写下来。开奖后看看你得几分！');
  };

  // 结束游戏
  const endGame = () => {
    setGameStarted(false);
    setWords([]);
    setCurrentWords([]);
    setRewards([]);
    setRevealedBoxes([]);
    setRound(1);
    setRoundFinished(false);
    setHistory([]);
    setMessage('');
  };

  // 获取奖励信息
  const getRewardInfo = (score) => {
    return REWARDS_CONFIG.find(r => r.score === score) || REWARDS_CONFIG[2];
  };

  // ===== 设置区 =====
  if (!gameStarted) {
    return (
      <div className="lwb-settings">
        <div className="lwb-settings-card">
          <h2 className="lwb-title">🎁 词语幸运盒</h2>
          <p className="lwb-description">
            输入词语后，每轮随机出现 3 个词语。学生先选择一个词语，系统再随机开奖，看看每个词语对应几分。
          </p>

          <div className="lwb-form">
            <div className="lwb-form-group">
              <label className="lwb-label">词语输入</label>
              <textarea
                className="lwb-textarea"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={"例如：\n苹果\n香蕉\n橘子\n西瓜\n葡萄\n学校\n老师\n朋友"}
                rows={8}
              />
              <div className="lwb-input-info">
                <span className="lwb-word-count">词语数量：{getWordCount()}</span>
                <span className="lwb-hint">留空将使用默认词语</span>
              </div>
            </div>

            <button className="lwb-btn lwb-btn-start" onClick={startGame}>
              🎮 开始游戏
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 游戏区 =====
  return (
    <div className="lwb-game">
      {/* 顶部状态栏 */}
      <div className="lwb-topbar">
        <button className="lwb-btn lwb-btn-back" onClick={endGame}>
          ← 返回设置
        </button>
        <div className="lwb-topbar-center">
          第 {round} 轮
        </div>
        <div className="lwb-status">
          {isRevealing ? '开奖中...' : roundFinished ? '本轮结果' : '请选择一个词语'}
        </div>
      </div>

      {/* 提示文字 */}
      <div className="lwb-message">{message}</div>

      {/* 主游戏区域 */}
      <div className="lwb-game-area">
        <div className="lwb-boxes-container">
          {currentWords.map((word, index) => {
            const isRevealed = revealedBoxes.includes(index);
            const rewardInfo = isRevealed ? getRewardInfo(rewards[index]) : null;

            return (
              <div key={index} className="lwb-box-item">
                <div className="lwb-word-card">{word}</div>
                <div className={`lwb-lucky-box ${isRevealed ? 'opened' : ''}`}>
                  {isRevealed ? (
                    <div className="lwb-reward">
                      <div className="lwb-reward-icon">{rewardInfo.icon}</div>
                      <div className="lwb-reward-score">{rewardInfo.label}</div>
                    </div>
                  ) : (
                    <div className="lwb-box-closed">
                      <div className="lwb-box-question">?</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="lwb-actions">
        {!roundFinished ? (
          <button
            className="lwb-btn lwb-btn-reveal"
            onClick={startReveal}
            disabled={isRevealing}
          >
            🎁 开始开奖
          </button>
        ) : (
          <button className="lwb-btn lwb-btn-next" onClick={nextRound}>
            ▶ 下一轮
          </button>
        )}
        <button className="lwb-btn lwb-btn-restart" onClick={restartGame}>
          🔄 重新开始
        </button>
        <button className="lwb-btn lwb-btn-end" onClick={endGame}>
          ⏹ 结束游戏
        </button>
      </div>

      {/* 开奖记录 */}
      <div className="lwb-history">
        <h3 className="lwb-history-title">📜 开奖记录</h3>
        {history.length === 0 ? (
          <p className="lwb-history-empty">暂无记录</p>
        ) : (
          <div className="lwb-history-list">
            {history.map((record, index) => (
              <div key={index} className="lwb-history-item">
                <span className="lwb-history-round">第 {record.round} 轮：</span>
                {record.results.map((r, i) => (
                  <span key={i} className="lwb-history-result">
                    {r.word} {r.score}分
                    {i < record.results.length - 1 && ' / '}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LuckyWordBoxGame;
