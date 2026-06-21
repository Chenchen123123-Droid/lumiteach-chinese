import React, { useState, useEffect, useCallback } from 'react';
import './ChineseUnoCardGenerator.css';

// localStorage key
const DRAFT_KEY = 'chinese_uno_card_generator_draft';

// UNO colors
const UNO_COLORS = {
  red: '#ef4444',
  yellow: '#facc15',
  green: '#22c55e',
  blue: '#3b82f6'
};

const COLOR_NAMES = {
  red: '红色',
  yellow: '黄色',
  green: '绿色',
  blue: '蓝色',
  wild: '万能'
};

const COLOR_NAMES_EN = {
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
  blue: 'Blue',
  wild: 'Wild'
};

// Built-in word banks
const WORD_BANKS = {
  food: {
    nameZh: '食物',
    nameEn: 'Food',
    words: [
      '苹果|píng guǒ|apple',
      '香蕉|xiāng jiāo|banana',
      '米饭|mǐ fàn|rice',
      '面条|miàn tiáo|noodles',
      '茶|chá|tea',
      '水|shuǐ|water',
      '饺子|jiǎo zi|dumplings',
      '包子|bāo zi|steamed bun',
      '面条|miàn tiáo|noodles',
      '蛋糕|dàn gāo|cake'
    ]
  },
  animals: {
    nameZh: '动物',
    nameEn: 'Animals',
    words: [
      '猫|māo|cat',
      '狗|gǒu|dog',
      '鸟|niǎo|bird',
      '鱼|yú|fish',
      '老虎|lǎo hǔ|tiger',
      '熊猫|xióng māo|panda',
      '兔子|tù zi|rabbit',
      '猴子|hóu zi|monkey',
      '大象|dà xiàng|elephant',
      '蛇|shé|snake'
    ]
  },
  school: {
    nameZh: '学校',
    nameEn: 'School',
    words: [
      '老师|lǎo shī|teacher',
      '学生|xué shēng|student',
      '教室|jiào shì|classroom',
      '书|shū|book',
      '笔|bǐ|pen',
      '考试|kǎo shì|test',
      '作业|zuò yè|homework',
      '图书馆|tú shū guǎn|library',
      '操场|cāo chǎng|playground',
      '校长|xiào zhǎng|principal'
    ]
  },
  family: {
    nameZh: '家庭',
    nameEn: 'Family',
    words: [
      '爸爸|bà ba|dad',
      '妈妈|mā ma|mom',
      '哥哥|gē ge|older brother',
      '姐姐|jiě jie|older sister',
      '弟弟|dì di|younger brother',
      '妹妹|mèi mei|younger sister',
      '爷爷|yé ye|grandpa',
      '奶奶|nǎi nai|grandma',
      '家|jiā|home',
      '爱ài|love'
    ]
  },
  daily: {
    nameZh: '日常生活',
    nameEn: 'Daily Life',
    words: [
      '吃饭|chī fàn|eat',
      '喝水|hē shuǐ|drink water',
      '睡觉|shuì jiào|sleep',
      '看书|kàn shū|read',
      '买东西|mǎi dōng xi|go shopping',
      '回家|huí jiā|go home',
      '上学|shàng xué|go to school',
      '工作|gōng zuò|work',
      '运动|yùn dòng|exercise',
      '休息|xiū xi|rest'
    ]
  },
  travel: {
    nameZh: '旅行',
    nameEn: 'Travel',
    words: [
      '飞机|fēi jī|airplane',
      '火车|huǒ chē|train',
      '出租车|chū zū chē|taxi',
      '酒店|jiǔ diàn|hotel',
      '机场|jī chǎng|airport',
      '护照|hù zhào|passport',
      '票|piào|ticket',
      '地图|dì tú|map',
      '旅游|lǚ yóu|travel',
      '行李|lǚ xíng|luggage'
    ]
  }
};

// Default words
const DEFAULT_WORDS = [
  '苹果|píng guǒ|apple',
  '香蕉|xiāng jiāo|banana',
  '学校|xué xiào|school',
  '老师|lǎo shī|teacher',
  '学生|xué shēng|student',
  '朋友|péng yǒu|friend',
  '中国|zhōng guó|China',
  '中文|zhōng wén|Chinese',
  '今天|jīn tiān|today',
  '明天|míng tiān|tomorrow',
  '吃饭|chī fàn|eat',
  '喝水|hē shuǐ|drink water',
  '看书|kàn shū|read',
  '写字|xiě zì|write',
  '听音乐|tīng yīn yuè|listen to music',
  '去学校|qù xué xiào|go to school'
];

