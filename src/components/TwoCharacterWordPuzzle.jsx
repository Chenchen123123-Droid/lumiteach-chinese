import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './TwoCharacterWordPuzzle.css';

const STORAGE_KEY = 'two_char_word_puzzle_state';

// 默认示例数据
const DEFAULT_EXAMPLES = [
  '学校|school',
  '中文|Chinese',
  '朋友|friend',
  '天气|weather',
  '老师|teacher',
  '苹果|apple',
  '汉语|Chinese language',
  '学生|student',
  '喜欢|like',
  '学习|study'
];

// 解析输入words
function parseWords(input) {
  const lines = input.split('\n').filter(line => line.trim());
  const words = [];
  const errors = [];

  lines.forEach((line, index) => {
    const parts = line.split('|');
    const word = parts[0].trim();

    if (word.length !== 2) {
      errors.push({ line: index + 1, message: `第 ${index + 1} 行"${word}"不是两个汉字，请修改。` });
      return;
    }

    // 检查是否包含非汉字
    const chineseRegex = /^[一-龥]{2}$/;
    if (!chineseRegex.test(word)) {
      errors.push({ line: index + 1, message: `第 ${index + 1 } 行"${word}"包含非汉字字符，请不要输入标点、数字或英文作为词语。` });
      return;
    }

    words.push({
      word,
      hint: parts[1] ? parts[1].trim() : '',
      correct: false
    });
  });

  return { words, errors };
}

// 生成拼图碎片数据
function generatePieces(word, canvasSize = 200) {
  const pieces = [];

  for (let charIndex = 0; charIndex < 2; charIndex++) {
    const char = word[charIndex];

    // 创建临时canvas绘制汉字
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasSize;
    tempCanvas.height = canvasSize;
    const ctx = tempCanvas.getContext('2d');

    // 绘制白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 绘制田字格线条
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2;
    // 横中线
    ctx.beginPath();
    ctx.moveTo(0, canvasSize / 2);
    ctx.lineTo(canvasSize, canvasSize / 2);
    ctx.stroke();
    // 竖中线
    ctx.beginPath();
    ctx.moveTo(canvasSize / 2, 0);
    ctx.lineTo(canvasSize / 2, canvasSize);
    ctx.stroke();
    // 外框
    ctx.strokeStyle = '#BDBDBD';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, canvasSize - 4, canvasSize - 4);

    // 绘制汉字
    ctx.font = `${canvasSize * 0.7}px "KaiTi", "STKaiti", "楷体", serif`;
    ctx.fillStyle = '#1D1D1F';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, canvasSize / 2, canvasSize / 2);

    // 切成4块
    const halfSize = canvasSize / 2;
    for (let pieceIndex = 0; pieceIndex < 4; pieceIndex++) {
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = halfSize;
      pieceCanvas.height = halfSize;
      const pieceCtx = pieceCanvas.getContext('2d');

      let sx, sy;
      switch (pieceIndex) {
        case 0: // 左上
          sx = 0; sy = 0;
          break;
        case 1: // 右上
          sx = halfSize; sy = 0;
          break;
        case 2: // 左下
          sx = 0; sy = halfSize;
          break;
        case 3: // 右下
          sx = halfSize; sy = halfSize;
          break;
        default:
          sx = 0; sy = 0;
      }

      pieceCtx.drawImage(tempCanvas,
        sx, sy, halfSize, halfSize,
        0, 0, halfSize, halfSize
      );

      pieces.push({
        id: `${charIndex}-${pieceIndex}`,
        charIndex,
        pieceIndex,
        char,
        image: pieceCanvas.toDataURL(),
        placed: false,
        x: 0,
        y: 0
      });
    }
  }

  return pieces;
}

