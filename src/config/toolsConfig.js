/**
 * 工具权限配置
 * 定义每个工具的访问权限和标签
 */

export const toolsConfig = {
  // ===== 课堂互动游戏 =====
  slingshot: {
    id: 'slingshot',
    titleZh: '弹弓大作战',
    titleEn: 'Slingshot Quiz Battle',
    descriptionZh: '输入主题或批量导入题目，把A/B选择题变成弹弓射击挑战',
    descriptionEn: 'Turn A/B quiz questions into a slingshot shooting challenge',
    category: 'games',
    subcategory: 'classroom',
    access: 'free',
    badge: 'FREE',
    scenes: ['A/B选择题', '课堂抢答', '动画音效', '词汇复习', '投屏互动'],
    icon: '🎯'
  },
  typing: {
    id: 'typing',
    titleZh: '中文输入挑战',
    titleEn: 'Chinese Typing Challenge',
    descriptionZh: '老师导入词库，学生根据提示输入中文，限时挑战打字速度',
    descriptionEn: 'Students type Chinese words from prompts in a timed challenge',
    category: 'games',
    subcategory: 'classroom',
    access: 'limited_free',
    badge: 'LIMITED_FREE',
    scenes: ['中文输入', '听写练习', '词汇复习', '个人挑战', '限时挑战'],
    icon: '⌨️'
  },
  snake: {
    id: 'snake',
    titleZh: '成语贪吃蛇',
    titleEn: 'Idiom Snake Game',
    descriptionZh: '控制小蛇按顺序吃掉汉字，完成成语挑战',
    descriptionEn: 'Control the snake to collect Chinese characters in order',
    category: 'games',
    subcategory: 'classroom',
    access: 'limited_free',
    badge: 'LIMITED_FREE',
    scenes: ['成语复习', '汉字顺序', '词语记忆', '反应训练'],
    icon: '🐍'
  },
  gacha: {
    id: 'gacha',
    titleZh: '词语扭蛋机',
    titleEn: 'Word Gacha Machine',
    descriptionZh: '随机抽取词语，适合课堂热身和复习',
    descriptionEn: 'Randomly draw words for warm-ups and review',
    category: 'games',
    subcategory: 'classroom',
    access: 'free',
    badge: 'FREE',
    scenes: ['课堂热身', '词汇复习', '随机点名'],
    icon: '🔮'
  },
  pinyinwheel: {
    id: 'pinyinwheel',
    titleZh: '拼音大转盘',
    titleEn: 'Pinyin Wheel',
    descriptionZh: '随机生成声母、韵母和声调组合，支持拼音朗读',
    descriptionEn: 'Random pinyin combinations with audio support',
    category: 'games',
    subcategory: 'classroom',
    access: 'free',
    badge: 'FREE',
    scenes: ['拼音练习', '发音训练'],
    icon: '🎡'
  },
  pinyinguess: {
    id: 'pinyinguess',
    titleZh: '看拼音猜汉字',
    titleEn: 'Guess Hanzi from Pinyin',
    descriptionZh: '显示拼音让学生猜汉字，老师揭晓答案',
    descriptionEn: 'Show pinyin, students guess the hanzi',
    category: 'games',
    subcategory: 'classroom',
    access: 'free',
    badge: 'FREE',
    scenes: ['拼音认读', '汉字练习', '投屏友好'],
    icon: '🔤'
  },
  matching: {
    id: 'matching',
    titleZh: '词语配对游戏',
    titleEn: 'Word Matching Game',
    descriptionZh: '从HSK词库或自定义词语生成配对练习',
    descriptionEn: 'Match Chinese words with pinyin or English meanings',
    category: 'games',
    subcategory: 'classroom',
    access: 'limited_free',
    badge: 'LIMITED_FREE',
    scenes: ['词汇复习', '配对练习'],
    icon: '👥'
  },
  disappearing: {
    id: 'disappearing',
    titleZh: '课文消失挑战',
    titleEn: 'Text Disappearing Challenge',
    descriptionZh: '逐轮隐藏文字，锻炼记忆和复述能力',
    descriptionEn: 'Progressively hide text to train memory',
    category: 'games',
    subcategory: 'classroom',
    access: 'pro',
    badge: 'PRO',
    scenes: ['阅读训练', '记忆练习', '朗读'],
    icon: '🎯'
  },
  sentence: {
    id: 'sentence',
    titleZh: '句子排序游戏',
    titleEn: 'Sentence Ordering Game',
    descriptionZh: '打乱句子顺序，让学生重新排列',
    descriptionEn: 'Shuffle sentences for reordering',
    category: 'games',
    subcategory: 'classroom',
    access: 'pro',
    badge: 'PRO',
    scenes: ['语法练习', '阅读理解'],
    icon: '🔄'
  },
  gomoku: {
    id: 'gomoku',
    titleZh: '教学五子棋',
    titleEn: 'Teaching Gomoku',
    descriptionZh: '输入词语生成棋盘，双人对战五连珠',
    descriptionEn: 'Vocabulary Gomoku for two players',
    category: 'games',
    subcategory: 'classroom',
    access: 'pro',
    badge: 'PRO',
    scenes: ['双人对战', '词汇复习', '小组活动'],
    icon: '♟️'
  },
  guesschar: {
    id: 'guesschar',
    titleZh: '猜字大挑战',
    titleEn: 'Guess Character Challenge',
    descriptionZh: '方块遮挡答案，逐步揭晓让学生猜词',
    descriptionEn: 'Hidden blocks, gradually reveal to guess',
    category: 'games',
    subcategory: 'classroom',
    access: 'pro',
    badge: 'PRO',
    scenes: ['课堂互动', '抢答游戏', '投屏'],
    icon: '🧩'
  },
  luckybox: {
    id: 'luckybox',
    titleZh: '词语幸运盒',
    titleEn: 'Lucky Word Box',
    descriptionZh: '词语和神秘盒随机匹配，开奖得分',
    descriptionEn: 'Match words with mystery boxes',
    category: 'games',
    subcategory: 'classroom',
    access: 'pro',
    badge: 'PRO',
    scenes: ['积分游戏', '小组对抗'],
    icon: '🎁'
  },
  minesweeper: {
    id: 'minesweeper',
    titleZh: '词语扫雷',
    titleEn: 'Word Minesweeper',
    descriptionZh: '两队轮流点击，安全格得分地雷扣分',
    descriptionEn: 'Team game: click safe cells, avoid mines',
    category: 'games',
    subcategory: 'classroom',
    access: 'pro',
    badge: 'PRO',
    scenes: ['两队对抗', '扫雷游戏', '积分竞赛'],
    icon: '💣'
  },

  // ===== 备课生成工具 =====
  worksheet: {
    id: 'worksheet',
    titleZh: '汉字字帖生成器',
    titleEn: 'Hanzi Worksheet Generator',
    descriptionZh: '快速生成田字格、米字格和描红练习纸',
    descriptionEn: 'Create printable hanzi practice sheets',
    category: 'tools',
    subcategory: 'prep',
    access: 'pro',
    badge: 'PRO',
    scenes: ['打印材料', '汉字练习', 'PDF导出'],
    icon: '📝'
  },
  hanzicomponent: {
    id: 'hanzicomponent',
    titleZh: '汉字部首词卡',
    titleEn: 'Hanzi Component Flashcards',
    descriptionZh: '输入汉字，自动拆分部件生成彩色词卡',
    descriptionEn: 'Auto-split hanzi into components for flashcards',
    category: 'tools',
    subcategory: 'prep',
    access: 'pro',
    badge: 'PRO',
    scenes: ['打印材料', '词汇学习', 'A4打印'],
    icon: '🧱'
  },
  chineseuno: {
    id: 'chineseuno',
    titleZh: '中文UNO卡牌',
    titleEn: 'Chinese UNO Cards',
    descriptionZh: '输入中文词表，生成UNO风格课堂卡牌',
    descriptionEn: 'Generate UNO-style cards from word lists',
    category: 'tools',
    subcategory: 'prep',
    access: 'pro',
    badge: 'PRO',
    scenes: ['卡牌游戏', '词汇复习', 'PDF导出'],
    icon: '🃏'
  },
  spotit: {
    id: 'spotit',
    titleZh: 'Spot It卡牌',
    titleEn: 'Spot It Cards',
    descriptionZh: '生成圆形Spot It找相同词卡牌',
    descriptionEn: 'Create printable circle matching cards',
    category: 'tools',
    subcategory: 'prep',
    access: 'free',
    badge: 'FREE',
    scenes: ['卡牌游戏', '词汇练习', 'PDF导出'],
    icon: '🎴'
  },
  wordcloud: {
    id: 'wordcloud',
    titleZh: '词云生成器',
    titleEn: 'Word Cloud Generator',
    descriptionZh: '输入词语，自动生成精美词云图片',
    descriptionEn: 'Generate beautiful word cloud images',
    category: 'tools',
    subcategory: 'prep',
    access: 'free',
    badge: 'FREE',
    scenes: ['课堂展示', '词汇展示', 'PNG下载'],
    icon: '☁️'
  },

  // ===== 课堂管理工具 =====
  luckypicker: {
    id: 'luckypicker',
    titleZh: '点名神器',
    titleEn: 'Lucky Picker',
    descriptionZh: '转盘抽人、随机点名、智能分组',
    descriptionEn: 'Random picker, wheel spin, smart grouping',
    category: 'tools',
    subcategory: 'management',
    access: 'free',
    badge: 'FREE',
    scenes: ['随机点名', '分组对抗', '课堂必备'],
    icon: '🎲'
  },
  seatmanager: {
    id: 'seatmanager',
    titleZh: '座位管理工具',
    titleEn: 'Seat Manager',
    descriptionZh: '创建班级座位表，拖拽换座和PDF导出',
    descriptionEn: 'Class seating charts with drag-and-drop',
    category: 'tools',
    subcategory: 'management',
    access: 'pro',
    badge: 'PRO',
    scenes: ['座位管理', '课堂管理', 'PDF导出'],
    icon: '🪑'
  }
};

