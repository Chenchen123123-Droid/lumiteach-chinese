import React, { useState, useEffect, useCallback, useRef } from 'react';
import { hskWordBank } from '../data/hskWordBank';
import './WordMatchingGame.css';

const DRAFT_KEY = 'word_matching_game_draft';

const translations = {
  zh: {
    title: '词语配对游戏',
    subtitle: '将中文词语与对应的拼音或英文解释配对，适合 HSK 词汇复习和课堂互动。',
    wordSource: '词语来源',
    hskWordBank: 'HSK 词库',
    customInput: '自定义输入',
    hskLevel: 'HSK 等级',
    mixedHSK: '混合 HSK 1-3',
    enterWords: '输入词语',
    wordFormat: '每行一个词，格式：中文|拼音|英文',
    matchingMode: '配对模式',
    chinesePinyin: '中文 ↔ 拼音',
    chineseEnglish: '中文 ↔ 英文',
    pinyinEnglish: '拼音 ↔ 英文',
    pairCount: '题目数量',
    startGame: '开始游戏',
    backToSetup: '返回设置',
    time: '用时',
    mistakes: '错误',
    fullscreen: '全屏上课',
    showAnswers: '显示答案',
    restart: '重新开始',
    completed: '完成啦！',
    mistakeCount: '错误次数',
    accuracy: '正确率',
    playAgain: '再玩一次',
    clearDraft: '清空草稿',
    notEnoughWords: '可用词语不足，请补充内容',
    notEnoughPairs: '当前可用词语不足，请减少题目数量或添加更多词语',
    answersShown: '答案已显示',
    noFullscreenSupport: '当前浏览器不支持全屏',
    difficulty: '难度',
    easy: '初级',
    medium: '中级',
    hard: '高级'
  },
  en: {
    title: 'Word Matching Game',
    subtitle: 'Match Chinese words with pinyin or English meanings. Great for HSK vocabulary review.',
    wordSource: 'Word Source',
    hskWordBank: 'HSK Word Bank',
    customInput: 'Custom Input',
    hskLevel: 'HSK Level',
    mixedHSK: 'Mixed HSK 1-3',
    enterWords: 'Enter Words',
    wordFormat: 'One word per line. Format: Chinese|Pinyin|English',
    matchingMode: 'Matching Mode',
    chinesePinyin: 'Chinese ↔ Pinyin',
    chineseEnglish: 'Chinese ↔ English',
    pinyinEnglish: 'Pinyin ↔ English',
    pairCount: 'Number of Pairs',
    startGame: 'Start Game',
    backToSetup: 'Back to Settings',
    time: 'Time',
    mistakes: 'Mistakes',
    fullscreen: 'Fullscreen',
    showAnswers: 'Show Answers',
    restart: 'Restart',
    completed: 'Completed!',
    mistakeCount: 'Mistakes',
    accuracy: 'Accuracy',
    playAgain: 'Play Again',
    clearDraft: 'Clear Draft',
    notEnoughWords: 'Not enough usable words. Please add more content.',
    notEnoughPairs: 'Not enough available words. Please reduce the number or add more words.',
    answersShown: 'Answers Shown',
    noFullscreenSupport: 'Fullscreen not supported in this browser.',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  }
};

