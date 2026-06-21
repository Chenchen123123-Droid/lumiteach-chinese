import React, { useState, useCallback } from 'react';
import './WordGachaGame.css';

/**
 * 词语扭蛋机游戏组件
 * 功能：老师输入词语，系统随机抽取展示，适合课堂互动
 */

// 各语言的默认词语
const defaultWords = {
  'zh-CN': ['苹果', '香蕉', '橘子', '葡萄', '西瓜', '草莓', '桃子', '梨'],
  'zh-TW': ['蘋果', '香蕉', '橘子', '葡萄', '西瓜', '草莓', '桃子', '梨'],
  'en': ['apple', 'banana', 'orange', 'grape', 'watermelon', 'strawberry', 'peach', 'pear'],
  'ko': ['사과', '바나나', '오렌지', '포도', '수박', '딸기', '복숭아', '배'],
  'ja': ['りんご', 'バナナ', 'オレンジ', 'ブドウ', 'スイカ', 'イチゴ', 'モモ', 'ナシ']
};

// 语音语言映射
const speechLangMap = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'en': 'en-US',
  'ko': 'ko-KR',
  'ja': 'ja-JP'
};

function WordGachaGame() {
  const [rawText, setRawText] = useState('');
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [drawnWords, setDrawnWords] = useState([]);
  const [remainingWords, setRemainingWords] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState('点击扭蛋开始抽词');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const parseWords = useCallback((text) => {
    if (!text.trim()) {
      return defaultWords['zh-CN'];
    }
    const wordList = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
    return wordList.length > 0 ? wordList : defaultWords['zh-CN'];
  }, []);

  const getWordCount = () => {
    if (!rawText.trim()) return defaultWords['zh-CN'].length;
    const wordList = rawText.split('\n').map(w => w.trim()).filter(w => w.length > 0);
    return wordList.length > 0 ? wordList.length : defaultWords['zh-CN'].length;
  };

  const startGame = () => {
    const wordList = parseWords(rawText);
    setWords(wordList);
    setRemainingWords([...wordList]);
    setDrawnWords([]);
    setCurrentWord('');
    setMessage('点击扭蛋开始抽词');
    setGameStarted(true);
  };

  const drawWord = () => {
    if (isDrawing) return;
    if (!allowRepeat && remainingWords.length === 0) {
      setMessage('所有词语都已经抽完啦！');
      return;
    }

    setIsDrawing(true);
    setMessage('抽取中...');

    setTimeout(() => {
      let selectedWord;
      let newRemainingWords;
      let newDrawnWords;

      if (allowRepeat) {
        const randomIndex = Math.floor(Math.random() * words.length);
        selectedWord = words[randomIndex];
        newRemainingWords = remainingWords;
        newDrawnWords = [...drawnWords, selectedWord];
      } else {
        const randomIndex = Math.floor(Math.random() * remainingWords.length);
        selectedWord = remainingWords[randomIndex];
        newRemainingWords = remainingWords.filter((_, index) => index !== randomIndex);
        newDrawnWords = [...drawnWords, selectedWord];
      }

      setCurrentWord(selectedWord);
      setRemainingWords(newRemainingWords);
      setDrawnWords(newDrawnWords);
      setIsDrawing(false);
      setMessage('');
    }, 1000);
  };

  const speakWord = () => {
    if (!currentWord || isSpeaking) return;
    if (!('speechSynthesis' in window)) {
      alert('您的浏览器不支持语音朗读功能');
      return;
    }

    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      alert('语音朗读出错，请重试');
    };

    window.speechSynthesis.speak(utterance);
  };

  const resetGame = () => {
    setRemainingWords([...words]);
    setDrawnWords([]);
    setCurrentWord('');
    setMessage('点击扭蛋开始抽词');
  };

  const endGame = () => {
    setGameStarted(false);
    setWords([]);
    setRemainingWords([]);
    setDrawnWords([]);
    setCurrentWord('');
    setMessage('点击扭蛋开始抽词');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getRandomColor = (index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA', '#FF9F43', '#5F27CD'];
    return colors[index % colors.length];
  };

  return (
    <div className={`gacha-game ${isFullscreen ? 'fullscreen' : ''}`}>
      {!gameStarted ? (
        <div className="game-settings">
          <div className="settings-header">
            <h2 className="game-title">🔮 词语扭蛋机</h2>
            <p className="game-description">
              输入词语，每行一个。点击开始游戏后，点击"扭蛋"按钮，系统会随机抽出一个词语。
            </p>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label className="form-label">词语输入</label>
              <textarea
                className="words-input"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="例如：\n苹果\n香蕉\n橘子\n葡萄"
                rows={8}
              />
              <div className="input-info">
                <span className="word-count">词语数量：{getWordCount()}</span>
                <span className="form-hint">留空将使用默认词语</span>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={allowRepeat}
                  onChange={(e) => setAllowRepeat(e.target.checked)}
                />
                <span className="checkbox-text">允许重复抽取</span>
              </label>
              <span className="checkbox-hint">
                {allowRepeat ? '每次都从全部词语中随机抽取' : '已抽过的词语不会再次出现'}
              </span>
            </div>

            <button className="btn-start" onClick={startGame}>
              🎮 开始游戏
            </button>
          </div>
        </div>
      ) : (
        <div className="game-play-area">
          <div className="game-header">
            <h2 className="game-title">🔮 词语扭蛋机</h2>
            <button className="btn-fullscreen" onClick={toggleFullscreen}>
              {isFullscreen ? '✕ 退出全屏' : '⛶ 全屏上课'}
            </button>
          </div>

          <div className={`gacha-machine ${isDrawing ? 'shaking' : ''}`}>
            <div className="machine-top">
              <div className="top-decoration">
                <span className="star">⭐</span>
                <span className="star">✨</span>
                <span className="star">⭐</span>
              </div>
            </div>

            <div className="ball-container">
              <div className="glass-shine"></div>
              <div className="balls-wrapper">
                {words.slice(0, 12).map((_, index) => (
                  <div
                    key={index}
                    className={`ball ${isDrawing ? 'bouncing' : ''}`}
                    style={{
                      backgroundColor: getRandomColor(index),
                      animationDelay: `${index * 0.08}s`
                    }}
                  >
                    <div className="ball-shine"></div>
                  </div>
                ))}
              </div>
              <div className="ball-opening"></div>
            </div>

            <div className="machine-middle">
              <div className={`word-display-area ${currentWord ? 'has-word' : ''}`}>
                <div className={`word-card ${currentWord ? 'show' : ''}`}>
                  {message ? (
                    <span className="message-text">{message}</span>
                  ) : (
                    <>
                      <span className="word-text">{currentWord}</span>
                      {currentWord && (
                        <button
                          className={`speak-btn ${isSpeaking ? 'speaking' : ''}`}
                          onClick={speakWord}
                          disabled={isSpeaking}
                          title="点击朗读词语"
                        >
                          {isSpeaking ? '🔊 正在朗读...' : '🔊 朗读'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="machine-bottom">
              <button
                className={`gacha-btn ${isDrawing ? 'disabled' : ''}`}
                onClick={drawWord}
                disabled={isDrawing}
              >
                <div className="btn-inner">
                  <span className="btn-icon">🎯</span>
                  <span className="btn-text">扭蛋</span>
                </div>
                <div className="btn-ring"></div>
              </button>

              <div className="bottom-decoration">
                <div className="stripe stripe-1"></div>
                <div className="stripe stripe-2"></div>
                <div className="stripe stripe-3"></div>
              </div>
            </div>
          </div>

          <div className="status-info">
            <div className="status-item">
              <span className="status-label">词语总数</span>
              <span className="status-value">{words.length}</span>
            </div>
            <div className="status-item">
              <span className="status-label">已抽取</span>
              <span className="status-value">{drawnWords.length}</span>
            </div>
            <div className="status-item">
              <span className="status-label">剩余</span>
              <span className="status-value">
                {allowRepeat ? '∞' : remainingWords.length}
              </span>
            </div>
          </div>

          <div className="history-section">
            <h3 className="history-title">📝 已抽出词语</h3>
            {drawnWords.length === 0 ? (
              <p className="no-history">暂无记录</p>
            ) : (
              <ul className="history-list">
                {drawnWords.map((word, index) => (
                  <li key={index} className="history-item">
                    <span className="history-number">{index + 1}.</span>
                    <span className="history-word">{word}</span>
                    <button
                      className="history-speak-btn"
                      onClick={() => {
                        if ('speechSynthesis' in window) {
                          const utterance = new SpeechSynthesisUtterance(word);
                          utterance.lang = 'zh-CN';
                          utterance.rate = 0.8;
                          window.speechSynthesis.speak(utterance);
                        }
                      }}
                      title="朗读此词语"
                    >
                      🔊
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="game-controls">
            <button className="btn-control btn-reset" onClick={resetGame}>
              🔄 重新开始
            </button>
            <button className="btn-control btn-end" onClick={endGame}>
              ⚙ 返回设置
            </button>
          </div>

          <div className="game-tips">
            <p>💡 提示：学生看到词语后，可以读出来、造句、翻译。如果不会读，点击"朗读"按钮听发音！</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WordGachaGame;
