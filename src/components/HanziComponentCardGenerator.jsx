import React, { useState, useEffect, useCallback } from 'react';
import { hanziComponents } from '../data/hanziComponents';
import { hanziPinyin } from '../data/hanziPinyin';
import radicalWordBank from '../data/radicalWordBank';
import './HanziComponentCardGenerator.css';

// localStorage key
const DRAFT_KEY = 'hanzi_component_card_draft';

// 默认颜色方案
const colorSchemes = {
  auto: {
    name: '自动彩色',
    colors: {
      default: '#4CAF50',
      defaultAlt: '#FF9800',
      氵: '#2196F3',
      火: '#F44336',
      木: '#4CAF50',
      金: '#FF9800',
      土: '#795548',
      日: '#FF5722',
      月: '#9C27B0',
      目: '#E91E63',
      心: '#E91E63',
      口: '#2196F3',
      女: '#E91E63',
      亻: '#3F51B5',
      扌: '#3F51B5',
      忄: '#E91E63',
      艹: '#4CAF50',
      讠: '#2196F3',
      饣: '#FF9800',
      钅: '#FF9800',
      马: '#795548',
      鸟: '#607D8B',
      鱼: '#607D8B',
      羊: '#FFFFFF',
      '冖': '#9E9E9E',
      '宀': '#9E9E9E',
      '囗': '#9E9E9E',
      '⺁': '#9E9E9E'
    }
  },
  black: {
    name: '统一黑色',
    colors: { default: '#333333', defaultAlt: '#333333' }
  },
  soft: {
    name: '柔和色',
    colors: {
      default: '#81C784',
      defaultAlt: '#64B5F6',
      '氵': '#64B5F6',
      火: '#FF8A65',
      木: '#81C784',
      金: '#FFD54F',
      土: '#BCAAA4',
      日: '#FFB74D',
      月: '#BA68C8',
      目: '#F06292',
      心: '#F06292',
      口: '#4FC3F7',
      女: '#F48FB1',
      亻: '#7986CB',
      扌: '#7986CB',
      忄: '#F48FB1',
      艹: '#81C784',
      讠: '#4FC3F7',
      饣: '#FFD54F',
      钅: '#FFD54F',
      马: '#A1887F',
      鸟: '#90A4AE',
      鱼: '#90A4AE'
    }
  },
  highContrast: {
    name: '高对比色',
    colors: {
      default: '#FFFF00',
      defaultAlt: '#00FFFF',
      '氵': '#00FFFF',
      火: '#FF0000',
      木: '#00FF00',
      金: '#FFFF00',
      土: '#FFA500',
      日: '#FF0080',
      月: '#8000FF',
      目: '#FF0000',
      心: '#FF0000',
      口: '#00FFFF',
      女: '#FF0080',
      亻: '#0000FF',
      扌: '#0000FF',
      忄: '#FF0000',
      艹: '#00FF00',
      讠: '#00FFFF',
      饣: '#FFFF00',
      钅: '#FFFF00',
      马: '#FFA500'
    }
  }
};

