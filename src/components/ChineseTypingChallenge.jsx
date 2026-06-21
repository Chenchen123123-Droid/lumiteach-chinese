import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './ChineseTypingChallenge.css';

/**
 * 中文输入挑战 - Chinese Typing Challenge
 * 学生根据提示输入中文，限时挑战打字速度和准确率
 */
function ChineseTypingChallenge() {
  const { lang, t } = useLanguage();
  const [screen, setScreen] = useState('setup'); // 'setup' | 'play' | 'result' | 'leaderboard'
  const [wordInput, setWordInput] = useState('');
  const [words, setWords] = useState([]);
  const [challengeMode, setChallengeMode] = useState('english'); // 'english' | 'pinyin' | 'audio' | 'mixed'
  const [timeLimit, setTimeLimit] = useState(60);
  const [targetScore, setTargetScore] = useState(10);
  const [studentName, setStudentName] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [currentPromptType, setCurrentPromptType] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [mistakes, setMistakes] = useState({}); // { word: { ... } }
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState('');
  const audioContextRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

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
    const saved = localStorage.getItem('chinese_typing_challenge_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.wordInput) setWordInput(data.wordInput);
        if (data.challengeMode) setChallengeMode(data.challengeMode);
        if (data.timeLimit) setTimeLimit(data.timeLimit);
        if (data.targetScore) setTargetScore(data.targetScore);
        if (data.studentName) setStudentName(data.studentName);
        if (data.soundEnabled !== undefined) setSoundEnabled(data.soundEnabled);
      } catch (e) {
        console.error('加载草稿失败:', e);
      }
    }
  }, []);

  // 加载排行榜
  useEffect(() => {
    const saved = localStorage.getItem('chinese_typing_challenge_leaderboard');
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch (e) {
        console.error('加载排行榜失败:', e);
      }
    }
  }, []);

  // 保存草稿
  useEffect(() => {
    const draft = {
      wordInput,
      challengeMode,
      timeLimit,
      targetScore,
      studentName,
      soundEnabled
    };
    localStorage.setItem('chinese_typing_challenge_draft', JSON.stringify(draft));
  }, [wordInput, challengeMode, timeLimit, targetScore, studentName, soundEnabled]);

  // 计时器
  useEffect(() => {
    if (isPlaying && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, isPaused, timeRemaining]);

  // 自动聚焦输入框
  useEffect(() => {
    if (screen === 'play' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [screen, currentWordIndex]);

  // 播放音效
  const playSound = useCallback((type) => {
    if (!soundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'correct':
        oscillator.frequency.setValueAtTime(523, ctx.currentTime);
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      case 'wrong':
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      case 'levelup':
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
      case 'victory':
        [523, 659, 784, 1047, 784, 659, 523].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.1);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.1);
        });
        break;
      default:
        break;
    }
  }, [soundEnabled]);

  // 朗读中文
  const speakChinese = useCallback((text) => {
    if (!window.speechSynthesis) {
      setMessage(lang === 'zh'
        ? '当前浏览器不支持语音朗读'
        : 'Speech is not supported in this browser');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  // 解析词库
  const parseWords = useCallback((text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    const seen = new Set();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split('|').map(p => p.trim());
      const chinese = parts[0];

      if (!chinese || seen.has(chinese)) continue;
      seen.add(chinese);

      parsed.push({
        id: `word_${Date.now()}_${i}`,
        chinese: chinese,
        pinyin: parts[1] || '',
        english: parts[2] || '',
        raw: line
      });
    }

    return parsed;
  }, []);

  // 根据模式获取可用词
  const getUsableWords = useCallback((wordList, mode) => {
    switch (mode) {
      case 'english':
        return wordList.filter(w => w.english);
      case 'pinyin':
        return wordList.filter(w => w.pinyin);
      case 'audio':
        return wordList;
      case 'mixed':
        return wordList.filter(w => w.english || w.pinyin);
      default:
        return wordList;
    }
  }, []);

  // 获取当前提示类型
  const getPromptType = useCallback((mode, word) => {
    if (mode === 'mixed') {
      const available = [];
      if (word.english) available.push('english');
      if (word.pinyin) available.push('pinyin');
      available.push('audio');
      return available[Math.floor(Math.random() * available.length)];
    }
    if (mode === 'audio') return 'audio';
    if (mode === 'pinyin') return 'pinyin';
    return 'english';
  }, []);

  // 获取提示内容
  const getPrompt = useCallback((word, promptType) => {
    switch (promptType) {
      case 'english':
        return word.english || '';
      case 'pinyin':
        return word.pinyin || '';
      case 'audio':
        return 'audio';
      default:
        return '';
    }
  }, []);

  // 检查答案
  const checkAnswer = useCallback(() => {
    if (!currentWord || !userInput.trim()) return;

    const userAnswer = userInput.trim();
    const correctAnswer = currentWord.chinese.trim();

    if (userAnswer === correctAnswer) {
      // 正确
      setCorrectCount(prev => prev + 1);
      setScore(prev => prev + 1);
      playSound('correct');
      setMessage(lang === 'zh' ? '正确！' : 'Correct!');
      setUserInput('');

      // 检查是否升级
      const newScore = score + 1;
      const levelThreshold = targetScore + (currentLevel - 1) * 5;
      if (newScore >= levelThreshold && currentLevel < 3) {
        playSound('levelup');
        setCurrentLevel(prev => prev + 1);
        setMessage(lang === 'zh'
          ? `恭喜进入 Level ${currentLevel + 1}！`
          : `Level ${currentLevel + 1}!`);
      }

      // 下一题
      pickNextWord();
    } else {
      // 错误
      setWrongCount(prev => prev + 1);
      setWrongAttempts(prev => prev + 1);

      // 记录到错词本
      setMistakes(prev => ({
        ...prev,
        [currentWord.chinese]: {
          chinese: currentWord.chinese,
          pinyin: currentWord.pinyin,
          english: currentWord.english,
          userInput: userAnswer,
          count: (prev[currentWord.chinese]?.count || 0) + 1
        }
      }));

      playSound('wrong');
      setMessage(lang === 'zh' ? '再试一次' : 'Try Again');

      // 连续错误3次显示答案
      if (wrongAttempts >= 2) {
        setShowAnswer(true);
      }
    }
  }, [currentWord, userInput, score, targetScore, currentLevel, wrongAttempts, lang, playSound]);

  // 选择下一题
  const pickNextWord = useCallback(() => {
    const usableWords = getUsableWords(words, challengeMode);
    if (usableWords.length === 0) {
      setMessage(lang === 'zh'
        ? '当前模式可用词语不足'
        : 'Not enough usable words');
      return;
    }

    const nextIndex = Math.floor(Math.random() * usableWords.length);
    const nextWord = usableWords[nextIndex];
    setCurrentWord(nextWord);
    setCurrentWordIndex(nextIndex);
    setCurrentPromptType(getPromptType(challengeMode, nextWord));
    setWrongAttempts(0);
    setShowAnswer(false);
    setMessage('');
  }, [words, challengeMode, getPromptType, lang]);

  // 开始游戏
  const startChallenge = () => {
    const parsed = parseWords(wordInput);
    if (parsed.length === 0) {
      setMessage(lang === 'zh' ? '请先输入词库' : 'Please enter word list');
      return;
    }

    const usable = getUsableWords(parsed, challengeMode);
    if (usable.length < 3) {
      setMessage(lang === 'zh'
        ? '当前模式可用词语不足，请补充拼音或英文'
        : 'Not enough usable words. Please add pinyin or English.');
      return;
    }

    setWords(parsed);
    setCurrentLevel(1);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setMistakes({});
    setTimeRemaining(timeLimit);
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentWord(null);

    // 选择第一题
    const firstIndex = Math.floor(Math.random() * usable.length);
    setCurrentWord(usable[firstIndex]);
    setCurrentPromptType(getPromptType(challengeMode, usable[firstIndex]));

    setScreen('play');
    setMessage('');

    // 聚焦输入框
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  // 结束游戏
  const finishGame = useCallback(() => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    playSound('victory');

    // 保存记录
    const record = {
      id: `record_${Date.now()}`,
      studentName: studentName || 'Guest',
      score: score,
      accuracy: correctCount + wrongCount > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0,
      level: currentLevel,
      timeLimit: timeLimit,
      mode: challengeMode,
      date: new Date().toISOString()
    };

    const newLeaderboard = [...leaderboard, record].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return a.timeLimit - b.timeLimit;
    }).slice(0, 20);

    setLeaderboard(newLeaderboard);
    localStorage.setItem('chinese_typing_challenge_leaderboard', JSON.stringify(newLeaderboard));

    setScreen('result');
  }, [score, correctCount, wrongCount, currentLevel, timeLimit, challengeMode, studentName, leaderboard, playSound]);

  // 跳过当前词
  const skipWord = () => {
    if (!currentWord) return;
    setMistakes(prev => ({
      ...prev,
      [currentWord.chinese]: {
        chinese: currentWord.chinese,
        pinyin: currentWord.pinyin,
        english: currentWord.english,
        userInput: 'skipped',
        count: 1
      }
    }));
    pickNextWord();
  };

  // 显示答案
  const revealAnswer = () => {
    setShowAnswer(true);
  };

  // 重新练习错词
  const practiceMistakes = () => {
    const mistakeWords = Object.values(mistakes);
    if (mistakeWords.length === 0) return;

    const newWords = mistakeWords.map((m, i) => ({
      id: `word_mistake_${i}`,
      chinese: m.chinese,
      pinyin: m.pinyin,
      english: m.english,
      raw: m.chinese
    }));

    setWords(newWords);
    setCurrentLevel(1);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setMistakes({});
    setTimeRemaining(timeLimit);
    setIsPlaying(true);
    setIsPaused(false);

    if (newWords.length > 0) {
      setCurrentWord(newWords[0]);
      setCurrentPromptType(getPromptType(challengeMode, newWords[0]));
    }

    setScreen('play');
    setMessage('');

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  // 重新开始
  const restartGame = () => {
    const usable = getUsableWords(words, challengeMode);
    if (usable.length === 0) return;

    setCurrentLevel(1);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setMistakes({});
    setTimeRemaining(timeLimit);
    setIsPlaying(true);
    setIsPaused(false);

    const firstIndex = Math.floor(Math.random() * usable.length);
    setCurrentWord(usable[firstIndex]);
    setCurrentPromptType(getPromptType(challengeMode, usable[firstIndex]));
    setWrongAttempts(0);
    setShowAnswer(false);
    setMessage('');

    setScreen('play');
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  // 清空草稿
  const clearDraft = () => {
    localStorage.removeItem('chinese_typing_challenge_draft');
    setWordInput('');
    setChallengeMode('english');
    setTimeLimit(60);
    setTargetScore(10);
    setStudentName('');
    setMessage(lang === 'zh' ? '草稿已清除' : 'Draft cleared');
  };

  // 清空排行榜
  const clearLeaderboard = () => {
    localStorage.removeItem('chinese_typing_challenge_leaderboard');
    setLeaderboard([]);
    setMessage(lang === 'zh' ? '排行榜已清除' : 'Leaderboard cleared');
  };

  // 处理输入
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  // 处理回车
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  // 手动触发正确（当输入等于答案时自动正确）
  useEffect(() => {
    if (currentWord && userInput.trim() === currentWord.chinese.trim() && userInput.trim() !== '') {
      checkAnswer();
    }
  }, [userInput, currentWord, checkAnswer]);

  // ===== 渲染结果页 =====
  if (screen === 'result') {
    const accuracy = correctCount + wrongCount > 0
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
      : 0;
    const mistakeList = Object.values(mistakes);

    return (
      <div className="typing-result">
        <div className="result-card">
          <h2>{lang === 'zh' ? '挑战完成！' : 'Challenge Complete!'}</h2>

          <div className="result-stats">
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '学生' : 'Student'}</span>
              <span className="stat-value">{studentName || 'Guest'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '最终等级' : 'Final Level'}</span>
              <span className="stat-value">Level {currentLevel}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '得分' : 'Score'}</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '正确' : 'Correct'}</span>
              <span className="stat-value correct-val">{correctCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '错误' : 'Wrong'}</span>
              <span className="stat-value wrong-val">{wrongCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '正确率' : 'Accuracy'}</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{lang === 'zh' ? '用时' : 'Time'}</span>
              <span className="stat-value">{timeLimit}s</span>
            </div>
          </div>

          {mistakeList.length > 0 && (
            <div className="mistakes-section">
              <h3>{lang === 'zh' ? '本次错词' : 'Mistake Review'}</h3>
              <div className="mistakes-table">
                <div className="mistakes-header">
                  <span>{lang === 'zh' ? '正确答案' : 'Correct'}</span>
                  <span>{lang === 'zh' ? '拼音' : 'Pinyin'}</span>
                  <span>{lang === 'zh' ? '你的输入' : 'Your Input'}</span>
                </div>
                {mistakeList.map((m, idx) => (
                  <div key={idx} className="mistakes-row">
                    <span className="correct-word">{m.chinese}</span>
                    <span className="pinyin-word">{m.pinyin}</span>
                    <span className="user-word">{m.userInput}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="result-buttons">
            <button className="btn-result primary" onClick={restartGame}>
              {lang === 'zh' ? '再玩一次' : 'Play Again'}
            </button>
            {mistakeList.length > 0 && (
              <button className="btn-result" onClick={practiceMistakes}>
                {lang === 'zh' ? '练习错词' : 'Practice Mistakes'}
              </button>
            )}
            <button className="btn-result" onClick={() => setScreen('leaderboard')}>
              {lang === 'zh' ? '查看排行榜' : 'View Leaderboard'}
            </button>
            <button className="btn-result secondary" onClick={() => setScreen('setup')}>
              {lang === 'zh' ? '返回设置' : 'Back to Setup'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 渲染排行榜页 =====
  if (screen === 'leaderboard') {
    return (
      <div className="typing-leaderboard">
        <div className="leaderboard-card">
          <h2>{lang === 'zh' ? '排行榜' : 'Leaderboard'}</h2>

          {leaderboard.length === 0 ? (
            <p className="no-records">
              {lang === 'zh'
                ? '暂无记录'
                : 'No records yet'}
            </p>
          ) : (
            <div className="leaderboard-table">
              <div className="leaderboard-header">
                <span>#</span>
                <span>{lang === 'zh' ? '学生' : 'Student'}</span>
                <span>{lang === 'zh' ? '得分' : 'Score'}</span>
                <span>{lang === 'zh' ? '正确率' : 'Accuracy'}</span>
                <span>{lang === 'zh' ? '等级' : 'Level'}</span>
              </div>
              {leaderboard.map((record, idx) => (
                <div key={record.id} className={`leaderboard-row ${idx < 3 ? 'top-three' : ''}`}>
                  <span className="rank">#{idx + 1}</span>
                  <span className="name">{record.studentName}</span>
                  <span className="score">{record.score}</span>
                  <span className="accuracy">{record.accuracy}%</span>
                  <span className="level">Lv{record.level}</span>
                </div>
              ))}
            </div>
          )}

          <div className="leaderboard-buttons">
            {leaderboard.length > 0 && (
              <button className="btn-leaderboard" onClick={clearLeaderboard}>
                {lang === 'zh' ? '清空排行榜' : 'Clear Leaderboard'}
              </button>
            )}
            <button className="btn-leaderboard secondary" onClick={() => setScreen('setup')}>
              {lang === 'zh' ? '返回设置' : 'Back to Setup'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 渲染游戏页 =====
  if (screen === 'play') {
    const prompt = currentWord ? getPrompt(currentWord, currentPromptType) : '';
    const accuracy = correctCount + wrongCount > 0
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
      : 100;

    return (
      <div className="typing-play">
        <div className="play-header">
          <div className="level-badge">Level {currentLevel}</div>
          <div className="target-badge">
            {lang === 'zh' ? '目标' : 'Target'}: {targetScore + (currentLevel - 1) * 5}
          </div>
          <div className="time-badge">
            {lang === 'zh' ? '剩余时间' : 'Time'}: {timeRemaining}s
          </div>
          <div className="score-badge">
            {lang === 'zh' ? '得分' : 'Score'}: {score}
          </div>
          <div className="accuracy-badge">
            {lang === 'zh' ? '正确率' : 'Accuracy'}: {accuracy}%
          </div>
          <div className="sound-toggle" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? '🔊' : '🔇'}
          </div>
        </div>

        <div className="play-content">
          <div className="prompt-card">
            {currentPromptType === 'audio' ? (
              <div className="audio-prompt">
                <button className="btn-speak" onClick={() => speakChinese(currentWord?.chinese)}>
                  🔊 {lang === 'zh' ? '播放读音' : 'Play Audio'}
                </button>
              </div>
            ) : (
              <div className="text-prompt">{prompt}</div>
            )}
            <div className="prompt-hint">
              {lang === 'zh' ? '请输入中文' : 'Type the Chinese word'}
            </div>
          </div>

          <div className={`input-area ${message === (lang === 'zh' ? '正确！' : 'Correct!') ? 'correct' : message === (lang === 'zh' ? '再试一次' : 'Try Again') ? 'wrong' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'zh' ? '输入中文...' : 'Type Chinese...'}
              autoComplete="off"
              className="typing-input"
            />
            {currentWord?.pinyin && (
              <button className="btn-listen" onClick={() => speakChinese(currentWord.chinese)}>
                🔊
              </button>
            )}
          </div>

          <div className="feedback-message">{message}</div>

          {showAnswer && currentWord && (
            <div className="answer-reveal">
              <div className="answer-text">
                <span className="label">{lang === 'zh' ? '正确答案' : 'Answer'}:</span>
                <span className="word">{currentWord.chinese}</span>
              </div>
              {currentWord.pinyin && (
                <div className="answer-pinyin">{currentWord.pinyin}</div>
              )}
              {currentWord.english && (
                <div className="answer-english">{currentWord.english}</div>
              )}
            </div>
          )}

          <div className="play-actions">
            <button className="btn-action" onClick={skipWord}>
              {lang === 'zh' ? '跳过' : 'Skip'}
            </button>
            <button className="btn-action" onClick={revealAnswer} disabled={!currentWord}>
              {lang === 'zh' ? '查看答案' : 'Show Answer'}
            </button>
            <button className="btn-action" onClick={() => setIsPaused(!isPaused)}>
              {isPaused
                ? (lang === 'zh' ? '继续' : 'Resume')
                : (lang === 'zh' ? '暂停' : 'Pause')}
            </button>
            <button className="btn-action danger" onClick={finishGame}>
              {lang === 'zh' ? '结束挑战' : 'End Challenge'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 渲染设置页 =====
  return (
    <div className="typing-setup">
      <div className="setup-header">
        <h1>{lang === 'zh' ? '中文输入挑战' : 'Chinese Typing Challenge'}</h1>
        <p className="setup-subtitle">
          {lang === 'zh'
            ? '导入词库，让学生根据英文、拼音或语音提示输入中文'
            : 'Import a word list and let students type Chinese from prompts'}
        </p>
      </div>

      <div className="setup-content">
        <div className="input-section">
          <h3>{lang === 'zh' ? '词库输入' : 'Word List'}</h3>
          <textarea
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            placeholder={lang === 'zh'
              ? '每行一个词，支持格式：\n中文|拼音|英文\n例如：\n草莓|cǎo méi|strawberry\n香蕉|xiāng jiāo|banana'
              : 'One word per line:\nChinese|Pinyin|English\nExample:\n草莓|cǎo méi|strawberry\n香蕉|xiāng jiāo|banana'}
            rows={8}
          />
        </div>

        <div className="settings-row">
          <div className="setting-group">
            <label>{lang === 'zh' ? '挑战模式' : 'Challenge Mode'}</label>
            <select value={challengeMode} onChange={(e) => setChallengeMode(e.target.value)}>
              <option value="english">{lang === 'zh' ? '英文提示 → 中文' : 'English → Chinese'}</option>
              <option value="pinyin">{lang === 'zh' ? '拼音提示 → 中文' : 'Pinyin → Chinese'}</option>
              <option value="audio">{lang === 'zh' ? '听音提示 → 中文' : 'Audio → Chinese'}</option>
              <option value="mixed">{lang === 'zh' ? '混合模式' : 'Mixed Mode'}</option>
            </select>
          </div>

          <div className="setting-group">
            <label>{lang === 'zh' ? '时间设置' : 'Time Limit'}</label>
            <select value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}>
              <option value="30">30s</option>
              <option value="60">60s</option>
              <option value="90">90s</option>
              <option value="120">120s</option>
            </select>
          </div>

          <div className="setting-group">
            <label>{lang === 'zh' ? '目标分数' : 'Target Score'}</label>
            <select value={targetScore} onChange={(e) => setTargetScore(Number(e.target.value))}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="0">{lang === 'zh' ? '不限目标' : 'No Target'}</option>
            </select>
          </div>

          <div className="setting-group">
            <label>{lang === 'zh' ? '学生名字' : 'Student Name'}</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder={lang === 'zh' ? '例如：Alex' : 'e.g. Alex'}
            />
          </div>
        </div>

        <div className="setup-actions">
          <button className="btn-start" onClick={startChallenge}>
            {lang === 'zh' ? '开始挑战' : 'Start Challenge'}
          </button>
          <button className="btn-secondary" onClick={() => setScreen('leaderboard')}>
            {lang === 'zh' ? '查看排行榜' : 'View Leaderboard'}
          </button>
          <button className="btn-clear" onClick={clearDraft}>
            {lang === 'zh' ? '清空草稿' : 'Clear Draft'}
          </button>
        </div>

        {message && <div className="message-toast">{message}</div>}
      </div>
    </div>
  );
}

export default ChineseTypingChallenge;