// 打乱碎片
function shufflePieces(pieces) {
  const shuffled = [...pieces];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 双字词拼图游戏
 */
function TwoCharacterWordPuzzle() {
  const { lang, t } = useLanguage();
  const isZh = lang === 'zh';

  // 步骤状态
  const [step, setStep] = useState(1);

  // 输入状态
  const [inputText, setInputText] = useState('');
  const [validatedWords, setValidatedWords] = useState([]);
  const [errors, setErrors] = useState([]);

  // 游戏设置
  const [settings, setSettings] = useState({
    mode: 'practice', // practice | challenge
    showChinese: true,
    showHint: false,
    judgeMode: 'instant', // instant | after
    timeLimit: 0, // 0 = no limit
    hintCount: 'unlimited'
  });

  // 游戏状态
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pieces, setPieces] = useState([]);
  const [targetPositions, setTargetPositions] = useState([]);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalWrongAttempts, setTotalWrongAttempts] = useState(0);

  // 拖拽状态
  const [draggingPiece, setDraggingPiece] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const hintTimerRef = useRef(null);

  // 语言文本
  const texts = {
    title: isZh ? '双字词拼图' : 'Two-Character Word Puzzle',
    subtitle: isZh ? '输入两字词，系统会把每个汉字按田字格切成拼图碎片。' : 'Turn each Chinese character into 4 puzzle pieces in a tian-zigrid.',
    step1Title: isZh ? '输入词语' : 'Add Words',
    step2Title: isZh ? '游戏设置' : 'Game Settings',
    step3Title: isZh ? '开始游戏' : 'Play',
    inputLabel: isZh ? '词语列表' : 'Word List',
    placeholder: isZh
      ? '每行一个两字词，例如：\n学校\n中文\n朋友\n天气\n老师'
      : 'One word per line (2 characters):\n学校\n中文\n朋友\n天气\n老师',
    importBtn: isZh ? '导入词语' : 'Import Words',
    exampleBtn: isZh ? '使用示例' : 'Use Examples',
    clearBtn: isZh ? '清空' : 'Clear',
    wordCount: isZh ? '已识别 {count} 个词语' : '{count} words identified',
    modeLabel: isZh ? '模式' : 'Mode',
    practiceMode: isZh ? '练习模式' : 'Practice Mode',
    practiceDesc: isZh ? '无限尝试' : 'Unlimited attempts',
    challengeMode: isZh ? '挑战模式' : 'Challenge Mode',
    challengeDesc: isZh ? '计时计分' : 'Timed with scoring',
    showChineseLabel: isZh ? '显示中文词语' : 'Show Chinese Word',
    showHintLabel: isZh ? '显示英文提示' : 'Show English Hint',
    judgeModeLabel: isZh ? '判定方式' : 'Judgment Mode',
    instantJudge: isZh ? '即时判定' : 'Instant',
    instantDesc: isZh ? '放错自动弹回' : 'Return on wrong placement',
    afterJudge: isZh ? '完成后判定' : 'Check After',
    afterDesc: isZh ? '全部放完后检查' : 'Check after all placed',
    timeLimitLabel: isZh ? '时间限制' : 'Time Limit',
    noLimit: isZh ? '不限时' : 'No Limit',
    secondsPer: isZh ? '{n}秒/题' : '{n}s/question',
    hintCountLabel: isZh ? '提示次数' : 'Hint Count',
    unlimited: isZh ? '无限' : 'Unlimited',
    prevBtn: isZh ? '上��步' : 'Previous',
    nextBtn: isZh ? '下一步' : 'Next',
    startBtn: isZh ? '开始游戏' : 'Start Game',
    questionNum: isZh ? '第 {n} / {total} 题' : 'Question {n} / {total}',
    score: isZh ? '分数' : 'Score',
    time: isZh ? '时间' : 'Time',
    hint: isZh ? '提示' : 'Hint',
    reset: isZh ? '重置' : 'Reset',
    skip: isZh ? '跳过' : 'Skip',
    check: isZh ? '检查答案' : 'Check Answer',
    correctText: isZh ? '拼对了！' : 'Correct!',
    nextQuestion: isZh ? '下一题' : 'Next',
    completed: isZh ? '完成啦！' : 'Game Complete!',
    totalQuestions: isZh ? '总题数' : 'Total Questions',
    completedQuestions: isZh ? '完成题数' : 'Completed',
    timeUsed: isZh ? '用时' : 'Time',
    accuracy: isZh ? '正确率' : 'Accuracy',
    finalScore: isZh ? '得分' : 'Score',
    playAgain: isZh ? '再玩一次' : 'Play Again',
    backToEdit: isZh ? '返回编辑' : 'Back to Edit',
    backToTools: isZh ? '返回全部工具' : 'Back to Tools',
    recoverGame: isZh ? '恢复游戏' : 'Resume Game',
    newGame: isZh ? '重新开始' : 'New Game',
    recoverPrompt: isZh ? '检测到未完成的拼图游戏，是否恢复？' : 'Resume previous game?',
    hintHint: isZh ? '提示：{hint}' : 'Hint: {hint}'
  };

  // 加载localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.inputText) {
          setInputText(state.inputText);
          if (state.validatedWords?.length > 0) {
            setValidatedWords(state.validatedWords);
          }
        }
        if (state.settings) {
          setSettings(state.settings);
        }
        if (state.currentIndex > 0 || state.gameComplete) {
          if (!state.gameComplete && state.validatedWords?.length > 0) {
            // 询问是否恢复
            const shouldRecover = window.confirm(texts.recoverPrompt);
            if (shouldRecover) {
              setCurrentIndex(state.currentIndex || 0);
              setScore(state.score || 0);
              setCompletedCount(state.completedCount || 0);
              setTotalWrongAttempts(state.totalWrongAttempts || 0);
              setStep(3);
              // 需要重建pieces
              if (state.validatedWords?.[state.currentIndex]) {
                const word = state.validatedWords[state.currentIndex].word;
                const newPieces = generatePieces(word);
                setPieces(shufflePieces(newPieces.map(p => ({ ...p, placed: false }))));
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Load state error:', e);
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    try {
      const state = {
        inputText,
        validatedWords,
        settings,
        currentIndex,
        score,
        completedCount,
        totalWrongAttempts,
        gameComplete,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Save state error:', e);
    }
  }, [inputText, validatedWords, settings, currentIndex, score, completedCount, totalWrongAttempts, gameComplete]);

  // 计时器
  useEffect(() => {
    if (step === 3 && !gameComplete && !isSuccess && settings.timeLimit > 0) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= settings.timeLimit) {
            // 时间到，当作超时处理
            handleSkip();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [step, gameComplete, isSuccess, settings.timeLimit]);

  // 检查是否全部完成
  const checkCompletion = useCallback((currentPieces) => {
    const allPlaced = currentPieces.every(p => p.placed);
    if (allPlaced) {
      setIsSuccess(true);
      setCompletedCount(prev => prev + 1);
      if (settings.mode === 'challenge') {
        let questionScore = 100;
        questionScore -= hintsUsed * 5;
        questionScore -= wrongAttempts * 5;
        questionScore = Math.max(0, questionScore);
        setScore(prev => prev + questionScore);
      }
    }
  }, [settings.mode, hintsUsed, wrongAttempts]);

  // 处理输入变化
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);

    if (text.trim()) {
      const { words, errors } = parseWords(text);
      setValidatedWords(words);
      setErrors(errors);
    } else {
      setValidatedWords([]);
      setErrors([]);
    }
  };

  // 导入示例
  const handleImportExamples = () => {
    const text = DEFAULT_EXAMPLES.join('\n');
    setInputText(text);
    const { words, errors } = parseWords(text);
    setValidatedWords(words);
    setErrors(errors);
  };

  // 清空
  const handleClear = () => {
    setInputText('');
    setValidatedWords([]);
    setErrors([]);
  };

  // 下一步
  const handleNext = () => {
    if (step === 1) {
      if (validatedWords.length === 0) {
        alert(isZh ? '请输入至少一个两字词' : 'Please add at least one two-character word');
        return;
      }
      if (errors.length > 0) {
        alert(errors[0].message);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      // 初始化第一题
      startQuestion(0);
    }
  };

  // 上一步
  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // 开始题目
  const startQuestion = (index) => {
    if (index >= validatedWords.length) {
      setGameComplete(true);
      return;
    }

    const word = validatedWords[index].word;
    const newPieces = generatePieces(word);
    setPieces(shufflePieces(newPieces.map(p => ({ ...p, placed: false }))));
    setTargetPositions([
      { charIndex: 0, pieceIndex: 0, x: 0, y: 0 },
      { charIndex: 0, pieceIndex: 1, x: 1, y: 0 },
      { charIndex: 0, pieceIndex: 2, x: 0, y: 1 },
      { charIndex: 0, pieceIndex: 3, x: 1, y: 1 },
      { charIndex: 1, pieceIndex: 0, x: 2, y: 0 },
      { charIndex: 1, pieceIndex: 1, x: 3, y: 0 },
      { charIndex: 1, pieceIndex: 2, x: 2, y: 1 },
      { charIndex: 1, pieceIndex: 3, x: 3, y: 1 }
    ]);
    setCurrentIndex(index);
    setIsSuccess(false);
    setHintsUsed(0);
    setWrongAttempts(0);
    setShowHint(false);
    setTimeElapsed(0);
  };

  // 拖拽相关
  const handleDragStart = (e, piece) => {
    if (piece.placed) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
    setDraggingPiece(piece);
  };

  const handleDragMove = (e) => {
    if (!draggingPiece) return;

    e.preventDefault();
    // 拖拽移动由CSS transform处理
  };

  const handleDragEnd = (e) => {
    if (!draggingPiece) return;

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    // 检查是否放到正确位置
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      const relX = (clientX - containerRect.left - dragOffset.x) / (containerRect.width / 4);
      const relY = (clientY - containerRect.top - dragOffset.y - 100) / (containerRect.width / 4);

      const targetX = Math.round(relX);
      const targetY = Math.round(relY);

      if (targetX >= 0 && targetX <= 3 && targetY >= 0 && targetY <= 1) {
        const expectedCharIndex = targetX < 2 ? 0 : 1;
        const expectedPieceIndex = (targetY * 2) + (targetX % 2);

        if (draggingPiece.charIndex === expectedCharIndex &&
            draggingPiece.pieceIndex === expectedPieceIndex) {
          // 放对了
          setPieces(prev => prev.map(p =>
            p.id === draggingPiece.id ? { ...p, placed: true } : p
          ));

          if (settings.judgeMode === 'instant') {
            checkCompletion(
              pieces.map(p => p.id === draggingPiece.id ? { ...p, placed: true } : p)
            );
          }
        } else {
          // 放错了
          setWrongAttempts(prev => prev + 1);
          setTotalWrongAttempts(prev => prev + 1);

          if (settings.judgeMode === 'instant') {
            // 即时判定，弹回碎片区
            // 碎片已经在随机位置，不需要特殊处理
          }
        }
      }
    }

    setDraggingPiece(null);
  };

  // 点击检查按钮
  const handleCheckAnswer = () => {
    const allPlaced = pieces.every(p => p.placed);
    if (!allPlaced) {
      alert(isZh ? '请把所有碎片放到田字格中' : 'Please place all pieces in the grids');
      return;
    }

    // 检查全部
    const allCorrect = pieces.every(p => {
      return p.placed;
    });

    if (allCorrect) {
      setIsSuccess(true);
      setCompletedCount(prev => prev + 1);
      if (settings.mode === 'challenge') {
        let questionScore = 100;
        questionScore -= hintsUsed * 5;
        questionScore -= wrongAttempts * 5;
        questionScore = Math.max(0, questionScore);
        setScore(prev => prev + questionScore);
      }
    } else {
      setWrongAttempts(prev => prev + 1);
      setTotalWrongAttempts(prev => prev + 1);
    }
  };

  // 提示
  const handleHint = () => {
    if (settings.hintCount !== 'unlimited' && hintsUsed >= parseInt(settings.hintCount)) {
      return;
    }

    setShowHint(true);
    setHintsUsed(prev => prev + 1);

    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }

    hintTimerRef.current = setTimeout(() => {
      setShowHint(false);
    }, 2000);
  };

  // 重置
  const handleReset = () => {
    const word = validatedWords[currentIndex].word;
    const newPieces = generatePieces(word);
    setPieces(shufflePieces(newPieces.map(p => ({ ...p, placed: false }))));
    setIsSuccess(false);
    setHintsUsed(0);
    setWrongAttempts(0);
    setShowHint(false);
  };

  // 跳过
  const handleSkip = () => {
    setIsSuccess(false);
    completedCount: completedCount + 1
    if (currentIndex < validatedWords.length - 1) {
      startQuestion(currentIndex + 1);
    } else {
      setGameComplete(true);
    }
  };

  // 下一题
  const handleNextQuestion = () => {
    if (currentIndex < validatedWords.length - 1) {
      startQuestion(currentIndex + 1);
    } else {
      setGameComplete(true);
    }
  };

  // 再玩一次
  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setScore(0);
    setCompletedCount(0);
    setTotalWrongAttempts(0);
    setGameComplete(false);
    setIsSuccess(false);
    setErrors([]);
    startQuestion(0);
  };

  // 返回编辑
  const handleBackToEdit = () => {
    setStep(2);
    setGameComplete(false);
    setIsSuccess(false);
    setCurrentIndex(0);
    setScore(0);
    setCompletedCount(0);
    setTotalWrongAttempts(0);
    setPieces([]);
  };

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 渲染步骤条
  const renderStepBar = () => (
    <div className="puzzle-step-bar">
      <div className={`puzzle-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
        <span className="step-num">1</span>
        <span className="step-label">{texts.step1Title}</span>
      </div>
      <div className="puzzle-step-line" />
      <div className={`puzzle-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
        <span className="step-num">2</span>
        <span className="step-label">{texts.step2Title}</span>
      </div>
      <div className="puzzle-step-line" />
      <div className={`puzzle-step ${step >= 3 ? 'active' : ''}`}>
        <span className="step-num">3</span>
        <span className="step-label">{texts.step3Title}</span>
      </div>
    </div>
  );

  // 渲染 Step 1
  const renderStep1 = () => (
    <div className="puzzle-step1">
      <h2 className="puzzle-section-title">{texts.title}</h2>
      <p className="puzzle-section-subtitle">{texts.subtitle}</p>

      <div className="puzzle-input-area">
        <label className="puzzle-input-label">{texts.inputLabel}</label>
        <textarea
          className="puzzle-textarea"
          value={inputText}
          onChange={handleInputChange}
          placeholder={texts.placeholder}
          rows={12}
        />

        {validatedWords.length > 0 && (
          <div className="puzzle-word-count">
            {texts.wordCount.replace('{count}', validatedWords.length)}
          </div>
        )}

        {errors.length > 0 && (
          <div className="puzzle-errors">
            {errors.map((err, idx) => (
              <div key={idx} className="puzzle-error">{err.message}</div>
            ))}
          </div>
        )}
      </div>

      <div className="puzzle-buttons">
        <button className="puzzle-btn puzzle-btn-secondary" onClick={handleImportExamples}>
          {texts.importBtn}
        </button>
        <button className="puzzle-btn puzzle-btn-outline" onClick={handleClear}>
          {texts.clearBtn}
        </button>
      </div>
    </div>
  );

  // 渲染 Step 2
  const renderStep2 = () => (
    <div className="puzzle-step2">
      <h2 className="puzzle-section-title">{texts.step2Title}</h2>

      <div className="puzzle-settings">
        {/* 模式选择 */}
        <div className="puzzle-setting-group">
          <label className="puzzle-setting-label">{texts.modeLabel}</label>
          <div className="puzzle-radio-group">
            <label className="puzzle-radio">
              <input
                type="radio"
                name="mode"
                checked={settings.mode === 'practice'}
                onChange={() => setSettings(s => ({ ...s, mode: 'practice' }))}
              />
              <span className="radio-content">
                <span className="radio-title">{texts.practiceMode}</span>
                <span className="radio-desc">{texts.practiceDesc}</span>
              </span>
            </label>
            <label className="puzzle-radio">
              <input
                type="radio"
                name="mode"
                checked={settings.mode === 'challenge'}
                onChange={() => setSettings(s => ({ ...s, mode: 'challenge' }))}
              />
              <span className="radio-content">
                <span className="radio-title">{texts.challengeMode}</span>
                <span className="radio-desc">{texts.challengeDesc}</span>
              </span>
            </label>
          </div>
        </div>

        {/* 显示选项 */}
        <div className="puzzle-setting-group">
          <label className="puzzle-toggle-label">
            <input
              type="checkbox"
              checked={settings.showChinese}
              onChange={(e) => setSettings(s => ({ ...s, showChinese: e.target.checked }))}
            />
            <span>{texts.showChineseLabel}</span>
          </label>
          <label className="puzzle-toggle-label">
            <input
              type="checkbox"
              checked={settings.showHint}
              onChange={(e) => setSettings(s => ({ ...s, showHint: e.target.checked }))}
            />
            <span>{texts.showHintLabel}</span>
          </label>
        </div>

        {/* 判定方式 */}
        <div className="puzzle-setting-group">
          <label className="puzzle-setting-label">{texts.judgeModeLabel}</label>
          <div className="puzzle-radio-group">
            <label className="puzzle-radio">
              <input
                type="radio"
                name="judgeMode"
                checked={settings.judgeMode === 'instant'}
                onChange={() => setSettings(s => ({ ...s, judgeMode: 'instant' }))}
              />
              <span className="radio-content">
                <span className="radio-title">{texts.instantJudge}</span>
                <span className="radio-desc">{texts.instantDesc}</span>
              </span>
            </label>
            <label className="puzzle-radio">
              <input
                type="radio"
                name="judgeMode"
                checked={settings.judgeMode === 'after'}
                onChange={() => setSettings(s => ({ ...s, judgeMode: 'after' }))}
              />
              <span className="radio-content">
                <span className="radio-title">{texts.afterJudge}</span>
                <span className="radio-desc">{texts.afterDesc}</span>
              </span>
            </label>
          </div>
        </div>

        {/* 时间限制 */}
        <div className="puzzle-setting-group">
          <label className="puzzle-setting-label">{texts.timeLimitLabel}</label>
          <select
            className="puzzle-select"
            value={settings.timeLimit}
            onChange={(e) => setSettings(s => ({ ...s, timeLimit: parseInt(e.target.value) }))}
          >
            <option value="0">{texts.noLimit}</option>
            <option value="30">{texts.secondsPer.replace('{n}', 30)}</option>
            <option value="60">{texts.secondsPer.replace('{n}', 60)}</option>
            <option value="90">{texts.secondsPer.replace('{n}', 90)}</option>
          </select>
        </div>

        {/* 提示次数 */}
        <div className="puzzle-setting-group">
          <label className="puzzle-setting-label">{texts.hintCountLabel}</label>
          <select
            className="puzzle-select"
            value={settings.hintCount}
            onChange={(e) => setSettings(s => ({ ...s, hintCount: e.target.value }))}
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="unlimited">{texts.unlimited}</option>
          </select>
        </div>
      </div>
    </div>
  );

  // 渲染 Step 3
  const renderStep3 = () => {
    if (gameComplete) {
      const accuracy = validatedWords.length > 0
        ? Math.round((completedCount / validatedWords.length) * 100)
        : 0;

      return (
        <div className="puzzle-game-complete">
          <div className="complete-icon">🎉</div>
          <h2 className="complete-title">{texts.completed}</h2>

          <div className="complete-stats">
            <div className="stat-item">
              <span className="stat-label">{texts.totalQuestions}</span>
              <span className="stat-value">{validatedWords.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{texts.completedQuestions}</span>
              <span className="stat-value">{completedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{texts.timeUsed}</span>
              <span className="stat-value">{formatTime(timeElapsed)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{texts.accuracy}</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{texts.finalScore}</span>
              <span className="stat-value">{score}</span>
            </div>
          </div>

          <div className="complete-buttons">
            <button className="puzzle-btn puzzle-btn-primary" onClick={handlePlayAgain}>
              {texts.playAgain}
            </button>
            <button className="puzzle-btn puzzle-btn-secondary" onClick={handleBackToEdit}>
              {texts.backToEdit}
            </button>
          </div>
        </div>
      );
    }

    if (isSuccess) {
      const currentWord = validatedWords[currentIndex];
      return (
        <div className="puzzle-success">
          <div className="success-icon">✅</div>
          <h2 className="success-title">{texts.correctText}</h2>
          {settings.showChinese && (
            <div className="success-word">{currentWord?.word}</div>
          )}
          <button className="puzzle-btn puzzle-btn-primary" onClick={handleNextQuestion}>
            {texts.nextQuestion}
          </button>
        </div>
      );
    }

    const currentWord = validatedWords[currentIndex];
    const gridCellSize = 120;

    return (
      <div className="puzzle-game">
        {/* 顶部信息 */}
        <div className="puzzle-header">
          <div className="puzzle-info">
            <span className="puzzle-question-num">
              {texts.questionNum.replace('{n}', currentIndex + 1).replace('{total}', validatedWords.length)}
            </span>
          </div>

          {settings.mode === 'challenge' && (
            <>
              <div className="puzzle-info">
                <span className="info-label">{texts.score}:</span>
                <span className="info-value">{score}</span>
              </div>
              <div className="puzzle-info">
                <span className="info-label">{texts.time}:</span>
                <span className="info-value">{formatTime(timeElapsed)}</span>
              </div>
            </>
          )}

          <div className="puzzle-actions">
            {(settings.hintCount === 'unlimited' || hintsUsed < parseInt(settings.hintCount)) && (
              <button className="puzzle-btn puzzle-btn-small" onClick={handleHint}>
                {texts.hint}
              </button>
            )}
            <button className="puzzle-btn puzzle-btn-small" onClick={handleReset}>
              {texts.reset}
            </button>
            <button className="puzzle-btn puzzle-btn-small" onClick={handleSkip}>
              {texts.skip}
            </button>
          </div>
        </div>

        {/* 提示信息 */}
        {settings.showHint && currentWord?.hint && (
          <div className="puzzle-hint-text">
            {texts.hintHint.replace('{hint}', currentWord.hint)}
          </div>
        )}

        {/* 完整汉字显示（提示模式） */}
        {showHint && (
          <div className="puzzle-reveal">
            <span className="reveal-char">{currentWord?.word?.[0]}</span>
            <span className="reveal-char">{currentWord?.word?.[1]}</span>
          </div>
        )}

        {/* 田字格区域 */}
        <div className="puzzle-grid" ref={containerRef}>
          <div
            className="tian-grid"
            style={{
              width: gridCellSize * 2 + 4,
              height: gridCellSize + 2
            }}
          >
            {/* 第一个字的目标格 */}
            <div className="tian-cell" style={{ width: gridCellSize, height: gridCellSize }}>
              <div className="cell-lines">
                <div className="cell-line-h" />
                <div className="cell-line-v" />
                <div className="cell-border" />
              </div>
            </div>
            <div className="tian-cell" style={{ width: gridCellSize, height: gridCellSize }}>
              <div className="cell-lines">
                <div className="cell-line-h" />
                <div className="cell-line-v" />
                <div className="cell-border" />
              </div>
            </div>

            {/* 第二个字的目标格 */}
            <div className="tian-cell" style={{ width: gridCellSize, height: gridCellSize }}>
              <div className="cell-lines">
                <div className="cell-line-h" />
                <div className="cell-line-v" />
                <div className="cell-border" />
              </div>
            </div>
            <div className="tian-cell" style={{ width: gridCellSize, height: gridCellSize }}>
              <div className="cell-lines">
                <div className="cell-line-h" />
                <div className="cell-line-v" />
                <div className="cell-border" />
              </div>
            </div>
          </div>
        </div>

        {/* 碎片区域 */}
        <div className="puzzle-pieces">
          {pieces.map((piece, idx) => (
            <div
              key={piece.id}
              className={`puzzle-piece ${piece.placed ? 'placed' : ''} ${draggingPiece?.id === piece.id ? 'dragging' : ''}`}
              style={{
                width: gridCellSize / 2 - 2,
                height: gridCellSize / 2 - 2
              }}
              onMouseDown={(e) => handleDragStart(e, piece)}
              onTouchStart={(e) => handleDragStart(e, piece)}
              onMouseMove={handleDragMove}
              onTouchMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onTouchEnd={handleDragEnd}
            >
              <img src={piece.image} alt="" draggable={false} />
            </div>
          ))}
        </div>

        {/* 检查按钮（完成后判定模式用） */}
        {settings.judgeMode === 'after' && (
          <button className="puzzle-btn puzzle-btn-primary" onClick={handleCheckAnswer}>
            {texts.check}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="puzzle-container">
      {renderStepBar()}

      <div className="puzzle-content">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* 底部导航 */}
      {step < 3 && (
        <div className="puzzle-nav">
          {step > 1 && (
            <button className="puzzle-btn puzzle-btn-outline" onClick={handlePrev}>
              {texts.prevBtn}
            </button>
          )}
          <button
            className="puzzle-btn puzzle-btn-primary"
            onClick={step === 2 ? handleNext : handleNext}
          >
            {step === 2 ? texts.startBtn : texts.nextBtn}
          </button>
        </div>
      )}
    </div>
  );
}

export default TwoCharacterWordPuzzle;