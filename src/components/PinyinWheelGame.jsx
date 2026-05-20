import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './PinyinWheelGame.css';

/**
 * 拼音大转盘游戏组件
 * 三层圆形转盘样式，内置合法普语音节库
 */

// 合法普通话拼音音节库（按声母分组）
const PINYIN_SYLLABLES = {
  '': ['a', 'o', 'e', 'i', 'u', 'ü', 'er', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'],
  'b': ['ba', 'bo', 'bai', 'bei', 'bao', 'bou', 'bie', 'ban', 'ben', 'bin', 'bun', 'bang', 'beng', 'bing'],
  'p': ['pa', 'po', 'pai', 'pei', 'pao', 'pou', 'pie', 'pan', 'pen', 'pin', 'pun', 'pang', 'peng', 'ping'],
  'm': ['ma', 'mo', 'me', 'mai', 'mei', 'mao', 'mou', 'mie', 'miu', 'man', 'men', 'min', 'mun', 'mang', 'meng', 'ming'],
  'f': ['fa', 'fo', 'fei', 'fou', 'fao', 'fan', 'fen', 'fun', 'fang', 'feng'],
  'd': ['da', 'do', 'dai', 'dei', 'dao', 'dou', 'die', 'diu', 'dan', 'den', 'din', 'dun', 'dang', 'deng', 'ding'],
  't': ['ta', 'to', 'tai', 'tei', 'tao', 'tou', 'tie', 'tiu', 'tan', 'ten', 'tin', 'tun', 'tang', 'teng', 'ting'],
  'n': ['na', 'no', 'nai', 'nei', 'nao', 'nou', 'nie', 'niu', 'nan', 'nen', 'nin', 'nun', 'nang', 'neng', 'ning'],
  'l': ['la', 'lo', 'lai', 'lei', 'lao', 'lou', 'lie', 'liu', 'lan', 'len', 'lin', 'lun', 'lang', 'leng', 'ling'],
  'g': ['ga', 'go', 'gai', 'gei', 'gao', 'gou', 'gie', 'gan', 'gen', 'gin', 'gun', 'gang', 'geng', 'ging'],
  'k': ['ka', 'ko', 'kai', 'kei', 'kao', 'kou', 'kie', 'kan', 'ken', 'kin', 'kun', 'kang', 'keng', 'king'],
  'h': ['ha', 'ho', 'hai', 'hei', 'hao', 'hou', 'hie', 'han', 'hen', 'hin', 'hun', 'hang', 'heng', 'hing'],
  'j': ['jia', 'jie', 'jiao', 'jou', 'jiu', 'jian', 'jin', 'jun', 'jiang', 'jing'],
  'q': ['qia', 'qie', 'qiao', 'qou', 'qiu', 'qian', 'qin', 'qun', 'qiang', 'qing'],
  'x': ['xia', 'xie', 'xiao', 'xou', 'xiu', 'xian', 'xin', 'xun', 'xiang', 'xing'],
  'zh': ['zha', 'zhe', 'zhai', 'zhei', 'zhao', 'zhou', 'zhua', 'zhuo', 'zhuai', 'zhan', 'zhen', 'zhun', 'zhang', 'zheng', 'zhong'],
  'ch': ['cha', 'che', 'chai', 'chei', 'chao', 'chou', 'chua', 'chuo', 'chuai', 'chan', 'chen', 'chun', 'chang', 'cheng', 'chong'],
  'sh': ['sha', 'she', 'shai', 'shei', 'shao', 'shou', 'shua', 'shuo', 'shuai', 'shan', 'shen', 'shun', 'shang', 'sheng', 'shong'],
  'r': ['ra', 're', 'rai', 'rei', 'rao', 'rou', 'rua', 'ruo', 'ran', 'ren', 'run', 'rang', 'reng', 'rong'],
  'z': ['za', 'ze', 'zai', 'zei', 'zao', 'zou', 'zua', 'zuo', 'zan', 'zen', 'zun', 'zang', 'zeng', 'zong'],
  'c': ['ca', 'ce', 'cai', 'cei', 'cao', 'cou', 'cua', 'cuo', 'can', 'cen', 'cun', 'cang', 'ceng', 'cong'],
  's': ['sa', 'se', 'sai', 'sei', 'sao', 'sou', 'sua', 'suo', 'san', 'sen', 'sun', 'sang', 'seng', 'song']
};

// 展开为全部合法音节数组
const ALL_SYLLABLES = [];
Object.entries(PINYIN_SYLLABLES).forEach(([initial, finals]) => {
  finals.forEach(final => {
    ALL_SYLLABLES.push({ initial, final });
  });
});

// 声调配置
const TONES = [
  { name: '第一声', mark: '¯', value: 1 },
  { name: '第二声', mark: '´', value: 2 },
  { name: '第三声', mark: 'ˇ', value: 3 },
  { name: '第四声', mark: '`', value: 4 }
];

// 带声调元音映射
const TONE_MARKS = {
  a: ['ā', 'á', 'ǎ', 'à'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ']
};

function addToneMark(finalChar, tone) {
  if (!finalChar) return '';
  const toneIndex = tone - 1;

  if (finalChar.includes('a')) return finalChar.replace('a', TONE_MARKS.a[toneIndex]);
  if (finalChar.includes('o')) return finalChar.replace('o', TONE_MARKS.o[toneIndex]);
  if (finalChar.includes('e')) return finalChar.replace('e', TONE_MARKS.e[toneIndex]);
  if (finalChar === 'iu') return 'i' + TONE_MARKS.u[toneIndex];
  if (finalChar === 'ui') return TONE_MARKS.i[toneIndex] + 'u';

  const vowels = ['ü', 'u', 'i'];
  for (const vowel of vowels) {
    if (finalChar.includes(vowel)) {
      const markedVowel = TONE_MARKS[vowel][toneIndex];
      const lastIndex = finalChar.lastIndexOf(vowel);
      return finalChar.slice(0, lastIndex) + markedVowel + finalChar.slice(lastIndex + 1);
    }
  }
  return finalChar;
}

function generateFullPinyin(initial, finalChar, tone) {
  let markedFinal = addToneMark(finalChar, tone);

  // j q x 后面的 ü 写成 u
  if (['j', 'q', 'x'].includes(initial) && markedFinal.includes('ü')) {
    markedFinal = markedFinal.replace(/ü[̄́̌̀]?/g, (match) => {
      const toneVal = TONE_MARKS.ü.indexOf(match);
      return toneVal >= 0 ? TONE_MARKS.u[toneVal] : 'u';
    });
  }

  return initial + markedFinal;
}

function PinyinWheelGame() {
  const { lang } = useLanguage();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [rotation, setRotation] = useState({ initial: 0, final: 0, tone: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const spinRef = useRef(null);

  // 获取所有声母列表（用于转盘显示）
  const allInitials = Object.keys(PINYIN_SYLLABLES).filter(i => i !== '');

  // 获取随机音节
  const getRandomSyllable = useCallback(() => {
    const idx = Math.floor(Math.random() * ALL_SYLLABLES.length);
    return ALL_SYLLABLES[idx];
  }, []);

  // 开始转动
  const startSpin = useCallback(() => {
    if (spinning) return;

    setSpinning(true);
    setShowResult(false);
    setResult(null);

    // 随机选择目标
    const syllable = getRandomSyllable();
    const tone = TONES[Math.floor(Math.random() * TONES.length)];

    // 动画
    const spinDuration = 2000;
    const startTime = Date.now();

    spinRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      // 随机添加旋转
      setRotation({
        initial: easeOut * (360 * 3 + Math.random() * 60),
        final: easeOut * (360 * 3 + Math.random() * 60),
        tone: easeOut * (360 * 4 + Math.random() * 90)
      });

      if (progress >= 1) {
        clearInterval(spinRef.current);

        const fullPinyin = generateFullPinyin(syllable.initial, syllable.final, tone.value);

        setResult({
          initial: syllable.initial || (lang === 'zh' ? '无' : 'none'),
          final: syllable.final,
          tone: tone,
          fullPinyin: fullPinyin,
          displayFinal: ['j', 'q', 'x'].includes(syllable.initial)
            ? syllable.final.replace('ü', 'ü')
            : syllable.final
        });

        setRotation({
          initial: 0,
          final: 0,
          tone: 0
        });

        setSpinning(false);
        setShowResult(true);
      }
    }, 25);
  }, [spinning, getRandomSyllable, lang]);

  // 朗读
  const speakPinyin = useCallback(() => {
    if (!result?.fullPinyin || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(result.fullPinyin);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.7;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [result]);

  // 重置
  const resetGame = useCallback(() => {
    if (spinRef.current) clearInterval(spinRef.current);
    setSpinning(false);
    setResult(null);
    setShowResult(false);
    setRotation({ initial: 0, final: 0, tone: 0 });
    window.speechSynthesis?.cancel();
  }, []);

  return (
    <div className="pinyin-wheel-page">
      <div className="pw-header">
        <h1>🎡 拼音大转盘</h1>
        <p>{lang === 'zh' ? '点击开始，随机生成合法的普通话拼音' : 'Click start to generate valid Mandarin pinyin'}</p>
      </div>

      {/* 三层转盘 */}
      <div className="pw-wheel-container">
        {/* 红色指针 */}
        <div className="pw-pointer">▼</div>

        {/* 外圈 - 声母 */}
        <div className="pw-wheel pw-wheel-outer" style={{ transform: `rotate(${rotation.initial}deg)` }}>
          <div className="pw-wheel-label">{lang === 'zh' ? '声母' : 'Initial'}</div>
          {allInitials.map((initial, idx) => (
            <div
              key={initial}
              className="pw-wheel-item"
              style={{ transform: `rotate(${idx * (360 / allInitials.length)}deg) translateY(-100px)` }}
            >
              {initial}
            </div>
          ))}
        </div>

        {/* 中圈 - 韵母 */}
        <div className="pw-wheel pw-wheel-middle" style={{ transform: `rotate(${rotation.final}deg)` }}>
          <div className="pw-wheel-label">{lang === 'zh' ? '韵母' : 'Final'}</div>
          {[...new Set(ALL_SYLLABLES.map(s => s.final))].slice(0, 24).map((final, idx) => (
            <div
              key={final}
              className="pw-wheel-item small"
              style={{ transform: `rotate(${idx * (360 / 24)}deg) translateY(-72px)` }}
            >
              {final}
            </div>
          ))}
        </div>

        {/* 内圈 - 声调 */}
        <div className="pw-wheel pw-wheel-inner" style={{ transform: `rotate(${rotation.tone}deg)` }}>
          {TONES.map((tone, idx) => (
            <div
              key={tone.value}
              className="pw-wheel-item tone"
              style={{ transform: `rotate(${idx * 90}deg) translateY(-42px)` }}
            >
              {tone.mark}
            </div>
          ))}
        </div>

        {/* 中心按钮 */}
        <button
          className="pw-center-btn"
          onClick={startSpin}
          disabled={spinning}
        >
          {spinning ? '🎯' : (lang === 'zh' ? '开始' : 'Start')}
        </button>
      </div>

      {/* 结果卡片 */}
      {showResult && result && (
        <div className="pw-result-card">
          <div className="pw-result-grid">
            <div className="pw-result-item">
              <span className="pw-result-label">{lang === 'zh' ? '声母' : 'Initial'}</span>
              <span className="pw-result-value">{result.initial}</span>
            </div>
            <div className="pw-result-item">
              <span className="pw-result-label">{lang === 'zh' ? '韵母' : 'Final'}</span>
              <span className="pw-result-value">{result.displayFinal}</span>
            </div>
            <div className="pw-result-item">
              <span className="pw-result-label">{lang === 'zh' ? '声调' : 'Tone'}</span>
              <span className="pw-result-value">{lang === 'zh' ? result.tone.name : `Tone ${result.tone.value}`}</span>
            </div>
          </div>
          <div className="pw-result-full">
            <span>{result.fullPinyin}</span>
          </div>
          <div className="pw-result-actions">
            <button className="pw-speak-btn" onClick={speakPinyin} disabled={isSpeaking}>
              🔊 {isSpeaking ? (lang === 'zh' ? '朗读中...' : 'Reading...') : (lang === 'zh' ? '朗读' : 'Speak')}
            </button>
            <button className="pw-again-btn" onClick={startSpin}>
              {lang === 'zh' ? '再来一次' : 'Again'}
            </button>
            <button className="pw-reset-btn" onClick={resetGame}>
              {lang === 'zh' ? '重置' : 'Reset'}
            </button>
          </div>
        </div>
      )}

      {!showResult && !spinning && (
        <div className="pw-hint">
          {lang === 'zh' ? '点击"开始"按钮开始游戏' : 'Click "Start" to begin'}
        </div>
      )}
    </div>
  );
}

export default PinyinWheelGame;