function WordMatchingGame({ onToggleFullscreen, isFullscreen }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('language') || 'zh';
    } catch {
      return 'zh';
    }
  });
  const t = translations[lang] || translations.zh;

  const [screen, setScreen] = useState('setup');
  const [wordSource, setWordSource] = useState('hsk');
  const [hskLevel, setHskLevel] = useState('hsk1');
  const [customInput, setCustomInput] = useState('');
  const [matchingMode, setMatchingMode] = useState('chinese-pinyin');
  const [pairCount, setPairCount] = useState(8);
  const [message, setMessage] = useState('');

  const [gamePairs, setGamePairs] = useState([]);
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeftId, setSelectedLeftId] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongPairIds, setWrongPairIds] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answersShown, setAnswersShown] = useState(false);

  const gameRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    loadDraft();
  }, []);

  useEffect(() => {
    if (screen === 'game') {
      saveDraft();
    }
  }, [screen, wordSource, hskLevel, customInput, matchingMode, pairCount]);

  useEffect(() => {
    if (startTime && !isCompleted && !answersShown) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, isCompleted, answersShown]);

  const parseCustomInput = useCallback((text) => {
    if (!text.trim()) return [];

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const result = [];
    const seen = new Set();

    lines.forEach((line, idx) => {
      let chinese = '', pinyin = '', meaning = '';

      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        chinese = parts[0] || '';
        pinyin = parts[1] || '';
        meaning = parts[2] || '';
      } else {
        chinese = line;
      }

      if (chinese && !seen.has(chinese)) {
        seen.add(chinese);
        result.push({ id: `word_${idx}`, chinese, pinyin, meaning });
      }
    });

    return result;
  }, []);

  const getWordsFromSource = useCallback(() => {
    if (wordSource === 'hsk') {
      if (hskLevel === 'mixed') {
        return [...hskWordBank.hsk1, ...hskWordBank.hsk2, ...hskWordBank.hsk3];
      }
      return hskWordBank[hskLevel] || [];
    }
    return parseCustomInput(customInput);
  }, [wordSource, hskLevel, customInput, parseCustomInput]);

  const filterWordsByMode = useCallback((words, mode) => {
    return words.filter(word => {
      switch (mode) {
        case 'chinese-pinyin':
          return word.chinese && word.pinyin;
        case 'chinese-english':
          return word.chinese && word.meaning;
        case 'pinyin-english':
          return word.pinyin && word.meaning;
        default:
          return true;
      }
    });
  }, []);

  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const startGame = useCallback(() => {
    const allWords = getWordsFromSource();
    const filteredWords = filterWordsByMode(allWords, matchingMode);

    if (filteredWords.length === 0) {
      setMessage(t.notEnoughWords);
      return;
    }

    if (filteredWords.length < pairCount) {
      setMessage(`${t.notEnoughPairs} (${filteredWords.length})`);
      return;
    }

    const shuffledWords = shuffleArray(filteredWords).slice(0, pairCount);
    const pairs = shuffledWords.map((word, idx) => ({
      id: `pair_${idx}`,
      word: word
    }));

    const left = pairs.map(pair => ({
      id: pair.id,
      value: getLeftValue(pair.word, matchingMode),
      pairId: pair.id
    }));

    const right = shuffleArray(pairs).map(pair => ({
      id: `right_${pair.id}`,
      value: getRightValue(pair.word, matchingMode),
      pairId: pair.id
    }));

    setGamePairs(pairs);
    setLeftItems(left);
    setRightItems(right);
    setSelectedLeftId(null);
    setMatchedPairs([]);
    setWrongPairIds([]);
    setMistakes(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsCompleted(false);
    setAnswersShown(false);
    setMessage('');
    setScreen('game');
  }, [getWordsFromSource, filterWordsByMode, matchingMode, pairCount, shuffleArray, t]);

  const getLeftValue = (word, mode) => {
    switch (mode) {
      case 'chinese-pinyin':
        return word.chinese;
      case 'chinese-english':
        return word.chinese;
      case 'pinyin-english':
        return word.pinyin;
      default:
        return word.chinese;
    }
  };

  const getRightValue = (word, mode) => {
    switch (mode) {
      case 'chinese-pinyin':
        return word.pinyin;
      case 'chinese-english':
        return word.meaning;
      case 'pinyin-english':
        return word.meaning;
      default:
        return word.pinyin;
    }
  };

  const handleLeftClick = useCallback((item) => {
    if (matchedPairs.includes(item.pairId)) return;
    if (answersShown) return;

    setSelectedLeftId(item.id);
    setWrongPairIds([]);
  }, [matchedPairs, answersShown]);

  const handleRightClick = useCallback((item) => {
    if (!selectedLeftId) return;
    if (matchedPairs.includes(item.pairId)) return;
    if (answersShown) return;

    const leftItem = leftItems.find(l => l.id === selectedLeftId);
    if (!leftItem) return;

    if (leftItem.pairId === item.pairId) {
      setMatchedPairs(prev => [...prev, leftItem.pairId]);
      setSelectedLeftId(null);

      if (matchedPairs.length + 1 === gamePairs.length) {
        setIsCompleted(true);
      }
    } else {
      setWrongPairIds([selectedLeftId, item.id]);
      setMistakes(prev => prev + 1);
      setTimeout(() => {
        setWrongPairIds([]);
      }, 800);
    }
  }, [selectedLeftId, leftItems, matchedPairs, gamePairs.length, answersShown]);

  const showAnswers = useCallback(() => {
    setMatchedPairs(gamePairs.map(p => p.id));
    setAnswersShown(true);
  }, [gamePairs]);

  const restartGame = useCallback(() => {
    const right = shuffleArray(gamePairs).map(pair => ({
      id: `right_${pair.id}`,
      value: getRightValue(pair.word, matchingMode),
      pairId: pair.id
    }));

    setRightItems(right);
    setSelectedLeftId(null);
    setMatchedPairs([]);
    setWrongPairIds([]);
    setMistakes(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsCompleted(false);
    setAnswersShown(false);
    setMessage('');
  }, [gamePairs, matchingMode, shuffleArray]);

  const backToSetup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setScreen('setup');
    setMessage('');
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (gameRef.current) {
        gameRef.current.requestFullscreen().catch(() => {
          alert(t.noFullscreenSupport);
        });
      }
    } else {
      document.exitFullscreen();
    }
  }, [t]);

  const saveDraft = useCallback(() => {
    try {
      const data = { wordSource, hskLevel, customInput, matchingMode, pairCount };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  }, [wordSource, hskLevel, customInput, matchingMode, pairCount]);

  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const data = JSON.parse(draft);
        if (data.wordSource) setWordSource(data.wordSource);
        if (data.hskLevel) setHskLevel(data.hskLevel);
        if (data.customInput) setCustomInput(data.customInput);
        if (data.matchingMode) setMatchingMode(data.matchingMode);
        if (data.pairCount) setPairCount(data.pairCount);
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setWordSource('hsk');
      setHskLevel('hsk1');
      setCustomInput('');
      setMatchingMode('chinese-pinyin');
      setPairCount(8);
    } catch (e) {
      console.error('Error clearing draft:', e);
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficulty = () => {
    if (pairCount <= 6) return { label: t.easy, class: 'easy' };
    if (pairCount <= 10) return { label: t.medium, class: 'medium' };
    return { label: t.hard, class: 'hard' };
  };

  const getAccuracy = () => {
    const correct = matchedPairs.length;
    const total = correct + mistakes;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const renderSetup = () => (
    <div className="matching-setup">
      <div className="setup-card">
        <div className="setup-header">
          <h2>{t.title}</h2>
          <p className="subtitle">{t.subtitle}</p>
        </div>

        <div className="setup-section">
          <h3>{t.wordSource}</h3>
          <div className="source-tabs">
            <button
              className={`tab-btn ${wordSource === 'hsk' ? 'active' : ''}`}
              onClick={() => setWordSource('hsk')}
            >
              {t.hskWordBank}
            </button>
            <button
              className={`tab-btn ${wordSource === 'custom' ? 'active' : ''}`}
              onClick={() => setWordSource('custom')}
            >
              {t.customInput}
            </button>
          </div>
        </div>

        {wordSource === 'hsk' && (
          <div className="setup-section">
            <h3>{t.hskLevel}</h3>
            <div className="hsk-grid">
              {['hsk1', 'hsk2', 'hsk3', 'mixed'].map(level => (
                <button
                  key={level}
                  className={`hsk-btn ${hskLevel === level ? 'active' : ''}`}
                  onClick={() => setHskLevel(level)}
                >
                  {level === 'mixed' ? t.mixedHSK : level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {wordSource === 'custom' && (
          <div className="setup-section">
            <h3>{t.enterWords}</h3>
            <textarea
              className="custom-input"
              placeholder={t.wordFormat}
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
            />
          </div>
        )}

        <div className="setup-section">
          <h3>{t.matchingMode}</h3>
          <div className="mode-grid">
            <button
              className={`mode-btn ${matchingMode === 'chinese-pinyin' ? 'active' : ''}`}
              onClick={() => setMatchingMode('chinese-pinyin')}
            >
              {t.chinesePinyin}
            </button>
            <button
              className={`mode-btn ${matchingMode === 'chinese-english' ? 'active' : ''}`}
              onClick={() => setMatchingMode('chinese-english')}
            >
              {t.chineseEnglish}
            </button>
            <button
              className={`mode-btn ${matchingMode === 'pinyin-english' ? 'active' : ''}`}
              onClick={() => setMatchingMode('pinyin-english')}
            >
              {t.pinyinEnglish}
            </button>
          </div>
        </div>

        <div className="setup-section">
          <h3>{t.pairCount}</h3>
          <div className="pair-count-grid">
            {[4, 6, 8, 10, 12].map(count => (
              <button
                key={count}
                className={`count-btn ${pairCount === count ? 'active' : ''}`}
                onClick={() => setPairCount(count)}
              >
                {count}
              </button>
            ))}
          </div>
          <div className="difficulty-badge">
            <span className={`difficulty ${getDifficulty().class}`}>
              {t.difficulty}：{getDifficulty().label}
            </span>
          </div>
        </div>

        {message && <div className="message-box error">{message}</div>}

        <div className="setup-actions">
          <button className="btn-start" onClick={startGame}>
            {t.startGame}
          </button>
          <button className="btn-clear" onClick={clearDraft}>
            {t.clearDraft}
          </button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="matching-game" ref={gameRef}>
      <div className="game-header">
        <button className="btn-back" onClick={backToSetup}>
          {t.backToSetup}
        </button>
        <h2>{t.title}</h2>
        <div className="game-stats">
          <span className="stat">
            {t.time}：{formatTime(elapsedTime)}
          </span>
          <span className="stat">
            {t.mistakes}：{mistakes}
          </span>
          <button className="btn-fullscreen" onClick={toggleFullscreen}>
            {t.fullscreen}
          </button>
        </div>
      </div>

      <div className="game-content">
        <div className="left-column">
          {leftItems.map(item => {
            const isMatched = matchedPairs.includes(item.pairId);
            const isSelected = selectedLeftId === item.id;
            const isWrong = wrongPairIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`match-card left ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={() => handleLeftClick(item)}
              >
                {item.value}
              </div>
            );
          })}
        </div>

        <div className="right-column">
          {rightItems.map(item => {
            const isMatched = matchedPairs.includes(item.pairId);
            const isWrong = wrongPairIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`match-card right ${isMatched ? 'matched' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={() => handleRightClick(item)}
              >
                {item.value}
              </div>
            );
          })}
        </div>
      </div>

      <div className="game-actions">
        <button className="btn-action" onClick={showAnswers}>
          {t.showAnswers}
        </button>
        <button className="btn-action" onClick={restartGame}>
          {t.restart}
        </button>
      </div>

      {(isCompleted || answersShown) && (
        <div className="result-modal">
          <div className="result-content">
            <h3>{isCompleted ? t.completed : t.answersShown}</h3>
            {isCompleted && (
              <>
                <div className="result-stats">
                  <p>{t.time}：{elapsedTime} {lang === 'zh' ? '秒' : 's'}</p>
                  <p>{t.mistakeCount}：{mistakes}</p>
                  <p>{t.accuracy}：{getAccuracy()}%</p>
                </div>
              </>
            )}
            <div className="result-actions">
              <button className="btn-primary" onClick={restartGame}>
                {t.playAgain}
              </button>
              <button className="btn-secondary" onClick={backToSetup}>
                {t.backToSetup}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="word-matching-game">
      {screen === 'setup' ? renderSetup() : renderGame()}
    </div>
  );
}

export default WordMatchingGame;
