import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './PinyinWheelGame.css';

// 常用且有效的普通话音节。转盘每轮只展示 12 个，避免把整张拼音表塞进一个圆盘。
const COMMON_SYLLABLES = `
a ai an ang ao ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu
ca cai can cang cao ce cen ceng cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo ci cong cou cu cuan cui cun cuo
da dai dan dang dao de deng di dian diao die ding diu dong dou du duan dui dun duo e en eng er
fa fan fang fei fen feng fo fou fu ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo
ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo
ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun
ka kai kan kang kao ke ken keng kong kou ku kua kuai kuan kuang kui kun kuo
la lai lan lang lao le lei leng li lian liang liao lie lin ling liu long lou lu luan lun luo lü lüe
ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu
na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nü nüe
o ou pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu
qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun
ran rang rao re ren reng ri rong rou ru ruan rui run ruo
sa sai san sang sao se sen seng sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo si song sou su suan sui sun suo
ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo
wa wai wan wang wei wen weng wo wu xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun
ya yan yang yao ye yi yin ying yong you yu yuan yue yun
za zai zan zang zao ze zei zen zeng zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo zi zong zou zu zuan zui zun zuo
`.trim().split(/\s+/);

const INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];
const TONES = [
  { name: '第一声', mark: 'ˉ', value: 1 },
  { name: '第二声', mark: 'ˊ', value: 2 },
  { name: '第三声', mark: 'ˇ', value: 3 },
  { name: '第四声', mark: 'ˋ', value: 4 }
];
const TONE_MARKS = {
  a: ['ā', 'á', 'ǎ', 'à'], o: ['ō', 'ó', 'ǒ', 'ò'], e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'], u: ['ū', 'ú', 'ǔ', 'ù'], ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ']
};

function splitSyllable(syllable) {
  const initial = INITIALS.find(item => syllable.startsWith(item)) || '';
  const writtenFinal = initial ? syllable.slice(initial.length) : syllable;
  const displayFinal = ['j', 'q', 'x', 'y'].includes(initial)
    ? writtenFinal.replace(/^u/, 'ü')
    : writtenFinal;
  return { base: syllable, initial, writtenFinal, displayFinal };
}

function addToneMark(finalChar, tone) {
  const index = tone - 1;
  if (finalChar.includes('a')) return finalChar.replace('a', TONE_MARKS.a[index]);
  if (finalChar.includes('o')) return finalChar.replace('o', TONE_MARKS.o[index]);
  if (finalChar.includes('e')) return finalChar.replace('e', TONE_MARKS.e[index]);
  if (finalChar === 'iu') return `i${TONE_MARKS.u[index]}`;
  if (finalChar === 'ui') return `${TONE_MARKS.i[index]}u`;
  for (const vowel of ['ü', 'u', 'i']) {
    const position = finalChar.lastIndexOf(vowel);
    if (position >= 0) return `${finalChar.slice(0, position)}${TONE_MARKS[vowel][index]}${finalChar.slice(position + 1)}`;
  }
  return finalChar;
}

function pickOptions() {
  const pool = [...COMMON_SYLLABLES];
  const options = [];
  while (options.length < 12 && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    options.push(splitSyllable(pool.splice(index, 1)[0]));
  }
  return options;
}

