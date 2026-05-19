import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './ToolGrid.css';

/**
 * 全部工具页 - ToolGrid
 * 专业 SaaS 风格的工具展示页面
 */

// 工具配置数据
const toolsData = [
  // ===== 课堂互动游戏 =====
  {
    id: 'slingshot',
    icon: '🎯',
    category: 'games',
    access: 'free',
    title: { zh: '弹弓大作战', en: 'Slingshot Quiz Battle' },
    description: {
      zh: 'A/B选择题变成弹弓射击挑战，适合课堂抢答和词汇复习',
      en: 'Turn A/B quiz questions into a slingshot shooting challenge'
    },
    tags: { zh: ['A/B选择题', '课堂抢答', '动画音效'], en: ['A/B Quiz', 'Classroom', 'Animation'] }
  },
  {
    id: 'typing',
    icon: '⌨️',
    category: 'games',
    access: 'limited_free',
    title: { zh: '中文输入挑战', en: 'Chinese Typing Challenge' },
    description: {
      zh: '根据英文、拼音或语音提示输入中文，限时挑战打字速度',
      en: 'Type Chinese from prompts in a timed challenge'
    },
    tags: { zh: ['中文输入', '听写练习', '排行榜'], en: ['Typing', 'Dictation', 'Leaderboard'] }
  },
  {
    id: 'snake',
    icon: '🐍',
    category: 'games',
    access: 'limited_free',
    title: { zh: '成语贪吃蛇', en: 'Idiom Snake Game' },
    description: {
      zh: '控制小蛇按顺序吃掉汉字，完成成语挑战',
      en: 'Control a snake to collect characters in correct order'
    },
    tags: { zh: ['成语复习', '汉字顺序', '词语记忆'], en: ['Idiom', 'Characters', 'Memory'] }
  },
  {
    id: 'gacha',
    icon: '🔮',
    category: 'games',
    access: 'free',
    title: { zh: '词语扭蛋机', en: 'Word Gacha Machine' },
    description: {
      zh: '随机抽取词语，适合课堂热身和复习',
      en: 'Randomly draw words for warm-ups and review'
    },
    tags: { zh: ['课堂热身', '词汇复习', '随机'], en: ['Warm-up', 'Review', 'Random'] }
  },
  {
    id: 'pinyinwheel',
    icon: '🎡',
    category: 'games',
    access: 'free',
    title: { zh: '拼音大转盘', en: 'Pinyin Wheel' },
    description: {
      zh: '随机生成声母、韵母和声调组合，支持拼音朗读',
      en: 'Random pinyin combinations with audio'
    },
    tags: { zh: ['拼音练习', '发音训练', '随机'], en: ['Pinyin', 'Pronunciation', 'Random'] }
  },
  {
    id: 'pinyinguess',
    icon: '🔤',
    category: 'games',
    access: 'free',
    title: { zh: '看拼音猜汉字', en: 'Guess Hanzi from Pinyin' },
    description: {
      zh: '显示拼音让学生猜汉字，老师揭晓答案',
      en: 'Show pinyin, students guess the hanzi'
    },
    tags: { zh: ['拼音认读', '汉字练习', '投屏'], en: ['Pinyin', 'Hanzi', 'Projection'] }
  },
  {
    id: 'matching',
    icon: '👥',
    category: 'games',
    access: 'limited_free',
    title: { zh: '词语配对游戏', en: 'Word Matching Game' },
    description: {
      zh: '从词库或自定义词语生成配对练习',
      en: 'Match Chinese words with meanings'
    },
    tags: { zh: ['词汇复习', '配对练习'], en: ['Review', 'Matching'] }
  },
  {
    id: 'disappearing',
    icon: '🎯',
    category: 'games',
    access: 'pro',
    title: { zh: '课文消失挑战', en: 'Text Disappearing Challenge' },
    description: {
      zh: '逐轮隐藏文字，锻炼记忆和复述能力',
      en: 'Progressively hide text to train memory'
    },
    tags: { zh: ['阅读训练', '记忆练习'], en: ['Reading', 'Memory'] }
  },
  {
    id: 'sentence',
    icon: '🔄',
    category: 'games',
    access: 'pro',
    title: { zh: '句子排序游戏', en: 'Sentence Ordering Game' },
    description: {
      zh: '打乱句子顺序，让学生重新排列',
      en: 'Shuffle sentences for reordering'
    },
    tags: { zh: ['语法练习', '阅读理解'], en: ['Grammar', 'Reading'] }
  },
  {
    id: 'gomoku',
    icon: '♟️',
    category: 'games',
    access: 'pro',
    title: { zh: '教学五子棋', en: 'Teaching Gomoku' },
    description: {
      zh: '输入词语生成棋盘，双人对战五连珠',
      en: 'Vocabulary Gomoku for two players'
    },
    tags: { zh: ['双人对战', '词汇复习'], en: ['Two Players', 'Vocabulary'] }
  },
  {
    id: 'guesschar',
    icon: '🧩',
    category: 'games',
    access: 'pro',
    title: { zh: '猜字大挑战', en: 'Guess Character Challenge' },
    description: {
      zh: '方块遮挡答案，逐步揭晓让学生猜词',
      en: 'Hidden blocks, gradually reveal to guess'
    },
    tags: { zh: ['课堂互动', '抢答游戏'], en: ['Classroom', 'Quiz'] }
  },
  {
    id: 'luckybox',
    icon: '🎁',
    category: 'games',
    access: 'pro',
    title: { zh: '词语幸运盒', en: 'Lucky Word Box' },
    description: {
      zh: '词语和神秘盒随机匹配，开奖得分',
      en: 'Match words with mystery boxes'
    },
    tags: { zh: ['积分游戏', '小组对抗'], en: ['Score Game', 'Team'] }
  },
  {
    id: 'minesweeper',
    icon: '💣',
    category: 'games',
    access: 'pro',
    title: { zh: '词语扫雷', en: 'Word Minesweeper' },
    description: {
      zh: '两队轮流点击，安全格得分地雷扣分',
      en: 'Team game: click safe cells, avoid mines'
    },
    tags: { zh: ['两队对抗', '积分竞赛'], en: ['Team Battle', 'Score'] }
  },

  // ===== 备课生成工具 =====
  {
    id: 'worksheet',
    icon: '📝',
    category: 'tools',
    access: 'pro',
    title: { zh: '汉字字帖生成器', en: 'Hanzi Worksheet Generator' },
    description: {
      zh: '快速生成田字格、米字格和描红练习纸',
      en: 'Create printable hanzi practice sheets'
    },
    tags: { zh: ['打印材料', '汉字练习', 'PDF'], en: ['Print', 'Practice', 'PDF'] }
  },
  {
    id: 'hanzicomponent',
    icon: '🧱',
    category: 'tools',
    access: 'pro',
    title: { zh: '汉字部首词卡', en: 'Hanzi Component Flashcards' },
    description: {
      zh: '输入汉字，自动拆分部件生成彩色词卡',
      en: 'Auto-split hanzi into components for flashcards'
    },
    tags: { zh: ['打印材料', '词汇学习'], en: ['Print', 'Vocabulary'] }
  },
  {
    id: 'chineseuno',
    icon: '🃏',
    category: 'tools',
    access: 'pro',
    title: { zh: '中文UNO卡牌', en: 'Chinese UNO Cards' },
    description: {
      zh: '输入中文词表，生成UNO风格课堂卡牌',
      en: 'Generate UNO-style cards from word lists'
    },
    tags: { zh: ['卡牌游戏', '词汇复习', 'PDF'], en: ['Cards', 'Review', 'PDF'] }
  },
  {
    id: 'spotit',
    icon: '🎴',
    category: 'tools',
    access: 'free',
    title: { zh: 'Spot It卡牌', en: 'Spot It Cards' },
    description: {
      zh: '生成圆形Spot It找相同词卡牌',
      en: 'Create printable circle matching cards'
    },
    tags: { zh: ['卡牌游戏', '词汇练习', 'PDF'], en: ['Cards', 'Practice', 'PDF'] }
  },
  {
    id: 'wordcloud',
    icon: '☁️',
    category: 'tools',
    access: 'free',
    title: { zh: '词云生成器', en: 'Word Cloud Generator' },
    description: {
      zh: '输入词语，自动生成精美词云图片',
      en: 'Generate beautiful word cloud images'
    },
    tags: { zh: ['课堂展示', '词汇展示', 'PNG'], en: ['Display', 'Vocabulary', 'PNG'] }
  },

  // ===== 课堂管理工具 =====
  {
    id: 'luckypicker',
    icon: '🎲',
    category: 'management',
    access: 'free',
    title: { zh: '点名神器', en: 'Lucky Picker' },
    description: {
      zh: '转盘抽人、随机点名、智能分组',
      en: 'Random picker, wheel spin, smart grouping'
    },
    tags: { zh: ['随机点名', '分组对抗'], en: ['Random', 'Grouping'] }
  },
  {
    id: 'seatmanager',
    icon: '🪑',
    category: 'management',
    access: 'pro',
    title: { zh: '座位管理工具', en: 'Seat Manager' },
    description: {
      zh: '创建班级座位表，拖拽换座和PDF导出',
      en: 'Class seating charts with drag-and-drop'
    },
    tags: { zh: ['座位管理', 'PDF导出'], en: ['Seating', 'PDF'] }
  }
];

