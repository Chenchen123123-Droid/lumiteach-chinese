import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SpotItCardGenerator.css';

const DRAFT_KEY = 'spotit_card_generator_draft';

const DEFAULT_ENTRIES = [
  { id: '1', chinese: '苹果', pinyin: 'píng guǒ', meaning: 'apple' },
  { id: '2', chinese: '香蕉', pinyin: 'xiāng jiāo', meaning: 'banana' },
  { id: '3', chinese: '西瓜', pinyin: 'xī guā', meaning: 'watermelon' },
  { id: '4', chinese: '葡萄', pinyin: 'pú táo', meaning: 'grape' },
  { id: '5', chinese: '草莓', pinyin: 'cǎo méi', meaning: 'strawberry' },
  { id: '6', chinese: '橙子', pinyin: 'chéng zi', meaning: 'orange' },
  { id: '7', chinese: '芒果', pinyin: 'máng guǒ', meaning: 'mango' },
  { id: '8', chinese: '梨', pinyin: 'lí', meaning: 'pear' },
  { id: '9', chinese: '桃子', pinyin: 'táo zi', meaning: 'peach' },
  { id: '10', chinese: '菠萝', pinyin: 'bō luó', meaning: 'pineapple' },
  { id: '11', chinese: '学校', pinyin: 'xué xiào', meaning: 'school' },
  { id: '12', chinese: '老师', pinyin: 'lǎo shī', meaning: 'teacher' },
  { id: '13', chinese: '学生', pinyin: 'xué shēng', meaning: 'student' },
  { id: '14', chinese: '朋友', pinyin: 'péng yǒu', meaning: 'friend' },
  { id: '15', chinese: '中文', pinyin: 'zhōng wén', meaning: 'Chinese' },
  { id: '16', chinese: '学习', pinyin: 'xué xí', meaning: 'study' },
  { id: '17', chinese: '今天', pinyin: 'jīn tiān', meaning: 'today' },
  { id: '18', chinese: '明天', pinyin: 'míng tiān', meaning: 'tomorrow' },
  { id: '19', chinese: '吃饭', pinyin: 'chī fàn', meaning: 'eat' },
  { id: '20', chinese: '喝水', pinyin: 'hē shuǐ', meaning: 'drink water' },
  { id: '21', chinese: '看书', pinyin: 'kàn shū', meaning: 'read' },
  { id: '22', chinese: '写字', pinyin: 'xiě zì', meaning: 'write' },
  { id: '23', chinese: '听音乐', pinyin: 'tīng yīn yuè', meaning: 'listen to music' },
  { id: '24', chinese: '去学校', pinyin: 'qù xué xiào', meaning: 'go to school' },
  { id: '25', chinese: '回家', pinyin: 'huí jiā', meaning: 'go home' },
  { id: '26', chinese: '买东西', pinyin: 'mǎi dōng xi', meaning: 'go shopping' },
  { id: '27', chinese: '天气', pinyin: 'tiān qì', meaning: 'weather' },
  { id: '28', chinese: '漂亮', pinyin: 'piào liang', meaning: 'beautiful' },
  { id: '29', chinese: '高兴', pinyin: 'gāo xìng', meaning: 'happy' },
  { id: '30', chinese: '喜欢', pinyin: 'xǐ huān', meaning: 'like' },
  { id: '31', chinese: '谢谢', pinyin: 'xiè xie', meaning: 'thank you' }
];

const STANDARD_CONFIGS = {
  3: { wordsPerCard: 3, totalWords: 7, totalCards: 7 },
  4: { wordsPerCard: 4, totalWords: 13, totalCards: 13 },
  5: { wordsPerCard: 5, totalWords: 21, totalCards: 21 },
  6: { wordsPerCard: 6, totalWords: 31, totalCards: 31 }
};

