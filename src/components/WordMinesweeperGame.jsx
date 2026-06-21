import React, { useState, useCallback } from 'react';
import './WordMinesweeperGame.css';

/**
 * 词语扫雷游戏组件
 * 功能：两队轮流点击格子，安全格得分，地雷格不得分
 */

const DEFAULT_ITEMS = [
  '苹果', '香蕉', '橘子', '学校', '老师',
  '朋友', '今天', '天气', '很好', '中国'
];

/** 解析内容 */
function parseItems(text) {
  if (!text.trim()) return [];
  return text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
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

/** 生成棋盘 */
function generateBoard(gridSize, mineCount, items) {
  const totalCells = gridSize * gridSize;
  const safeCount = totalCells - mineCount;

  // 创建格子数组
  const cells = [];

  // 先创建地雷格
  for (let i = 0; i < mineCount; i++) {
    cells.push({
      id: i,
      content: '',
      isMine: true,
      isRevealed: false
    });
  }

  // 创建安全格，填入词语（可重复）
  const shuffledItems = shuffleArray(items);
  for (let i = 0; i < safeCount; i++) {
    const content = shuffledItems[i % shuffledItems.length];
    cells.push({
      id: mineCount + i,
      content: content,
      isMine: false,
      isRevealed: false
    });
  }

  // 打乱格子顺序
  return shuffleArray(cells);
}

function WordMinesweeperGame() {
  // 设置区状态
  const [rawText, setRawText] = useState('');
  const [gridSize, setGridSize] = useState(10);
  const [mineCount, setMineCount] = useState(15);
  const [team1Name, setTeam1Name] = useState('红队');
  const [team2Name, setTeam2Name] = useState('蓝队');
  const [firstTeam, setFirstTeam] = useState(1);

  // 游戏状态
  const [gameStarted, setGameStarted] = useState(false);
  const [items, setItems] = useState([]);
  const [board, setBoard] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(1);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [revealedSafeCount, setRevealedSafeCount] = useState(0);
  const [revealedMineCount, setRevealedMineCount] = useState(0);
  const [message, setMessage] = useState('');

  // 计算总数
  const totalCells = gridSize * gridSize;
  const safeCount = totalCells - mineCount;

  // 获取内容数量
  const getItemCount = () => {
    const parsed = parseItems(rawText);
    return parsed.length > 0 ? parsed.length : DEFAULT_ITEMS.length;
  };

  // 验证地雷数量
  const validateMineCount = (count) => {
    const maxMines = Math.floor(totalCells * 0.4);
    if (count <= 0) return { valid: false, message: '地雷数量必须大于 0' };
    if (count > maxMines) return { valid: false, message: `地雷数量不能超过格子总数的 40%（最多 ${maxMines} 个）` };
    return { valid: true };
  };

  // 开始游戏
  const startGame = () => {
    const parsed = parseItems(rawText);
    const gameItems = parsed.length > 0 ? parsed : [...DEFAULT_ITEMS];

    const validation = validateMineCount(mineCount);
    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }

    setItems(gameItems);
    const newBoard = generateBoard(gridSize, mineCount, gameItems);
    setBoard(newBoard);
    setCurrentTeam(firstTeam);
    setTeam1Score(0);
    setTeam2Score(0);
    setGameOver(false);
    setRevealedSafeCount(0);
    setRevealedMineCount(0);
    setMessage('');
    setGameStarted(true);
  };

  // 点击格子
  const handleCellClick = useCallback((index) => {
    if (gameOver) return;

    const cell = board[index];
    if (cell.isRevealed) return;

    const newBoard = [...board];
    newBoard[index] = { ...cell, isRevealed: true };
    setBoard(newBoard);

    if (cell.isMine) {
      // 踩到地雷
      setRevealedMineCount(prev => prev + 1);
      setMessage(`${currentTeam === 1 ? team1Name : team2Name} 踩到地雷！💣 不得分，换队。`);
      // 切换队伍
      setCurrentTeam(prev => prev === 1 ? 2 : 1);
    } else {
      // 安全格
      setRevealedSafeCount(prev => prev + 1);
      if (currentTeam === 1) {
        setTeam1Score(prev => prev + 1);
      } else {
        setTeam2Score(prev => prev + 1);
      }
      setMessage(`${currentTeam === 1 ? team1Name : team2Name} 找到「${cell.content}」！+1 分，换队。`);
      // 切换队伍
      setCurrentTeam(prev => prev === 1 ? 2 : 1);

      // 检查游戏是否结束
      const newRevealedSafe = revealedSafeCount + 1;
      if (newRevealedSafe >= safeCount) {
        endGameWithResult();
      }
    }
  }, [board, currentTeam, gameOver, team1Name, team2Name, revealedSafeCount, safeCount]);

  // 游戏结束并显示结果
  const endGameWithResult = useCallback(() => {
    setGameOver(true);
    let resultMsg = `游戏结束！\n${team1Name}：${team1Score} 分\n${team2Name}：${team2Score} 分\n`;
    if (team1Score > team2Score) {
      resultMsg += `🎉 ${team1Name} 获胜！`;
    } else if (team2Score > team1Score) {
      resultMsg += `🎉 ${team2Name} 获胜！`;
    } else {
      resultMsg += '平局！';
    }
    setMessage(resultMsg);
  }, [team1Name, team2Name, team1Score, team2Score]);

  // 重新开始
  const restartGame = () => {
    const newBoard = generateBoard(gridSize, mineCount, items);
    setBoard(newBoard);
    setCurrentTeam(firstTeam);
    setTeam1Score(0);
    setTeam2Score(0);
    setGameOver(false);
    setRevealedSafeCount(0);
    setRevealedMineCount(0);
    setMessage('');
  };

  // 返回设置
  const backToSettings = () => {
    setGameStarted(false);
    setBoard([]);
    setGameOver(false);
    setMessage('');
  };

  // 提前结束游戏
  const endGameEarly = () => {
    endGameWithResult();
    setGameOver(true);
  };

  // 全部揭晓
  const revealAll = () => {
    const newBoard = board.map(cell => ({ ...cell, isRevealed: true }));
    setBoard(newBoard);
    endGameWithResult();
    setGameOver(true);
  };

  // ===== 设置区 =====
  if (!gameStarted) {
    return (
      <div className="wms-settings">
        <div className="wms-settings-card">
          <h2 className="wms-title">💣 词语扫雷</h2>
          <p className="wms-description">
            输入词语或问题，系统会生成扫雷棋盘。两队轮流选择格子，点到安全格得分，点到地雷不得分。
          </p>

          <div className="wms-form">
            <div className="wms-form-group">
              <label className="wms-label">词语/问题输入</label>
              <textarea
                className="wms-textarea"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={"例如：\n苹果\n香蕉\n1+1=？\n北京是中国的首都\n今天\n天气\n很好\n学校\n老师\n朋友"}
                rows={8}
              />
              <div className="wms-input-info">
                <span className="wms-item-count">内容数量：{getItemCount()}</span>
                <span className="wms-hint">内容会重复填充棋盘</span>
              </div>
            </div>

            <div className="wms-form-row">
              <div className="wms-form-group">
                <label className="wms-label">网格大小</label>
                <select
                  className="wms-select"
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                >
                  <option value={8}>8 x 8</option>
                  <option value={10}>10 x 10</option>
                  <option value={12}>12 x 12</option>
                </select>
              </div>

              <div className="wms-form-group">
                <label className="wms-label">地雷数量</label>
                <input
                  type="number"
                  className="wms-input"
                  value={mineCount}
                  onChange={(e) => setMineCount(Number(e.target.value))}
                  min={1}
                  max={Math.floor(gridSize * gridSize * 0.4)}
                />
                <span className="wms-input-hint">最多 {Math.floor(gridSize * gridSize * 0.4)} 个</span>
              </div>
            </div>

            <div className="wms-form-row">
              <div className="wms-form-group">
                <label className="wms-label">队伍 1 名称</label>
                <input
                  type="text"
                  className="wms-input"
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                />
              </div>

              <div className="wms-form-group">
                <label className="wms-label">队伍 2 名称</label>
                <input
                  type="text"
                  className="wms-input"
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                />
              </div>
            </div>

            <div className="wms-form-group">
              <label className="wms-label">谁先开始</label>
              <select
                className="wms-select"
                value={firstTeam}
                onChange={(e) => setFirstTeam(Number(e.target.value))}
              >
                <option value={1}>{team1Name} 先手</option>
                <option value={2}>{team2Name} 先手</option>
              </select>
            </div>

            {message && (
              <div className="wms-error">{message}</div>
            )}

            <button className="wms-btn wms-btn-start" onClick={startGame}>
              🎮 开始游戏
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 游戏区 =====
  const currentTeamName = currentTeam === 1 ? team1Name : team2Name;
  const currentTeamClass = currentTeam === 1 ? 'wms-team-red' : 'wms-team-blue';

  return (
    <div className="wms-game">
      {/* 顶部状态栏 */}
      <div className="wms-topbar">
        <button className="wms-btn wms-btn-back" onClick={backToSettings}>
          ← 返回设置
        </button>
        <div className="wms-stats">
          <div className={`wms-team-score wms-team-red ${currentTeam === 1 ? 'active' : ''}`}>
            {team1Name}：{team1Score} 分
          </div>
          <div className={`wms-team-score wms-team-blue ${currentTeam === 2 ? 'active' : ''}`}>
            {team2Name}：{team2Score} 分
          </div>
          <div className="wms-stat-item">剩余安全格：{safeCount - revealedSafeCount}</div>
          <div className="wms-stat-item">已踩雷：{revealedMineCount}</div>
        </div>
      </div>

      {/* 当前队伍提示 */}
      {!gameOver && (
        <div className={`wms-current-team ${currentTeamClass}`}>
          当前队伍：{currentTeamName}
        </div>
      )}

      {/* 提示信息 */}
      {message && (
        <div className="wms-message">{message}</div>
      )}

      {/* 棋盘区域 */}
      <div
        className="wms-board"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`
        }}
      >
        {board.map((cell, index) => (
          <div
            key={cell.id}
            className={`wms-cell ${cell.isRevealed ? 'revealed' : ''} ${cell.isMine && cell.isRevealed ? 'mine' : ''} ${!cell.isMine && cell.isRevealed ? 'safe' : ''}`}
            onClick={() => handleCellClick(index)}
          >
            {cell.isRevealed ? (
              cell.isMine ? (
                <span className="wms-mine-icon">💣</span>
              ) : (
                <span className="wms-cell-content">{cell.content}</span>
              )
            ) : (
              <span className="wms-cell-question">?</span>
            )}
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="wms-actions">
        <button className="wms-btn wms-btn-restart" onClick={restartGame} disabled={gameOver}>
          🔄 重新开始
        </button>
        <button className="wms-btn wms-btn-end" onClick={endGameEarly} disabled={gameOver}>
          ⏹ 结束游戏
        </button>
        <button className="wms-btn wms-btn-reveal" onClick={revealAll} disabled={gameOver}>
          👁 全部揭晓
        </button>
      </div>
    </div>
  );
}

export default WordMinesweeperGame;