// 翻译
const translations = {
  zh: {
    title: '汉字部首词卡生成器',
    subtitle: '输入汉字，自动生成部首/部件结构词卡',
    inputPlaceholder: '输入汉字（每行一个或用空格分隔）：\n好\n明\n林\n休\n\n或手动指定拆分：\n好=女+子\n明=日+月\n\n或带拼音和英文：\n好|hǎo|good',
    generateCards: '生成词卡',
    results: '拆字结果',
    component: '拆分部件',
    pinyin: '拼音',
    meaning: '英文释义',
    source: '来源',
    auto: '自动',
    manual: '手动',
    unknown: '未知',
    noDataFound: '未找到拆分，请手动输入',
    cardSettings: '卡片设置',
    mode: '卡片模式',
    showBoth: '显示拆分和答案',
    hideAnswer: '隐藏答案',
    showHanziOnly: '只显示整字',
    matching: '配对卡模式',
    showPinyin: '显示拼音',
    showMeaning: '显示英文释义',
    compSize: '部件大小',
    answerSize: '答案字大小',
    cardsPerPage: '每页卡片数',
    orientation: '卡片方向',
    horizontal: '横版',
    vertical: '竖版',
    colorScheme: '颜色方案',
    compColor: '部件颜色自定义',
    applyToSame: '应用到所有相同部件',
    quickAdd: '按部首快速添加',
    print: '打印',
    exportPDF: '导出 PDF',
    saveDraft: '保存草稿',
    clearDraft: '清空草稿',
    prevPage: '上一页',
    nextPage: '下一页',
    pageInfo: '第 {n} / {total} 页'
  },
  en: {
    title: 'Hanzi Component Flashcard Generator',
    subtitle: 'Enter Hanzi and generate component structure flashcards',
    inputPlaceholder: 'Enter Hanzi (one per line or space separated):\n好\n明\n林\n休\n\nOr specify components manually:\n好=女+子\n明=日+月\n\nOr with pinyin and English:\n好|hǎo|good',
    generateCards: 'Generate Cards',
    results: 'Component Results',
    component: 'Components',
    pinyin: 'Pinyin',
    meaning: 'English',
    source: 'Source',
    auto: 'Auto',
    manual: 'Manual',
    unknown: 'Unknown',
    noDataFound: 'No component data found. Please edit manually.',
    cardSettings: 'Card Settings',
    mode: 'Card Mode',
    showBoth: 'Show Components and Answer',
    hideAnswer: 'Hide Answer',
    showHanziOnly: 'Hanzi Only',
    matching: 'Matching Card Mode',
    showPinyin: 'Show Pinyin',
    showMeaning: 'Show English Meaning',
    compSize: 'Component Size',
    answerSize: 'Answer Size',
    cardsPerPage: 'Cards per Page',
    orientation: 'Card Direction',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
    colorScheme: 'Color Scheme',
    compColor: 'Component Colors',
    applyToSame: 'Apply to Same Components',
    quickAdd: 'Quick Add by Radical',
    print: 'Print',
    exportPDF: 'Export PDF',
    saveDraft: 'Save Draft',
    clearDraft: 'Clear Draft',
    prevPage: 'Previous',
    nextPage: 'Next',
    pageInfo: 'Page {n} / {total}'
  }
};

