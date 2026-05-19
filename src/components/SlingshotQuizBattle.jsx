import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getWordBank, topicMapping } from '../data/slingshotQuestionBank';
import './SlingshotQuizBattle.css';

/**
 * 弹弓大作战 - A/B答题弹射游戏
 */
function SlingshotQuizBattle() {
  const { lang, t } = useLanguage();
  const [screen, setScreen] = useState('setup'); // 'setup' | 'play' | 'result'
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [questionType, setQuestionType] = useState('en2zh');
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [manualQuestion, setManualQuestion] = useState({ question: '', correctAnswer: '', wrongAnswer: '', explanation: '' });
  const [bulkInput, setBulkInput] = useState('');
  const [importErrors, setImportErrors] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selectedSide, setSelectedSide] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [message, setMessage] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', correctAnswer: '', wrongAnswer: '', explanation: '' });
  const audioContextRef = useRef(null);
  const confettiRef = useRef(null);

  // 初始化 AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 从 localStorage 加载草稿
  useEffect(() => {
    const saved = localStorage.getItem('slingshot_quiz_battle_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.questions) setQuestions(data.questions);
        if (data.topic) setTopic(data.topic);
        if (data.level) setLevel(data.level);
        if (data.questionType) setQuestionType(data.questionType);
        if (data.questionCount) setQuestionCount(data.questionCount);
        if (data.soundEnabled !== undefined) setSoundEnabled(data.soundEnabled);
      } catch (e) {
        console.error('加载草稿失败:', e);
      }
    }
  }, []);

  // 保存草稿到 localStorage
  useEffect(() => {
    const draft = {
      topic,
      level,
      questionType,
      questionCount,
      questions,
      soundEnabled
    };
    localStorage.setItem('slingshot_quiz_battle_draft', JSON.stringify(draft));
  }, [topic, level, questionType, questionCount, questions, soundEnabled]);

  // 播放音效
  const playSound = useCallback((type) => {
    if (!soundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'pull':
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.08);
        break;
      case 'shoot':
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.25);
        break;
      case 'correct':
        oscillator.frequency.setValueAtTime(523, ctx.currentTime);
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.35);
        break;
      case 'wrong':
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'win':
        [523, 659, 784, 1047].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.15);
        });
        break;
      default:
        break;
    }
  }, [soundEnabled]);

  // AI生成题目函数 - 预留接口
  const generateQuestionsWithAI = useCallback(async ({ topic, level, count, questionType }) => {
    // TODO: 未来接入真实 AI API
    // 当前使用模板生成 fallback
    return generateQuestionsFromTemplate({ topic, level, count, questionType });
  }, []);

  // 模板生成题目
  const generateQuestionsFromTemplate = useCallback(({ topic: tm, level: lv, count, questionType: qt }) => {
    const wordBank = getWordBank(tm);
    const shuffled = [...wordBank].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    const generated = [];

    for (let i = 0; i < selected.length; i++) {
      const word = selected[i];
      let q, correct, wrong;

      // 找另一个词作为错误答案
      const otherWord = wordBank.find(w => w.chinese !== word.chinese) || wordBank[(i + 1) % wordBank.length];

      switch (qt) {
        case 'en2zh':
          q = `What is the Chinese word for "${word.english}"?`;
          correct = `${word.chinese} (${word.pinyin})`;
          wrong = `${otherWord.chinese} (${otherWord.pinyin})`;
          break;
        case 'zh2en':
          q = `What does "${word.chinese}" mean?`;
          correct = word.english;
          wrong = otherWord.english;
          break;
        case 'pinyin2zh':
          q = `Which word is "${word.pinyin}"?`;
          correct = word.chinese;
          wrong = otherWord.chinese;
          break;
        case 'zh2pinyin':
          q = `How do you read "${word.chinese}"?`;
          correct = word.pinyin;
          wrong = otherWord.pinyin;
          break;
        case 'truefalse':
          const isTrue = Math.random() > 0.5;
          if (isTrue) {
            q = `"${word.chinese}" means ${word.english}.`;
            correct = 'True';
            wrong = 'False';
          } else {
            q = `"${word.chinese}" means ${otherWord.english}.`;
            correct = 'False';
            wrong = 'True';
          }
          break;
        default:
          q = `What is "${word.chinese}"?`;
          correct = word.english;
          wrong = otherWord.english;
      }

      generated.push({
        id: `q_${Date.now()}_${i}`,
        question: q,
        correctAnswer: correct,
        wrongAnswer: wrong,
        explanation: '',
        type: qt,
        level: lv,
        topic: tm,
        correctSide: Math.random() > 0.5 ? 'A' : 'B'
      });
    }

    return generated;
  }, []);

  // 处理智能模板生成
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setMessage(lang === 'zh' ? '请输入主题' : 'Please enter a topic');
      return;
    }
    playSound('pull');
    const newQuestions = await generateQuestionsWithAI({
      topic: topic,
      level: level,
      count: questionCount,
      questionType: questionType
    });
    setQuestions(prev => [...prev, ...newQuestions]);
    setMessage(lang === 'zh'
      ? `成功生成 ${newQuestions.length} 道题目`
      : `Generated ${newQuestions.length} questions`);
  };

  // 解析批量导入
  const parseBulkQuestions = useCallback((text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    const errors = [];

    // 尝试 JSON 格式
    if (text.trim().startsWith('[')) {
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          json.forEach((item, idx) => {
            if (item.question && item.correctAnswer && item.wrongAnswer) {
              parsed.push({
                id: `q_${Date.now()}_${idx}`,
                question: item.question,
                correctAnswer: item.correctAnswer,
                wrongAnswer: item.wrongAnswer,
                explanation: item.explanation || '',
                type: 'imported',
                level: level,
                topic: topic,
                correctSide: Math.random() > 0.5 ? 'A' : 'B'
              });
            } else {
              errors.push({ line: idx + 1, message: lang === 'zh' ? '缺少必要字段' : 'Missing required fields' });
            }
          });
          return { questions: parsed, errors };
        }
      } catch (e) {
        // 不是 JSON 格式，继续尝试其他格式
      }
    }

    // 尝试竖线格式
    const pipeLines = lines.filter(line => line.includes('|') && !line.includes('A.') && !line.includes('B.'));
    if (pipeLines.length > 0) {
      pipeLines.forEach((line, idx) => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
          parsed.push({
            id: `q_${Date.now()}_${idx}`,
            question: parts[0],
            correctAnswer: parts[1],
            wrongAnswer: parts[2],
            explanation: parts[3] || '',
            type: 'imported',
            level: level,
            topic: topic,
            correctSide: Math.random() > 0.5 ? 'A' : 'B'
          });
        } else {
          errors.push({ line: idx + 1, message: lang === 'zh' ? '格式错误' : 'Format error' });
        }
      });
      return { questions: parsed, errors };
    }

    // 尝试 A/B 格式
    let currentQ = null;
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // 新题目开始
      if (trimmed.match(/^\d+\./)) {
        if (currentQ && currentQ.question) {
          parsed.push(currentQ);
        }
        currentQ = {
          id: `q_${Date.now()}_${parsed.length}`,
          question: trimmed.replace(/^\d+\.\s*/, ''),
          correctAnswer: '',
          wrongAnswer: '',
          explanation: '',
          type: 'imported',
          level: level,
          topic: topic,
          correctSide: 'A'
        };
      }
      // A 选项
      else if (trimmed.startsWith('A.') || trimmed.startsWith('A:')) {
        if (currentQ) {
          currentQ.wrongAnswer = trimmed.replace(/^[A:]\s*/, '');
        }
      }
      // B 选项
      else if (trimmed.startsWith('B.') || trimmed.startsWith('B:')) {
        if (currentQ) {
          currentQ.correctAnswer = trimmed.replace(/^[B:]\s*/, '');
        }
      }
      // Answer 行
      else if (trimmed.toLowerCase().startsWith('answer:')) {
        const answer = trimmed.replace(/^answer:\s*/i, '').trim().toUpperCase();
        if (currentQ && answer) {
          currentQ.correctSide = answer;
        }
      }
    });
    if (currentQ && currentQ.question) {
      parsed.push(currentQ);
    }

    return { questions: parsed, errors };
  }, [lang, level, topic]);

  // 处理批量导入
  const handleImport = () => {
    if (!bulkInput.trim()) {
      setMessage(lang === 'zh' ? '请输入题目' : 'Please enter questions');
      return;
    }
    const result = parseBulkQuestions(bulkInput);
    setQuestions(prev => [...prev, ...result.questions]);
    setImportErrors(result.errors);
    setBulkInput('');
    setMessage(lang === 'zh'
      ? `成功导入: ${result.questions.length} 道, 格式错误: ${result.errors.length} 行`
      : `Imported: ${result.questions.length}, Errors: ${result.errors.length}`);
  };

  // 手动添加题目
  const handleAddManual = () => {
    if (!manualQuestion.question.trim() || !manualQuestion.correctAnswer.trim() || !manualQuestion.wrongAnswer.trim()) {
      setMessage(lang === 'zh' ? '请填写完整题目信息' : 'Please fill in all required fields');
      return;
    }
    if (manualQuestion.correctAnswer.trim() === manualQuestion.wrongAnswer.trim()) {
      setMessage(lang === 'zh' ? '正确答案和错误答案不能相同' : 'Correct and wrong answers cannot be the same');
      return;
    }
    const newQ = {
      id: `q_${Date.now()}`,
      ...manualQuestion,
      type: 'manual',
      level: level,
      topic: topic,
      correctSide: Math.random() > 0.5 ? 'A' : 'B'
    };
    setQuestions(prev => [...prev, newQ]);
    setManualQuestion({ question: '', correctAnswer: '', wrongAnswer: '', explanation: '' });
    setMessage(lang === 'zh' ? '添加成功' : 'Added successfully');
  };

  // 复制 AI 提示词
  const copyAIPrompt = () => {
    const prompt = lang === 'zh'
      ? `请根据下面主题生成 10 道中文课堂 A/B 选择题，适合对外汉语学生。

要求：
1. 题目适合课堂投屏
2. 每题只有一个正确答案和一个错误答案
3. 正确答案和错误答案不要太长
4. 请严格使用以下格式：
题目|正确答案|错误答案

主题：${topic || '交通工具'}
学生水平：${level === 'beginner' ? '初级' : level === 'intermediate' ? '中级' : '高级'}
题型：${questionType === 'en2zh' ? '英文到中文' : questionType === 'zh2en' ? '中文到英文' : questionType}

示例：
What is the Chinese word for 'airplane'?|飞机 (fēi jī)|出租车 (chū zū chē)
What does "地铁" mean?|subway|train

不要输出额外解释。`
      : `Please generate 10 Chinese A/B quiz questions for TCSOL students.

Requirements:
1. Questions suitable for classroom projector display
2. Only one correct answer and one wrong answer each
3. Answers should not be too long
4. Please use this format exactly:
question|correct answer|wrong answer

Topic: ${topic || 'transportation'}
Level: ${level}
Question Type: ${questionType}

Example:
What is the Chinese word for 'airplane'?|飞机 (fēi jī)|出租车 (chū zū chē)
What does "地铁" mean?|subway|train

Do not add extra explanations.`;

    navigator.clipboard.writeText(prompt).then(() => {
      setMessage(lang === 'zh' ? '已复制 AI 出题提示词' : 'AI prompt copied');
    });
  };

  // 删除题目
  const handleDelete = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  // 上移
  const handleMoveUp = (idx) => {
    if (idx <= 0) return;
    setQuestions(prev => {
      const newQ = [...prev];
      [newQ[idx - 1], newQ[idx]] = [newQ[idx], newQ[idx - 1]];
      return newQ;
    });
  };

  // 下移
  const handleMoveDown = (idx) => {
    if (idx >= questions.length - 1) return;
    setQuestions(prev => {
      const newQ = [...prev];
      [newQ[idx], newQ[idx + 1]] = [newQ[idx + 1], newQ[idx]];
      return newQ;
    });
  };

  // 清空全部
  const handleClearAll = () => {
    setQuestions([]);
    setMessage(lang === 'zh' ? '已清空' : 'Cleared');
  };

  // 开始游戏
  const startBattle = () => {
    if (questions.length === 0) {
      setMessage(lang === 'zh' ? '请先添加题目' : 'Please add questions first');
      return;
    }
    // 重新随机 A/B 位置
    const randomized = questions.map(q => ({
      ...q,
      correctSide: Math.random() > 0.5 ? 'A' : 'B'
    }));
    setQuestions(randomized);
    setCurrentIndex(0);
    setCurrentQuestion(randomized[0]);
    setScore(0);
    setMistakes(0);
    setSelectedSide(null);
    setFeedback(null);
    setScreen('play');
  };

  // 处理答案点击
  const handleAnswerClick = (side) => {
    if (isAnimating || feedback) return;

    setSelectedSide(side);
    setIsAnimating(true);
    playSound('shoot');

    setTimeout(() => {
      const isCorrect = side === currentQuestion.correctSide;
      setFeedback(isCorrect ? 'correct' : 'wrong');

      if (isCorrect) {
        setScore(prev => prev + 1);
        playSound('correct');
        setFeedbackMessage(lang === 'zh' ? 'Oh Yeah!' : 'Oh Yeah!');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } else {
        setMistakes(prev => prev + 1);
        playSound('wrong');
        setFeedbackMessage(lang === 'zh' ? 'Oh NO!' : 'Oh NO!');
      }

      setIsAnimating(false);
    }, 600);
  };

  // 下一题
  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCurrentQuestion(questions[nextIdx]);
    } else {
      setScreen('result');
      playSound('win');
    }
    setSelectedSide(null);
    setFeedback(null);
    setFeedbackMessage('');
  };

  // 上一题
  const goPrevious = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setCurrentQuestion(questions[prevIdx]);
    }
    setSelectedSide(null);
    setFeedback(null);
    setFeedbackMessage('');
  };

  // 显示答案
  const showAnswer = () => {
    if (currentQuestion.correctSide === 'A') {
      setSelectedSide('A');
    } else {
      setSelectedSide('B');
    }
    setFeedback('correct');
  };

  // 重新开始
  const restartBattle = () => {
    const randomized = questions.map(q => ({
      ...q,
      correctSide: Math.random() > 0.5 ? 'A' : 'B'
    }));
    setQuestions(randomized);
    setCurrentIndex(0);
    setCurrentQuestion(randomized[0]);
    setScore(0);
    setMistakes(0);
    setSelectedSide(null);
    setFeedback(null);
    setFeedbackMessage('');
  };

  // 退出游戏
  const exitGame = () => {
    setScreen('setup');
    setSelectedSide(null);
    setFeedback(null);
    setFeedbackMessage('');
  };

  // 全屏
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 清除草稿
  const clearDraft = () => {
    localStorage.removeItem('slingshot_quiz_battle_draft');
    setQuestions([]);
    setTopic('');
    setLevel('beginner');
    setQuestionType('en2zh');
    setQuestionCount(5);
    setMessage(lang === 'zh' ? '草稿已清除' : 'Draft cleared');
  };

  // 获取当前题目的 A/B 显示
  const getAnswerA = () => {
    if (!currentQuestion) return '';
    return currentQuestion.correctSide === 'A' ? currentQuestion.correctAnswer : currentQuestion.wrongAnswer;
  };

  const getAnswerB = () => {
    if (!currentQuestion) return '';
    return currentQuestion.correctSide === 'B' ? currentQuestion.correctAnswer : currentQuestion.wrongAnswer;
  };

  // ===== 渲染 =====
  if (screen === 'result') {
    const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="slingshot-result">
        <div className="result-content">
          <h2>{lang === 'zh' ? '挑战完成！' : 'Battle Complete!'}</h2>
          <div className="result-stats">
            <div className="stat">
              <span className="stat-label">{lang === 'zh' ? '得分' : 'Score'}</span>
              <span className="stat-value">{score} / {questions.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">{lang === 'zh' ? '错误次数' : 'Mistakes'}</span>
              <span className="stat-value">{mistakes}</span>
            </div>
            <div className="stat">
              <span className="stat-label">{lang === 'zh' ? '正确率' : 'Accuracy'}</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
          </div>
          <div className="result-buttons">
            <button className="btn-result" onClick={restartBattle}>
              {lang === 'zh' ? '再玩一次' : 'Play Again'}
            </button>
            <button className="btn-result secondary" onClick={exitGame}>
              {lang === 'zh' ? '返回设置' : 'Back to Setup'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'play') {
    return (
      <div className={`slingshot-play ${feedback === 'correct' ? 'correct-bg' : feedback === 'wrong' ? 'wrong-bg' : ''}`}>
        {showConfetti && <div className="confetti-container">{Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="confetti" style={{
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 0.5 + 's',
            backgroundColor: ['#f44336', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'][Math.floor(Math.random() * 5)]
          }} />
        ))}</div>}

        <div className="play-header">
          <div className="question-counter">
            {lang === 'zh' ? '第 ' : 'Question '}{currentIndex + 1} / {questions.length}
          </div>
          <div className="score-display">
            {lang === 'zh' ? '得分：' : 'Score: '}{score}
          </div>
          <div className="play-controls">
            <button className="btn-icon" onClick={() => setSoundEnabled(!soundEnabled)} title={lang === 'zh' ? '音效' : 'Sound'}>
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button className="btn-icon" onClick={toggleFullscreen} title={lang === 'zh' ? '全屏' : 'Fullscreen'}>
              ⛶
            </button>
            <button className="btn-icon" onClick={exitGame} title={lang === 'zh' ? '退出' : 'Exit'}>
              ✕
            </button>
          </div>
        </div>

        <div className="play-content">
          <div className="question-card">
            <p className="question-text">{currentQuestion?.question}</p>
          </div>

          <div className="answers-container">
            <div
              className={`answer-card ${selectedSide === 'A' ? 'selected' : ''} ${feedback && currentQuestion?.correctSide === 'A' ? 'correct-answer' : ''} ${feedback === 'wrong' && selectedSide === 'A' ? 'wrong-answer' : ''}`}
              onClick={() => handleAnswerClick('A')}
            >
              <span className="answer-label">A</span>
              <span className="answer-text">{getAnswerA()}</span>
            </div>

            <div className="slingshot-visual">
              <div className="slingshot">
                <div className="slingshot-left"></div>
                <div className="slingshot-right"></div>
                <div className="slingshot-band"></div>
                <div className={`projectile ${isAnimating ? 'flying' : ''} ${selectedSide === 'A' ? 'to-a' : selectedSide === 'B' ? 'to-b' : ''}`}></div>
              </div>
            </div>

            <div
              className={`answer-card ${selectedSide === 'B' ? 'selected' : ''} ${feedback && currentQuestion?.correctSide === 'B' ? 'correct-answer' : ''} ${feedback === 'wrong' && selectedSide === 'B' ? 'wrong-answer' : ''}`}
              onClick={() => handleAnswerClick('B')}
            >
              <span className="answer-label">B</span>
              <span className="answer-text">{getAnswerB()}</span>
            </div>
          </div>

          {feedbackMessage && (
            <div className={`feedback-message ${feedback}`}>
              {feedbackMessage}
            </div>
          )}
        </div>

        <div className="play-footer">
          <button className="btn-play" onClick={goPrevious} disabled={currentIndex === 0}>
            {lang === 'zh' ? '上一题' : 'Previous'}
          </button>
          <button className="btn-play" onClick={showAnswer} disabled={!!feedback}>
            {lang === 'zh' ? '显示答案' : 'Show Answer'}
          </button>
          <button className="btn-play" onClick={restartBattle}>
            {lang === 'zh' ? '重新开始' : 'Restart'}
          </button>
          <button className="btn-play primary" onClick={goNext}>
            {lang === 'zh' ? '下一题' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // 设置页
  return (
    <div className="slingshot-setup">
      <div className="setup-header">
        <h1>{lang === 'zh' ? '弹弓大作战' : 'Slingshot Quiz Battle'}</h1>
        <p className="setup-subtitle">
          {lang === 'zh' ? '老师控制端 · 准备开始啦！' : 'Teacher Setup · Get ready!'}
        </p>
        {message && <div className="setup-message">{message}</div>}
      </div>

      <div className="setup-content">
        {/* 智能模板出题 */}
        <div className="input-section generator-section">
          <h3>{lang === 'zh' ? '神奇一键出题' : 'Smart Question Generator'}</h3>
          <div className="input-group">
            <label>{lang === 'zh' ? '课程主题 / 课文名称' : 'Course Topic / Lesson Title'}</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={lang === 'zh' ? '例如：交通工具、天气、水果、HSK1词汇' : 'e.g. transportation, weather, fruits'}
            />
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>{lang === 'zh' ? '目标学生' : 'Student Level'}</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="beginner">{lang === 'zh' ? '初级' : 'Beginner'}</option>
                <option value="intermediate">{lang === 'zh' ? '中级' : 'Intermediate'}</option>
                <option value="advanced">{lang === 'zh' ? '高级' : 'Advanced'}</option>
              </select>
            </div>
            <div className="input-group">
              <label>{lang === 'zh' ? '题目类型' : 'Question Type'}</label>
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                <option value="en2zh">{lang === 'zh' ? '英文 → 中文' : 'English to Chinese'}</option>
                <option value="zh2en">{lang === 'zh' ? '中文 → 英文' : 'Chinese to English'}</option>
                <option value="pinyin2zh">{lang === 'zh' ? '拼音 → 中文' : 'Pinyin to Chinese'}</option>
                <option value="zh2pinyin">{lang === 'zh' ? '中文 → 拼音' : 'Chinese to Pinyin'}</option>
                <option value="truefalse">{lang === 'zh' ? 'True / False' : 'True / False'}</option>
              </select>
            </div>
            <div className="input-group">
              <label>{lang === 'zh' ? '题目数量' : 'Number of Questions'}</label>
              <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>
          </div>
          <button className="btn-generate" onClick={handleGenerate}>
            {lang === 'zh' ? `变出 ${questionCount} 道题` : `Generate ${questionCount} Questions`}
          </button>
          <p className="ai-notice">
            {lang === 'zh'
              ? '当前使用内置题库和模板生成，AI 出题功能即将开放'
              : 'Currently using built-in word banks. AI coming soon.'}
          </p>
        </div>

        <div className="input-sections-row">
          {/* 手动添加 */}
          <div className="input-section manual-section">
            <h3>{lang === 'zh' ? '手动添加题目' : 'Add Question Manually'}</h3>
            <div className="input-group">
              <label>{lang === 'zh' ? '题目内容' : 'Question'}</label>
              <input
                type="text"
                value={manualQuestion.question}
                onChange={(e) => setManualQuestion(prev => ({ ...prev, question: e.target.value }))}
                placeholder={lang === 'zh' ? '请输入题目' : 'Enter question'}
              />
            </div>
            <div className="input-group">
              <label>{lang === 'zh' ? '正确答案' : 'Correct Answer'}</label>
              <input
                type="text"
                value={manualQuestion.correctAnswer}
                onChange={(e) => setManualQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                placeholder={lang === 'zh' ? '请输入正确答案' : 'Enter correct answer'}
              />
            </div>
            <div className="input-group">
              <label>{lang === 'zh' ? '错误答案' : 'Wrong Answer'}</label>
              <input
                type="text"
                value={manualQuestion.wrongAnswer}
                onChange={(e) => setManualQuestion(prev => ({ ...prev, wrongAnswer: e.target.value }))}
                placeholder={lang === 'zh' ? '请输入错误答案' : 'Enter wrong answer'}
              />
            </div>
            <div className="input-group">
              <label>{lang === 'zh' ? '解释 (可选)' : 'Explanation (optional)'}</label>
              <input
                type="text"
                value={manualQuestion.explanation}
                onChange={(e) => setManualQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder={lang === 'zh' ? '请输入解释' : 'Enter explanation'}
              />
            </div>
            <button className="btn-add" onClick={handleAddManual}>
              {lang === 'zh' ? '加入挑战' : 'Add to Battle'}
            </button>
          </div>

          {/* 批量导入 */}
          <div className="input-section import-section">
            <h3>{lang === 'zh' ? '批量导入题目' : 'Bulk Import Questions'}</h3>
            <p className="import-hint">
              {lang === 'zh'
                ? '支持从 ChatGPT、DeepSeek、Claude 或 Excel 中复制题目'
                : 'Paste questions from ChatGPT, DeepSeek, Claude, or Excel'}
            </p>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={lang === 'zh'
                ? '格式1: 题目|正确答案|错误答案\n格式2: A/B Answer 格式\n格式3: JSON 数组'
                : 'Format1: question|correct|wrong\nFormat2: A/B Answer format\nFormat3: JSON array'}
              rows={5}
            />
            <div className="import-buttons">
              <button className="btn-import" onClick={handleImport}>
                {lang === 'zh' ? '导入题目' : 'Import Questions'}
              </button>
              <button className="btn-copy-prompt" onClick={copyAIPrompt}>
                {lang === 'zh' ? '复制 AI 出题提示词' : 'Copy AI Prompt'}
              </button>
            </div>
            {importErrors.length > 0 && (
              <div className="import-errors">
                {importErrors.map((err, idx) => (
                  <p key={idx} className="error-item">
                    {lang === 'zh' ? `第 ${err.line} 行: ` : `Line ${err.line}: `}{err.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 题目列表 */}
        <div className="questions-section">
          <div className="questions-header">
            <h3>{lang === 'zh' ? `准备好的题目（${questions.length}）` : `Prepared Questions (${questions.length})`}</h3>
            {questions.length > 0 && (
              <button className="btn-clear" onClick={handleClearAll}>
                {lang === 'zh' ? '清空全部' : 'Clear All'}
              </button>
            )}
          </div>

          {questions.length === 0 ? (
            <p className="no-questions">
              {lang === 'zh'
                ? '还没有题目哦，快来变出一些题目吧！'
                : 'No questions yet. Generate or add some questions to start!'}
            </p>
          ) : (
            <div className="questions-list">
              {questions.map((q, idx) => (
                <div key={q.id} className="question-item">
                  <span className="q-number">{idx + 1}</span>
                  <div className="q-content">
                    <p className="q-question">{q.question}</p>
                    <p className="q-answers">
                      <span className="correct">{q.correctAnswer}</span>
                      <span className="separator">|</span>
                      <span className="wrong">{q.wrongAnswer}</span>
                    </p>
                  </div>
                  <div className="q-actions">
                    <button onClick={() => handleMoveUp(idx)} disabled={idx === 0}>↑</button>
                    <button onClick={() => handleMoveDown(idx)} disabled={idx === questions.length - 1}>↓</button>
                    <button onClick={() => handleDelete(idx)} className="delete">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {questions.length > 0 && (
            <div className="start-button-container">
              <button className="btn-start" onClick={startBattle}>
                {lang === 'zh' ? '开启大挑战' : 'Start Battle'}
              </button>
            </div>
          )}
        </div>

        <div className="setup-footer">
          <button className="btn-clear-draft" onClick={clearDraft}>
            {lang === 'zh' ? '清空草稿' : 'Clear Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SlingshotQuizBattle;