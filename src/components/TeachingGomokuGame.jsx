import React, { useState, useCallback } from 'react';
import './TeachingGomokuGame.css';

/**
 * 教学五子棋游戏组件
 * 功能：老师输入词语，生成棋盘，两个玩家轮流下棋，先连成五个获胜
 *
 * 扩展预设：
 * - 可添加计时功能
 * - 可添加游戏记录保存
 * - 可添加AI对战模式
 */
function TeachingGomokuGame() {
  // 默认词语
  const defaultWords = ['你好', '我好', '明天', '今天', '学校', '吃饭', '学习', '朋友', '老师', '学生'];

  // 状态管理
  const [rawText, setRawText] = useState('');
  const [player1Name, setPlayer1Name] = useState('玩家1');
  const [player2Name, setPlayer2Name] = useState('玩家2');
  const [boardSize, setBoardSize] = useState(10);
  const [customBoardSize, setCustomBoardSize] = useState('');
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * 解析输入的词语
   * @returns {string[]} 词语数组
   */
  const parseWords = useCallback(() => {
    if (!rawText.trim()) {
      return defaultWords;
    }
    const words = rawText
      .split('\n')
      .map(w => w.trim())
      .filter(w => w.length > 0);
    return words.length > 0 ? words : defaultWords;
  }, [rawText]);

  /**
   * 随机打乱数组
   */
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  /**
   * 生成棋盘
   */
  const generateBoard = useCallback(() => {
    const words = parseWords();
    const totalCells = boardSize * boardSize;

    // 生成足够的词语填充棋盘
    const filledWords = [];
    for (let i = 0; i < totalCells; i++) {
      filledWords.push(words[i % words.length]);
    }

    // 打乱顺序
    const shuffledWords = shuffleArray(filledWords);

    // 创建棋盘数组
    const newBoard = [];
    for (let row = 0; row < boardSize; row++) {
      const rowData = [];
      for (let col = 0; col < boardSize; col++) {
        rowData.push({
          word: shuffledWords[row * boardSize + col],
          owner: null // null: 未占领, 1: 玩家1(黑), 2: 玩家2(白)
        });
      }
      newBoard.push(rowData);
    }

    return newBoard;
  }, [boardSize, parseWords]);

  /**
   * 开始游戏
   */
  const handleStartGame = () => {
    // 验证棋盘大小
    const size = isCustomSize ? parseInt(customBoardSize) : boardSize;
    if (isNaN(size) || size < 5 || size > 20) {
      alert('棋盘大小必须在 5 到 20 之间！');
      return;
    }

    setBoardSize(size);
    const newBoard = generateBoard();
    setBoard(newBoard);
    setCurrentPlayer(1);
    setWinner(null);
    setMoveHistory([]);
    setGameStarted(true);
  };

  /**
   * 检查是否获胜
   * @param {number} row - 当前行
   * @param {number} col - 当前列
   * @param {number} player - 当前玩家
   * @returns {boolean} 是否获胜
   */
  const checkWinner = (row, col, player, currentBoard) => {
    const directions = [
      [0, 1],   // 横向
      [1, 0],   // 纵向
      [1, 1],   // 左上到右下
      [1, -1]   // 右上到左下
    ];

    for (const [dx, dy] of directions) {
      let count = 1;

      // 正方向计数
      let r = row + dx;
      let c = col + dy;
      while (
        r >= 0 && r < boardSize &&
        c >= 0 && c < boardSize &&
        currentBoard[r][c].owner === player
      ) {
        count++;
        r += dx;
        c += dy;
      }

      // 反方向计数
      r = row - dx;
      c = col - dy;
      while (
        r >= 0 && r < boardSize &&
        c >= 0 && c < boardSize &&
        currentBoard[r][c].owner === player
      ) {
        count++;
        r -= dx;
        c -= dy;
      }

      if (count >= 5) {
        return true;
      }
    }

    return false;
  };

  /**
   * 点击格子
   */
  const handleCellClick = (row, col) => {
    // 游戏已结束或格子已被占领
    if (winner || board[row][col].owner !== null) {
      return;
    }

    // 创建新棋盘状态
    const newBoard = board.map(r => r.map(cell => ({ ...cell })));
    newBoard[row][col].owner = currentPlayer;

    // 记录历史
    const newHistory = [...moveHistory, { row, col, player: currentPlayer }];

    // 检查是否获胜
    const isWin = checkWinner(row, col, currentPlayer, newBoard);

    setBoard(newBoard);
    setMoveHistory(newHistory);

    if (isWin) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  /**
   * 悔棋
   */
  const handleUndo = () => {
    if (moveHistory.length === 0) return;

    const newHistory = [...moveHistory];
    const lastMove = newHistory.pop();

    // 恢复棋盘
    const newBoard = board.map(r => r.map(cell => ({ ...cell })));
    newBoard[lastMove.row][lastMove.col].owner = null;

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setCurrentPlayer(lastMove.player);
    setWinner(null);
  };

  /**
   * 重新开始（保留设置）
   */
  const handleRestart = () => {
    const newBoard = generateBoard();
    setBoard(newBoard);
    setCurrentPlayer(1);
    setWinner(null);
    setMoveHistory([]);
  };

  /**
   * 返回设置
   */
  const handleBackToSettings = () => {
    setGameStarted(false);
    setBoard([]);
    setWinner(null);
    setMoveHistory([]);
    setCurrentPlayer(1);
  };

  /**
   * 切换全屏
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  /**
   * 切换棋盘大小选择方式
   */
  const handleSizeOptionClick = (size) => {
    setIsCustomSize(false);
    setCustomBoardSize('');
    setBoardSize(size);
  };

  /**
   * 自定义棋盘大小输入
   */
  const handleCustomSizeChange = (e) => {
    const value = e.target.value;
    setCustomBoardSize(value);
    setIsCustomSize(true);

    // 实时更新棋盘大小
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 5 && numValue <= 20) {
      setBoardSize(numValue);
    }
  };

  // 获取当前玩家名称
  const getCurrentPlayerName = () => {
    return currentPlayer === 1 ? player1Name : player2Name;
  };

  // 获取获胜玩家名称
  const getWinnerName = () => {
    return winner === 1 ? player1Name : player2Name;
  };

  return (
    <div className={`gomoku-game ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* 游戏设置区域 */}
      {!gameStarted ? (
        <div className="game-settings">
          <div className="settings-header">
            <h2 className="game-title">♟️ 教学五子棋</h2>
            <p className="game-description">
              输入词语，每行一个，系统会随机生成棋盘。两个玩家轮流点击格子，先连成五个的人获胜。
            </p>
          </div>

          <div className="settings-form">
            {/* 词语输入 */}
            <div className="form-group">
              <label className="form-label">词语输入</label>
              <textarea
                className="words-input"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="请输入词语、短语或句子，每行一个&#10;例如：&#10;你好&#10;我很好&#10;明天&#10;去学校&#10;吃饭"
                rows={8}
              />
              <span className="form-hint">留空将使用默认词语</span>
            </div>

            {/* 玩家名称 */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="player-dot player1-dot"></span>
                  玩家 1 名称
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="玩家1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <span className="player-dot player2-dot"></span>
                  玩家 2 名称
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="玩家2"
                />
              </div>
            </div>

            {/* 棋盘大小 */}
            <div className="form-group">
              <label className="form-label">棋盘大小</label>
              <div className="size-options">
                {[8, 10, 12].map(size => (
                  <button
                    key={size}
                    className={`size-btn ${!isCustomSize && boardSize === size ? 'active' : ''}`}
                    onClick={() => handleSizeOptionClick(size)}
                  >
                    {size} × {size}
                  </button>
                ))}
                <div className="custom-size-input">
                  <input
                    type="number"
                    className="form-input size-input"
                    value={customBoardSize}
                    onChange={handleCustomSizeChange}
                    placeholder="自定义"
                    min={5}
                    max={20}
                  />
                </div>
              </div>
              <span className="form-hint">可输入 5-20 之间的数字自定义棋盘大小</span>
            </div>

            {/* 开始按钮 */}
            <button className="btn-start" onClick={handleStartGame}>
              🎮 开始游戏
            </button>
          </div>
        </div>
      ) : (
        /* 游戏进行区域 */
        <div className="game-play-area">
          <div className="game-header">
            <h2 className="game-title">♟️ 教学五子棋</h2>
            <button className="btn-fullscreen" onClick={toggleFullscreen}>
              {isFullscreen ? '✕ 退出全屏' : '⛶ 全屏上课'}
            </button>
          </div>

          {/* 当前玩家状态 */}
          <div className="game-status">
            {winner ? (
              <div className="winner-message">
                🎉 {getWinnerName()} 获胜！
              </div>
            ) : (
              <div className="current-player">
                <span className="status-label">当前玩家：</span>
                <span className={`player-dot ${currentPlayer === 1 ? 'player1-dot' : 'player2-dot'}`}></span>
                <span className="player-name">{getCurrentPlayerName()}</span>
              </div>
            )}
          </div>

          {/* 棋盘 */}
          <div className="board-container">
            <div
              className="board"
              style={{
                gridTemplateColumns: `repeat(${boardSize}, 1fr)`
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`cell ${cell.owner === 1 ? 'player1' : ''} ${cell.owner === 2 ? 'player2' : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    <span className="cell-word">{cell.word}</span>
                    {cell.owner && (
                      <div className={`cell-piece piece-${cell.owner}`}></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="game-controls">
            <button
              className="btn-control btn-undo"
              onClick={handleUndo}
              disabled={moveHistory.length === 0}
            >
              ↩ 悔棋
            </button>
            <button className="btn-control btn-restart" onClick={handleRestart}>
              🔄 重新开始
            </button>
            <button className="btn-control btn-back" onClick={handleBackToSettings}>
              ⚙ 返回设置
            </button>
          </div>

          {/* 游戏提示 */}
          <div className="game-tips">
            <p>💡 提示：老师线下判断学生回答是否正确，正确后点击格子占领。先连成五个格子获胜！</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeachingGomokuGame;
