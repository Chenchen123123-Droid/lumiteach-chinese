/**
 * 文本处理工具函数
 * 用于中文课文的分词、隐藏、打乱等操作
 *
 * 扩展预留：
 * - 可添加拼音标注功能
 * - 可添加词性分析
 * - 可添加关键词提取
 */

/**
 * 简单中文分词
 * 按标点符号切分，如果没有标点则按每1-2字切分
 * @param {string} text - 输入文本
 * @returns {string[]} 分词结果数组
 */
export function simpleTokenize(text) {
  if (!text || typeof text !== 'string') return [];

  // 先按标点符号切分
  const punctuation = /[，。！？、；：""''（）《》【】\s,\.!?;:'"()\[\]]+/;
  let tokens = text.split(punctuation).filter(t => t.trim());

  // 如果切分结果太少，按字符切分
  if (tokens.length <= 1) {
    tokens = [];
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      // 跳过标点和空格
      if (punctuation.test(char)) continue;

      // 尝试组合2字词
      if (i < text.length - 1 && !punctuation.test(text[i + 1])) {
        tokens.push(text.slice(i, i + 2));
        i++; // 跳过下一个字符
      } else {
        tokens.push(char);
      }
    }
  }

  return tokens.filter(t => t.trim());
}

/**
 * 从文本中提取词语
 * 简单规则：提取2-4字的连续汉字
 * @param {string} text - 输入文本
 * @param {number} count - 需要提取的词语数量
 * @returns {string[]} 提取的词语数组
 */
export function extractWords(text, count = 6) {
  if (!text || typeof text !== 'string') return [];

  // 匹配2-4个连续汉字
  const chineseWordPattern = /[一-龥]{2,4}/g;
  const matches = text.match(chineseWordPattern) || [];

  // 去重并限制数量
  const uniqueWords = [...new Set(matches)];
  return uniqueWords.slice(0, count);
}

/**
 * 生成隐藏文本
 * @param {string} text - 原始文本
 * @param {number} hidePercent - 隐藏百分比 (0-100)
 * @returns {Object} 包含处理后的文本和隐藏位置信息
 */
export function hideText(text, hidePercent = 0) {
  if (!text || hidePercent === 0) {
    return { displayText: text, hiddenIndices: [] };
  }

  // 分词
  const tokens = simpleTokenize(text);
  const totalTokens = tokens.length;

  if (totalTokens === 0) {
    return { displayText: text, hiddenIndices: [] };
  }

  // 计算需要隐藏的词语数量
  const hideCount = Math.ceil(totalTokens * hidePercent / 100);

  // 随机选择要隐藏的词语索引
  const indices = Array.from({ length: totalTokens }, (_, i) => i);
  const shuffled = indices.sort(() => Math.random() - 0.5);
  const hiddenIndices = shuffled.slice(0, hideCount).sort((a, b) => a - b);

  // 构建显示文本
  let displayText = text;
  let offset = 0;

  hiddenIndices.forEach(tokenIndex => {
    const token = tokens[tokenIndex];
    const index = text.indexOf(token, offset);

    if (index !== -1) {
      const hidden = '____';
      displayText = displayText.slice(0, index) + hidden + displayText.slice(index + token.length);
      offset = index + hidden.length;
    }
  });

  return { displayText, hiddenIndices };
}

/**
 * 打乱数组顺序
 * @param {Array} array - 原始数组
 * @returns {Array} 打乱后的新数组
 */
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 生成拼音占位符
 * 扩展预留：后续可接入拼音库
 * @param {string} word - 中文词语
 * @returns {string} 拼音占位符
 */
export function generatePinyinPlaceholder(word) {
  return `(${word} 拼音)`;
}

/**
 * 生成解释占位符
 * 扩展预留：后续可接入翻译API
 * @param {string} word - 中文词语
 * @returns {string} 解释占位符
 */
export function generateMeaningPlaceholder(word) {
  return `${word}的解释`;
}

/**
 * 按句子切分文本
 * @param {string} text - 输入文本
 * @returns {string[]} 句子数组
 */
export function splitIntoSentences(text) {
  if (!text) return [];

  // 按中文句号、感叹号、问号切分
  const sentences = text.split(/[。！？.!?]+/).filter(s => s.trim());
  return sentences.map(s => s.trim());
}

/**
 * 创建句子卡片
 * 将句子切分成可排序的片段
 * @param {string} sentence - 输入句子
 * @returns {Object[]} 卡片数组，每个卡片包含 id, text, originalIndex
 */
export function createSentenceCards(sentence) {
  if (!sentence) return [];

  // 先尝试按逗号切分
  let parts = sentence.split(/[，,、]/).filter(p => p.trim());

  // 如果切分结果太少，按词语切分
  if (parts.length < 3) {
    parts = simpleTokenize(sentence);
  }

  return parts.map((text, index) => ({
    id: `card-${index}`,
    text: text.trim(),
    originalIndex: index
  }));
}

/**
 * 检查句子排序是否正确
 * @param {Object[]} cards - 卡片数组
 * @returns {boolean} 是否正确
 */
export function checkSentenceOrder(cards) {
  return cards.every((card, index) => card.originalIndex === index);
}
