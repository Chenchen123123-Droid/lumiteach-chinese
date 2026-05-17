/**
 * 统一词语解析工具
 * 用于所有词汇类工具的标准输入解析
 */

/**
 * 解析词语输入为标准格式
 * @param {string} text - 用户输入的文本
 * @returns {Array} 标准格式的词条数组
 */
export function parseWordEntries(text) {
  if (!text || !text.trim()) {
    return [];
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const result = [];
  const seen = new Set();

  lines.forEach((line, idx) => {
    let chinese = '', pinyin = '', meaning = '';

    // 检查是否包含分隔符
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      chinese = parts[0] || '';
      pinyin = parts[1] || '';
      meaning = parts[2] || '';
    } else if (line.includes(' ')) {
      // 空格分隔，视为多个独立词语
      const words = line.split(/\s+/).filter(w => w);
      words.forEach((word, wordIdx) => {
        if (!seen.has(word)) {
          seen.add(word);
          result.push({
            id: `entry_${idx}_${wordIdx}`,
            chinese: word,
            pinyin: '',
            meaning: '',
            raw: word
          });
        }
      });
      return;
    } else {
      // 只有中文
      chinese = line;
    }

    if (chinese && !seen.has(chinese)) {
      seen.add(chinese);
      result.push({
        id: `entry_${idx}`,
        chinese,
        pinyin,
        meaning,
        raw: line
      });
    }
  });

  return result;
}

/**
 * 从词库中随机抽取指定数量
 * @param {Array} entries - 词条数组
 * @param {number} count - 抽取数量
 * @returns {Array} 抽取后的词条数组
 */
export function pickRandomEntries(entries, count) {
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * 根据配对模式过滤词条
 * @param {Array} entries - 词条数组
 * @param {string} mode - 配对模式
 * @returns {Array} 过滤后的词条数组
 */
export function filterEntriesByMode(entries, mode) {
  return entries.filter(entry => {
    switch (mode) {
      case 'chinese-pinyin':
        return entry.chinese && entry.pinyin;
      case 'chinese-english':
        return entry.chinese && entry.meaning;
      case 'pinyin-english':
        return entry.pinyin && entry.meaning;
      default:
        return true;
    }
  });
}

/**
 * 获取显示文本
 * @param {Object} entry - 词条对象
 * @param {string} type - 显示类型
 * @returns {string} 显示文本
 */
export function getDisplayText(entry, type) {
  switch (type) {
    case 'chinese':
      return entry.chinese;
    case 'pinyin':
      return entry.pinyin;
    case 'english':
    case 'meaning':
      return entry.meaning;
    case 'full':
      return entry.meaning ? `${entry.chinese} (${entry.pinyin}) ${entry.meaning}` : entry.chinese;
    default:
      return entry.chinese;
  }
}

/**
 * 打乱数组顺序
 * @param {Array} array - 要打乱的数组
 * @returns {Array} 打乱后的新数组
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default {
  parseWordEntries,
  pickRandomEntries,
  filterEntriesByMode,
  getDisplayText,
  shuffleArray
};