// 分类配置
const categories = {
  games: {
    zh: '课堂互动游戏',
    en: 'Classroom Games',
    desc: { zh: '适合投屏、课堂活动、学生互动', en: 'For live classroom interaction and student engagement' }
  },
  tools: {
    zh: '备课生成工具',
    en: 'Preparation Tools',
    desc: { zh: '适合生成字帖、卡牌、词云和可打印材料', en: 'Generate worksheets, cards, word clouds, and printable materials' }
  },
  management: {
    zh: '课堂管理工具',
    en: 'Class Management',
    desc: { zh: '适合点名、座位安排和班级管理', en: 'Manage student lists, seating charts, and classroom routines' }
  }
};

// 权限标签
const accessLabels = {
  free: { zh: '免费', en: 'FREE' },
  limited_free: { zh: '限时免费', en: 'FREE' },
  pro: { zh: 'Pro', en: 'PRO' }
};

function ToolGrid({ onToolSelect }) {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');

  // 过滤工具
  const filteredTools = useMemo(() => {
    return toolsData.filter(tool => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchZh = tool.title.zh.toLowerCase().includes(query) ||
                       tool.description.zh.toLowerCase().includes(query) ||
                       tool.tags.zh.some(tag => tag.toLowerCase().includes(query));
        const matchEn = tool.title.en.toLowerCase().includes(query) ||
                       tool.description.en.toLowerCase().includes(query) ||
                       tool.tags.en.some(tag => tag.toLowerCase().includes(query));
        if (!matchZh && !matchEn) return false;
      }

      // 分类过滤
      if (filterCategory !== 'all' && tool.category !== filterCategory) {
        return false;
      }

      // 权限过滤
      if (filterAccess === 'free' && tool.access === 'pro') {
        return false;
      }
      if (filterAccess === 'pro' && (tool.access === 'free' || tool.access === 'limited_free')) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filterCategory, filterAccess]);

  // 按分类分组
  const groupedTools = useMemo(() => {
    const groups = { games: [], tools: [], management: [] };
    filteredTools.forEach(tool => {
      if (groups[tool.category]) {
        groups[tool.category].push(tool);
      }
    });
    return groups;
  }, [filteredTools]);

  const handleToolClick = (toolId) => {
    if (onToolSelect) {
      onToolSelect(toolId);
    }
  };

  const getAccessClass = (access) => {
    if (access === 'pro') return 'access-pro';
    return 'access-free';
  };

  return (
    <div className="tool-grid-page">
      {/* 页面头部 */}
      <div className="tool-grid-header">
        <h1 className="page-title">
          {lang === 'zh' ? '全部工具' : 'All Tools'}
        </h1>
        <p className="page-subtitle">
          {lang === 'zh'
            ? '为对外汉语老师设计的课堂互动、备课生成和课堂管理工具'
            : 'Interactive classroom games, lesson preparation tools, and class management utilities for Chinese teachers'}
        </p>
      </div>

      {/* 搜索和筛选 */}
      <div className="tool-grid-controls">
        <input
          type="text"
          className="search-input"
          placeholder={lang === 'zh'
            ? '搜索工具，例如：拼音、字帖、点名'
            : 'Search tools, e.g. pinyin, worksheet, picker'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterCategory === 'all' && filterAccess === 'all' ? 'active' : ''}`}
            onClick={() => { setFilterCategory('all'); setFilterAccess('all'); }}
          >
            {lang === 'zh' ? '全部' : 'All'}
          </button>
          <button
            className={`filter-btn ${filterCategory === 'games' ? 'active' : ''}`}
            onClick={() => { setFilterCategory('games'); setFilterAccess('all'); }}
          >
            {lang === 'zh' ? '课堂互动' : 'Games'}
          </button>
          <button
            className={`filter-btn ${filterCategory === 'tools' ? 'active' : ''}`}
            onClick={() => { setFilterCategory('tools'); setFilterAccess('all'); }}
          >
            {lang === 'zh' ? '备课生成' : 'Prep'}
          </button>
          <button
            className={`filter-btn ${filterCategory === 'management' ? 'active' : ''}`}
            onClick={() => { setFilterCategory('management'); setFilterAccess('all'); }}
          >
            {lang === 'zh' ? '课堂管理' : 'Manage'}
          </button>
          <span className="filter-divider">|</span>
          <button
            className={`filter-btn ${filterAccess === 'free' ? 'active' : ''}`}
            onClick={() => { setFilterCategory('all'); setFilterAccess('free'); }}
          >
            {lang === 'zh' ? '免费' : 'Free'}
          </button>
          <button
            className={`filter-btn ${filterAccess === 'pro' ? 'active' : ''}`}
            onClick={() => { setFilterCategory('all'); setFilterAccess('pro'); }}
          >
            Pro
          </button>
        </div>
      </div>

      {/* 工具分类展示 */}
      {Object.entries(categories).map(([catKey, cat]) => {
        const tools = groupedTools[catKey];
        if (tools.length === 0) return null;

        return (
          <div key={catKey} className="tool-category">
            <div className="category-header">
              <h2 className="category-title">{lang === 'zh' ? cat.zh : cat.en}</h2>
              <p className="category-desc">{lang === 'zh' ? cat.desc.zh : cat.desc.en}</p>
            </div>

            <div className="tools-grid">
              {tools.map((tool, index) => (
                <div
                  key={tool.id}
                  className="tool-card"
                  onClick={() => handleToolClick(tool.id)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="tool-card-header">
                    <span className="tool-icon">{tool.icon}</span>
                    <span className={`tool-access ${getAccessClass(tool.access)}`}>
                      {accessLabels[tool.access][lang]}
                    </span>
                  </div>

                  <h3 className="tool-name">
                    {lang === 'zh' ? tool.title.zh : tool.title.en}
                  </h3>

                  <p className="tool-desc">
                    {lang === 'zh' ? tool.description.zh : tool.description.en}
                  </p>

                  <div className="tool-tags">
                    {(lang === 'zh' ? tool.tags.zh : tool.tags.en).slice(0, 3).map((tag, i) => (
                      <span key={i} className="tool-tag">{tag}</span>
                    ))}
                  </div>

                  <button
                    className="tool-start-btn"
                    onClick={(e) => { e.stopPropagation(); handleToolClick(tool.id); }}
                  >
                    {lang === 'zh' ? '开始使用' : 'Start'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* 无结果 */}
      {filteredTools.length === 0 && (
        <div className="no-results">
          <p>{lang === 'zh' ? '没有找到匹配的工具' : 'No tools found'}</p>
        </div>
      )}
    </div>
  );
}

export default ToolGrid;