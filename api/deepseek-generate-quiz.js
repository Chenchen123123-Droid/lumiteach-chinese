/**
 * DeepSeek AI Quiz Generation API
 * Vercel Serverless Function
 *
 * Environment variable: DEEPSEEK_API_KEY (NOT VITE_ prefixed)
 * Endpoint: POST /api/deepseek-generate-quiz
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

const SYSTEM_PROMPT = `你是一名专业对外汉语老师，擅长为中文学习者设计课堂互动题目。
你需要根据老师提供的主题、HSK等级、题目数量和题型，生成适合课堂竞赛的中文题目。
题目必须清晰、答案唯一、选项合理、难度符合指定水平。
不要生成有争议的问题。
不要生成超出指定 HSK 等级太多的词汇。
输出必须是严格 JSON。
不要输出 Markdown。
不要输出代码块。
不要输出解释文字。`;

function buildUserPrompt(topic, level, count, questionTypes) {
  const typeLabels = {
    multiple_choice: '选择题',
    true_false: '判断题',
    word_understanding: '词语理解题',
    reading_comprehension: '阅读理解题'
  };

  const typeNames = questionTypes
    .map(t => typeLabels[t] || t)
    .join('、');

  return `请生成 ${count} 道中文课堂竞赛题。

主题：${topic}
难度：${level}
题型：${typeNames}

请严格输出 JSON 数组，格式如下：

[
  {
    "type": "multiple_choice",
    "question": "题目",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "answerIndex": 0,
    "answer": "正确答案",
    "explanation": "简短解释",
    "points": 10,
    "difficulty": "${level}",
    "tags": ["主题标签"]
  }
]

要求：
1. 如果是 multiple_choice，每题必须有 4 个选项。
2. answerIndex 必须是 0、1、2、3。
3. answer 必须等于 options[answerIndex]。
4. 如果是 true_false，options 必须是 ["对", "错"]。
5. 每题 points 默认 10。
6. 题目适合对外汉语学习者。
7. 尽量使用常见词和 HSK 词汇。
8. 题干不要太长。
9. 选项不要模糊。
10. 不要输出编号。
11. 不要输出 Markdown。
12. 不要输出代码块。
13. 只输出 JSON 数组。`;
}

/**
 * Clean and parse the AI response JSON
 */
function cleanAndParseJSON(text) {
  let cleaned = text.trim();

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*/g, '');

  // Extract content between first [ and last ]
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  if (firstBracket === -1 || lastBracket === -1 || firstBracket >= lastBracket) {
    throw new Error('AI返回格式中未找到有效的JSON数组。');
  }

  cleaned = cleaned.substring(firstBracket, lastBracket + 1);

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error('AI返回的不是JSON数组。');
  }

  return parsed;
}

/**
 * Validate and normalize a single question
 */
function validateQuestion(q, index) {
  const errors = [];

  if (!q.question || typeof q.question !== 'string') {
    errors.push(`第 ${index + 1} 题缺少 question 字段`);
  }

  if (!Array.isArray(q.options) || q.options.length < 2) {
    errors.push(`第 ${index + 1} 题的 options 必须是包含至少2个选项的数组`);
  }

  if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex >= q.options.length) {
    errors.push(`第 ${index + 1} 题的 answerIndex 不合法`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Auto-fix: ensure answer matches options[answerIndex]
  const fixedAnswer = q.options[q.answerIndex];

  // Determine type
  let type = q.type;
  if (!type) {
    type = q.options.length === 2 ? 'true_false' : 'multiple_choice';
  }

  return {
    valid: true,
    question: {
      id: `q${index + 1}`,
      type,
      question: q.question,
      options: q.options,
      answerIndex: q.answerIndex,
      answer: fixedAnswer,
      explanation: q.explanation || '',
      points: q.points || 10,
      difficulty: q.difficulty || '',
      tags: Array.isArray(q.tags) ? q.tags : []
    }
  };
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  // Check API key
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'DeepSeek API Key is not configured.'
    });
  }

  // Parse request body
  const { topic, level, count, questionTypes } = req.body || {};

  if (!topic || !level || !count || !questionTypes || !Array.isArray(questionTypes) || questionTypes.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: topic, level, count, questionTypes'
    });
  }

  const numCount = parseInt(count, 10);
  if (isNaN(numCount) || numCount < 1 || numCount > 50) {
    return res.status(400).json({
      success: false,
      error: 'count must be a number between 1 and 50'
    });
  }

  try {
    // Call DeepSeek API
    const userPrompt = buildUserPrompt(topic, level, numCount, questionTypes);

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return res.status(502).json({
        success: false,
        error: `DeepSeek API returned status ${response.status}. Please try again later.`
      });
    }

    const data = await response.json();

    // Extract the text content from the response
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({
        success: false,
        error: 'DeepSeek API returned empty content.'
      });
    }

    // Clean and parse JSON
    let rawQuestions;
    try {
      rawQuestions = cleanAndParseJSON(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      return res.status(502).json({
        success: false,
        error: 'AI返回格式解析失败，请重新生成。'
      });
    }

    // Validate each question
    const validQuestions = [];
    const allErrors = [];

    rawQuestions.forEach((q, i) => {
      const result = validateQuestion(q, i);
      if (result.valid) {
        validQuestions.push(result.question);
      } else {
        allErrors.push(...result.errors);
      }
    });

    if (validQuestions.length === 0) {
      return res.status(502).json({
        success: false,
        error: allErrors.length > 0
          ? allErrors.join('; ')
          : 'AI返回的题目格式均不合法，请重新生成。'
      });
    }

    return res.status(200).json({
      success: true,
      questions: validQuestions
    });

  } catch (error) {
    console.error('Generate quiz error:', error);
    return res.status(500).json({
      success: false,
      error: 'AI生成题目失败，请稍后再试。'
    });
  }
}