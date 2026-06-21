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
function DisappearingTextGame({ text = '', isFullscreen, onToggleFullscreen }) {
  // 难度级别配置
  const levels = [
    { name: '第 1 轮', percent: 0, description: '完整课文' },
    { name: '第 2 轮', percent: 20, description: '隐藏 20%' },
    { name: '第 3 轮', percent: 40, description: '隐藏 40%' },
    { name: '第 4 轮', percent: 60, description: '隐藏 60%' },
    { name: '第 5 轮', percent: 80, description: '隐藏 80%' }
  ];

  const [draftText, setDraftText] = useState(text);
  const [localText, setLocalText] = useState(text.trim());
  const effectiveText = text.trim() || localText;
  const [currentLevel, setCurrentLevel] = useState(0);
  const [displayText, setDisplayText] = useState(effectiveText);
  const [tokens, setTokens] = useState([]);

  // 初始化分词
  useEffect(() => {
    const words = simpleTokenize(effectiveText);
    setTokens(words);
    setCurrentLevel(0);
    setDisplayText(effectiveText);
  }, [effectiveText]);

  // 更新显示文本
  useEffect(() => {
    const { displayText: newDisplayText } = hideText(effectiveText, levels[currentLevel].percent);
    setDisplayText(newDisplayText);
  }, [currentLevel, effectiveText]);

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

  if (!effectiveText) {
    return (
      <div className="text-tool-setup">
        <div className="text-tool-setup-card">
          <span className="text-tool-icon">🎯</span>
          <h1>课文消失挑战</h1>
          <p>粘贴要练习的课文。开始后，文字会按轮次逐渐隐藏。</p>
          <label htmlFor="disappearing-source">课文内容</label>
          <textarea
            id="disappearing-source"
            value={draftText}
            onChange={event => setDraftText(event.target.value)}
            placeholder="例如：今天阳光很好，我们一起去公园散步。"
            rows={9}
          />
          <div className="text-tool-setup-actions">
            <button type="button" className="btn-secondary" onClick={() => setDraftText('今天阳光很好，我们一起去公园散步。公园里有很多花，也有很多人在运动。')}>加载示例</button>
            <button type="button" className="btn-primary" disabled={!draftText.trim()} onClick={() => setLocalText(draftText.trim())}>开始挑战</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`disappearing-game ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="game-header">
        <h2 className="game-title">🎯 课文消失挑战</h2>
        <div className="game-header-actions">
          {!text.trim() && <button className="btn-fullscreen" onClick={() => { setDraftText(localText); setLocalText(''); }}>修改课文</button>}
          <button className="btn-fullscreen" onClick={onToggleFullscreen} title={isFullscreen ? '退出全屏' : '全屏模式'}>
            {isFullscreen ? '✕ 退出全屏' : '⛶ 全屏上课'}
          </button>
        </div>
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
