import React, { useState, useEffect } from 'react';
import { extractWords, generatePinyinPlaceholder, generateMeaningPlaceholder } from '../utils/textUtils';
import './WordMatchGame.css';

/**
 * 词语配对游戏组件
 * 功能：将中文词语与拼音或解释配对
 *
 * 扩展预留：
 * - 可接入拼音API自动生成拼音
 * - 可接入翻译API生成英文解释
 * - 可添加图片配对模式
 * - 可添加计时和得分功能
 */
function WordMatchGame({ text, isFullscreen, onToggleFullscreen }) {
  const [leftCards, setLeftCards] = useState([]);
  const [rightCards, setRightCards] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);

  // 初始化配对卡片
  useEffect(() => {
    const words = extractWords(text, 6);

    if (words.length === 0) return;

    const newLeftCards = words.map((word, index) => ({
      id: `left-${index}`,
      text: word,
      pairId: index
    }));

    const newRightCards = words.map((word, index) => ({
      id: `right-${index}`,
      text: generatePinyinPlaceholder(word),
      meaning: generateMeaningPlaceholder(word),
      pairId: index
    }));

    // 打乱右侧卡片
    setLeftCards(newLeftCards);
    setRightCards(shuffleRightCards(newRightCards));
    setMatched([]);
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [text]);

  // 打乱右侧卡片
  const shuffleRightCards = (cards) => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 点击左侧卡片
  const handleLeftClick = (card) => {
    if (matched.includes(card.pairId)) return;

    setSelectedLeft(card);

    // 如果右侧已选中，检查匹配
    if (selectedRight) {
      checkMatch(card, selectedRight);
    }
  };

  // 点击右侧卡片
  const handleRightClick = (card) => {
    if (matched.includes(card.pairId)) return;

    setSelectedRight(card);

    // 如果左侧已选中，检查匹配
    if (selectedLeft) {
      checkMatch(selectedLeft, card);
    }
  };

  // 检查匹配
  const checkMatch = (left, right) => {
    if (left.pairId === right.pairId) {
      // 匹配成功
      setMatched([...matched, left.pairId]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setWrongPair(null);
    } else {
      // 匹配失败
      setWrongPair({ left: left.id, right: right.id });
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
      }, 1000);
    }
  };

  // 重新开始
  const handleRestart = () => {
    setMatched([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongPair(null);
    setRightCards(shuffleRightCards(rightCards));
  };

  // 是否全部匹配完成
  const allMatched = leftCards.length > 0 && matched.length === leftCards.length;

  return (
    <div className={`matching-game ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="game-header">
        <h2 className="game-title">👥 词语配对游戏</h2>
        <button
          className="btn-fullscreen"
          onClick={onToggleFullscreen}
          title={isFullscreen ? '退出全屏' : '全屏模式'}
        >
          {isFullscreen ? '✕ 退出全屏' : '⛶ 全屏上课'}
        </button>
      </div>

      <div className="game-instruction">
        <p>📝 点击左侧词语和右侧解释，找到正确的配对</p>
      </div>

      {allMatched && (
        <div className="completion-message">
          🎉 恭喜！全部配对成功！
        </div>
      )}

      <div className="match-columns">
        <div className="match-column left-column">
          <h3 className="column-title">中文词语</h3>
          <div className="cards-list">
            {leftCards.map((card) => (
              <div
                key={card.id}
                className={`match-card left-card ${
                  selectedLeft?.id === card.id ? 'selected' : ''
                } ${
                  matched.includes(card.pairId) ? 'matched' : ''
                } ${
                  wrongPair?.left === card.id ? 'wrong' : ''
                }`}
                onClick={() => handleLeftClick(card)}
              >
                {card.text}
              </div>
            ))}
          </div>
        </div>

        <div className="match-divider">
          <span className="divider-icon">⇄</span>
        </div>

        <div className="match-column right-column">
          <h3 className="column-title">拼音 / 解释</h3>
          <div className="cards-list">
            {rightCards.map((card) => (
              <div
                key={card.id}
                className={`match-card right-card ${
                  selectedRight?.id === card.id ? 'selected' : ''
                } ${
                  matched.includes(card.pairId) ? 'matched' : ''
                } ${
                  wrongPair?.right === card.id ? 'wrong' : ''
                }`}
                onClick={() => handleRightClick(card)}
              >
                <span className="pinyin-text">{card.text}</span>
                <span className="meaning-text">{card.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="match-progress">
        <span>已匹配：{matched.length} / {leftCards.length}</span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(matched.length / leftCards.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="game-controls">
        <button className="btn-control btn-restart" onClick={handleRestart}>
          🔄 重新开始
        </button>
      </div>

      <div className="game-tips">
        <p>💡 提示：先选择左侧的词语，再选择右侧对应的拼音或解释。第一版拼音和解释为占位内容，后续版本将自动生成。</p>
      </div>
    </div>
  );
}

export default WordMatchGame;
