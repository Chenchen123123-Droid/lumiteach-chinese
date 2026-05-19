/**
 * 弹弓大作战 - 内置词库
 * 用于智能模板出题
 */

export const slingshotQuestionBanks = {
  transportation: [
    { chinese: '飞机', pinyin: 'fēi jī', english: 'airplane' },
    { chinese: '出租车', pinyin: 'chū zū chē', english: 'taxi' },
    { chinese: '公共汽车', pinyin: 'gōng gòng qì chē', english: 'bus' },
    { chinese: '自行车', pinyin: 'zì xíng chē', english: 'bicycle' },
    { chinese: '地铁', pinyin: 'dì tiě', english: 'subway' },
    { chinese: '火车', pinyin: 'huǒ chē', english: 'train' },
    { chinese: '船', pinyin: 'chuán', english: 'boat/ship' },
    { chinese: '摩托车', pinyin: 'mó tuō chē', english: 'motorcycle' }
  ],
  fruits: [
    { chinese: '苹果', pinyin: 'píng guǒ', english: 'apple' },
    { chinese: '香蕉', pinyin: 'xiāng jiāo', english: 'banana' },
    { chinese: '西瓜', pinyin: 'xī guā', english: 'watermelon' },
    { chinese: '葡萄', pinyin: 'pú táo', english: 'grape' },
    { chinese: '草莓', pinyin: 'cǎo méi', english: 'strawberry' },
    { chinese: '橙子', pinyin: 'chéng zi', english: 'orange' },
    { chinese: '梨', pinyin: 'lí', english: 'pear' },
    { chinese: '桃子', pinyin: 'táo zi', english: 'peach' }
  ],
  weather: [
    { chinese: '天气', pinyin: 'tiān qì', english: 'weather' },
    { chinese: '下雨', pinyin: 'xià yǔ', english: 'rain' },
    { chinese: '下雪', pinyin: 'xià xuě', english: 'snow' },
    { chinese: '热', pinyin: 'rè', english: 'hot' },
    { chinese: '冷', pinyin: 'lěng', english: 'cold' },
    { chinese: '风', pinyin: 'fēng', english: 'wind' },
    { chinese: '云', pinyin: 'yún', english: 'cloud' },
    { chinese: '晴天', pinyin: 'qíng tiān', english: 'sunny day' }
  ],
  classroom: [
    { chinese: '老师', pinyin: 'lǎo shī', english: 'teacher' },
    { chinese: '学生', pinyin: 'xué shēng', english: 'student' },
    { chinese: '学校', pinyin: 'xué xiào', english: 'school' },
    { chinese: '教室', pinyin: 'jiào shì', english: 'classroom' },
    { chinese: '书', pinyin: 'shū', english: 'book' },
    { chinese: '笔', pinyin: 'bǐ', english: 'pen' },
    { chinese: '桌子', pinyin: 'zhuō zi', english: 'desk' },
    { chinese: '椅子', pinyin: 'yǐ zi', english: 'chair' }
  ],
  animals: [
    { chinese: '狗', pinyin: 'gǒu', english: 'dog' },
    { chinese: '猫', pinyin: 'māo', english: 'cat' },
    { chinese: '鸟', pinyin: 'niǎo', english: 'bird' },
    { chinese: '鱼', pinyin: 'yú', english: 'fish' },
    { chinese: '兔子', pinyin: 'tù zi', english: 'rabbit' },
    { chinese: '熊猫', pinyin: 'xióng māo', english: 'panda' },
    { chinese: '大象', pinyin: 'dà xiàng', english: 'elephant' },
    { chinese: '老虎', pinyin: 'lǎo hǔ', english: 'tiger' }
  ],
  colors: [
    { chinese: '红色', pinyin: 'hóng sè', english: 'red' },
    { chinese: '蓝色', pinyin: 'lán sè', english: 'blue' },
    { chinese: '绿色', pinyin: 'lǜ sè', english: 'green' },
    { chinese: '黄色', pinyin: 'huáng sè', english: 'yellow' },
    { chinese: '白色', pinyin: 'bái sè', english: 'white' },
    { chinese: '黑色', pinyin: 'hēi sè', english: 'black' },
    { chinese: '紫色', pinyin: 'zǐ sè', english: 'purple' },
    { chinese: '橙色', pinyin: 'chéng sè', english: 'orange' }
  ],
  numbers: [
    { chinese: '一', pinyin: 'yī', english: 'one' },
    { chinese: '二', pinyin: 'èr', english: 'two' },
    { chinese: '三', pinyin: 'sān', english: 'three' },
    { chinese: '四', pinyin: 'sì', english: 'four' },
    { chinese: '五', pinyin: 'wǔ', english: 'five' },
    { chinese: '六', pinyin: 'liù', english: 'six' },
    { chinese: '七', pinyin: 'qī', english: 'seven' },
    { chinese: '八', pinyin: 'bā', english: 'eight' },
    { chinese: '九', pinyin: 'jiǔ', english: 'nine' },
    { chinese: '十', pinyin: 'shí', english: 'ten' }
  ],
  family: [
    { chinese: '爸爸', pinyin: 'bà ba', english: 'father' },
    { chinese: '妈妈', pinyin: 'mā ma', english: 'mother' },
    { chinese: '哥哥', pinyin: 'gē ge', english: 'older brother' },
    { chinese: '姐姐', pinyin: 'jiě jie', english: 'older sister' },
    { chinese: '弟弟', pinyin: 'dì di', english: 'younger brother' },
    { chinese: '妹妹', pinyin: 'mèi mei', english: 'younger sister' },
    { chinese: '爷爷', pinyin: 'yé ye', english: 'grandfather' },
    { chinese: '奶奶', pinyin: 'nǎi nai', english: 'grandmother' }
  ]
};

// 中文主题到词库的映射
export const topicMapping = {
  '交通工具': 'transportation',
  '交通': 'transportation',
  'transportation': 'transportation',
  '水果': 'fruits',
  'fruits': 'fruits',
  '天气': 'weather',
  'weather': 'weather',
  '课堂': 'classroom',
  '学校': 'classroom',
  'classroom': 'classroom',
  '动物': 'animals',
  'animals': 'animals',
  '颜色': 'colors',
  'colors': 'colors',
  '数字': 'numbers',
  'numbers': 'numbers',
  '家庭': 'family',
  'family': 'family'
};

// 根据主题获取词库
export const getWordBank = (topic) => {
  const key = topicMapping[topic] || topic;
  return slingshotQuestionBanks[key] || slingshotQuestionBanks.classroom;
};

// 获取所有可用主题
export const getAvailableTopics = () => {
  return Object.keys(topicMapping).filter((_, i, arr) => arr.indexOf(_) === i);
};