import React, { useState, useEffect } from 'react';
import { createSentenceCards, shuffleArray, checkSentenceOrder } from '../utils/textUtils';
import './SentenceOrderGame.css';

/**
 * 句子排序游戏组件
 * 功能：将句子打乱，让学生通过拖拽重新排序
 *
 * 扩展预留：
 * - 可添加计时功能
 * - 可添加多句子关卡
 * - 可添加提示功能
 */
function SentenceOrderGame({ text, isFullscreen, onToggleFullscreen }) {
  const [cards, setCards] = useState([]);
  const [draggedCard, setDraggedCard] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // 初始化卡片
  useEffect(() => {
    const newCards = createSentenceCards(text);
    if (newCards.length > 0) {
      setCards(shuffleArray(newCards));
    }
    setFeedback(null);
    setShowAnswer(false);
  }, [text]);

  // 拖拽开始
  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 拖拽经过
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 拖拽放下
  const handleDrop = (e, targetCard) => {
    e.preventDefault();
    if (!draggedCard || draggedCard.id === targetCard.id) return;

    const newCards = [...cards];
    const draggedIndex = newCards.findIndex(c => c.id === draggedCard.id);
    const targetIndex = newCards.findIndex(c => c.id === targetCard.id);

    // 交换位置
    [newCards[draggedIndex], newCards[targetIndex]] = [newCards[targetIndex], newCards[draggedIndex]];
    setCards(newCards);
    setDraggedCard(null);
    setFeedback(null);
  };

  // 检查答案
  const handleCheckAnswer = () => {
    const isCorrect = checkSentenceOrder(cards);
    setFeedback(isCorrect ? 'correct' : 'wrong');
  };

  // 显示答案
  const handleShowAnswer = () => {
    const sortedCards = [...cards].sort((a, b) => a.originalIndex - b.originalIndex);
    setCards(sortedCards);
    setShowAnswer(true);
    setFeedback('correct');
  };

  // 重新打乱
  const handleReshuffle = () => {
    setCards(shuffleArray(cards));
    setFeedback(null);
    setShowAnswer(false);
  };

  return (
    <div className={`sentence-game ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="game-header">
        <h2 className="game-title">🔄 句子排序游戏</h2>
        <button
          className="btn-fullscreen"
          onClick={onToggleFullscreen}
          title={isFullscreen ? '退出全屏' : '全屏模式'}
        >
          {isFullscreen ? '✕ 退出全屏' : '⛶ 全屏上课'}
        </button>
      </div>

      <div className="game-instruction">
        <p>📝 拖拽下方的卡片，将句子按正确顺序排列</p>
      </div>

      <div className="cards-container">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`word-card ${feedback === 'correct' && card.originalIndex === index ? 'correct-position' : ''} ${showAnswer ? 'show-answer' : ''}`}
            draggable={!showAnswer}
            onDragStart={(e) => handleDragStart(e, card)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, card)}
          >
            <span className="card-number">{index + 1}</span>
            <span className="card-text">{card.text}</span>
          </div>
        ))}
      </div>

      {feedback && (
        <div className={`feedback-message ${feedback}`}>
          {feedback === 'correct' ? (
            <span>🎉 回答正确！太棒了！</span>
          ) : (
            <span>💪 再试一次！你可以的！</span>
          )}
        </div>
      )}

      <div className="game-controls">
        <button
          className="btn-control btn-check"
          onClick={handleCheckAnswer}
          disabled={showAnswer}
        >
          ✓ 检查答案
        </button>

        <button
          className="btn-control btn-answer"
          onClick={handleShowAnswer}
          disabled={showAnswer}
        >
          👁 显示答案
        </button>

        <button
          className="btn-control btn-reshuffle"
          onClick={handleReshuffle}
        >
          🔀 重新打乱
        </button>
      </div>

      <div className="game-tips">
        <p>💡 提示：观察句子结构，注意主语、谓语、宾语的顺序。</p>
      </div>
    </div>
  );
}

export default SentenceOrderGame;
