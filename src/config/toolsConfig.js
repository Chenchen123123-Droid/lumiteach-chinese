/**
 * 工具单一注册表。
 *
 * 工具大厅、路由、权限、搜索和组件加载全部读取这里。
 * 新增工具时只需要新增一项，避免多个列表互相漏配。
 */
export const categories = {
  games: {
    id: 'games',
    titleZh: '课堂互动游戏',
    titleEn: 'Classroom Games',
    descriptionZh: '适合投屏、课堂活动和学生互动',
    descriptionEn: 'For projection, classroom activities, and student engagement'
  },
  tools: {
    id: 'tools',
    titleZh: '备课生成工具',
    titleEn: 'Preparation Tools',
    descriptionZh: '生成字帖、卡牌、词云和可打印材料',
    descriptionEn: 'Create worksheets, cards, word clouds, and printable materials'
  },
  management: {
    id: 'management',
    titleZh: '课堂管理工具',
    titleEn: 'Class Management',
    descriptionZh: '用于点名、座位安排和班级管理',
    descriptionEn: 'Manage student lists, seating charts, and classroom routines'
  }
};

export const tools = [
  {
    id: 'slingshot', icon: '🎯', category: 'games', access: 'free', requiresText: false,
    titleZh: '弹弓大作战', titleEn: 'Slingshot Quiz Battle',
    descriptionZh: '把选择题变成弹弓射击挑战，适合课堂抢答和复习',
    descriptionEn: 'Turn quiz questions into a slingshot classroom challenge',
    tagsZh: ['选择题', '课堂抢答', '动画音效'], tagsEn: ['Quiz', 'Classroom', 'Animation'],
    load: () => import('../components/SlingshotQuizBattle')
  },
  {
    id: 'typing', icon: '⌨️', category: 'games', access: 'limited_free', requiresText: false,
    titleZh: '中文输入挑战', titleEn: 'Chinese Typing Challenge',
    descriptionZh: '根据英文、拼音或语音提示输入中文，限时挑战打字速度',
    descriptionEn: 'Type Chinese from prompts in a timed challenge',
    tagsZh: ['中文输入', '听写练习', '排行榜'], tagsEn: ['Typing', 'Dictation', 'Leaderboard'],
    load: () => import('../components/ChineseTypingChallenge')
  },
  {
    id: 'snake', icon: '🐍', category: 'games', access: 'limited_free', requiresText: false,
    titleZh: '成语贪吃蛇', titleEn: 'Idiom Snake Game',
    descriptionZh: '控制小蛇按顺序吃掉汉字，完成成语挑战',
    descriptionEn: 'Control a snake to collect characters in the correct order',
    tagsZh: ['成语复习', '汉字顺序', '词语记忆'], tagsEn: ['Idiom', 'Characters', 'Memory'],
    load: () => import('../components/IdiomSnakeGame')
  },
  {
    id: 'gacha', icon: '🔮', category: 'games', access: 'free', requiresText: false,
    titleZh: '词语扭蛋机', titleEn: 'Word Gacha Machine',
    descriptionZh: '随机抽取词语，适合课堂热身和复习',
    descriptionEn: 'Randomly draw words for warm-ups and review',
    tagsZh: ['课堂热身', '词汇复习', '随机'], tagsEn: ['Warm-up', 'Review', 'Random'],
    load: () => import('../components/WordGachaGame')
  },
  {
    id: 'pinyinwheel', icon: '🎡', category: 'games', access: 'free', requiresText: false,
    titleZh: '拼音大转盘', titleEn: 'Pinyin Wheel',
    descriptionZh: '随机生成声母、韵母和声调组合，支持拼音朗读',
    descriptionEn: 'Generate random pinyin combinations with audio support',
    tagsZh: ['拼音练习', '发音训练', '转盘'], tagsEn: ['Pinyin', 'Pronunciation', 'Wheel'],
    load: () => import('../components/PinyinWheelGame')
  },
  {
    id: 'pinyinguess', icon: '🔤', category: 'games', access: 'free', requiresText: false,
    titleZh: '看拼音猜汉字', titleEn: 'Guess Hanzi from Pinyin',
    descriptionZh: '显示拼音让学生猜汉字，由老师揭晓和计分',
    descriptionEn: 'Show pinyin and let students guess the hanzi',
    tagsZh: ['拼音认读', '汉字练习', '投屏'], tagsEn: ['Pinyin', 'Hanzi', 'Projection'],
    load: () => import('../components/PinyinGuessHanZiGame')
  },
  {
    id: 'matching', icon: '👥', category: 'games', access: 'limited_free', requiresText: false,
    titleZh: '词语配对游戏', titleEn: 'Word Matching Game',
    descriptionZh: '从 HSK 词库或自定义词语生成配对练习',
    descriptionEn: 'Match Chinese words with pinyin or meanings',
    tagsZh: ['词汇复习', '配对练习', 'HSK'], tagsEn: ['Review', 'Matching', 'HSK'],
    load: () => import('../components/WordMatchingGame')
  },
  {
    id: 'disappearing', icon: '🎯', category: 'games', access: 'pro', requiresText: true,
    titleZh: '课文消失挑战', titleEn: 'Text Disappearing Challenge',
    descriptionZh: '逐轮隐藏课文，训练记忆、朗读和复述能力',
    descriptionEn: 'Progressively hide text to train reading and memory',
    tagsZh: ['阅读训练', '记忆练习', '朗读'], tagsEn: ['Reading', 'Memory', 'Speaking'],
    load: () => import('../components/DisappearingTextGame')
  },
  {
    id: 'sentence', icon: '🔄', category: 'games', access: 'pro', requiresText: true,
    titleZh: '句子排序游戏', titleEn: 'Sentence Ordering Game',
    descriptionZh: '打乱句子成分，让学生拖拽恢复正确顺序',
    descriptionEn: 'Shuffle sentence parts for students to reorder',
    tagsZh: ['语法练习', '阅读理解', '拖拽'], tagsEn: ['Grammar', 'Reading', 'Drag'],
    load: () => import('../components/SentenceOrderGame')
  },
  {
    id: 'gomoku', icon: '♟️', category: 'games', access: 'pro', requiresText: false,
    titleZh: '教学五子棋', titleEn: 'Teaching Gomoku',
    descriptionZh: '输入词语生成棋盘，双人对战五连珠',
    descriptionEn: 'Vocabulary Gomoku for two players',
    tagsZh: ['双人对战', '词汇复习', '棋盘'], tagsEn: ['Two Players', 'Vocabulary', 'Board'],
    load: () => import('../components/TeachingGomokuGame')
  },
  {
    id: 'guesschar', icon: '🔍', category: 'games', access: 'free', requiresText: false,
    titleZh: '找错别字', titleEn: 'Spot the Typo',
    descriptionZh: '导入错误句子，让学生点击并找出错别字',
    descriptionEn: 'Find and correct typos in Chinese sentences',
    tagsZh: ['错别字', '阅读纠错', '课堂互动'], tagsEn: ['Typo', 'Reading', 'Classroom'],
    load: () => import('../components/SpotTheTypo')
  },
  {
    id: 'luckybox', icon: '🎁', category: 'games', access: 'pro', requiresText: false,
    titleZh: '词语幸运盒', titleEn: 'Lucky Word Box',
    descriptionZh: '词语与神秘盒随机匹配，开奖获得分数',
    descriptionEn: 'Match words with mystery boxes and reveal scores',
    tagsZh: ['积分游戏', '小组对抗', '随机'], tagsEn: ['Score', 'Teams', 'Random'],
    load: () => import('../components/LuckyWordBoxGame')
  },
  {
    id: 'minesweeper', icon: '💣', category: 'games', access: 'pro', requiresText: false,
    titleZh: '词语扫雷', titleEn: 'Word Minesweeper',
    descriptionZh: '两队轮流点击格子，安全格得分，踩雷扣分',
    descriptionEn: 'Teams reveal cells, earn points, and avoid mines',
    tagsZh: ['两队对抗', '积分竞赛', '扫雷'], tagsEn: ['Teams', 'Score', 'Minesweeper'],
    load: () => import('../components/WordMinesweeperGame')
  },
  {
    id: 'fliptiles', icon: '🎁', category: 'games', access: 'free', requiresText: false,
    titleZh: '翻格子', titleEn: 'Flip Tiles Quiz',
    descriptionZh: '录入题目和分值，进行课堂分组翻牌答题',
    descriptionEn: 'A team-based tile-flipping classroom quiz',
    tagsZh: ['分组游戏', '课堂互动', '复习答题'], tagsEn: ['Teams', 'Classroom', 'Quiz'],
    load: () => import('../components/FlipTilesQuiz')
  },
  {
    id: 'twopuzzle', icon: '🧩', category: 'games', access: 'free', requiresText: false,
    titleZh: '双字词拼图', titleEn: 'Two-Character Word Puzzle',
    descriptionZh: '把双字词切成拼图碎片，练习汉字认读和词语复习',
    descriptionEn: 'Turn two-character words into drag-and-drop puzzles',
    tagsZh: ['汉字认读', '词语复习', '拼图'], tagsEn: ['Hanzi', 'Vocabulary', 'Puzzle'],
    load: () => import('../components/TwoCharacterWordPuzzle')
  },
  {
    id: 'climbmountain', icon: '⛰️', category: 'games', access: 'free', requiresText: false,
    titleZh: '爬山竞赛（本地演示）', titleEn: 'Climb the Mountain (Local Demo)',
    descriptionZh: '在同一浏览器中演示课堂答题竞赛；暂不支持跨设备联机',
    descriptionEn: 'A local classroom quiz demo; cross-device rooms are not yet supported',
    tagsZh: ['本地演示', '课堂竞赛', 'AI 出题'], tagsEn: ['Local Demo', 'Quiz', 'AI Questions'],
    load: () => import('../components/ClimbMountainQuiz')
  },
  {
    id: 'worksheet', icon: '📝', category: 'tools', access: 'pro', requiresText: false,
    titleZh: '汉字字帖生成器', titleEn: 'Hanzi Worksheet Generator',
    descriptionZh: '生成田字格、米字格和描红练习纸',
    descriptionEn: 'Create printable hanzi practice sheets',
    tagsZh: ['打印材料', '汉字练习', 'PDF'], tagsEn: ['Print', 'Practice', 'PDF'],
    load: () => import('../components/HanziWorksheetGenerator')
  },
  {
    id: 'hanzicomponent', icon: '🧱', category: 'tools', access: 'pro', requiresText: false,
    titleZh: '汉字部首词卡', titleEn: 'Hanzi Component Flashcards',
    descriptionZh: '拆分汉字部件并生成彩色词卡',
    descriptionEn: 'Split hanzi into components and create flashcards',
    tagsZh: ['打印材料', '汉字部件', '词卡'], tagsEn: ['Print', 'Components', 'Cards'],
    load: () => import('../components/HanziComponentCardGenerator')
  },
  {
    id: 'chineseuno', icon: '🃏', category: 'tools', access: 'pro', requiresText: false,
    titleZh: '中文 UNO 卡牌', titleEn: 'Chinese UNO Cards',
    descriptionZh: '输入中文词表，生成 UNO 风格课堂卡牌',
    descriptionEn: 'Generate UNO-style cards from Chinese word lists',
    tagsZh: ['卡牌游戏', '词汇复习', 'PDF'], tagsEn: ['Cards', 'Review', 'PDF'],
    load: () => import('../components/ChineseUnoCardGenerator')
  },
  {
    id: 'spotit', icon: '🎴', category: 'tools', access: 'free', requiresText: false,
    titleZh: 'Spot It 卡牌', titleEn: 'Spot It Cards',
    descriptionZh: '生成任意两张只有一个相同词的圆形卡牌',
    descriptionEn: 'Create printable circular matching cards',
    tagsZh: ['卡牌游戏', '词汇练习', 'PDF'], tagsEn: ['Cards', 'Practice', 'PDF'],
    load: () => import('../components/SpotItCardGenerator')
  },
  {
    id: 'readingaudio', icon: '🔊', category: 'tools', access: 'free', requiresText: false,
    titleZh: '课堂朗读音频工具', titleEn: 'Classroom Reading Audio Tool',
    descriptionZh: '把听力文本变成课堂朗读播放器',
    descriptionEn: 'Turn lesson text into a classroom reading player',
    tagsZh: ['听力练习', '跟读训练', '朗读'], tagsEn: ['Listening', 'Repetition', 'Audio'],
    load: () => import('../components/ClassroomReadingAudioTool')
  },
  {
    id: 'wordcloud', icon: '☁️', category: 'tools', access: 'free', requiresText: false,
    titleZh: '词云生成器', titleEn: 'Word Cloud Generator',
    descriptionZh: '输入词语，生成适合课堂展示的词云图片',
    descriptionEn: 'Generate classroom word cloud images',
    tagsZh: ['课堂展示', '词汇展示', 'PNG'], tagsEn: ['Display', 'Vocabulary', 'PNG'],
    load: () => import('../components/WordCloudGenerator')
  },
  {
    id: 'luckypicker', icon: '🎲', category: 'management', access: 'free', requiresText: false,
    titleZh: '点名神器', titleEn: 'Lucky Picker',
    descriptionZh: '转盘抽人、随机点名和智能分组',
    descriptionEn: 'Random picker, wheel spin, and smart grouping',
    tagsZh: ['随机点名', '名单', '分组'], tagsEn: ['Random', 'Lists', 'Grouping'],
    load: () => import('../components/LuckyPickerTool')
  },
  {
    id: 'seatmanager', icon: '🪑', category: 'management', access: 'pro', requiresText: false,
    titleZh: '座位管理工具', titleEn: 'Seat Manager',
    descriptionZh: '创建班级座位表，支持拖拽换座和 PDF 导出',
    descriptionEn: 'Create seating charts with drag-and-drop and PDF export',
    tagsZh: ['座位管理', '班级名单', 'PDF'], tagsEn: ['Seating', 'Class Lists', 'PDF'],
    load: () => import('../components/SeatManagerTool')
  }
];

export const toolsConfig = Object.fromEntries(tools.map(tool => [tool.id, tool]));

export const getToolById = id => toolsConfig[id] || null;
export const getToolsByCategory = category => tools.filter(tool => tool.category === category);

export const getToolsByAccess = accessLevel => tools.filter(tool => {
  if (accessLevel === 'school') return true;
  if (accessLevel === 'pro') return tool.access !== 'school';
  return tool.access === 'free' || tool.access === 'limited_free';
});

export const getToolBadge = (toolId, lang = 'zh') => {
  const tool = getToolById(toolId);
  if (!tool) return '';
  if (tool.access === 'pro') return 'PRO';
  if (tool.access === 'school') return 'SCHOOL';
  if (tool.access === 'limited_free') return lang === 'zh' ? '限时免费' : 'FREE';
  return lang === 'zh' ? '免费' : 'FREE';
};

export default toolsConfig;