const CARD_COLORS = ['#111827', '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];

const translations = {
  zh: {
    title: 'Spot It 卡牌生成器',
    subtitle: '输入词语，生成"找相同词"的课堂语言卡牌',
    mode: '生成模式',
    standardMode: '标准 Spot It 模式',
    freeMode: '自由练习模式',
    standardDesc: '严格保证任意两张卡只有 1 个相同词',
    freeDesc: '自由模式不保证任意两张卡只有一个相同词，适合普通词汇复习',
    deckSize: '卡组规格',
    wordsNeeded: '需要词语数',
    currentWords: '当前词语数',
    missing: '还差',
    enterWords: '输入词语',
    wordFormat: '每行一个词语，推荐格式：中文|拼音|英文',
    useFirstN: '使用前 N 个词',
    randomPickN: '随机抽 N 个词',
    cardContent: '卡片内容',
    showChinese: '显示中文',
    showPinyin: '显示拼音',
    showEnglish: '显示英文',
    printMode: '打印模式',
    colorMode: '彩色版',
    bwMode: '黑白版',
    cardsPerPage: '每页卡片数量',
    showCutLines: '显示裁切线',
    generate: '生成卡片',
    print: '打印',
    downloadPdf: '下载 PDF',
    clearDraft: '清空草稿',
    prev: '上一页',
    next: '下一页',
    noCards: '还没有生成卡片',
    noCardsHint: '请先输入词语并点击生成',
    notEnough: '词语不足，还差',
    tooMany: '输入词语过多',
    page: '第',
    pageOf: '页，共',
    pages: '页',
    freeWordsPerCard: '每张卡词语数',
    freeCardCount: '生成卡片数量',
    allowReuse: '词语是否允许重复使用',
    standardSize: '卡组规格',
    wordsPerCard: '词/卡',
    perPage: '张/页'
  },
  en: {
    title: 'Spot It Card Generator',
    subtitle: 'Enter words and generate classroom language matching cards',
    mode: 'Generation Mode',
    standardMode: 'Standard Spot It Mode',
    freeMode: 'Free Practice Mode',
    standardDesc: 'Guarantees exactly 1 shared word between any two cards',
    freeDesc: 'Free mode does not guarantee exactly one shared word. Suitable for quick vocabulary practice.',
    deckSize: 'Deck Size',
    wordsNeeded: 'Words Needed',
    currentWords: 'Current Words',
    missing: 'Missing',
    enterWords: 'Enter Words',
    wordFormat: 'One word per line. Recommended format: Chinese|Pinyin|English',
    useFirstN: 'Use first N words',
    randomPickN: 'Randomly pick N words',
    cardContent: 'Card Content',
    showChinese: 'Show Chinese',
    showPinyin: 'Show Pinyin',
    showEnglish: 'Show English',
    printMode: 'Print Mode',
    colorMode: 'Color',
    bwMode: 'Black & White',
    cardsPerPage: 'Cards per Page',
    showCutLines: 'Show Cut Lines',
    generate: 'Generate Cards',
    print: 'Print',
    downloadPdf: 'Download PDF',
    clearDraft: 'Clear Draft',
    prev: 'Previous',
    next: 'Next',
    noCards: 'No cards generated yet',
    noCardsHint: 'Enter words and click Generate',
    notEnough: 'Not enough words, missing',
    tooMany: 'Too many words entered',
    page: 'Page',
    pageOf: 'of',
    pages: '',
    freeWordsPerCard: 'Words per Card',
    freeCardCount: 'Number of Cards',
    allowReuse: 'Allow word reuse',
    standardSize: 'Deck Size',
    wordsPerCard: 'words/card',
    perPage: '/page'
  }
};

function SpotItCardGenerator() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('language') || 'zh';
    } catch {
      return 'zh';
    }
  });
  const t = translations[lang] || translations.zh;

  const [mode, setMode] = useState('standard');
  const [standardSize, setStandardSize] = useState(3);
  const [rawInput, setRawInput] = useState('');
  const [entries, setEntries] = useState([]);
  const [overflowStrategy, setOverflowStrategy] = useState('first');
  const [showChinese, setShowChinese] = useState(true);
  const [showPinyin, setShowPinyin] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [printMode, setPrintMode] = useState('color');
  const [cardsPerPage, setCardsPerPage] = useState(6);
  const [showCutLines, setShowCutLines] = useState(true);
  const [freeWordsPerCard, setFreeWordsPerCard] = useState(5);
  const [freeCardCount, setFreeCardCount] = useState(20);
  const [allowReuse, setAllowReuse] = useState(true);
  const [cards, setCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [message, setMessage] = useState('');

  const printRef = useRef(null);

  const totalPages = Math.ceil(cards.length / cardsPerPage);

  useEffect(() => {
    loadDraft();
  }, []);

  useEffect(() => {
    saveDraft();
  }, [mode, standardSize, rawInput, showChinese, showPinyin, showEnglish, printMode, cardsPerPage, showCutLines, freeWordsPerCard, freeCardCount, allowReuse]);

  const parseEntries = useCallback((text) => {
    if (!text.trim()) {
      return DEFAULT_ENTRIES.slice(0, STANDARD_CONFIGS[standardSize].totalWords);
    }

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const result = [];
    const seen = new Set();

    const processLine = (line, idx) => {
      let chinese = '', pinyin = '', meaning = '';

      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        chinese = parts[0] || '';
        pinyin = parts[1] || '';
        meaning = parts[2] || '';
      } else {
        chinese = line;
      }

      return { id: `entry_${idx}`, chinese, pinyin, meaning };
    };

    if (lines.length === 1 && !lines[0].includes('|') && lines[0].includes(' ')) {
      const words = lines[0].split(/\s+/).filter(w => w);
      words.forEach((word, idx) => {
        if (!seen.has(word)) {
          seen.add(word);
          result.push({ id: `entry_${idx}`, chinese: word, pinyin: '', meaning: '' });
        }
      });
    } else {
      lines.forEach((line, idx) => {
        const entry = processLine(line, idx);
        if (entry.chinese && !seen.has(entry.chinese)) {
          seen.add(entry.chinese);
          result.push(entry);
        }
      });
    }

    return result.length > 0 ? result : DEFAULT_ENTRIES.slice(0, STANDARD_CONFIGS[standardSize].totalWords);
  }, [standardSize]);

  const prepareStandardEntries = useCallback((allEntries, requiredCount, strategy) => {
    if (allEntries.length <= requiredCount) {
      return allEntries;
    }

    if (strategy === 'random') {
      const shuffled = [...allEntries].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, requiredCount);
    }

    return allEntries.slice(0, requiredCount);
  }, []);

  const generateSpotItDeck = useCallback((wordEntries, wordsPerCard) => {
    const n = wordsPerCard - 1;
    const totalCards = n * n + n + 1;
    const deck = [];

    for (let i = 0; i < totalCards; i++) {
      deck.push({ id: `card_${i + 1}`, items: [] });
    }

    const indices = [];
    for (let i = 0; i < n * n + n + 1; i++) {
      indices.push(i);
    }

    const getCardIndices = (cardIndex) => {
      if (cardIndex === 0) {
        const indices = [];
        for (let i = 0; i < n; i++) {
          indices.push(i);
        }
        return indices;
      }

      if (cardIndex >= 1 && cardIndex <= n) {
        const indices = [0];
        const offset = (cardIndex - 1) * n;
        for (let i = 0; i < n; i++) {
          indices.push(n + 1 + offset + i);
        }
        return indices;
      }

      const baseIndex = n + 1 + n * n;
      const cardOffset = cardIndex - n - 1;
      const line = Math.floor(cardOffset / n);
      const col = cardOffset % n;
      const indices = [line + 1];

      for (let i = 0; i < n; i++) {
        indices.push(baseIndex + i * n + col);
      }

      return indices;
    };

    const entriesList = wordEntries.slice(0, totalCards);

    for (let i = 0; i < totalCards; i++) {
      const wordIndices = getCardIndices(i);
      deck[i].items = wordIndices.map(idx => entriesList[idx]).filter(e => e);
    }

    return deck;
  }, []);

  const generateFreeDeck = useCallback((allEntries, wordsPerCard, cardCount) => {
    const deck = [];
    const entriesList = [...allEntries];
    const totalEntries = entriesList.length;
    const canReuse = allowReuse || totalEntries >= wordsPerCard * cardCount;

    for (let i = 0; i < cardCount; i++) {
      const cardItems = [];

      for (let j = 0; j < wordsPerCard; j++) {
        let entry;
        if (canReuse && entriesList.length > 0) {
          const idx = Math.floor(Math.random() * entriesList.length);
          entry = entriesList[idx];
          if (!allowReuse) {
            entriesList.splice(idx, 1);
          }
        } else if (entriesList.length > 0) {
          const idx = i * wordsPerCard + j;
          entry = entriesList[idx % totalEntries];
        } else {
          entry = { id: `entry_${j}`, chinese: '', pinyin: '', meaning: '' };
        }
        cardItems.push(entry);
      }

      deck.push({ id: `card_${i + 1}`, items: cardItems });
    }

    return deck;
  }, [allowReuse]);

  const handleGenerate = useCallback(() => {
    const parsedEntries = parseEntries(rawInput);

    if (mode === 'standard') {
      const config = STANDARD_CONFIGS[standardSize];
      const requiredCount = config.totalWords;

      if (parsedEntries.length < requiredCount) {
        setMessage(`${t.notEnough} ${requiredCount - parsedEntries.length} ${lang === 'zh' ? '个词' : 'words'}`);
        return;
      }

      if (parsedEntries.length > requiredCount) {
        setMessage(`${t.tooMany} ${parsedEntries.length} ${lang === 'zh' ? '个，本模式只需要' : 'words. This mode only needs'} ${requiredCount} ${lang === 'zh' ? '个词' : 'words'}`);

        const prepared = prepareStandardEntries(parsedEntries, requiredCount, overflowStrategy);
        const newCards = generateSpotItDeck(prepared, config.wordsPerCard);
        setCards(newCards);
        setCurrentPage(0);
        setMessage('');
        return;
      }

      const newCards = generateSpotItDeck(parsedEntries, config.wordsPerCard);
      setCards(newCards);
      setCurrentPage(0);
      setMessage('');
    } else {
      const newCards = generateFreeDeck(parsedEntries, freeWordsPerCard, freeCardCount);
      setCards(newCards);
      setCurrentPage(0);
      setMessage('');
    }
  }, [mode, standardSize, rawInput, parseEntries, generateSpotItDeck, generateFreeDeck, prepareStandardEntries, freeWordsPerCard, freeCardCount, overflowStrategy, t, lang]);

  const saveDraft = useCallback(() => {
    try {
      const data = {
        mode, standardSize, rawInput, showChinese, showPinyin, showEnglish,
        printMode, cardsPerPage, showCutLines, freeWordsPerCard, freeCardCount, allowReuse
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  }, [mode, standardSize, rawInput, showChinese, showPinyin, showEnglish, printMode, cardsPerPage, showCutLines, freeWordsPerCard, freeCardCount, allowReuse]);

  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const data = JSON.parse(draft);
        if (data.mode) setMode(data.mode);
        if (data.standardSize) setStandardSize(data.standardSize);
        if (data.rawInput) setRawInput(data.rawInput);
        if (data.showChinese !== undefined) setShowChinese(data.showChinese);
        if (data.showPinyin !== undefined) setShowPinyin(data.showPinyin);
        if (data.showEnglish !== undefined) setShowEnglish(data.showEnglish);
        if (data.printMode) setPrintMode(data.printMode);
        if (data.cardsPerPage) setCardsPerPage(data.cardsPerPage);
        if (data.showCutLines !== undefined) setShowCutLines(data.showCutLines);
        if (data.freeWordsPerCard) setFreeWordsPerCard(data.freeWordsPerCard);
        if (data.freeCardCount) setFreeCardCount(data.freeCardCount);
        if (data.allowReuse !== undefined) setAllowReuse(data.allowReuse);
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setRawInput('');
      setCards([]);
      setCurrentPage(0);
      setMessage('');
      setMode('standard');
      setStandardSize(3);
      setShowChinese(true);
      setShowPinyin(false);
      setShowEnglish(false);
      setPrintMode('color');
      setCardsPerPage(6);
      setShowCutLines(true);
      setFreeWordsPerCard(5);
      setFreeCardCount(20);
      setAllowReuse(true);
    } catch (e) {
      console.error('Error clearing draft:', e);
    }
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (cards.length === 0) return;

    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const cardSize = 60;
    const gap = 8;

    const cols = cardsPerPage === 6 ? 2 : 2;
    const rows = cardsPerPage === 6 ? 3 : 4;

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      if (pageIdx > 0) {
        pdf.addPage();
      }

      const startIdx = pageIdx * cardsPerPage;
      const pageCards = cards.slice(startIdx, startIdx + cardsPerPage);

      for (let i = 0; i < pageCards.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = margin + col * (cardSize + gap) + (cardsPerPage === 8 && col === 1 ? 10 : 0);
        const y = margin + row * (cardSize + gap) + 10;

        const cardElement = document.querySelector(`[data-card-index="${startIdx + i}"]`);
        if (cardElement) {
          try {
            const canvas = await html2canvas(cardElement, {
              scale: 2,
              backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', x, y, cardSize, cardSize);
          } catch (e) {
            console.error('Error rendering card:', e);
          }
        }
      }

      if (pageIdx < totalPages - 1) {
        pdf.addPage();
      }
    }

    pdf.save('spot-it-language-cards.pdf');
  }, [cards, cardsPerPage, totalPages]);

  const getCurrentPageCards = useCallback(() => {
    const start = currentPage * cardsPerPage;
    return cards.slice(start, start + cardsPerPage);
  }, [cards, currentPage, cardsPerPage]);

  const renderWord = (entry, index) => {
    const textPieces = [];

    if (showChinese && entry.chinese) {
      textPieces.push({ text: entry.chinese, type: 'chinese' });
    }
    if (showPinyin && entry.pinyin) {
      textPieces.push({ text: entry.pinyin, type: 'pinyin' });
    }
    if (showEnglish && entry.meaning) {
      textPieces.push({ text: entry.meaning, type: 'english' });
    }

    if (textPieces.length === 0) {
      return null;
    }

    const maxLen = Math.max(...textPieces.map(p => p.text.length));
    let fontSize = 16;
    if (maxLen > 15) fontSize = 10;
    else if (maxLen > 10) fontSize = 12;
    else if (maxLen > 6) fontSize = 14;

    const color = printMode === 'color' ? CARD_COLORS[index % CARD_COLORS.length] : '#000000';

    return (
      <div className="card-word" key={index}>
        <span className="word-text" style={{ fontSize: `${fontSize}px`, color }}>
          {textPieces.map((p, i) => (
            <div key={i} className={`word-piece ${p.type}`} style={{ fontSize: p.type === 'chinese' ? `${fontSize}px` : `${fontSize - 2}px` }}>
              {p.text}
            </div>
          ))}
        </span>
      </div>
    );
  };

  const config = STANDARD_CONFIGS[standardSize];
  const currentEntries = parseEntries(rawInput);

  return (
    <div className="spotit-generator">
      <div className="spotit-settings-panel">
        <div className="settings-header">
          <h2>{t.title}</h2>
          <p className="subtitle">{t.subtitle}</p>
        </div>

        <div className="settings-section">
          <h3>{t.mode}</h3>
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'standard' ? 'active' : ''}`}
              onClick={() => setMode('standard')}
            >
              <span className="mode-name">{t.standardMode}</span>
              <span className="mode-desc">{t.standardDesc}</span>
            </button>
            <button
              className={`mode-btn ${mode === 'free' ? 'active' : ''}`}
              onClick={() => setMode('free')}
            >
              <span className="mode-name">{t.freeMode}</span>
              <span className="mode-desc">{t.freeDesc}</span>
            </button>
          </div>
        </div>

        {mode === 'standard' ? (
          <div className="settings-section">
            <h3>{t.standardSize}</h3>
            <div className="size-grid">
              {[3, 4, 5, 6].map(size => (
                <button
                  key={size}
                  className={`size-btn ${standardSize === size ? 'active' : ''}`}
                  onClick={() => setStandardSize(size)}
                >
                  {size} {t.wordsPerCard}, {STANDARD_CONFIGS[size].totalWords} {lang === 'zh' ? '词' : 'words'}, {STANDARD_CONFIGS[size].totalCards} {lang === 'zh' ? '张卡' : 'cards'}
                </button>
              ))}
            </div>
            <div className="word-count-info">
              <span>{t.wordsNeeded}: {config.totalWords}</span>
              <span>{t.currentWords}: {currentEntries.length}</span>
              {currentEntries.length < config.totalWords ? (
                <span className="missing">{t.missing}: {config.totalWords - currentEntries.length}</span>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="settings-section">
              <h3>{t.freeWordsPerCard}</h3>
              <input
                type="number"
                className="number-input"
                min="3"
                max="8"
                value={freeWordsPerCard}
                onChange={e => setFreeWordsPerCard(parseInt(e.target.value) || 5)}
              />
            </div>
            <div className="settings-section">
              <h3>{t.freeCardCount}</h3>
              <input
                type="number"
                className="number-input"
                min="4"
                max="60"
                value={freeCardCount}
                onChange={e => setFreeCardCount(parseInt(e.target.value) || 20)}
              />
            </div>
            <div className="settings-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={allowReuse}
                  onChange={e => setAllowReuse(e.target.checked)}
                />
                {t.allowReuse}
              </label>
            </div>
          </>
        )}

        <div className="settings-section">
          <h3>{t.enterWords}</h3>
          <textarea
            className="word-input"
            placeholder={t.wordFormat}
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
          />
        </div>

        {mode === 'standard' && currentEntries.length > config.totalWords && (
          <div className="settings-section">
            <h3>{t.tooMany}</h3>
            <div className="overflow-toggle">
              <button
                className={`overflow-btn ${overflowStrategy === 'first' ? 'active' : ''}`}
                onClick={() => setOverflowStrategy('first')}
              >
                {t.useFirstN}
              </button>
              <button
                className={`overflow-btn ${overflowStrategy === 'random' ? 'active' : ''}`}
                onClick={() => setOverflowStrategy('random')}
              >
                {t.randomPickN}
              </button>
            </div>
          </div>
        )}

        <div className="settings-section">
          <h3>{t.cardContent}</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showChinese}
                onChange={e => {
                  setShowChinese(e.target.checked);
                  if (!e.target.checked && !showPinyin && !showEnglish) {
                    setShowChinese(true);
                  }
                }}
              />
              {t.showChinese}
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showPinyin}
                onChange={e => {
                  setShowPinyin(e.target.checked);
                  if (!e.target.checked && !showChinese && !showEnglish) {
                    setShowChinese(true);
                  }
                }}
              />
              {t.showPinyin}
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showEnglish}
                onChange={e => {
                  setShowEnglish(e.target.checked);
                  if (!e.target.checked && !showChinese && !showPinyin) {
                    setShowChinese(true);
                  }
                }}
              />
              {t.showEnglish}
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>{t.printMode}</h3>
          <div className="print-mode-toggle">
            <button
              className={`print-mode-btn ${printMode === 'color' ? 'active' : ''}`}
              onClick={() => setPrintMode('color')}
            >
              {t.colorMode}
            </button>
            <button
              className={`print-mode-btn ${printMode === 'bw' ? 'active' : ''}`}
              onClick={() => setPrintMode('bw')}
            >
              {t.bwMode}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>{t.cardsPerPage}</h3>
          <div className="cards-per-page-toggle">
            <button
              className={`per-page-btn ${cardsPerPage === 6 ? 'active' : ''}`}
              onClick={() => setCardsPerPage(6)}
            >
              6 {t.perPage}
            </button>
            <button
              className={`per-page-btn ${cardsPerPage === 8 ? 'active' : ''}`}
              onClick={() => setCardsPerPage(8)}
            >
              8 {t.perPage}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showCutLines}
              onChange={e => setShowCutLines(e.target.checked)}
            />
            {t.showCutLines}
          </label>
        </div>

        {message && <div className="message-box">{message}</div>}

        <div className="settings-actions">
          <button className="btn-generate" onClick={handleGenerate}>
            {t.generate}
          </button>
          <button className="btn-print" onClick={handlePrint} disabled={cards.length === 0}>
            {t.print}
          </button>
          <button className="btn-download" onClick={handleDownloadPdf} disabled={cards.length === 0}>
            {t.downloadPdf}
          </button>
          <button className="btn-clear" onClick={clearDraft}>
            {t.clearDraft}
          </button>
        </div>
      </div>

      <div className="spotit-preview-panel">
        <div className="preview-header">
          <h2>{lang === 'zh' ? '卡片预览' : 'Card Preview'}</h2>
          {cards.length > 0 && (
            <div className="pagination">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
                {t.prev}
              </button>
              <span className="page-info">
                {t.page} {currentPage + 1} {t.pageOf} {totalPages} {t.pages}
              </span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>
                {t.next}
              </button>
            </div>
          )}
        </div>

        <div className="preview-content" ref={printRef}>
          {cards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎴</div>
              <h3>{t.noCards}</h3>
              <p>{t.noCardsHint}</p>
            </div>
          ) : (
            <div className="spotit-print-area">
              {getCurrentPageCards().map((card, idx) => (
                <div
                  key={card.id}
                  className={`spotit-card ${showCutLines ? 'show-cut-lines' : ''} ${printMode}`}
                  data-card-index={currentPage * cardsPerPage + idx}
                >
                  <div className="card-inner">
                    {card.items.map((item, i) => renderWord(item, i))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpotItCardGenerator;