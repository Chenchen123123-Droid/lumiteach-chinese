import React, { useState, useCallback, useRef } from 'react';
import './PinyinWheelGame.css';

/**
 * 拼音大转盘游戏组件
 * 功能：随机生成声母、韵母、声调组合，学生练习拼音发音
 */

// 声母列表（21个）
const INITIALS = [
  'b', 'p', 'm', 'f',
  'd', 't', 'n', 'l',
  'g', 'k', 'h',
  'j', 'q', 'x',
  'zh', 'ch', 'sh', 'r',
  'z', 'c', 's'
];

// 韵母列表（24个，按单韵母、复韵母、鼻韵母分组）
const FINALS = [
  // 单韵母（6个）
  'a', 'o', 'e', 'i', 'u', 'ü',
  // 复韵母（9个）
  'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er',
  // 前鼻韵母（5个）
  'an', 'en', 'in', 'un', 'ün',
  // 后鼻韵母（4个）
  'ang', 'eng', 'ing', 'ong'
];

// 声调配置（4个声调，不含轻声）
const TONES = [
  { name: '第一声', mark: '¯', value: 1 },
  { name: '第二声', mark: '´', value: 2 },
  { name: '第三声', mark: 'ˇ', value: 3 },
  { name: '第四声', mark: '`', value: 4 }
];

