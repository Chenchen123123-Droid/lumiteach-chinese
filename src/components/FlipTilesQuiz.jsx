import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import './FlipTilesQuiz.css';

/**
 * 翻格子游戏工具
 * 课堂分组翻牌答题游戏
 */
function FlipTilesQuiz() {
  const { lang } = useLanguage();
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  // 游戏步骤：1-录入题目 2-游戏设置 3-开始游戏
  const [step, setStep] = useState(1);

  // 题目数据
  const [questions, setQuestions] = useState([]);
  const [nextId, setNextId] = useState(1);

  // 游戏设置
  const [teamCount, setTeamCount] = useState(2);
  const [tileCount, setTileCount] = useState(12);
  const [enableRandom, setEnableRandom] = useState(true);
  const [randomLevel, setRandomLevel] = useState('normal');

  // 游戏状态
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [tiles, setTiles] = useState([]);
  const [revealedTiles, setRevealedTiles] = useState([]);
  const [gameStatus, setGameStatus] = useState('setup'); // setup / playing / ended

  // 当前弹窗
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [currentTile, setCurrentTile] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // 从 localStorage 恢复
  useEffect(() => {
    const saved = localStorage.getItem('flip-tiles-quiz');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.questions) setQuestions(data.questions);
        if (data.nextId) setNextId(data.nextId);
        if (data.teamCount) setTeamCount(data.teamCount);
        if (data.tileCount) setTileCount(data.tileCount);
        if (data.enableRandom !== undefined) setEnableRandom(data.enableRandom);
        if (data.randomLevel) setRandomLevel(data.randomLevel);

        // 如果有未完成的游戏，询问是否恢复
        if (data.gameStatus === 'playing') {
          const shouldRestore = window.confirm(lang === 'zh'
            ? '检测到未完成的游戏，是否恢复？'
            : 'An unfinished game was found. Restore it?');
          if (shouldRestore) {
            setTeams(data.teams || []);
            setCurrentTeam(data.currentTeam || 0);
            setTiles(data.tiles || []);
            setRevealedTiles(data.revealedTiles || []);
            setGameStatus('playing');
            setStep(3);
          }
        }
      } catch (e) {
        console.error('Failed to restore data', e);
      }
    }
  }, []);

  // 自动保存到 localStorage
  useEffect(() => {
    const data = {
      questions,
      nextId,
      teamCount,
      tileCount,
      enableRandom,
      randomLevel,
      teams,
      currentTeam,
      tiles,
      revealedTiles,
      gameStatus
    };
    localStorage.setItem('flip-tiles-quiz', JSON.stringify(data));
  }, [questions, nextId, teamCount, tileCount, enableRandom, randomLevel, teams, currentTeam, tiles, revealedTiles, gameStatus]);

  // 添加题目
  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      id: nextId,
      question: '',
      answer: '',
      points: 10
    }]);
    setNextId(prev => prev + 1);
    showSuccess(lang === 'zh' ? '已添加题目' : 'Question added');
  };

  // 更新题目
  const updateQuestion = (id, field, value) => {
    setQuestions(prev => prev.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  // 删除题目
  const deleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    showSuccess(lang === 'zh' ? '已删除题目' : 'Question deleted');
  };

  // 复制题目
  const copyQuestion = (question) => {
    setQuestions(prev => [...prev, {
      ...question,
      id: nextId,
      question: question.question + ' (copy)',
      answer: question.answer
    }]);
    setNextId(prev => prev + 1);
    showSuccess(lang === 'zh' ? '已复制题目' : 'Question copied');
  };

  // 批量导入
  const importQuestions = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());

        const newQuestions = [];
        for (const line of lines) {
          const parts = line.split('|');
          newQuestions.push({
            id: nextId + newQuestions.length,
            question: parts[0]?.trim() || '',
            answer: parts[1]?.trim() || '',
            points: parts[2] ? parseInt(parts[2]) : 10
          });
        }

        setQuestions(prev => [...prev, ...newQuestions]);
        setNextId(prev => prev + newQuestions.length);
        showSuccess(lang === 'zh'
          ? `已导入 ${newQuestions.length} 道题目`
          : `Imported ${newQuestions.length} questions`);
      } catch (err) {
        showError(lang === 'zh' ? '导入失败' : 'Import failed');
      }
    };
    input.click();
  };

  // 清空题目
  const clearQuestions = () => {
    setQuestions([]);
    showSuccess(lang === 'zh' ? '已清空题目' : 'Questions cleared');
  };

  // 导出配置
  const exportConfig = () => {
    const config = {
      version: 1,
      questions,
      teamCount,
      tileCount,
      enableRandom,
      randomLevel
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flip-tiles-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess(lang === 'zh' ? '已导出配置' : 'Config exported');
  };

  // 导入配置
  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const config = JSON.parse(text);
        if (config.questions) setQuestions(config.questions);
        if (config.teamCount) setTeamCount(config.teamCount);
        if (config.tileCount) setTileCount(config.tileCount);
        if (config.enableRandom !== undefined) setEnableRandom(config.enableRandom);
        if (config.randomLevel) setRandomLevel(config.randomLevel);
        showSuccess(lang === 'zh' ? '已导入配置' : 'Config imported');
      } catch (err) {
        showError(lang === 'zh' ? '导入失败' : 'Import failed');
      }
    };
    input.click();
  };

  // 生成格子
  const generateTiles = useCallback(() => {
    const questionIndices = [];
    for (let i = 0; i < questions.length; i++) {
      questionIndices.push({ type: 'question', index: i });
    }

    // 随机事件比例
    let bonusCount = 0;
    let penaltyCount = 0;
    let giftCount = 0;

    if (enableRandom) {
      const totalTiles = tileCount;
      const questionCount = questions.length;
      const freeTiles = totalTiles - questionCount;

      if (randomLevel === 'low') {
        bonusCount = Math.floor(freeTiles * 0.15);
        penaltyCount = Math.floor(freeTiles * 0.1);
      } else if (randomLevel === 'normal') {
        bonusCount = Math.floor(freeTiles * 0.2);
        penaltyCount = Math.floor(freeTiles * 0.15);
      } else {
        bonusCount = Math.floor(freeTiles * 0.25);
        penaltyCount = Math.floor(freeTiles * 0.2);
      }

      const used = bonusCount + penaltyCount;
      giftCount = Math.max(0, freeTiles - used);
    }

    const newTiles = [...questionIndices];

    // 添加奖励格
    for (let i = 0; i < bonusCount; i++) {
      newTiles.push({ type: 'bonus' });
    }
    // 添加惩罚格
    for (let i = 0; i < penaltyCount; i++) {
      newTiles.push({ type: 'penalty' });
    }
    // 添加赠送格
    for (let i = 0; i < giftCount; i++) {
      newTiles.push({ type: 'gift' });
    }

    // 随机打乱
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
    }

    return newTiles;
  }, [questions, tileCount, enableRandom, randomLevel]);

  // 开始游戏
  const startGame = () => {
    if (questions.length === 0) {
      showError(lang === 'zh' ? '请先添加题目' : 'Please add questions first');
      return;
    }

    if (tileCount < questions.length) {
      showError(lang === 'zh'
        ? '格子数量不能少于题目数量'
        : 'Tile count cannot be less than question count');
      return;
    }

    // 初始化队伍
    const newTeams = [];
    for (let i = 0; i < teamCount; i++) {
      newTeams.push({ id: i, name: `${lang === 'zh' ? '第' : 'Team'}${i + 1}${lang === 'zh' ? '组' : ''}`, score: 0 });
    }

    setTeams(newTeams);
    setCurrentTeam(0);
    setTiles(generateTiles());
    setRevealedTiles([]);
    setGameStatus('playing');
    setStep(3);
    showSuccess(lang === 'zh' ? '游戏开始！' : 'Game started!');
  };

  // 点击格子
  const handleTileClick = (index) => {
    if (revealedTiles.includes(index)) return;

    const tile = tiles[index];
    setCurrentTile({ ...tile, index });
    setRevealedTiles(prev => [...prev, index]);

    if (tile.type === 'question') {
      setShowQuestionModal(true);
    } else if (tile.type === 'bonus') {
      setShowBonusModal(true);
    } else if (tile.type === 'penalty') {
      setShowPenaltyModal(true);
    } else if (tile.type === 'gift') {
      setShowGiftModal(true);
    }
  };

  // 答对
  const handleCorrect = () => {
    const question = questions[currentTile.index];
    setTeams(prev => prev.map((t, i) =>
      i === currentTeam ? { ...t, score: t.score + question.points } : t
    ));
    showSuccess(lang === 'zh' ? '答对了！' : 'Correct!');
    setShowQuestionModal(false);
    goToNextTeam();
  };

  // 答错
  const handleWrong = () => {
    showInfo(lang === 'zh' ? '答错了' : 'Wrong answer');
    setShowQuestionModal(false);
    goToNextTeam();
  };

  // 跳过
  const handleSkip = () => {
    setShowQuestionModal(false);
    goToNextTeam();
  };

  // 领取奖励
  const handleCollectBonus = () => {
    const bonusPoints = [5, 10, 15][Math.floor(Math.random() * 3)];
    setTeams(prev => prev.map((t, i) =>
      i === currentTeam ? { ...t, score: t.score + bonusPoints } : t
    ));
    showSuccess(lang === 'zh' ? `获得 ${bonusPoints} 分！` : `+${bonusPoints} points!`);
    setShowBonusModal(false);
    goToNextTeam();
  };

  // 确认惩罚
  const handleConfirmPenalty = () => {
    const penaltyPoints = [-5, -10, -15][Math.floor(Math.random() * 3)];
    setTeams(prev => prev.map((t, i) =>
      i === currentTeam ? { ...t, score: t.score + penaltyPoints } : t
    ));
    showWarning(lang === 'zh' ? `扣除 ${Math.abs(penaltyPoints)} 分` : `${penaltyPoints} points`);
    setShowPenaltyModal(false);
    goToNextTeam();
  };

  // 赠送分数
  const handleGiveGift = (targetTeamId) => {
    const giftPoints = [5, 10, 15][Math.floor(Math.random() * 3)];
    setTeams(prev => prev.map((t, i) =>
      i === targetTeamId ? { ...t, score: t.score + giftPoints } : t
    ));
    showSuccess(lang === 'zh' ? `赠送给第${targetTeamId + 1}组 ${giftPoints}分！` : `Gave ${giftPoints} to Team ${targetTeamId + 1}!`);
    setShowGiftModal(false);
    goToNextTeam();
  };

  // 切换到下一组
  const goToNextTeam = () => {
    const next = (currentTeam + 1) % teamCount;
    setCurrentTeam(next);

    // 检查是否所有格子都翻开了
    if (revealedTiles.length + 1 >= tiles.length) {
      setTimeout(() => {
        setShowEndModal(true);
        setGameStatus('ended');
      }, 500);
    }
  };

  // 重置游戏
  const resetGame = () => {
    setTeams([]);
    setCurrentTeam(0);
    setTiles([]);
    setRevealedTiles([]);
    setGameStatus('setup');
    setStep(1);
    setShowEndModal(false);
    showSuccess(lang === 'zh' ? '游戏已重置' : 'Game reset');
  };

  // 全屏
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        showError(lang === 'zh' ? '浏览器不支持全屏' : 'Fullscreen not supported');
      });
    } else {
      document.exitFullscreen();
    }
  };

  // 获取冠军
  const getWinner = () => {
    if (teams.length === 0) return null;
    const maxScore = Math.max(...teams.map(t => t.score));
    const winners = teams.filter(t => t.score === maxScore);
    return winners.length === 1 ? winners[0] : winners;
  };

  // 渲染步骤1：录入题目
  const renderStep1 = () => (
    <div className="flip-step-container">
      <div className="step-header-section">
        <h1>{lang === 'zh' ? '翻格子' : 'Flip Tiles Quiz'}</h1>
        <p>{lang === 'zh'
          ? '录入你的课堂题目，设置分值，准备开始互动！'
          : 'Add your classroom questions, set points, and get ready to play.'}</p>
      </div>

      <div className="questions-list">
        {questions.map((q, idx) => (
          <div key={q.id} className="question-card">
            <div className="question-number">{idx + 1}</div>
            <div className="question-fields">
              <div className="question-field">
                <label>{lang === 'zh' ? '题目' : 'Question'}</label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                  placeholder={lang === 'zh' ? '请输入题目……' : 'Enter your question...'}
                />
              </div>
              <div className="question-field">
                <label>{lang === 'zh' ? '标准答案（仅供教师参考）' : 'Answer (for teacher)'}</label>
                <input
                  type="text"
                  value={q.answer}
                  onChange={(e) => updateQuestion(q.id, 'answer', e.target.value)}
                  placeholder={lang === 'zh' ? '请输入正确答案……' : 'Enter the answer...'}
                />
              </div>
              <div className="question-field small">
                <label>{lang === 'zh' ? '分值' : 'Points'}</label>
                <input
                  type="number"
                  value={q.points}
                  onChange={(e) => updateQuestion(q.id, 'points', parseInt(e.target.value) || 10)}
                  min="1"
                />
              </div>
            </div>
            <div className="question-actions">
              <button className="copy-btn" onClick={() => copyQuestion(q)} title={lang === 'zh' ? '复制' : 'Copy'}>📋</button>
              <button className="delete-btn" onClick={() => deleteQuestion(q.id)} title={lang === 'zh' ? '删除' : 'Delete'}>🗑️</button>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="empty-state">
            <p>{lang === 'zh' ? '还没有题目，点击添加' : 'No questions yet, click to add'}</p>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="add-btn primary" onClick={addQuestion}>
          + {lang === 'zh' ? '添加题目' : 'Add Question'}
        </button>
        <button className="import-btn" onClick={importQuestions}>
          {lang === 'zh' ? '批量导入' : 'Batch Import'}
        </button>
        <button className="export-btn" onClick={exportConfig}>
          {lang === 'zh' ? '导出配置' : 'Export'}
        </button>
        <button className="import-config-btn" onClick={importConfig}>
          {lang === 'zh' ? '导入配置' : 'Import'}
        </button>
        {questions.length > 0 && (
          <button className="clear-btn" onClick={clearQuestions}>
            {lang === 'zh' ? '清空题目' : 'Clear All'}
          </button>
        )}
      </div>

      <div className="step-nav">
        <button
          className="next-btn"
          onClick={() => setStep(2)}
          disabled={questions.length === 0}
        >
          {lang === 'zh' ? '下一步 →' : 'Next →'}
        </button>
      </div>
    </div>
  );

  // 渲染步骤2：游戏设置
  const renderStep2 = () => (
    <div className="flip-step-container">
      <div className="step-header-section">
        <h1>{lang === 'zh' ? '游戏设置' : 'Game Settings'}</h1>
        <p>{lang === 'zh'
          ? '配置分组与卡牌数量，点击开始进入课堂模式。'
          : 'Configure teams and tiles, then start the game.'}</p>
      </div>

      <div className="settings-card">
        <div className="setting-item">
          <label>{lang === 'zh' ? '分组数量' : 'Team Count'}</label>
          <div className="setting-options">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                className={`option-btn ${teamCount === n ? 'active' : ''}`}
                onClick={() => setTeamCount(n)}
              >
                {n} {lang === 'zh' ? '组' : 'Teams'}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-item">
          <label>{lang === 'zh' ? '卡牌总数' : 'Tile Count'}</label>
          <div className="setting-options">
            {[8, 12, 16].map(n => (
              <button
                key={n}
                className={`option-btn ${tileCount === n ? 'active' : ''}`}
                onClick={() => setTileCount(n)}
                disabled={n < questions.length}
              >
                {n} {lang === 'zh' ? '格' : 'Tiles'}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-item">
          <label>{lang === 'zh' ? '启用随机奖励惩罚' : 'Enable Random Events'}</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={enableRandom}
              onChange={(e) => setEnableRandom(e.target.checked)}
            />
            <span>{enableRandom ? lang === 'zh' ? '开启' : 'On' : lang === 'zh' ? '关闭' : 'Off'}</span>
          </div>
        </div>

        {enableRandom && (
          <div className="setting-item">
            <label>{lang === 'zh' ? '随机事件比例' : 'Random Event Level'}</label>
            <div className="setting-options">
              {['low', 'normal', 'high'].map(level => (
                <button
                  key={level}
                  className={`option-btn ${randomLevel === level ? 'active' : ''}`}
                  onClick={() => setRandomLevel(level)}
                >
                  {lang === 'zh'
                    ? (level === 'low' ? '少量' : level === 'normal' ? '普通' : '较多')
                    : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="game-preview">
        <h3>{lang === 'zh' ? '游戏预览' : 'Game Preview'}</h3>
        <div className="preview-info">
          <span>{lang === 'zh' ? '题目数量' : 'Questions'}: {questions.length}</span>
          <span>{lang === 'zh' ? '分组' : 'Teams'}: {teamCount}</span>
          <span>{lang === 'zh' ? '格子' : 'Tiles'}: {tileCount}</span>
          <span>{lang === 'zh' ? '奖励/惩罚' : 'Bonus/Penalty'}: {enableRandom ? lang === 'zh' ? '是' : 'Yes' : lang === 'zh' ? '否' : 'No'}</span>
        </div>
      </div>

      <div className="step-nav">
        <button className="back-btn" onClick={() => setStep(1)}>
          {lang === 'zh' ? '← 上一步' : '← Back'}
        </button>
        <button className="start-btn primary" onClick={startGame}>
          {lang === 'zh' ? '开始游戏 →' : 'Start Game →'}
        </button>
      </div>
    </div>
  );

  // 渲染步骤3：游戏主界面
  const renderStep3 = () => (
    <div className="flip-game-container">
      {/* 顶部：分数面板 */}
      <div className="score-panel">
        <div className="team-scores">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className={`team-score ${idx === currentTeam ? 'current' : ''}`}
            >
              <span className="team-name">{team.name}</span>
              <span className="team-points">{team.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 中间：格子区域 */}
      <div className="tiles-grid" style={{
        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(tileCount))}, 1fr)`
      }}>
        {tiles.map((tile, idx) => {
          const isRevealed = revealedTiles.includes(idx);
          return (
            <div
              key={idx}
              className={`tile ${isRevealed ? 'revealed' : ''} ${tile.type}`}
              onClick={() => !isRevealed && handleTileClick(idx)}
            >
              {isRevealed ? (
                <span className="tile-done">
                  {tile.type === 'question' ? '✓' : tile.type === 'bonus' ? '🎁' : tile.type === 'penalty' ? '😵' : '🎁'}
                </span>
              ) : (
                <span className="tile-number">{idx + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部：控制栏 */}
      <div className="game-controls">
        <div className="current-turn">
          {lang === 'zh' ? `当前轮到：${teams[currentTeam]?.name || ''}` : `Current Turn: ${teams[currentTeam]?.name || ''}`}
        </div>
        <div className="control-buttons">
          <button className="reset-btn" onClick={resetGame}>
            {lang === 'zh' ? '重置' : 'Reset'}
          </button>
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            {lang === 'zh' ? '全屏' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* 题目弹窗 */}
      {showQuestionModal && currentTile && (
        <div className="modal-overlay" onClick={() => setShowQuestionModal(false)}>
          <div className="modal-content question-modal" onClick={e => e.stopPropagation()}>
            <h2>{lang === 'zh' ? '题目' : 'Question'}</h2>
            <div className="question-display">
              <span className="points-badge">{questions[currentTile.index]?.points || 10} {lang === 'zh' ? '分' : 'pts'}</span>
              <p className="question-text">{questions[currentTile.index]?.question || ''}</p>
            </div>

            <div className="answer-section">
              <button className="toggle-answer-btn" onClick={() => setShowAnswer(!showAnswer)}>
                {showAnswer ? (lang === 'zh' ? '隐藏答案' : 'Hide Answer') : (lang === 'zh' ? '显示答案' : 'Show Answer')}
              </button>
              {showAnswer && (
                <p className="answer-text">{questions[currentTile.index]?.answer || ''}</p>
              )}
            </div>

            <div className="modal-actions">
              <button className="wrong-btn" onClick={handleWrong}>
                {lang === 'zh' ? '答错' : 'Wrong'}
              </button>
              <button className="skip-btn" onClick={handleSkip}>
                {lang === 'zh' ? '跳过' : 'Skip'}
              </button>
              <button className="correct-btn" onClick={handleCorrect}>
                {lang === 'zh' ? '答对' : 'Correct!'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 奖励弹窗 */}
      {showBonusModal && (
        <div className="modal-overlay" onClick={() => setShowBonusModal(false)}>
          <div className="modal-content bonus-modal" onClick={e => e.stopPropagation()}>
            <h2>🎁 {lang === 'zh' ? '奖励分数' : 'Bonus Points'}</h2>
            <p>{lang === 'zh' ? '恭喜！当前小组获得奖励分！' : 'Congratulations! Your team gets bonus points!'}</p>
            <button className="collect-btn" onClick={handleCollectBonus}>
              {lang === 'zh' ? '领取奖励' : 'Collect!'}
            </button>
          </div>
        </div>
      )}

      {/* 惩罚弹窗 */}
      {showPenaltyModal && (
        <div className="modal-overlay" onClick={() => setShowPenaltyModal(false)}>
          <div className="modal-content penalty-modal" onClick={e => e.stopPropagation()}>
            <h2>😵 {lang === 'zh' ? '扣分' : 'Penalty'}</h2>
            <p>{lang === 'zh' ? '当前小组扣除分数。' : 'Your team loses points.'}</p>
            <button className="confirm-btn" onClick={handleConfirmPenalty}>
              {lang === 'zh' ? '明白啦' : 'OK'}
            </button>
          </div>
        </div>
      )}

      {/* 赠送弹窗 */}
      {showGiftModal && (
        <div className="modal-overlay" onClick={() => setShowGiftModal(false)}>
          <div className="modal-content gift-modal" onClick={e => e.stopPropagation()}>
            <h2>🎁 {lang === 'zh' ? '赠送分数' : 'Give Points'}</h2>
            <p>{lang === 'zh' ? '选择一个小组赠送分数。' : 'Choose a team to give points to.'}</p>
            <div className="gift-teams">
              {teams.filter((t, i) => i !== currentTeam).map(team => (
                <button
                  key={team.id}
                  className="gift-team-btn"
                  onClick={() => handleGiveGift(team.id)}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 结束弹窗 */}
      {showEndModal && (
        <div className="modal-overlay">
          <div className="modal-content end-modal" onClick={e => e.stopPropagation()}>
            <h2>🏆 {lang === 'zh' ? '游戏结束' : 'Game Over'}</h2>
            <div className="final-scores">
              {teams.map(team => (
                <div key={team.id} className="final-score">
                  <span>{team.name}</span>
                  <span className="score-value">{team.score}</span>
                </div>
              ))}
            </div>
            <div className="winner">
              {lang === 'zh' ? '冠军：' : 'Winner: '}
              {Array.isArray(getWinner())
                ? getWinner().map(t => t.name).join(', ')
                : getWinner()?.name}
            </div>
            <div className="modal-actions">
              <button className="restart-btn" onClick={resetGame}>
                {lang === 'zh' ? '再玩一次' : 'Play Again'}
              </button>
              <button className="back-btn" onClick={() => { setShowEndModal(false); setStep(1); }}>
                {lang === 'zh' ? '返回题目' : 'Back to Questions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flip-tiles-page">
      {/* 步骤进度 */}
      <div className="step-progress">
        <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <span>1</span>
        </div>
        <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <span>2</span>
        </div>
        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>
          <span>3</span>
        </div>
        <div className="step-labels">
          <span>{lang === 'zh' ? '录入题目' : 'Add Questions'}</span>
          <span>{lang === 'zh' ? '游戏设置' : 'Settings'}</span>
          <span>{lang === 'zh' ? '开始游戏' : 'Play'}</span>
        </div>
      </div>

      {/* 步骤内容 */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}

export default FlipTilesQuiz;