// 分类配置
export const categories = {
  games: {
    id: 'games',
    titleZh: '课堂互动游戏',
    titleEn: 'Classroom Games',
    descriptionZh: '适合投屏上课、课堂热身、小组活动和词汇复习',
    descriptionEn: 'Interactive games for live teaching, warm-ups, and vocabulary review'
  },
  tools: {
    id: 'tools',
    titleZh: '备课生成工具',
    titleEn: 'Lesson Prep Tools',
    descriptionZh: '快速生成字帖、词卡、卡牌和可打印PDF教学材料',
    descriptionEn: 'Create worksheets, flashcards, and printable materials'
  },
  management: {
    id: 'management',
    titleZh: '课堂管理工具',
    titleEn: 'Classroom Management',
    descriptionZh: '管理学生名单、随机点名、分组和座位表',
    descriptionEn: 'Student lists, random picking, grouping, seating charts'
  }
};

// 获取分类下的工具
export const getToolsByCategory = (category) => {
  return Object.values(toolsConfig).filter(tool => tool.category === category);
};

// 根据权限获取工具列表
export const getToolsByAccess = (accessLevel) => {
  return Object.values(toolsConfig).filter(tool => {
    if (accessLevel === 'school') return true;
    if (accessLevel === 'pro') return tool.access !== 'school';
    if (accessLevel === 'free') return tool.access === 'free' || tool.access === 'limited_free';
    return tool.access === 'free';
  });
};

// 获取工具的 badge 显示文本
export const getToolBadge = (toolId, lang = 'zh') => {
  const tool = toolsConfig[toolId];
  if (!tool) return '';

  const badges = {
    FREE: lang === 'zh' ? '免费' : 'FREE',
    PRO: 'PRO',
    LIMITED_FREE: lang === 'zh' ? '限时免费' : 'FREE',
    SCHOOL: 'SCHOOL'
  };

  return badges[tool.badge] || tool.badge;
};

export default toolsConfig;