function PinyinWheelGame() {
  const { lang } = useLanguage();
  const [options, setOptions] = useState(pickOptions);
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const startSpin = useCallback(() => {
    if (spinning) return;
    const nextOptions = pickOptions();
    // 新一组音节本身已经随机，指针固定选中顶部，避免“指针指 A、结果却是 B”。
    const nextIndex = 0;
    const tone = TONES[Math.floor(Math.random() * TONES.length)];
    const syllable = nextOptions[nextIndex];

    setOptions(nextOptions);
    setSelectedIndex(null);
    setResult(null);
    setSpinning(true);
    setRotation(value => value + 1440 + Math.floor(Math.random() * 360));

    timerRef.current = window.setTimeout(() => {
      setSelectedIndex(nextIndex);
      setResult({
        ...syllable,
        tone,
        fullPinyin: `${syllable.initial}${addToneMark(syllable.writtenFinal, tone.value)}`
      });
      setSpinning(false);
    }, 1700);
  }, [spinning]);

  const speakPinyin = useCallback(() => {
    if (!result || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.fullPinyin);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.68;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [result]);

  const resetGame = () => {
    window.clearTimeout(timerRef.current);
    window.speechSynthesis?.cancel();
    setOptions(pickOptions());
    setSelectedIndex(null);
    setResult(null);
    setSpinning(false);
    setIsSpeaking(false);
  };

  return (
    <div className="pinyin-wheel-page">
      <header className="pw-header">
        <div>
          <span className="pw-eyebrow">PINYIN PRACTICE</span>
          <h1>拼音大转盘</h1>
          <p>{lang === 'zh' ? '每轮只显示 12 个常用音节，抽中后再拆解声母、韵母和声调。' : 'Twelve clear syllables per round, followed by a readable breakdown.'}</p>
        </div>
        <button className="pw-reset-top" onClick={resetGame}>{lang === 'zh' ? '换一组' : 'New set'}</button>
      </header>

      <div className="pw-classroom-layout">
        <section className="pw-stage" aria-label={lang === 'zh' ? '拼音转盘' : 'Pinyin wheel'}>
          <div className="pw-wheel-shell">
            <div className="pw-pointer"><span></span></div>
            <div className={`pw-wheel-disc ${spinning ? 'spinning' : ''}`} style={{ transform: `rotate(${rotation}deg)` }} />
            <div className="pw-wheel-options">
              {options.map((option, index) => {
                const angle = index * 30;
                return (
                  <div key={`${option.base}-${index}`} className={`pw-wheel-option ${selectedIndex === index ? 'selected' : ''}`} style={{ '--angle': `${angle}deg` }}>
                    <span style={{ transform: `rotate(-${angle}deg)` }}>{option.base}</span>
                  </div>
                );
              })}
            </div>
            <button className="pw-center-btn" onClick={startSpin} disabled={spinning}>
              <span>{spinning ? '…' : 'GO'}</span>
              <small>{spinning ? (lang === 'zh' ? '抽取中' : 'Spinning') : (lang === 'zh' ? '开始抽取' : 'Spin')}</small>
            </button>
          </div>
        </section>

        <aside className={`pw-result-card ${result ? 'has-result' : ''}`} aria-live="polite">
          {result ? (
            <>
              <span className="pw-result-kicker">{lang === 'zh' ? '本轮拼音' : 'Selected pinyin'}</span>
              <div className="pw-result-full">{result.fullPinyin}</div>
              <div className="pw-result-grid">
                <div><span>{lang === 'zh' ? '声母' : 'Initial'}</span><strong>{result.initial || '—'}</strong></div>
                <div><span>{lang === 'zh' ? '韵母' : 'Final'}</span><strong>{result.displayFinal}</strong></div>
                <div><span>{lang === 'zh' ? '声调' : 'Tone'}</span><strong>{result.tone.value}</strong><small>{result.tone.name}</small></div>
              </div>
              <div className="pw-result-actions">
                <button className="pw-speak-btn" onClick={speakPinyin} disabled={isSpeaking}>🔊 {isSpeaking ? '朗读中…' : '朗读'}</button>
                <button className="pw-again-btn" onClick={startSpin}>{lang === 'zh' ? '再抽一次' : 'Spin again'}</button>
              </div>
            </>
          ) : (
            <div className="pw-empty-result">
              <span>拼</span>
              <h2>{lang === 'zh' ? '抽取结果会显示在这里' : 'Your result appears here'}</h2>
              <p>{lang === 'zh' ? '点击转盘中央的“开始抽取”。' : 'Press the button in the center of the wheel.'}</p>
            </div>
          )}
        </aside>
      </div>

      <div className="pw-teaching-note">
        <div><span>1</span><p><strong>先读完整音节</strong>让学生尝试直接拼读。</p></div>
        <div><span>2</span><p><strong>再看结构拆解</strong>确认声母、韵母和声调。</p></div>
        <div><span>3</span><p><strong>最后点击朗读</strong>核对课堂发音。</p></div>
      </div>
    </div>
  );
}

export default PinyinWheelGame;
