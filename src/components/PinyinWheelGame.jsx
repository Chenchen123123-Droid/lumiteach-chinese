import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './PinyinWheelGame.css';

// 只从这份合法普通话音节表抽取结果。三个圆环负责展示，绝不直接胡乱拼接。
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
const INITIAL_RING = ['∅', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
const TONES = [
  { name: '第一声', mark: 'ˉ', value: 1 },
  { name: '第二声', mark: 'ˊ', value: 2 },
  { name: '第三声', mark: 'ˇ', value: 3 },
  { name: '第四声', mark: 'ˋ', value: 4 }
];
const TONE_MARKS = {
  a: ['ā', 'á', 'ǎ', 'à'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ']
};

function splitSyllable(syllable) {
  const initial = INITIALS.find(item => syllable.startsWith(item)) || '';
  const writtenFinal = initial ? syllable.slice(initial.length) : syllable;
  const displayFinal = ['j', 'q', 'x', 'y'].includes(initial)
    ? writtenFinal.replace(/^u/, 'ü')
    : writtenFinal;
  return { base: syllable, initial, writtenFinal, displayFinal };
}

const SYLLABLES = COMMON_SYLLABLES.map(splitSyllable);
const FINAL_RING = [...new Set(SYLLABLES.map(item => item.displayFinal))].sort((a, b) => {
  if (a.length !== b.length) return a.length - b.length;
  return a.localeCompare(b, 'zh-CN');
});

function addToneMark(finalChar, tone) {
  const index = tone - 1;
  if (finalChar.includes('a')) return finalChar.replace('a', TONE_MARKS.a[index]);
  if (finalChar.includes('o')) return finalChar.replace('o', TONE_MARKS.o[index]);
  if (finalChar.includes('e')) return finalChar.replace('e', TONE_MARKS.e[index]);
  if (finalChar === 'iu') return `i${TONE_MARKS.u[index]}`;
  if (finalChar === 'ui') return `${TONE_MARKS.i[index]}u`;
  for (const vowel of ['ü', 'u', 'i']) {
    const position = finalChar.lastIndexOf(vowel);
    if (position >= 0) {
      return `${finalChar.slice(0, position)}${TONE_MARKS[vowel][index]}${finalChar.slice(position + 1)}`;
    }
  }
  return finalChar;
}

function rotateToTop(items, selected) {
  const index = items.indexOf(selected);
  if (index < 0) return items;
  return [...items.slice(index), ...items.slice(0, index)];
}

function RingItems({ items, selected }) {
  const orderedItems = useMemo(() => rotateToTop(items, selected), [items, selected]);
  return (
    <div className="pw-ring-items">
      {orderedItems.map((item, index) => {
        const angle = index * (360 / orderedItems.length);
        return (
          <div
            className={`pw-ring-item ${index === 0 && selected ? 'selected' : ''}`}
            key={item}
            style={{ '--angle': `${angle}deg` }}
          >
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
}

function PinyinWheelGame() {
  const { lang } = useLanguage();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(timerRef.current);
    window.speechSynthesis?.cancel();
  }, []);

  const startSpin = useCallback(() => {
    if (spinning) return;
    const syllable = SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)];
    const tone = TONES[Math.floor(Math.random() * TONES.length)];

    setSpinning(true);
    setResult(null);
    timerRef.current = window.setTimeout(() => {
      setResult({
        ...syllable,
        tone,
        fullPinyin: `${syllable.initial}${addToneMark(syllable.writtenFinal, tone.value)}`
      });
      setSpinning(false);
    }, 1900);
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
    setResult(null);
    setSpinning(false);
    setIsSpeaking(false);
  };

  const selectedInitial = result ? (result.initial || '∅') : null;
  const selectedFinal = result?.displayFinal || null;
  const selectedTone = result?.tone.mark || null;

  return (
    <div className="pinyin-wheel-page">
      <header className="pw-header">
        <div>
          <span className="pw-eyebrow">PINYIN PRACTICE</span>
          <h1>拼音三层大转盘</h1>
          <p>{lang === 'zh' ? '外圈选韵母，中圈选声母，内圈选声调；三层共同组成一个合法音节。' : 'Finals outside, initials in the middle, and tones inside—always forming a valid syllable.'}</p>
        </div>
        <button className="pw-reset-top" onClick={resetGame}>{lang === 'zh' ? '清空结果' : 'Reset'}</button>
      </header>

      <div className="pw-ring-legend" aria-label="转盘层级说明">
        <span className="final"><i />外圈 · 韵母</span>
        <span className="initial"><i />中圈 · 声母</span>
        <span className="tone"><i />内圈 · 声调</span>
      </div>

      <div className="pw-classroom-layout">
        <section className={`pw-stage ${spinning ? 'is-spinning' : ''}`} aria-label="拼音三层转盘">
          <div className="pw-wheel-shell">
            <div className="pw-pointer"><span /></div>

            <div className="pw-ring pw-ring-outer">
              <div className="pw-ring-surface" />
              <RingItems items={FINAL_RING} selected={selectedFinal} />
            </div>

            <div className="pw-ring pw-ring-middle">
              <div className="pw-ring-surface" />
              <RingItems items={INITIAL_RING} selected={selectedInitial} />
            </div>

            <div className="pw-ring pw-ring-inner">
              <div className="pw-ring-surface" />
              <RingItems items={TONES.map(tone => tone.mark)} selected={selectedTone} />
            </div>

            <button className="pw-center-btn" onClick={startSpin} disabled={spinning}>
              <span>{spinning ? '…' : 'GO'}</span>
              <small>{spinning ? (lang === 'zh' ? '转动中' : 'Spinning') : (lang === 'zh' ? '开始转动' : 'Spin')}</small>
            </button>
          </div>
        </section>

        <aside className={`pw-result-card ${result ? 'has-result' : ''}`} aria-live="polite">
          {result ? (
            <>
              <span className="pw-result-kicker">三层组合结果</span>
              <div className="pw-result-full">{result.fullPinyin}</div>
              <div className="pw-equation" aria-label="拼音组合过程">
                <strong>{result.initial || '∅'}</strong><span>＋</span>
                <strong>{result.displayFinal}</strong><span>＋</span>
                <strong>{result.tone.mark}</strong>
              </div>
              <div className="pw-result-grid">
                <div><span>声母</span><strong>{result.initial || '零声母'}</strong></div>
                <div><span>韵母</span><strong>{result.displayFinal}</strong></div>
                <div><span>声调</span><strong>{result.tone.value}</strong><small>{result.tone.name}</small></div>
              </div>
              {['j', 'q', 'x', 'y'].includes(result.initial) && result.displayFinal.startsWith('ü') && (
                <p className="pw-rule-note">拼写规则：{result.initial} 和 ü 相拼时，ü 上两点省略。</p>
              )}
              <div className="pw-result-actions">
                <button className="pw-speak-btn" onClick={speakPinyin} disabled={isSpeaking}>🔊 {isSpeaking ? '朗读中…' : '朗读'}</button>
                <button className="pw-again-btn" onClick={startSpin}>再转一次</button>
              </div>
            </>
          ) : (
            <div className="pw-empty-result">
              <span>拼</span>
              <h2>{spinning ? '三层转盘正在转动' : '点击中心开始转动'}</h2>
              <p>{spinning ? '外圈、 中圈和内圈将同时停在一个合法组合上。' : '看指针依次读出声母、韵母和声调，再拼出完整音节。'}</p>
            </div>
          )}
        </aside>
      </div>

      <div className="pw-teaching-note">
        <div><span>1</span><p><strong>先看三层落点</strong>分别说出声母、韵母和声调。</p></div>
        <div><span>2</span><p><strong>尝试自己拼读</strong>先让学生读，再查看右侧答案。</p></div>
        <div><span>3</span><p><strong>最后点击朗读</strong>核对发音并重复跟读。</p></div>
      </div>
    </div>
  );
}

export default PinyinWheelGame;