// 带声调元音映射表
const TONE_MARKS = {
  a: ['ā', 'á', 'ǎ', 'à'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ']
};

/**
 * 将韵母添加声调符号
 * @param {string} finalChar - 韵母
 * @param {number} tone - 声调值 (1-4)
 * @returns {string} 带声调的韵母
 */
function addToneMark(finalChar, tone) {
  const toneIndex = tone - 1; // 0-3 对应四个声调

  // 声调标在主要元音上的规则：
  // 1. 有 a 标 a
  if (finalChar.includes('a')) {
    return finalChar.replace('a', TONE_MARKS.a[toneIndex]);
  }
  // 2. 没有 a，有 o 标 o
  if (finalChar.includes('o')) {
    return finalChar.replace('o', TONE_MARKS.o[toneIndex]);
  }
  // 3. 没有 a/o，有 e 标 e
  if (finalChar.includes('e')) {
    return finalChar.replace('e', TONE_MARKS.e[toneIndex]);
  }
  // 4. iu 标在 u 上
  if (finalChar === 'iu') {
    return 'i' + TONE_MARKS.u[toneIndex];
  }
  // 5. ui 标在 i 上
  if (finalChar === 'ui') {
    return TONE_MARKS.i[toneIndex] + 'u';
  }
  // 6. 其他情况标在最后一个元音上
  const vowels = ['ü', 'u', 'i'];
  for (const vowel of vowels) {
    if (finalChar.includes(vowel)) {
      const markedVowel = TONE_MARKS[vowel][toneIndex];
      // 替换最后一个出现的该元音
      const lastIndex = finalChar.lastIndexOf(vowel);
      return finalChar.slice(0, lastIndex) + markedVowel + finalChar.slice(lastIndex + 1);
    }
  }

  return finalChar;
}

/**
 * 生成完整拼音
 * @param {string} initial - 声母
 * @param {string} finalChar - 韵母
 * @param {number} tone - 声调值
 * @returns {string} 完整拼音
 */
function generatePinyin(initial, finalChar, tone) {
  const markedFinal = addToneMark(finalChar, tone);
  // 特殊处理：j, q, x 后面的 ü 写成 u
  if (['j', 'q', 'x'].includes(initial) && markedFinal.includes('ü')) {
    return initial + markedFinal.replace(/ü[̄́̌̀]?/g, (match) => {
      const toneVal = TONE_MARKS.ü.indexOf(match);
      if (toneVal >= 0) {
        return TONE_MARKS.u[toneVal];
      }
      return 'u';
    });
  }
  return initial + markedFinal;
}

function PinyinWheelGame() {
  // 状态管理
  const [selectedInitial, setSelectedInitial] = useState(null);
  const [selectedFinal, setSelectedFinal] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);
  const [currentPinyin, setCurrentPinyin] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('点击"开始"转动转盘');
  const [rotation, setRotation] = useState({ initial: 0, final: 0, tone: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const spinIntervalRef = useRef(null);

  // 随机选择元素
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 开始转动
  const startSpin = useCallback(() => {
    if (spinning) return;

    setSpinning(true);
    setMessage('转动中...');
    setSelectedInitial(null);
    setSelectedFinal(null);
    setSelectedTone(null);
    setCurrentPinyin('');

    // 动画：快速切换显示
    let count = 0;
    const maxCount = 20;

    spinIntervalRef.current = setInterval(() => {
      setSelectedInitial(getRandomItem(INITIALS));
      setSelectedFinal(getRandomItem(FINALS));
      setSelectedTone(getRandomItem(TONES));
      setRotation({
        initial: Math.random() * 360,
        final: Math.random() * 360,
        tone: Math.random() * 360
      });
      count++;

      if (count >= maxCount) {
        clearInterval(spinIntervalRef.current);

        // 最终结果
        const finalInitial = getRandomItem(INITIALS);
        const finalFinal = getRandomItem(FINALS);
        const finalTone = getRandomItem(TONES);

        setSelectedInitial(finalInitial);
        setSelectedFinal(finalFinal);
        setSelectedTone(finalTone);

        // 生成拼音
        const pinyin = generatePinyin(finalInitial, finalFinal, finalTone.value);
        setCurrentPinyin(pinyin);

        setSpinning(false);
        setMessage('');
      }
    }, 80);
  }, [spinning]);

  // 朗读拼音
  const speakPinyin = useCallback(() => {
    if (!currentPinyin) {
      setMessage('请先点击"开始"生成拼音');
      return;
    }

    if (!('speechSynthesis' in window)) {
      setMessage('当前浏览器不支持朗读功能');
      return;
    }

    // 取消之前的朗读
    window.speechSynthesis.cancel();

    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(currentPinyin);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.75;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setMessage('朗读出错，请重试');
    };

    window.speechSynthesis.speak(utterance);

    // 注意：浏览器 speechSynthesis 对拼音读音可能不完全标准
    // 后续可以替换成标准拼音音频库
  }, [currentPinyin]);

  // 重置游戏
  const resetGame = useCallback(() => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }
    setSelectedInitial(null);
    setSelectedFinal(null);
    setSelectedTone(null);
    setCurrentPinyin('');
    setSpinning(false);
    setMessage('点击"开始"转动转盘');
    setRotation({ initial: 0, final: 0, tone: 0 });
    window.speechSynthesis.cancel();
  }, []);

  // 获取当前声调显示
  const getToneDisplay = () => {
    if (!selectedTone) return '-';
    return selectedTone.mark;
  };

  return (
    <div className="pinyin-wheel-game">
      {/* 游戏标题和说明 */}
      <div className="pw-header">
        <h2 className="pw-title">🎡 拼音大转盘</h2>
        <p className="pw-description">
          点击开始，随机生成声母、韵母和声调。学生读出拼音后，可以点击喇叭听读音。
        </p>
      </div>

      {/* 转盘区域 */}
      <div className="pw-wheel-area">
        {/* 指针 */}
        <div className="pw-pointer">▼</div>

        {/* 三层转盘 */}
        <div className="pw-wheels-container">
          {/* 声母转盘 - 外圈 */}
          <div
            className="pw-wheel pw-wheel-initial"
            style={{ transform: `rotate(${rotation.initial}deg)` }}
          >
            <div className="pw-wheel-label">声母</div>
            <div className="pw-wheel-ring">
              {INITIALS.slice(0, 12).map((item, index) => (
                <div
                  key={index}
                  className="pw-wheel-item"
                  style={{ transform: `rotate(${index * 30}deg) translateX(140px)` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 韵母转盘 - 中圈 */}
          <div
            className="pw-wheel pw-wheel-final"
            style={{ transform: `rotate(${rotation.final}deg)` }}
          >
            <div className="pw-wheel-label">韵母</div>
            <div className="pw-wheel-ring">
              {FINALS.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  className="pw-wheel-item"
                  style={{ transform: `rotate(${index * 36}deg) translateX(95px)` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 声调转盘 - 内圈 */}
          <div
            className="pw-wheel pw-wheel-tone"
            style={{ transform: `rotate(${rotation.tone}deg)` }}
          >
            <div className="pw-wheel-label">声调</div>
            <div className="pw-wheel-ring">
              {TONES.map((item, index) => (
                <div
                  key={index}
                  className="pw-wheel-item"
                  style={{ transform: `rotate(${index * 72}deg) translateX(50px)` }}
                >
                  {item.mark}
                </div>
              ))}
            </div>
          </div>

          {/* 中心按钮 */}
          <button
            className={`pw-center-btn ${spinning ? 'spinning' : ''}`}
            onClick={startSpin}
            disabled={spinning}
          >
            {spinning ? '转动中...' : '开始'}
          </button>
        </div>
      </div>

      {/* 结果展示区 */}
      <div className="pw-result-area">
        <div className="pw-result-cards">
          <div className="pw-result-card pw-card-initial">
            <div className="pw-card-label">声母</div>
            <div className="pw-card-value">{selectedInitial || '-'}</div>
          </div>
          <div className="pw-result-card pw-card-final">
            <div className="pw-card-label">韵母</div>
            <div className="pw-card-value">{selectedFinal || '-'}</div>
          </div>
          <div className="pw-result-card pw-card-tone">
            <div className="pw-card-label">声调</div>
            <div className="pw-card-value">{getToneDisplay()}</div>
          </div>
        </div>

        {/* 组合结果 */}
        {currentPinyin && (
          <div className="pw-pinyin-result">
            <div className="pw-pinyin-label">组合结果</div>
            <div className="pw-pinyin-value">{currentPinyin}</div>
          </div>
        )}
      </div>

      {/* 提示信息 */}
      {message && (
        <div className="pw-message">{message}</div>
      )}

      {/* 操作按钮 */}
      <div className="pw-actions">
        <button
          className="pw-btn pw-btn-spin"
          onClick={startSpin}
          disabled={spinning}
        >
          {spinning ? '转动中...' : (currentPinyin ? '🔄 再转一次' : '🎯 开始')}
        </button>
        <button
          className={`pw-btn pw-btn-speak ${isSpeaking ? 'speaking' : ''}`}
          onClick={speakPinyin}
          disabled={spinning || isSpeaking}
        >
          {isSpeaking ? '🔊 正在朗读...' : '🔊 朗读'}
        </button>
        <button
          className="pw-btn pw-btn-reset"
          onClick={resetGame}
          disabled={spinning}
        >
          ↺ 重置
        </button>
      </div>

      {/* 提示 */}
      <div className="pw-tips">
        <p>💡 提示：当前为浏览器临时朗读，后续可升级为标准拼音音频。</p>
      </div>
    </div>
  );
}

export default PinyinWheelGame;
