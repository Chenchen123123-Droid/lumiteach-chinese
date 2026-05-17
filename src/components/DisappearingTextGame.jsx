import React, { useState, useEffect } from 'react';
import { hideText, simpleTokenize } from '../utils/textUtils';
import './DisappearingTextGame.css';

/**
 * 课文消失挑战游戏组件
 * 功能：逐轮隐藏课文中的词语，锻炼学生记忆和复述能力
 *
 * 扩展预留：
 * - 可添加自定义隐藏百分比
 * - 可添加计时功能
 * - 可添加语音朗读
 */
function DisappearingTextGame({ text, isFullscreen, onToggleFullscreen }) {
  // 难度级别配置
  const levels = [
    { name: '第 1 轮', percent: 0, description: '完整课文' },
    { name: '第 2 轮', percent: 20, description: '隐藏 20%' },
    { name: '第 3 轮', percent: 40, description: '隐藏 40%' },
    { name: '第 4 轮', percent: 60, description: '隐藏 60%' },
    { name: '第 5 轮', percent: 80, description: '隐藏 80%' }
  ];

  const [currentLevel, setCurrentLevel] = useState(0);
  const [displayText, setDisplayText] = useState(text);
  const [tokens, setTokens] = useState([]);

  // 初始化分词
  useEffect(() => {
    const words = simpleTokenize(text);
    setTokens(words);
    setCurrentLevel(0);
    setDisplayText(text);
  }, [text]);

  // 更新显示文本
  useEffect(() => {
    const { displayText: newDisplayText } = hideText(text, levels[currentLevel].percent);
    setDisplayText(newDisplayText);
  }, [currentLevel, text]);

  const handlePrevious = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
    }
  };

  const handleNext = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const handleReset = () => {
    setCurrentLevel(0);
  };

  return (
    <div className={`disappearing-game ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="game-header">
        <h2 className="game-title">🎯 课文消失挑战</h2>
        <button
          className="btn-fullscreen"
          onClick={onToggleFullscreen}
          title={isFullscreen ? '退出全屏' : '全屏模式'}
        >
          {isFullscreen ? '✕ 退出全屏' : '⛶ 全屏上课'}
        </button>
      </div>

      <div className="level-info">
        <span className="level-name">{levels[currentLevel].name}</span>
        <span className="level-description">{levels[currentLevel].description}</span>
        <span className="token-count">共 {tokens.length} 个词语</span>
      </div>

      <div className="text-display-area">
        <div className="display-text">
          {displayText}
        </div>
      </div>

      <div className="game-controls">
        <button
          className="btn-control btn-prev"
          onClick={handlePrevious}
          disabled={currentLevel === 0}
        >
          ← 上一轮
        </button>

        <button
          className="btn-control btn-reset"
          onClick={handleReset}
        >
          ↺ 重置
        </button>

        <button
          className="btn-control btn-next"
          onClick={handleNext}
          disabled={currentLevel === levels.length - 1}
        >
          下一轮 →
        </button>
      </div>

      <div className="level-progress">
        {levels.map((level, index) => (
          <div
            key={index}
            className={`progress-dot ${index === currentLevel ? 'active' : ''} ${index < currentLevel ? 'completed' : ''}`}
            onClick={() => setCurrentLevel(index)}
            title={level.name}
          />
        ))}
      </div>

      <div className="game-tips">
        <p>💡 提示：让学生朗读或复述课文，随着难度增加，学生需要记住更多内容。</p>
      </div>
    </div>
  );
}

export default DisappearingTextGame;
