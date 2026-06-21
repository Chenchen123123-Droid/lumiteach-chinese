import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PinyinGuessHanZiGame.css';

/**
 * 看拼音猜汉字游戏组件
 * 功能：显示拼音，学生猜汉字，老师点击揭晓答案
 */

const DEFAULT_QUESTIONS = [
  { hanzi: '苹果', pinyin: 'píng guǒ' },
  { hanzi: '香蕉', pinyin: 'xiāng jiāo' },
  { hanzi: '学校', pinyin: 'xué xiào' },
  { hanzi: '老师', pinyin: 'lǎo shī' },
  { hanzi: '朋友', pinyin: 'péng yǒu' }
];

/**
 * 解析题库文本
 * 格式：汉字|拼音，每行一题
 */
function parseQuestions(text) {
  if (!text.trim()) return [];
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const parts = line.split('|');
      if (parts.length < 2) return null;
      const hanzi = parts[0].trim();
      const pinyin = parts.slice(1).join('|').trim();
      if (!hanzi || !pinyin) return null;
      return { hanzi, pinyin, status: 'unanswered' };
    })
    .filter(item => item !== null);
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

function PinyinGuessHanZiGame() {
  // 设置区状态
  const [rawText, setRawText] = useState('');
  const [randomOrder, setRandomOrder] = useState(true);

  // 游戏状态
  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [message, setMessage] = useState('');

  // 计分
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const timerRef = useRef(null);

  // 获取有效题目数量
  const getQuestionCount = () => {
    const parsed = parseQuestions(rawText);
    return parsed.length > 0 ? parsed.length : DEFAULT_QUESTIONS.length;
  };

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
    let parsed = parseQuestions(rawText);
    if (parsed.length === 0) {
      parsed = DEFAULT_QUESTIONS.map(q => ({ ...q, status: 'unanswered' }));
    }
    if (randomOrder) {
      parsed = shuffleArray(parsed);
    }
    setQuestions(parsed);
    setCurrentIndex(0);
    setAnswerVisible(false);
    setCorrectCount(0);
    setWrongCount(0);
    setMessage('');
    setGameStarted(true);
    startTimer();
  };

  // 显示答案
  const showAnswer = () => {
    setAnswerVisible(true);
  };

  // 下一题
  const nextQuestion = () => {
    if (currentIndex >= questions.length - 1) {
      setMessage('已经是最后一题啦！');
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setAnswerVisible(false);
    setMessage('');
    startTimer();
  };

  // 上一题
  const prevQuestion = () => {
    if (currentIndex <= 0) {
      setMessage('已经是第一题啦！');
      return;
    }
    setCurrentIndex(prev => prev - 1);
    setAnswerVisible(false);
    setMessage('');
    startTimer();
  };

  // 重新开始
  const restartGame = () => {
    let qs = questions.map(q => ({ ...q, status: 'unanswered' }));
    if (randomOrder) {
      qs = shuffleArray(qs);
    }
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswerVisible(false);
    setCorrectCount(0);
    setWrongCount(0);
    setMessage('');
    startTimer();
  };

  // 结束游戏
  const endGame = () => {
    stopTimer();
    setGameStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswerVisible(false);
    setElapsedTime(0);
    setCorrectCount(0);
    setWrongCount(0);
    setMessage('');
  };

  // 手动标记答对/答错
  const markAnswer = (status) => {
    setQuestions(prev => {
      const updated = [...prev];
      const current = { ...updated[currentIndex] };
      const oldStatus = current.status;

      // 如果状态没变，不处理
      if (oldStatus === status) return prev;

      // 先减掉旧状态
      if (oldStatus === 'correct') setCorrectCount(c => c - 1);
      if (oldStatus === 'wrong') setWrongCount(c => c - 1);

      // 更新为新状态
      current.status = status;
      updated[currentIndex] = current;

      if (status === 'correct') setCorrectCount(c => c + 1);
      if (status === 'wrong') setWrongCount(c => c + 1);

      return updated;
    });
  };

  // 清理计时器
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const currentQ = questions[currentIndex];

  // ===== 设置区 =====
  if (!gameStarted) {
    return (
      <div className="pgh-settings">
        <div className="pgh-settings-card">
          <h2 className="pgh-title">📝 看拼音猜汉字</h2>
          <p className="pgh-description">
            老师输入"汉字|拼音"，游戏开始后只显示拼音。学生根据拼音猜汉字，老师点击按钮揭晓答案。
          </p>

          <div className="pgh-form">
            <div className="pgh-form-group">
              <label className="pgh-label">题库输入</label>
              <textarea
                className="pgh-textarea"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={"例如：\n苹果|píng guǒ\n学校|xué xiào\n老师|lǎo shī\n中国|zhōng guó\n朋友|péng yǒu"}
                rows={8}
              />
              <div className="pgh-input-info">
                <span className="pgh-question-count">题目数量：{getQuestionCount()}</span>
                <span className="pgh-hint">格式：汉字|拼音，每行一题</span>
              </div>
            </div>

            <div className="pgh-form-group pgh-checkbox-group">
              <label className="pgh-checkbox-label">
                <input
                  type="checkbox"
                  checked={randomOrder}
                  onChange={(e) => setRandomOrder(e.target.checked)}
                />
                <span className="pgh-checkbox-text">随机出题</span>
              </label>
              <span className="pgh-checkbox-hint">
                {randomOrder ? '开始游戏后打乱题目顺序' : '按照输入顺序出题'}
              </span>
            </div>

            <button className="pgh-btn pgh-btn-start" onClick={startGame}>
              🎮 开始游戏
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 游戏区 =====
  return (
    <div className="pgh-game">
      {/* 顶部状态栏 */}
      <div className="pgh-topbar">
        <button className="pgh-btn pgh-btn-back" onClick={endGame}>
          ← 返回设置
        </button>
        <div className="pgh-topbar-center">
          第 {currentIndex + 1} / {questions.length} 题
        </div>
        <div className="pgh-timer">
          用时：{elapsedTime}s
        </div>
      </div>

      {/* 计分栏 */}
      <div className="pgh-score-bar">
        <span className="pgh-score-correct">答对：{correctCount}</span>
        <span className="pgh-score-wrong">答错：{wrongCount}</span>
      </div>

      {/* 拼音显示区 */}
      <div className="pgh-display-area">
        <div className="pgh-pinyin-card">
          <div className="pgh-pinyin-text">{currentQ.pinyin}</div>
        </div>

        {/* 答案区域 */}
        <div className="pgh-answer-area">
          {answerVisible ? (
            <div className="pgh-answer-card pgh-answer-show">
              <div className="pgh-answer-text">{currentQ.hanzi}</div>
            </div>
          ) : (
            <div className="pgh-answer-card pgh-answer-hidden">
              <div className="pgh-answer-placeholder">请学生说出或写出对应汉字</div>
            </div>
          )}
        </div>
      </div>

      {/* 提示信息 */}
      {message && (
        <div className="pgh-message">{message}</div>
      )}

      {/* 操作按钮 */}
      <div className="pgh-actions">
        <button className="pgh-btn pgh-btn-reveal" onClick={showAnswer}>
          💡 显示答案
        </button>
        <button className="pgh-btn pgh-btn-prev" onClick={prevQuestion}>
          ◀ 上一题
        </button>
        <button className="pgh-btn pgh-btn-next" onClick={nextQuestion}>
          ▶ 下一题
        </button>
        <button className="pgh-btn pgh-btn-restart" onClick={restartGame}>
          🔄 重新开始
        </button>
        <button className="pgh-btn pgh-btn-end" onClick={endGame}>
          ⏹ 结束游戏
        </button>
      </div>

      {/* 手动计分按钮 */}
      <div className="pgh-mark-area">
        <span className="pgh-mark-label">手动计分：</span>
        <button
          className={`pgh-btn pgh-btn-correct ${currentQ.status === 'correct' ? 'active' : ''}`}
          onClick={() => markAnswer('correct')}
        >
          ✓ 答对
        </button>
        <button
          className={`pgh-btn pgh-btn-wrong ${currentQ.status === 'wrong' ? 'active' : ''}`}
          onClick={() => markAnswer('wrong')}
        >
          ✗ 答错
        </button>
      </div>
    </div>
  );
}

export default PinyinGuessHanZiGame;
