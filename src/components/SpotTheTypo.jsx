import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import './SpotTheTypo.css';

/**
 * 找错别字工具
 * Spot the Typo - Chinese typo detection game for classrooms
 */
function SpotTheTypo() {
  const { lang } = useLanguage();
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  // 模式：sentence(句子模式) / word(词语模式)
  const [mode, setMode] = useState('sentence');

  // 步骤：setup / play / result
  const [step, setStep] = useState('setup');

  // 题目数据 - 句子模式
  const [questions, setQuestions] = useState([]);
  const [nextId, setNextId] = useState(1);

  // 词语题目 - 词语模式
  const [wordPairs, setWordPairs] = useState([]);
  const [nextWordId, setNextWordId] = useState(1);

  // 游戏设置
  const [timeLimit, setTimeLimit] = useState(0); // 0 = 无限制
  const [lives, setLives] = useState(5);
  const [targetScore, setTargetScore] = useState(100);
  const [questionPoints, setQuestionPoints] = useState(10);
  const [difficulty, setDifficulty] = useState('normal');

  // 游戏状态
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentLives, setCurrentLives] = useState(0);
  const [gameResults, setGameResults] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);

  // AI 设置
  const [aiTopic, setAiTopic] = useState('学校生活');
  const [aiLevel, setAiLevel] = useState('3');
  const [aiCount, setAiCount] = useState(20);

  // 默认示例数据
  const defaultQuestions = [
    { id: 1, sentence: '我以经完成作业了。', wrongWord: '以经', correctWord: '已经' },
    { id: 2, sentence: '他的太度很认真。', wrongWord: '太度', correctWord: '态度' },
    { id: 3, sentence: '我把书放在北包里。', wrongWord: '北包', correctWord: '背包' },
    { id: 4, sentence: '今天的天汽很好。', wrongWord: '天汽', correctWord: '天气' },
    { id: 5, sentence: '我喜换学习中文。', wrongWord: '喜换', correctWord: '喜欢' },
    { id: 6, sentence: '你知到这个问题的答案吗？', wrongWord: '知到', correctWord: '知道' },
    { id: 7, sentence: '这个时侯我们应该休息。', wrongWord: '时侯', correctWord: '时候' },
    { id: 8, sentence: '她的汉语说得非长好。', wrongWord: '非长', correctWord: '非常' },
    { id: 9, sentence: '因为下雨，所已我没去公园。', wrongWord: '所已', correctWord: '所以' },
    { id: 10, sentence: '我明天要去学效。', wrongWord: '学效', correctWord: '学校' }
  ];

  const defaultWordPairs = [
    { id: 1, correctWord: '已经', wrongWord: '以经' },
    { id: 2, correctWord: '态度', wrongWord: '太度' },
    { id: 3, correctWord: '背包', wrongWord: '北包' },
    { id: 4, correctWord: '天气', wrongWord: '天汽' },
    { id: 5, correctWord: '喜欢', wrongWord: '喜换' },
    { id: 6, correctWord: '知道', wrongWord: '知到' },
    { id: 7, correctWord: '时候', wrongWord: '时侯' },
    { id: 8, correctWord: '非常', wrongWord: '非长' }
  ];

  // 从 localStorage 恢复
  useEffect(() => {
    const saved = localStorage.getItem('spot-the-typo');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.questions && data.questions.length > 0) setQuestions(data.questions);
        if (data.nextId) setNextId(data.nextId);
        if (data.wordPairs && data.wordPairs.length > 0) setWordPairs(data.wordPairs);
        if (data.nextWordId) setNextWordId(data.nextWordId);
        if (data.mode) setMode(data.mode);
        if (data.timeLimit !== undefined) setTimeLimit(data.timeLimit);
        if (data.lives) setLives(data.lives);
        if (data.difficulty) setDifficulty(data.difficulty);
      } catch (e) {
        console.error('Failed to restore data', e);
      }
    }
  }, []);

  // 自动保存
  useEffect(() => {
    const data = {
      questions,
      nextId,
      wordPairs,
      nextWordId,
      mode,
      timeLimit,
      lives,
      difficulty
    };
    localStorage.setItem('spot-the-typo', JSON.stringify(data));
  }, [questions, nextId, wordPairs, nextWordId, mode, timeLimit, lives, difficulty]);

  // 初始化默认数据
  const loadDefaultQuestions = () => {
    setQuestions(defaultQuestions);
    setNextId(defaultQuestions.length + 1);
    showSuccess(lang === 'zh' ? '已加载示例题目' : 'Loaded sample questions');
  };

  // 批量导入句子
  const importSentences = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    const newQuestions = [];
    let errorLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const parts = line.split('|');

      if (parts.length !== 3) {
        errorLine = i + 1;
        break;
      }

      const [sentence, wrongWord, correctWord] = parts.map(p => p.trim());

      if (!sentence || !wrongWord || !correctWord) {
        errorLine = i + 1;
        break;
      }

      if (!sentence.includes(wrongWord)) {
        errorLine = i + 1;
        break;
      }

      newQuestions.push({
        id: nextId + newQuestions.length,
        sentence,
        wrongWord,
        correctWord
      });
    }

    if (errorLine > 0) {
      showError(lang === 'zh' ? `第 ${errorLine} 行格式错误` : `Line ${errorLine} format error`);
      return false;
    }

    setQuestions(prev => [...prev, ...newQuestions]);
    setNextId(prev => prev + newQuestions.length);
    showSuccess(lang === 'zh' ? `成功导入 ${newQuestions.length} 道题` : `Imported ${newQuestions.length} questions`);
    return true;
  };

  // 批量导入词语
  const importWords = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    const newWords = [];
    let errorLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const parts = line.split('|');

      if (parts.length !== 2) {
        errorLine = i + 1;
        break;
      }

      const [correctWord, wrongWord] = parts.map(p => p.trim());

      if (!correctWord || !wrongWord) {
        errorLine = i + 1;
        break;
      }

      newWords.push({
        id: nextWordId + newWords.length,
        correctWord,
        wrongWord
      });
    }

    if (errorLine > 0) {
      showError(lang === 'zh' ? `第 ${errorLine} 行格式错误` : `Line ${errorLine} format error`);
      return false;
    }

    setWordPairs(prev => [...prev, ...newWords]);
    setNextWordId(prev => prev + newWords.length);
    showSuccess(lang === 'zh' ? `成功导入 ${newWords.length} 组词` : `Imported ${newWords.length} word pairs`);
    return true;
  };

  // 删除题目
  const deleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    showSuccess(lang === 'zh' ? '已删除' : 'Deleted');
  };

  // 删除词语对
  const deleteWordPair = (id) => {
    setWordPairs(prev => prev.filter(w => w.id !== id));
    showSuccess(lang === 'zh' ? '已删除' : 'Deleted');
  };

  // 清空题目
  const clearQuestions = () => {
    setQuestions([]);
    showSuccess(lang === 'zh' ? '已清空' : 'Cleared');
  };

  // 清空词语
  const clearWordPairs = () => {
    setWordPairs([]);
    showSuccess(lang === 'zh' ? '已清空' : 'Cleared');
  };

  // 生成 AI 提示词
  const generateAIPrompt = () => {
    const prompt = `你是一名专业对外汉语老师。
请为 HSK${aiLevel} 学生生成 ${aiCount} 组中文错别字练习。
主题是：${aiTopic}

请严格按照下面格式输出：
错误句子|错误词|正确词

要求：
1. 每句话只包含一个错别字。
2. 错误词必须出现在错误句子中。
3. 正确词必须能自然替换错误词。
4. 句子要自然、通顺，适合中文学习者。
5. 错误词应该是常见错别字、常见混淆字或常见误写。
6. 不要使用生僻词。
7. 不要使用真实存在但只是语境不合适的词作为错词。
8. 不要输出解释。
9. 不要输出编号。
10. 每行一组。

示例：
我以经完成作业了。|以经|已经
他的太度很认真。|太度|态度
今天的天汽很好。|天汽|天气

请只输出符合格式的内容。`;

    navigator.clipboard.writeText(prompt).then(() => {
      showSuccess(lang === 'zh' ? '已复制 AI 提示词，请粘贴到 ChatGPT/Kimi' : 'Copied! Paste into ChatGPT/Kimi');
    });
  };

  // 开始游戏
  const startGame = () => {
    const items = mode === 'sentence' ? questions : wordPairs;
    if (items.length === 0) {
      showError(lang === 'zh' ? '请先添加题目' : 'Please add questions first');
      return;
    }

    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(timeLimit > 0 ? timeLimit : 0);
    setCurrentLives(lives);
    setGameResults([]);
    setStep('play');
    showSuccess(lang === 'zh' ? '游戏开始！' : 'Game started!');
  };

  // 点击处理 - 句子模式
  const handleSentenceClick = (word, isTarget) => {
    if (showFeedback) return;

    setSelectedWord(word);
    setShowFeedback(true);

    if (isTarget) {
      setFeedbackCorrect(true);
      setScore(prev => prev + questionPoints);
      setGameResults(prev => [...prev, { correct: true }]);
    } else {
      setFeedbackCorrect(false);
      const newLives = currentLives - 1;
      setCurrentLives(newLives);
      setGameResults(prev => [...prev, { correct: false }]);

      if (newLives <= 0) {
        setTimeout(() => setStep('result'), 1000);
      }
    }
  };

  // 点击处理 - 词语模式
  const handleWordClick = (word, isWrong) => {
    if (showFeedback) return;

    setSelectedWord(word);
    setShowFeedback(true);
    setFeedbackCorrect(isWrong);

    if (isWrong) {
      setScore(prev => prev + questionPoints);
      setGameResults(prev => [...prev, { correct: true }]);
    } else {
      const newLives = currentLives - 1;
      setCurrentLives(newLives);
      setGameResults(prev => [...prev, { correct: false }]);

      if (newLives <= 0) {
        setTimeout(() => setStep('result'), 1000);
      }
    }
  };

  // 下一题
  const nextQuestion = () => {
    const items = mode === 'sentence' ? questions : wordPairs;
    if (currentIndex + 1 >= items.length) {
      setStep('result');
    } else {
      setCurrentIndex(prev => prev + 1);
      setShowFeedback(false);
      setSelectedWord(null);
    }
  };

  // 键盘下一题
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (step === 'play' && showFeedback && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        nextQuestion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, showFeedback, currentIndex]);

  // 计时器
  useEffect(() => {
    if (step !== 'play') return;
    if (timeLimit <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStep('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLimit]);

  // 获取当前题目
  const getCurrentQuestion = () => {
    if (mode === 'sentence') {
      return questions[currentIndex] || null;
    } else {
      return wordPairs[currentIndex] || null;
    }
  };

  // 拆分句子为可点击片段
  const splitSentence = (sentence, wrongWord) => {
    if (!wrongWord || !sentence.includes(wrongWord)) {
      return [{ text: sentence, isTarget: false }];
    }

    const parts = [];
    const regex = new RegExp(`(${wrongWord})`, 'g');
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(sentence)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: sentence.slice(lastIndex, match.index), isTarget: false });
      }
      parts.push({ text: match[1], isTarget: true });
      lastIndex = match.index + match[1].length;
    }

    if (lastIndex < sentence.length) {
      parts.push({ text: sentence.slice(lastIndex), isTarget: false });
    }

    return parts;
  };

  // 获取修正句
  const getCorrectedSentence = (sentence, wrongWord, correctWord) => {
    return sentence.replace(wrongWord, correctWord);
  };

  // 复制复盘
  const copyReview = () => {
    const items = mode === 'sentence' ? questions : wordPairs;
    let text = '';

    if (mode === 'sentence') {
      text = '错别字练习复盘\n\n';
      gameResults.forEach((result, idx) => {
        const q = questions[idx];
        if (q) {
          text += `${idx + 1}. ${result.correct ? '✓' : '✗'}\n`;
          text += `  原句: ${q.sentence}\n`;
          text += `  错词: ${q.wrongWord}\n`;
          text += `  正确: ${q.correctWord}\n`;
          text += `  修正: ${getCorrectedSentence(q.sentence, q.wrongWord, q.correctWord)}\n\n`;
        }
      });
    } else {
      text = '词语练习复盘\n\n';
      gameResults.forEach((result, idx) => {
        const w = wordPairs[idx];
        if (w) {
          text += `${idx + 1}. ${result.correct ? '✓' : '✗'}\n`;
          text += `  正确词: ${w.correctWord}\n`;
          text += `  错误词: ${w.wrongWord}\n\n`;
        }
      });
    }

    navigator.clipboard.writeText(text).then(() => {
      showSuccess(lang === 'zh' ? '已复制复盘' : 'Review copied');
    });
  };

  // 渲染设置步骤
  const renderSetup = () => (
    <div className="typo-setup-container">
      {/* 模式选择 */}
      <div className="mode-select">
        <button
          className={`mode-btn ${mode === 'sentence' ? 'active' : ''}`}
          onClick={() => setMode('sentence')}
        >
          {lang === 'zh' ? '句子模式' : 'Sentence Mode'}
        </button>
        <button
          className={`mode-btn ${mode === 'word' ? 'active' : ''}`}
          onClick={() => setMode('word')}
        >
          {lang === 'zh' ? '词语模式' : 'Word Mode'}
        </button>
      </div>

      {mode === 'sentence' ? (
        <>
          {/* 句子模式设置 */}
          <div className="setup-section">
            <h3>{lang === 'zh' ? '批量导入句子' : 'Import Sentences'}</h3>
            <p className="help-text">
              {lang === 'zh'
                ? '每行格式：错误句子|错误词|正确词'
                : 'Format per line: wrong sentence|wrong word|correct word'}
            </p>
            <textarea
              className="import-textarea"
              placeholder={lang === 'zh'
                ? '我以经完成作业了。|以经|已经\n他的太度很认真。|太度|态度\n今天的天汽很好。|天汽|天气'
                : 'I have already finished my homework.|以经|已经\nHis attitude is very serious.|太度|态度\nThe weather is good today.|天汽|天气'}
            />
            <div className="import-actions">
              <button className="import-btn" onClick={(e) => {
                const text = e.target.previousSibling.value;
                if (text) importSentences(text);
              }}>
                {lang === 'zh' ? '导入句子' : 'Import'}
              </button>
              <button className="load-default-btn" onClick={loadDefaultQuestions}>
                {lang === 'zh' ? '加载示例' : 'Load Samples'}
              </button>
            </div>
          </div>

          {/* 题目列表 */}
          <div className="questions-list">
            <div className="list-header">
              <h3>{lang === 'zh' ? `题目列表 (${questions.length})` : `Questions (${questions.length})`}</h3>
              {questions.length > 0 && (
                <button className="clear-all-btn" onClick={clearQuestions}>
                  {lang === 'zh' ? '清空' : 'Clear All'}
                </button>
              )}
            </div>
            {questions.length === 0 ? (
              <p className="empty-text">
                {lang === 'zh' ? '请导入句子或加载示例' : 'Import sentences or load samples'}
              </p>
            ) : (
              <div className="question-items">
                {questions.map((q, idx) => (
                  <div key={q.id} className="question-item">
                    <span className="q-number">{idx + 1}</span>
                    <span className="q-sentence">{q.sentence}</span>
                    <span className="q-wrong">{q.wrongWord}</span>
                    <span className="q-arrow">→</span>
                    <span className="q-correct">{q.correctWord}</span>
                    <button className="delete-btn" onClick={() => deleteQuestion(q.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 词语模式设置 */}
          <div className="setup-section">
            <h3>{lang === 'zh' ? '批量导入词语' : 'Import Words'}</h3>
            <p className="help-text">
              {lang === 'zh'
                ? '每行格式：正确词|错误词'
                : 'Format per line: correct word|wrong word'}
            </p>
            <textarea
              className="import-textarea"
              placeholder={lang === 'zh'
                ? '已经|以经\n态度|太度\n背包|北包\n天气|天汽'
                : 'already|以经\nattitude|太度\nbackpack|北包\nweather|天汽'}
            />
            <div className="import-actions">
              <button className="import-btn" onClick={(e) => {
                const text = e.target.previousSibling.value;
                if (text) importWords(text);
              }}>
                {lang === 'zh' ? '导入词语' : 'Import'}
              </button>
              <button className="load-default-btn" onClick={() => {
                setWordPairs(defaultWordPairs);
                setNextWordId(defaultWordPairs.length + 1);
                showSuccess(lang === 'zh' ? '已加载示例' : 'Loaded samples');
              }}>
                {lang === 'zh' ? '加载示例' : 'Load Samples'}
              </button>
            </div>
          </div>

          {/* 词语列表 */}
          <div className="questions-list">
            <div className="list-header">
              <h3>{lang === 'zh' ? `词语列表 (${wordPairs.length})` : `Words (${wordPairs.length})`}</h3>
              {wordPairs.length > 0 && (
                <button className="clear-all-btn" onClick={clearWordPairs}>
                  {lang === 'zh' ? '清空' : 'Clear All'}
                </button>
              )}
            </div>
            {wordPairs.length === 0 ? (
              <p className="empty-text">
                {lang === 'zh' ? '请导入词语或加载示例' : 'Import words or load samples'}
              </p>
            ) : (
              <div className="question-items">
                {wordPairs.map((w, idx) => (
                  <div key={w.id} className="question-item word-item">
                    <span className="q-number">{idx + 1}</span>
                    <span className="q-correct">{w.correctWord}</span>
                    <span className="q-arrow">|</span>
                    <span className="q-wrong">{w.wrongWord}</span>
                    <button className="delete-btn" onClick={() => deleteWordPair(w.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* AI 提示词 */}
      <div className="ai-section">
        <h3>{lang === 'zh' ? 'AI 批量生成提示词' : 'AI Prompt Generator'}</h3>
        <div className="ai-settings">
          <select value={aiLevel} onChange={(e) => setAiLevel(e.target.value)}>
            <option value="1">HSK 1</option>
            <option value="2">HSK 2</option>
            <option value="3">HSK 3</option>
            <option value="4">HSK 4</option>
            <option value="5">HSK 5</option>
            <option value="6">HSK 6</option>
          </select>
          <select value={aiCount} onChange={(e) => setAiCount(parseInt(e.target.value))}>
            <option value="10">10 {lang === 'zh' ? '题' : ''}</option>
            <option value="20">20 {lang === 'zh' ? '题' : ''}</option>
            <option value="30">30 {lang === 'zh' ? '题' : ''}</option>
          </select>
        </div>
        <input
          type="text"
          className="ai-topic-input"
          placeholder={lang === 'zh' ? '输入主题，如：学校生活' : 'Topic, e.g. school life'}
          value={aiTopic}
          onChange={(e) => setAiTopic(e.target.value)}
        />
        <button className="ai-generate-btn" onClick={generateAIPrompt}>
          {lang === 'zh' ? '生成提示词' : 'Generate Prompt'}
        </button>
      </div>

      {/* 游戏设置 */}
      <div className="settings-section">
        <h3>{lang === 'zh' ? '游戏设置' : 'Game Settings'}</h3>
        <div className="setting-row">
          <label>{lang === 'zh' ? '时间限制' : 'Time Limit'}</label>
          <select value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))}>
            <option value="0">{lang === 'zh' ? '不限时' : 'No limit'}</option>
            <option value="30">30s</option>
            <option value="60">60s</option>
            <option value="90">90s</option>
          </select>
        </div>
        <div className="setting-row">
          <label>{lang === 'zh' ? '生命数量' : 'Lives'}</label>
          <select value={lives} onChange={(e) => setLives(parseInt(e.target.value))}>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="999">{lang === 'zh' ? '无限' : 'Unlimited'}</option>
          </select>
        </div>
        <div className="setting-row">
          <label>{lang === 'zh' ? '每题分值' : 'Points'}</label>
          <select value={questionPoints} onChange={(e) => setQuestionPoints(parseInt(e.target.value))}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select>
        </div>
      </div>

      {/* 开始按钮 */}
      <button
        className="start-btn"
        onClick={startGame}
        disabled={(mode === 'sentence' ? questions.length : wordPairs.length) === 0}
      >
        {lang === 'zh' ? '开始游戏' : 'Start Game'}
      </button>
    </div>
  );

  // 渲染游戏步骤
  const renderPlay = () => {
    const current = getCurrentQuestion();
    if (!current) return null;

    return (
      <div className="typo-game-container">
        {/* 顶部状态栏 */}
        <div className="game-status-bar">
          <div className="status-item">
            <span className="status-label">{lang === 'zh' ? '分数' : 'Score'}</span>
            <span className="status-value">{score}</span>
          </div>
          {timeLimit > 0 && (
            <div className="status-item">
              <span className="status-label">{lang === 'zh' ? '时间' : 'Time'}</span>
              <span className="status-value">{timeLeft}s</span>
            </div>
          )}
          <div className="status-item">
            <span className="status-label">{lang === 'zh' ? '生命' : 'Lives'}</span>
            <span className="status-value">{currentLives}</span>
          </div>
          <div className="status-item">
            <span className="status-label">{lang === 'zh' ? '题号' : 'Q'}</span>
            <span className="status-value">{currentIndex + 1} / {mode === 'sentence' ? questions.length : wordPairs.length}</span>
          </div>
        </div>

        {/* 游戏内容 */}
        <div className="game-content">
          <h2 className="game-prompt">
            {lang === 'zh' ? '找出句子中的错别字' : 'Find the typo in the sentence'}
          </h2>

          {mode === 'sentence' ? (
            <div className="sentence-display">
              {splitSentence(current.sentence, current.wrongWord).map((part, idx) => (
                <span
                  key={idx}
                  className={`clickable-word ${part.isTarget ? 'target' : ''} ${showFeedback && part.isTarget ? 'revealed' : ''}`}
                  onClick={() => handleSentenceClick(part.text, part.isTarget)}
                >
                  {part.text}
                </span>
              ))}
            </div>
          ) : (
            <div className="words-display">
              <div className="words-pair">
                <div
                  className={`word-card ${showFeedback && !feedbackCorrect ? 'correct' : ''}`}
                  onClick={() => handleWordClick(current.correctWord, false)}
                >
                  {current.correctWord}
                </div>
                <div
                  className={`word-card wrong ${showFeedback && feedbackCorrect ? 'revealed' : ''}`}
                  onClick={() => handleWordClick(current.wrongWord, true)}
                >
                  {current.wrongWord}
                </div>
              </div>
            </div>
          )}

          {/* 反馈弹窗 */}
          {showFeedback && (
            <div className="feedback-card">
              {feedbackCorrect ? (
                <>
                  <div className="feedback-icon correct">✓</div>
                  <div className="feedback-text">
                    {lang === 'zh' ? '答对了！' : 'Correct!'}
                  </div>
                  {mode === 'sentence' && (
                    <div className="correction-info">
                      <span className="wrong">{current.wrongWord}</span>
                      <span className="arrow">→</span>
                      <span className="correct">{current.correctWord}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="feedback-icon wrong">✗</div>
                  <div className="feedback-text">
                    {lang === 'zh' ? '再想一想' : 'Try again'}
                  </div>
                </>
              )}
              <button className="next-btn" onClick={nextQuestion}>
                {lang === 'zh' ? '下一题 →' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染结果步骤
  const renderResult = () => {
    const correctCount = gameResults.filter(r => r.correct).length;
    const wrongCount = gameResults.filter(r => !r.correct).length;
    const total = gameResults.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="typo-result-container">
        <h2>{lang === 'zh' ? '游戏结束' : 'Game Over'}</h2>

        <div className="result-stats">
          <div className="stat-item">
            <span className="stat-label">{lang === 'zh' ? '最终分数' : 'Score'}</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{lang === 'zh' ? '答对' : 'Correct'}</span>
            <span className="stat-value correct">{correctCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{lang === 'zh' ? '答错' : 'Wrong'}</span>
            <span className="stat-value wrong">{wrongCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{lang === 'zh' ? '正确率' : 'Accuracy'}</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
        </div>

        {/* 复盘表 */}
        <div className="review-section">
          <h3>{lang === 'zh' ? '复盘' : 'Review'}</h3>
          <div className="review-items">
            {mode === 'sentence' ? (
              questions.slice(0, gameResults.length).map((q, idx) => (
                <div key={idx} className={`review-item ${gameResults[idx]?.correct ? 'correct' : 'wrong'}`}>
                  <span className="review-status">{gameResults[idx]?.correct ? '✓' : '✗'}</span>
                  <span className="review-sentence">{q.sentence}</span>
                  <span className="review-wrong">{q.wrongWord}</span>
                  <span className="review-arrow">→</span>
                  <span className="review-correct">{q.correctWord}</span>
                </div>
              ))
            ) : (
              wordPairs.slice(0, gameResults.length).map((w, idx) => (
                <div key={idx} className={`review-item ${gameResults[idx]?.correct ? 'correct' : 'wrong'}`}>
                  <span className="review-status">{gameResults[idx]?.correct ? '✓' : '✗'}</span>
                  <span className="review-correct">{w.correctWord}</span>
                  <span className="review-wrong">{w.wrongWord}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="result-actions">
          <button className="restart-btn" onClick={() => { setStep('setup'); startGame(); }}>
            {lang === 'zh' ? '再玩一次' : 'Play Again'}
          </button>
          <button className="copy-review-btn" onClick={copyReview}>
            {lang === 'zh' ? '复制复盘' : 'Copy Review'}
          </button>
          <button className="back-btn" onClick={() => setStep('setup')}>
            {lang === 'zh' ? '返回编辑' : 'Back to Edit'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="spot-the-typo-page">
      {step === 'setup' && renderSetup()}
      {step === 'play' && renderPlay()}
      {step === 'result' && renderResult()}
    </div>
  );
}

export default SpotTheTypo;