// Translations
const translations = {
  zh: {
    title: '中文 UNO 卡牌生成器',
    subtitle: '输入中文词表，一键生成可打印的课堂 UNO 卡牌',
    quickMode: '快速模式',
    fullMode: '完整模式',
    quickWords: '40 个词',
    fullWords: '80 个词',
    quickDesc: '适合短时间课堂活动',
    fullDesc: '适合完整卡牌游戏',
    fromText: '从文本生成卡组',
    inputPlaceholder: '每行输入一个词语，推荐格式：\n汉字|拼音|英文意思\n\n示例：\n苹果|píng guǒ|apple\n香蕉|xiāng jiāo|banana',
    generateDeck: '生成卡组',
    cardContent: '卡牌内容',
    showChinese: '显示中文',
    showPinyin: '显示拼音',
    showMeaning: '显示英文',
    showNumber: '显示数字',
    showColorName: '显示颜色名称',
    specialCards: '添加功能牌',
    skip: '跳过牌',
    reverse: '反转牌',
    drawTwo: '抽两张',
    wild: '万能牌',
    drawFour: '抽四张',
    totalCards: '总卡牌',
    printDeck: '打印卡组',
    exportPDF: '导出 PDF',
    clearDeck: '清空卡组',
    clearDraft: '清空草稿',
    deckEmpty: '卡组为空',
    emptyHint: '请在左侧输入词语并生成卡组',
    fromWordBank: '从内置词库生成',
    topicOptional: '主题',
    level: '等级',
    wordBank: '内置词库',
    pageInfo: '第 {n} / {total} 页'
  },
  en: {
    title: 'Chinese UNO Card Generator',
    subtitle: 'Enter a Chinese word list and generate printable classroom UNO cards',
    quickMode: 'Quick Mode',
    fullMode: 'Full Game',
    quickWords: '40 Words',
    fullWords: '80 Words',
    quickDesc: 'Best for short activities',
    fullDesc: 'Best for full card game',
    fromText: 'Generate from Text',
    inputPlaceholder: 'Enter one word per line:\n汉字|拼音|meaning\n\nExample:\n苹果|píng guǒ|apple\n香蕉|xiāng jiāo|banana',
    generateDeck: 'Build Deck',
    cardContent: 'Card Content',
    showChinese: 'Show Chinese',
    showPinyin: 'Show Pinyin',
    showMeaning: 'Show English',
    showNumber: 'Show Numbers',
    showColorName: 'Show Color Names',
    specialCards: 'Special Cards',
    skip: 'Skip',
    reverse: 'Reverse',
    drawTwo: '+2 Draw',
    wild: 'Wild',
    drawFour: '+4 Wild',
    totalCards: 'Total Cards',
    printDeck: 'Print Deck',
    exportPDF: 'Export PDF',
    clearDeck: 'Clear Deck',
    clearDraft: 'Clear Draft',
    deckEmpty: 'Deck is Empty',
    emptyHint: 'Enter words on the left and build your deck',
    fromWordBank: 'Generate from Word Bank',
    topicOptional: 'Topic',
    level: 'Level',
    wordBank: 'Word Bank',
    pageInfo: 'Page {n} / {total}'
  }
};