function HanziComponentCardGenerator() {
  // 语言
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('language') || 'zh';
    } catch {
      return 'zh';
    }
  });
  const t = translations[lang] || translations.zh;

  // 输入
  const [rawInput, setRawInput] = useState('');

  // 卡片数据
  const [cards, setCards] = useState([]);

  // 设置
  const [cardMode, setCardMode] = useState('showBoth');
  const [showPinyin, setShowPinyin] = useState(true);
  const [showMeaning, setShowMeaning] = useState(false);
  const [componentSize, setComponentSize] = useState(90);
  const [answerSize, setAnswerSize] = useState(110);
  const [cardsPerPage, setCardsPerPage] = useState(6);
  const [cardOrientation, setCardOrientation] = useState('horizontal');
  const [colorScheme, setColorScheme] = useState('auto');
  const [componentColors, setComponentColors] = useState({});
  const [currentPage, setCurrentPage] = useState(0);

  // 加载草稿
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const data = JSON.parse(draft);
        if (data.rawInput) setRawInput(data.rawInput);
        if (data.cards) setCards(data.cards);
        if (data.settings) {
          const s = data.settings;
          if (s.cardMode) setCardMode(s.cardMode);
          if (s.showPinyin !== undefined) setShowPinyin(s.showPinyin);
          if (s.showMeaning !== undefined) setShowMeaning(s.showMeaning);
          if (s.componentSize) setComponentSize(s.componentSize);
          if (s.answerSize) setAnswerSize(s.answerSize);
          if (s.cardsPerPage) setCardsPerPage(s.cardsPerPage);
          if (s.cardOrientation) setCardOrientation(s.cardOrientation);
          if (s.colorScheme) setColorScheme(s.colorScheme);
        }
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
  }, []);

  // 解析输入
  const parseInput = useCallback((text) => {
    if (!text.trim()) return [];

    const lines = text
      .replace(/[,，;；\n]+/g, '\n')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l);

    const result = [];

    lines.forEach((line, idx) => {
      let char = '', components = [], pinyin = '', meaning = '', source = 'manual';
      let manualComponents = null;

      // 检查是否是手动指定格式: 好=女+子 或 好=女+子|hǎo|good
      const manualMatch = line.match(/^(.+?)=(.+?)(?:\|(.+?)(?:\|(.+))?)?$/);
      if (manualMatch) {
        char = manualMatch[1].trim();
        const compStr = manualMatch[2];
        manualComponents = compStr.split('+').map(c => c.trim()).filter(c => c);
        pinyin = manualMatch[3] || '';
        meaning = manualMatch[4] || '';
      } else {
        // 直接提取汉字
        const matches = line.match(/[一-鿿]/g);
        if (!matches) return;
        char = matches[0];
        manualComponents = null;
      }

      // 查询自动拆分
      const autoComponents = hanziComponents[char];
      if (manualComponents) {
        components = manualComponents;
        source = 'manual';
      } else if (autoComponents) {
        components = autoComponents;
        source = 'auto';
      } else {
        components = [char];
        source = 'unknown';
      }

      // 查询拼音
      if (!pinyin) {
        pinyin = hanziPinyin[char] || '';
      }

      result.push({
        id: `card_${idx}`,
        char,
        components,
        pinyin,
        meaning,
        source
      });
    });

    return result;
  }, []);

  // 生成卡片
  const handleGenerate = useCallback(() => {
    const parsedCards = parseInput(rawInput);
    setCards(parsedCards);
    setCurrentPage(0);
  }, [rawInput, parseInput]);

  // 更新卡片
  const updateCard = useCallback((index, field, value) => {
    setCards(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'components') {
        updated[index].source = 'manual';
      }
      return updated;
    });
  }, []);

  // 获取颜色
  const getComponentColor = useCallback((component) => {
    if (colorScheme === 'black') {
      return '#333333';
    }

    const scheme = colorSchemes[colorScheme];
    if (scheme && scheme.colors) {
      return scheme.colors[component] || scheme.colors.default || scheme.colors.defaultAlt || '#4CAF50';
    }

    return colorSchemes.auto.colors[component] || colorSchemes.auto.colors.default || '#4CAF50';
  }, [colorScheme]);

  // 更新颜色
  const handleColorChange = useCallback((component, color) => {
    setComponentColors(prev => ({ ...prev, [component]: color }));
  }, []);

  // 应用到所有相同部件
  const applyColorToAll = useCallback((component, color) => {
    setComponentColors(prev => {
      const updated = { ...prev };
      // 查找所有包含该部件的卡片
      cards.forEach(card => {
        if (card.components && card.components.includes(component)) {
          // 该卡片的所有相同部件都应用颜色
          card.components.forEach(c => {
            updated[c] = color;
          });
        }
      });
      return updated;
    });
  }, [cards]);

  // 按部首快速添加
  const handleQuickAdd = useCallback((radical) => {
    const words = radicalWordBank[radical];
    if (!words || !words.length) return;

    const existingChars = new Set(
      cards.map(c => c.char)
    );

    const newWords = words
      .slice(0, 6)
      .filter(w => !existingChars.has(w));

    if (newWords.length > 0) {
      setRawInput(prev => {
        const existing = prev.trim();
        return existing ? existing + '\n' + newWords.join('\n') : newWords.join('\n');
      });
    }
  }, [cards]);

  // 分页
  const paginatedCards = useCallback(() => {
    if (!cards.length || cardMode === 'matching') {
      return [cards];
    }

    const pages = [];
    for (let i = 0; i < cards.length; i += cardsPerPage) {
      pages.push(cards.slice(i, i + cardsPerPage));
    }
    return pages;
  }, [cards, cardsPerPage, cardMode]);

  // 获取配对卡
  const getMatchingCards = useCallback(() => {
    if (cardMode !== 'matching' || !cards.length) return [];

    const result = [];
    cards.forEach(card => {
      // 问题卡
      result.push({
        ...card,
        isQuestion: true,
        displayText: card.components.join(' + ')
      });
      // 答案卡
      result.push({
        ...card,
        isQuestion: false,
        displayText: card.char
      });
    });
    return result;
  }, [cards, cardMode]);

  // 保存草稿
  const saveDraft = useCallback(() => {
    try {
      const data = {
        rawInput,
        cards,
        settings: {
          cardMode,
          showPinyin,
          showMeaning,
          componentSize,
          answerSize,
          cardsPerPage,
          cardOrientation,
          colorScheme
        }
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      alert(lang === 'zh' ? '已保存' : 'Saved');
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  }, [rawInput, cards, cardMode, showPinyin, showMeaning, componentSize, answerSize, cardsPerPage, cardOrientation, colorScheme, lang]);

  // 清空草稿
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setRawInput('');
      setCards([]);
      setCurrentPage(0);
    } catch (e) {
      console.error('Error clearing draft:', e);
    }
  }, []);

  // 打印
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // 导出 PDF
  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const printArea = document.querySelector('.component-card-print-area');
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
      pdf.save('hanzi-component-cards.pdf');
    } catch (e) {
      console.error('PDF export error:', e);
      alert(lang === 'zh' ? 'PDF 导出失败，请确保已安装 html2canvas 和 jspdf' : 'PDF export failed');
    }
  }, [lang]);

  // 渲染卡片
  const renderCard = (card, index) => {
    const isMatching = cardMode === 'matching';
    const showFront = isMatching ? card.isQuestion : false;
    const showBack = isMatching ? !card.isQuestion : false;

    // 根据模式确定显示内容
    let displayChar = card.char;
    let displayComponents = card.components;
    let displayAnswer = card.char;

    if (cardMode === 'hideAnswer') {
      displayAnswer = '____';
    } else if (cardMode === 'showHanziOnly') {
      displayComponents = [];
      displayAnswer = card.char;
    } else if (isMatching) {
      displayChar = card.displayText;
      displayComponents = [];
      displayAnswer = card.displayText;
    }

    return (
      <div
        key={card.id + index}
        className={`flashcard ${cardOrientation} ${cardMode === 'matching' ? (card.isQuestion ? 'question' : 'answer') : ''}`}
        style={{ fontSize: `${answerSize / 4}px` }}
      >
        {/* 拼音 */}
        {showPinyin && card.pinyin && (
          <div className="card-pinyin">{card.pinyin}</div>
        )}

        {/* 部件 */}
        {(displayComponents && displayComponents.length > 0) && !showBack && (
          <div className="card-components">
            {displayComponents.map((comp, i) => (
              <span
                key={i}
                className="component-char"
                style={{
                  color: componentColors[comp] || getComponentColor(comp),
                  fontSize: `${componentSize / 4}px`
                }}
              >
                {comp}
                {i < displayComponents.length - 1 && ' + '}
              </span>
            ))}
            {' = '}
          </div>
        )}

        {/* 答案 */}
        {(cardMode !== 'showHanziOnly' || isMatching) && displayAnswer && (
          <div
            className="card-answer"
            style={{ fontSize: `${answerSize / 3}px` }}
          >
            {isMatching ? card.displayText : card.char}
          </div>
        )}

        {/* 英文释义 */}
        {showMeaning && card.meaning && (
          <div className="card-meaning">{card.meaning}</div>
        )}
      </div>
    );
  };

  // 渲染页面
  const renderPages = () => {
    const pages = paginatedCards();
    const matchingCards = cardMode === 'matching' ? getMatchingCards() : [];

    if (!pages.length || (pages.length === 1 && pages[0].length === 0)) {
      return (
        <div className="preview-empty">
          {lang === 'zh' ? '请先生成词卡' : 'Please generate cards first'}
        </div>
      );
    }

    if (cardMode === 'matching') {
      // 配对卡模式：2列布局
      const cardsPerPage2 = Math.ceil(matchingCards.length / 2);
      const pages2 = [];
      for (let i = 0; i < matchingCards.length; i += cardsPerPage2) {
        pages2.push(matchingCards.slice(i, i + cardsPerPage2));
      }

      return (
        <div className="print-pages">
          {pages2.map((pageCards, pageIdx) => (
            <div key={pageIdx} className="component-card-page">
              <div className="page-cards matching-mode">
                {pageCards.map((card, idx) => renderCard(card, idx))}
              </div>
              <div className="page-number">
                {lang === 'zh' ? `第 ${pageIdx + 1} / ${pages2.length} 页` : `Page ${pageIdx + 1} / ${pages2.length}`}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="print-pages">
        {pages.map((pageCards, pageIdx) => (
          <div
            key={pageIdx}
            className="component-card-page"
            style={{ display: pageIdx === currentPage ? 'flex' : 'none' }}
          >
            <div className="page-cards">
              {pageCards.map((card, idx) => renderCard(card, idx))}
            </div>
            <div className="page-number">
              {t.pageInfo.replace('{n}', (currentPage + 1)).replace('{total}', pages.length)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="hanzi-component-generator">
      {/* 左侧设置 */}
      <div className="generator-sidebar">
        {/* 输入区 */}
        <div className="sidebar-section">
          <h3>{lang === 'zh' ? '输入汉字' : 'Enter Hanzi'}</h3>
          <textarea
            className="hanzi-input"
            placeholder={t.inputPlaceholder}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
          />
          <button className="btn-generate" onClick={handleGenerate}>
            {t.generateCards}
          </button>
        </div>

        {/* 拆字结果 */}
        {cards.length > 0 && (
          <div className="sidebar-section">
            <h3>{t.results}</h3>
            <div className="results-table">
              {cards.map((card, idx) => (
                <div key={idx} className="result-row">
                  <div className="result-char">{card.char}</div>
                  <input
                    type="text"
                    className="result-components"
                    value={card.components.join('+')}
                    onChange={(e) => updateCard(idx, 'components', e.target.value.split('+'))}
                  />
                  <input
                    type="text"
                    className="result-pinyin"
                    value={card.pinyin}
                    onChange={(e) => updateCard(idx, 'pinyin', e.target.value)}
                  />
                  <input
                    type="text"
                    className="result-meaning"
                    value={card.meaning}
                    onChange={(e) => updateCard(idx, 'meaning', e.target.value)}
                  />
                  <span className={`result-source ${card.source}`}>
                    {t[card.source]}
                  </span>
                  {card.source === 'unknown' && (
                    <span className="source-warning">{t.noDataFound}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 卡片设置 */}
        <div className="sidebar-section">
          <h3>{t.cardSettings}</h3>

          <div className="setting-row">
            <label>{t.mode}</label>
            <select value={cardMode} onChange={(e) => setCardMode(e.target.value)}>
              <option value="showBoth">{t.showBoth}</option>
              <option value="hideAnswer">{t.hideAnswer}</option>
              <option value="showHanziOnly">{t.showHanziOnly}</option>
              <option value="matching">{t.matching}</option>
            </select>
          </div>

          <div className="setting-row">
            <label>{t.showPinyin}</label>
            <input
              type="checkbox"
              checked={showPinyin}
              onChange={(e) => setShowPinyin(e.target.checked)}
            />
          </div>

          <div className="setting-row">
            <label>{t.showMeaning}</label>
            <input
              type="checkbox"
              checked={showMeaning}
              onChange={(e) => setShowMeaning(e.target.checked)}
            />
          </div>

          <div className="setting-row">
            <label>{t.compSize}</label>
            <input
              type="range"
              min="40"
              max="160"
              value={componentSize}
              onChange={(e) => setComponentSize(parseInt(e.target.value))}
            />
            <span>{componentSize}px</span>
          </div>

          <div className="setting-row">
            <label>{t.answerSize}</label>
            <input
              type="range"
              min="40"
              max="180"
              value={answerSize}
              onChange={(e) => setAnswerSize(parseInt(e.target.value))}
            />
            <span>{answerSize}px</span>
          </div>

          <div className="setting-row">
            <label>{t.cardsPerPage}</label>
            <select value={cardsPerPage} onChange={(e) => setCardsPerPage(parseInt(e.target.value))}>
              <option value="4">4</option>
              <option value="6">6</option>
              <option value="8">8</option>
              <option value="9">9</option>
            </select>
          </div>

          <div className="setting-row">
            <label>{t.orientation}</label>
            <select value={cardOrientation} onChange={(e) => setCardOrientation(e.target.value)}>
              <option value="horizontal">{t.horizontal}</option>
              <option value="vertical">{t.vertical}</option>
            </select>
          </div>

          <div className="setting-row">
            <label>{t.colorScheme}</label>
            <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
              {Object.entries(colorSchemes).map(([key, scheme]) => (
                <option key={key} value={key}>{scheme.name}</option>
              ))}
            </select>
          </div>

          {/* 颜色自定义 */}
          {colorScheme === 'auto' && cards.length > 0 && (
            <div className="setting-row colors-custom">
              <label>{t.compColor}</label>
              <div className="colors-list">
                {Array.from(new Set(cards.flatMap(c => c.components))).slice(0, 10).map(comp => (
                  <span key={comp} className="color-item">
                    <span className="color-char" style={{ color: getComponentColor(comp) }}>{comp}</span>
                    <input
                      type="color"
                      value={componentColors[comp] || getComponentColor(comp)}
                      onChange={(e) => handleColorChange(comp, e.target.value)}
                    />
                    <button
                      className="btn-apply"
                      onClick={() => applyColorToAll(comp, componentColors[comp] || getComponentColor(comp))}
                    >
                      {t.applyToSame}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 按部首快速添加 */}
          <div className="setting-row quick-add">
            <label>{t.quickAdd}</label>
            <div className="radicals-list">
              {['氵', '火', '木', '金', '土', '日', '月', '目', '心', '口', '女', '亻', '忄', '艹', '讠', '饣', '钅', '马', '鸟'].slice(0, 12).map(rad => (
                <button key={rad} onClick={() => handleQuickAdd(rad)}>
                  {rad}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="sidebar-section actions">
          <button className="btn-print" onClick={handlePrint}>
            {t.print}
          </button>
          <button className="btn-pdf" onClick={handleExportPDF}>
            {t.exportPDF}
          </button>
          <button className="btn-save" onClick={saveDraft}>
            {t.saveDraft}
          </button>
          <button className="btn-clear" onClick={clearDraft}>
            {t.clearDraft}
          </button>
        </div>
      </div>

      {/* 右侧预览 */}
      <div className="generator-preview">
        <h2>{lang === 'zh' ? 'A4 预览' : 'A4 Preview'}</h2>
        <div className="preview-controls">
          {cardMode !== 'matching' && cards.length > cardsPerPage && (
            <>
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                {t.prevPage}
              </button>
              <span>
                {t.pageInfo.replace('{n}', (currentPage + 1)).replace('{total}', Math.ceil(cards.length / cardsPerPage))}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(cards.length / cardsPerPage) - 1, p + 1))}
                disabled={currentPage >= Math.ceil(cards.length / cardsPerPage) - 1}
              >
                {t.nextPage}
              </button>
            </>
          )}
        </div>
        <div className="component-card-print-area">
          {renderPages()}
        </div>
      </div>
    </div>
  );
}

export default HanziComponentCardGenerator;