function ChineseUnoCardGenerator() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('language') || 'zh';
    } catch {
      return 'zh';
    }
  });
  const t = translations[lang] || translations.zh;

  // State
  const [mode, setMode] = useState('quick');
  const [rawText, setRawText] = useState('');
  const [cards, setCards] = useState([]);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showNumber, setShowNumber] = useState(true);
  const [showColorName, setShowColorName] = useState(false);
  const [includeSkip, setIncludeSkip] = useState(true);
  const [includeReverse, setIncludeReverse] = useState(true);
  const [includeDrawTwo, setIncludeDrawTwo] = useState(true);
  const [includeWild, setIncludeWild] = useState(true);
  const [includeDrawFour, setIncludeDrawFour] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('');

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const data = JSON.parse(draft);
        if (data.rawText) setRawText(data.rawText);
        if (data.mode) setMode(data.mode);
        if (data.showPinyin !== undefined) setShowPinyin(data.showPinyin);
        if (data.showMeaning !== undefined) setShowMeaning(data.showMeaning);
        if (data.showNumber !== undefined) setShowNumber(data.showNumber);
        if (data.showColorName !== undefined) setShowColorName(data.showColorName);
        if (data.includeSkip !== undefined) setIncludeSkip(data.includeSkip);
        if (data.includeReverse !== undefined) setIncludeReverse(data.includeReverse);
        if (data.includeDrawTwo !== undefined) setIncludeDrawTwo(data.includeDrawTwo);
        if (data.includeWild !== undefined) setIncludeWild(data.includeWild);
        if (data.includeDrawFour !== undefined) setIncludeDrawFour(data.includeDrawFour);
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    try {
      const data = {
        rawText,
        mode,
        showPinyin,
        showMeaning,
        showNumber,
        showColorName,
        includeSkip,
        includeReverse,
        includeDrawTwo,
        includeWild,
        includeDrawFour
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  }, [rawText, mode, showPinyin, showMeaning, showNumber, showColorName, includeSkip, includeReverse, includeDrawTwo, includeWild, includeDrawFour]);

  // Parse word list
  const parseWordList = useCallback((text) => {
    if (!text.trim()) return [];

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const entries = [];

    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      entries.push({
        chinese: parts[0] || '',
        pinyin: parts[1] || '',
        meaning: parts[2] || ''
      });
    });

    return entries;
  }, []);

  // Assign color by index
  const assignColor = (index) => {
    const colors = ['red', 'yellow', 'green', 'blue'];
    return colors[index % 4];
  };

  // Assign number by index
  const assignNumber = (index) => {
    return index % 10;
  };

  // Build word cards
  const buildWordCards = useCallback((entries, targetCount) => {
    if (!entries.length) return [];

    const cards = [];
    for (let i = 0; i < targetCount; i++) {
      const entry = entries[i % entries.length];
      cards.push({
        id: `word_${i}`,
        type: 'word',
        color: assignColor(i),
        number: assignNumber(i),
        chinese: entry.chinese,
        pinyin: entry.pinyin,
        meaning: entry.meaning
      });
    }
    return cards;
  }, []);

  // Build special cards
  const buildSpecialCards = useCallback(() => {
    const specials = [];
    let idx = 0;
    const colorList = ['red', 'yellow', 'green', 'blue'];

    const addCard = (type, labelZh, labelEn, symbol, color = null) => {
      specials.push({
        id: `special_${type}_${idx}`,
        type,
        color: color || 'wild',
        labelZh,
        labelEn,
        symbol,
        chinese: labelZh,
        pinyin: '',
        meaning: labelEn
      });
      idx++;
    };

    // Skip cards - 4 of each color
    if (includeSkip) {
      for (let i = 0; i < 4; i++) {
        addCard('skip', '跳过', 'Skip', '⏭', colorList[i]);
      }
    }

    // Reverse cards - 4 of each color
    if (includeReverse) {
      for (let i = 0; i < 4; i++) {
        addCard('reverse', '反转', 'Reverse', '🔄', colorList[i]);
      }
    }

    // +2 cards - 4 of each color
    if (includeDrawTwo) {
      for (let i = 0; i < 4; i++) {
        addCard('draw2', '+2', '+2', '+2', colorList[i]);
      }
    }

    // Wild cards
    if (includeWild) {
      for (let i = 0; i < 4; i++) {
        addCard('wild', '万能', 'Wild', '🌈', 'wild');
      }
    }

    // +4 Wild cards
    if (includeDrawFour) {
      for (let i = 0; i < 4; i++) {
        addCard('wild4', '+4', '+4', '+4', 'wild');
      }
    }

    return specials;
  }, [includeSkip, includeReverse, includeDrawTwo, includeWild, includeDrawFour]);

  // Build deck
  const handleBuildDeck = useCallback(() => {
    let entries = parseWordList(rawText);

    // Use default words if no input
    if (!entries.length) {
      entries = parseWordList(DEFAULT_WORDS.join('\n'));
    }

    const targetCount = mode === 'quick' ? 40 : 80;
    const wordCards = buildWordCards(entries, targetCount);
    const specialCards = buildSpecialCards();

    // Shuffle special cards into the deck
    const allCards = [...wordCards];
    specialCards.forEach(card => {
      // Insert special cards at random positions (except very beginning)
      const pos = Math.floor(Math.random() * (allCards.length - 4)) + 4;
      allCards.splice(pos, 0, card);
    });

    setCards(allCards);
  }, [rawText, mode, parseWordList, buildWordCards, buildSpecialCards]);

  // Load from word bank
  const handleLoadWordBank = useCallback((topic) => {
    const bank = WORD_BANKS[topic];
    if (!bank) return;

    const words = bank.words.join('\n');
    setRawText(words);
  }, []);

  // Paginate cards
  const paginateCards = useCallback(() => {
    const pageSize = 9;
    const pages = [];
    for (let i = 0; i < cards.length; i += pageSize) {
      pages.push(cards.slice(i, i + pageSize));
    }
    return pages.length ? pages : [[]];
  }, [cards]);

  // Clear deck
  const handleClearDeck = useCallback(() => {
    setCards([]);
  }, []);

  // Clear draft
  const handleClearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setRawText('');
      setCards([]);
      setMode('quick');
      setShowPinyin(true);
      setShowMeaning(true);
      setShowNumber(true);
      setShowColorName(false);
      setIncludeSkip(true);
      setIncludeReverse(true);
      setIncludeDrawTwo(true);
      setIncludeWild(true);
      setIncludeDrawFour(true);
    } catch (e) {
      console.error('Error clearing draft:', e);
    }
  }, []);

  // Print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Export PDF
  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const printArea = document.querySelector('.uno-print-area');
      if (!printArea) return;

      const canvas = await html2canvas(printArea, {
        scale: 2,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('chinese-uno-deck.pdf');
    } catch (e) {
      console.error('PDF export error:', e);
      alert(lang === 'zh' ? 'PDF 导出失败' : 'PDF export failed');
    }
  }, [lang]);

  // Get card background color
  const getCardBgColor = (color) => {
    return UNO_COLORS[color] || '#111827';
  };

  // Render card
  const renderCard = (card, index) => {
    const isSpecial = card.type !== 'word';
    const bgColor = getCardBgColor(card.color);
    const colorName = lang === 'zh'
      ? COLOR_NAMES[card.color] || ''
      : COLOR_NAMES_EN[card.color] || '';

    return (
      <div
        key={card.id}
        className={`uno-card ${card.color} ${isSpecial ? 'special' : ''}`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="card-corner top-left">
          {isSpecial ? (
            <span className="special-symbol">{card.symbol}</span>
          ) : showNumber ? (
            <span className="card-number">{card.number}</span>
          ) : null}
          {showColorName && <span className="color-name">{colorName}</span>}
        </div>

        <div className="card-content">
          <div className="card-main">
            {isSpecial ? (
              <>
                <span className="special-symbol large">{card.symbol}</span>
                <span className="special-label">{lang === 'zh' ? card.labelZh : card.labelEn}</span>
              </>
            ) : (
              <>
                <span className="card-chinese">{card.chinese}</span>
                {showPinyin && card.pinyin && (
                  <span className="card-pinyin">{card.pinyin}</span>
                )}
                {showMeaning && card.meaning && (
                  <span className="card-meaning">{card.meaning}</span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="card-corner bottom-right">
          {isSpecial ? (
            <span className="special-symbol">{card.symbol}</span>
          ) : showNumber ? (
            <span className="card-number">{card.number}</span>
          ) : null}
        </div>

        {card.color === 'wild' && <div className="wild-gradient"></div>}
      </div>
    );
  };

  // Render pages
  const renderPages = () => {
    const pages = paginateCards();

    if (!cards.length) {
      return (
        <div className="uno-empty">
          <div className="empty-icon">🃏</div>
          <h3>{t.deckEmpty}</h3>
          <p>{t.emptyHint}</p>
        </div>
      );
    }

    return (
      <div className="uno-print-area">
        {pages.map((pageCards, pageIdx) => (
          <div key={pageIdx} className="uno-page">
            <div className="uno-grid">
              {pageCards.map((card, idx) => renderCard(card, idx))}
              {pageCards.length < 9 && Array.from({ length: 9 - pageCards.length }).map((_, i) => (
                <div key={`empty-${i}`} className="uno-card empty"></div>
              ))}
            </div>
            <div className="page-number">
              {t.pageInfo.replace('{n}', pageIdx + 1).replace('{total}', pages.length)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chinese-uno-generator">
      {/* Left Settings Panel */}
      <div className="uno-settings-panel">
        <div className="settings-header">
          <h2>{t.title}</h2>
          <p className="subtitle">{t.subtitle}</p>
        </div>

        {/* Mode Selection */}
        <div className="settings-section">
          <h3>{mode === 'quick' ? t.quickMode : t.fullMode}</h3>
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'quick' ? 'active' : ''}`}
              onClick={() => setMode('quick')}
            >
              <span className="mode-name">{t.quickMode}</span>
              <span className="mode-desc">{t.quickWords}</span>
            </button>
            <button
              className={`mode-btn ${mode === 'full' ? 'active' : ''}`}
              onClick={() => setMode('full')}
            >
              <span className="mode-name">{t.fullMode}</span>
              <span className="mode-desc">{t.fullWords}</span>
            </button>
          </div>
        </div>

        {/* Word Bank */}
        <div className="settings-section">
          <h3>{t.wordBank}</h3>
          <div className="topic-select">
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                if (e.target.value) {
                  handleLoadWordBank(e.target.value);
                }
              }}
            >
              <option value="">{t.topicOptional}</option>
              {Object.entries(WORD_BANKS).map(([key, bank]) => (
                <option key={key} value={key}>
                  {lang === 'zh' ? bank.nameZh : bank.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Input */}
        <div className="settings-section">
          <h3>{t.fromText}</h3>
          <textarea
            className="uno-text-input"
            placeholder={t.inputPlaceholder}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <button className="btn-build" onClick={handleBuildDeck}>
            {t.generateDeck}
          </button>
        </div>

        {/* Card Content Settings */}
        <div className="settings-section">
          <h3>{t.cardContent}</h3>
          <div className="settings-list">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={showNumber}
                onChange={(e) => setShowNumber(e.target.checked)}
              />
              {t.showNumber}
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={showPinyin}
                onChange={(e) => setShowPinyin(e.target.checked)}
              />
              {t.showPinyin}
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={showMeaning}
                onChange={(e) => setShowMeaning(e.target.checked)}
              />
              {t.showMeaning}
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={showColorName}
                onChange={(e) => setShowColorName(e.target.checked)}
              />
              {t.showColorName}
            </label>
          </div>
        </div>

        {/* Special Cards */}
        <div className="settings-section">
          <h3>{t.specialCards}</h3>
          <div className="settings-list">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={includeSkip}
                onChange={(e) => setIncludeSkip(e.target.checked)}
              />
              {t.skip}
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={includeReverse}
                onChange={(e) => setIncludeReverse(e.target.checked)}
              />
              {t.reverse}
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={includeDrawTwo}
                onChange={(e) => setIncludeDrawTwo(e.target.checked)}
              />
              {t.drawTwo}
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={includeWild}
                onChange={(e) => setIncludeWild(e.target.checked)}
              />
              {t.wild}
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={includeDrawFour}
                onChange={(e) => setIncludeDrawFour(e.target.checked)}
              />
              {t.drawFour}
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-section actions">
          <div className="card-count">
            <span className="count-label">{t.totalCards}:</span>
            <span className="count-value">{cards.length}</span>
          </div>
          <button className="btn-print" onClick={handlePrint} disabled={!cards.length}>
            🖨️ {t.printDeck}
          </button>
          <button className="btn-pdf" onClick={handleExportPDF} disabled={!cards.length}>
            📄 {t.exportPDF}
          </button>
          <button className="btn-clear" onClick={handleClearDeck} disabled={!cards.length}>
            🗑️ {t.clearDeck}
          </button>
          <button className="btn-draft" onClick={handleClearDraft}>
            ✕ {t.clearDraft}
          </button>
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="uno-preview-panel">
        <div className="preview-header">
          <h2>{t.title}</h2>
        </div>
        <div className="preview-content">
          {renderPages()}
        </div>
      </div>
    </div>
  );
}

export default ChineseUnoCardGenerator;