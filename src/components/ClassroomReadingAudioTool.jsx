import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import './ClassroomReadingAudioTool.css';

/**
 * 课堂朗读音频工具
 * 使用浏览器原生 SpeechSynthesis 实现文字朗读
 */
function ClassroomReadingAudioTool() {
  const { lang } = useLanguage();
  const { showSuccess, showError, showInfo } = useToast();

  // 状态
  const [inputText, setInputText] = useState('');
  const [sentences, setSentences] = useState([]);
  const [voices, setVoices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState('practice'); // practice / exam
  const [isGenerating, setIsGenerating] = useState(false);

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const pausedIndexRef = useRef(-1);

  // 加载语音列表
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // 停止朗读
  const stopSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentIndex(-1);
    }
  }, []);

  // 组件卸载时停止
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  // 页面可见性变化时停止
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        stopSpeech();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, stopSpeech]);

  // 从 localStorage 恢复
  useEffect(() => {
    const saved = localStorage.getItem('reading-audio-tool');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.inputText) setInputText(data.inputText);
        if (data.sentences) setSentences(data.sentences);
        if (data.mode) setMode(data.mode);
      } catch (e) {
        console.error('Failed to restore data', e);
      }
    }
  }, []);

  // 自动保存到 localStorage
  useEffect(() => {
    const data = {
      inputText,
      sentences,
      mode
    };
    localStorage.setItem('reading-audio-tool', JSON.stringify(data));
  }, [inputText, sentences, mode]);

  // 获取中文/英文语音 - 优先选择高质量语音
  const getPreferredVoice = (targetLang) => {
    // 尝试获取指定语言的语音
    const langCode = targetLang === 'zh' ? 'zh' : 'en';

    // 首先尝试找中文-大陆 或 中文(简体)
    const zhCN = voices.find(v => v.name.includes('Chinese') && v.name.includes('Simplified'));
    const zhTW = voices.find(v => v.name.includes('Chinese') && v.name.includes('Traditional'));

    if (targetLang === 'zh') {
      return zhCN || zhTW || voices.find(v => v.lang.toLowerCase().startsWith('zh')) || null;
    }

    return voices.find(v => v.lang.toLowerCase().startsWith(langCode)) || null;
  };

  const getVoicesByLang = (targetLang) => {
    if (targetLang === 'auto') return voices;
    const langCode = targetLang === 'zh' ? 'zh' : 'en';
    return voices.filter(v => v.lang.toLowerCase().startsWith(langCode));
  };

  // 解析文本为句子
  const parseText = () => {
    if (!inputText.trim()) {
      showError(lang === 'zh' ? '请输入朗读文本' : 'Please input reading text');
      return;
    }

    let lines = inputText.split('\n').filter(l => l.trim());
    if (lines.length === 0) {
      // 如果没有换行，根据标点拆分
      lines = inputText.split(/[。！？.!?]+/).filter(l => l.trim());
    }

    if (lines.length === 0) {
      showError(lang === 'zh' ? '没有可朗读的内容' : 'No content to read');
      return;
    }

    const newSentences = lines.map((text, idx) => ({
      id: Date.now() + idx,
      text: text.trim(),
      language: 'auto',
      voiceIndex: 0,
      rate: 1,
      repeat: 1,
      pauseAfter: 1
    }));

    setSentences(newSentences);
    showSuccess(lang === 'zh' ? '已解析' : 'Parsed');
  };

  // 更新句子
  const updateSentence = (id, field, value) => {
    setSentences(prev => prev.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  // 添加句子
  const addSentence = () => {
    setSentences(prev => [...prev, {
      id: Date.now(),
      text: '',
      language: 'auto',
      voiceIndex: 0,
      rate: 1,
      repeat: 1,
      pauseAfter: 1
    }]);
  };

  // 删除句子
  const deleteSentence = (id) => {
    setSentences(prev => prev.filter(s => s.id !== id));
  };

  // 上移
  const moveUp = (id) => {
    setSentences(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx <= 0) return prev;
      const newArr = [...prev];
      [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
      return newArr;
    });
  };

  // 下移
  const moveDown = (id) => {
    setSentences(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx >= prev.length - 1) return prev;
      const newArr = [...prev];
      [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
      return newArr;
    });
  };

  // 测试朗读功能
  const testSound = () => {
    // 先确保之前的都停掉
    stopSpeech();

    // 构建测试文本
    const testText = lang === 'zh'
      ? '你好，欢迎使用HanClass课堂朗读工具。'
      : 'Hello, welcome to HanClass Reading Tool.';

    const utterance = new SpeechSynthesisUtterance(testText);

    // 优先选择中文语音
    const preferredVoice = getPreferredVoice(lang);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    }

    utterance.rate = 1;
    utterance.volume = 1;

    // 错误处理
    utterance.onstart = () => {
      console.log('TTS started');
    };

    utterance.onerror = (event) => {
      console.error('TTS error:', event.error);
      setIsPlaying(false);
      showError(lang === 'zh'
        ? `朗读出错：${event.error}`
        : `TTS error: ${event.error}`);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    // 确保开始朗读
    setIsPlaying(true);
    synthRef.current.speak(utterance);
  };

  // 试听单句
  const previewSentence = (sentence) => {
    // 先确保之前的都停掉
    stopSpeech();

    if (!sentence.text.trim()) {
      showError(lang === 'zh' ? '请输入朗读内容' : 'Please input text');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence.text);

    // 使用智能语音选择
    const targetLang = sentence.language === 'auto' ? lang : sentence.language;
    const preferredVoice = getPreferredVoice(targetLang);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    }

    utterance.rate = sentence.rate;
    utterance.volume = 1;

    // 错误处理
    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onerror = (event) => {
      console.error('TTS error:', event.error);
      setIsPlaying(false);
      showError(lang === 'zh'
        ? `朗读出错：${event.error}`
        : `TTS error: ${event.error}`);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    // 开始朗读
    setIsPlaying(true);
    synthRef.current.speak(utterance);
  };

  // 朗读全部
  const playAll = async () => {
    if (sentences.length === 0) {
      showError(lang === 'zh' ? '没有可朗读的内容' : 'No content to read');
      return;
    }

    // 检查是否有可用语音
    if (voices.length === 0) {
      showError(lang === 'zh' ? '正在加载语音，请稍等片刻再试...' : 'Loading voices, please wait...');
      return;
    }

    setIsGenerating(true);
    stopSpeech();
    setCurrentIndex(0);
    setIsPlaying(true);
    setIsPaused(false);

    const playSentence = async (index) => {
      if (index >= sentences.length) {
        setIsPlaying(false);
        setCurrentIndex(-1);
        setIsGenerating(false);
        return;
      }

      // 检查是否停止了
      if (!synthRef.current) {
        setIsGenerating(false);
        return;
      }

      const sentence = sentences[index];
      setCurrentIndex(index);

      // 朗读多次
      for (let r = 0; r < sentence.repeat; r++) {
        // 检查是否停止了
        if (!synthRef.current) {
          setIsGenerating(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentence.text);

        // 使用智能语音选择
        const targetLang = sentence.language === 'auto' ? lang : sentence.language;
        const preferredVoice = getPreferredVoice(targetLang);
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          utterance.lang = preferredVoice.lang;
        }

        utterance.rate = sentence.rate;
        utterance.volume = 1;

        // 错误处理
        utterance.onerror = (event) => {
          console.error('TTS error:', event.error);
        };

        await new Promise((resolve) => {
          utterance.onend = resolve;
          utterance.onerror = resolve;
          synthRef.current.speak(utterance);
        });
      }

      // 句后停顿
      if (sentence.pauseAfter > 0 && index < sentences.length - 1) {
        await new Promise(resolve => setTimeout(resolve, sentence.pauseAfter * 1000));
      }

      // 继续下一句（只在手动停止时才停止）
      if (synthRef.current) {
        playSentence(index + 1);
      } else {
        setIsGenerating(false);
      }
    };

    playSentence(0);
  };

  // 暂停
  const pauseSpeech = () => {
    if (synthRef.current) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  // 继续
  const resumeSpeech = () => {
    if (synthRef.current) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  // 清空草稿
  const clearDraft = () => {
    setInputText('');
    setSentences([]);
    localStorage.removeItem('reading-audio-tool');
    showSuccess(lang === 'zh' ? '已清空草稿' : 'Draft cleared');
  };

  // 导出配置
  const exportConfig = () => {
    if (sentences.length === 0) {
      showError(lang === 'zh' ? '没有可导出的内容' : 'No content to export');
      return;
    }

    const config = {
      version: 1,
      inputText,
      sentences
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reading-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showSuccess(lang === 'zh' ? '已导出配置' : 'Config exported');
  };

  // 导入配置
  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const config = JSON.parse(text);

        if (config.inputText) setInputText(config.inputText);
        if (config.sentences && Array.isArray(config.sentences)) {
          setSentences(config.sentences);
        }

        showSuccess(lang === 'zh' ? '已导入配置' : 'Config imported');
      } catch (err) {
        showError(lang === 'zh' ? '导入失败：文件格式错误' : 'Import failed: Invalid file format');
      }
    };
    input.click();
  };

  // 浏览器支持检测
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  if (!isSupported) {
    return (
      <div className="reading-tool-page">
        <div className="reading-error-card">
          <div className="error-icon">⚠️</div>
          <h2>{lang === 'zh' ? '当前浏览器不支持语音朗读' : 'Speech synthesis not supported'}</h2>
          <p>{lang === 'zh' ? '请使用 Chrome、Safari 或 Edge 浏览器' : 'Please use Chrome, Safari or Edge browser'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reading-tool-page">
      <div className="reading-tool-container">
        {/* 模式切换 */}
        <div className="mode-switch">
          <button
            className={`mode-btn ${mode === 'practice' ? 'active' : ''}`}
            onClick={() => setMode('practice')}
          >
            {lang === 'zh' ? '练习模式' : 'Practice Mode'}
          </button>
          <button
            className={`mode-btn ${mode === 'exam' ? 'active' : ''}`}
            onClick={() => setMode('exam')}
          >
            {lang === 'zh' ? '考试模式' : 'Exam Mode'}
          </button>
        </div>

        {/* Step 1: 输入 */}
        <div className="step-card">
          <div className="step-header">
            <span className="step-number">1</span>
            <h2>{lang === 'zh' ? '输入内容' : 'Input Content'}</h2>
          </div>
          <textarea
            className="text-input"
            placeholder={lang === 'zh'
              ? '每行一句，例如：\n今天天气太好了！我们出去散步吧。\nHello, welcome to our Chinese class.'
              : 'One sentence per line, for example:\n今天天气太好了！我们出去散步吧。\nHello, welcome to our Chinese class.'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button className="parse-btn" onClick={parseText}>
            {lang === 'zh' ? '解析到编辑器' : 'Parse to Editor'}
          </button>
        </div>

        {/* Step 2: 编辑器 */}
        {sentences.length > 0 && (
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">2</span>
              <h2>{lang === 'zh' ? '设置朗读参数' : 'Configure Reading Settings'}</h2>
            </div>

            {/* 句子列表 */}
            <div className="sentences-list">
              {sentences.map((sentence, index) => (
                <div
                  key={sentence.id}
                  className={`sentence-item ${mode === 'practice' && currentIndex === index ? 'highlight' : ''}`}
                >
                  <div className="sentence-row">
                    <span className="sentence-index">{index + 1}</span>
                    <input
                      type="text"
                      className="sentence-text"
                      value={sentence.text}
                      onChange={(e) => updateSentence(sentence.id, 'text', e.target.value)}
                      placeholder={lang === 'zh' ? '输入句子' : 'Enter sentence'}
                    />
                  </div>

                  <div className="sentence-settings">
                    {/* 语言 */}
                    <select
                      className="setting-select"
                      value={sentence.language}
                      onChange={(e) => updateSentence(sentence.id, 'language', e.target.value)}
                    >
                      <option value="auto">{lang === 'zh' ? '自动' : 'Auto'}</option>
                      <option value="zh">{lang === 'zh' ? '中文' : 'Chinese'}</option>
                      <option value="en">{lang === 'zh' ? '英文' : 'English'}</option>
                    </select>

                    {/* 语速 */}
                    <select
                      className="setting-select"
                      value={sentence.rate}
                      onChange={(e) => updateSentence(sentence.id, 'rate', parseFloat(e.target.value))}
                    >
                      <option value="0.6">0.6x</option>
                      <option value="0.8">0.8x</option>
                      <option value="1">1x</option>
                      <option value="1.2">1.2x</option>
                      <option value="1.4">1.4x</option>
                    </select>

                    {/* 次数 */}
                    <select
                      className="setting-select"
                      value={sentence.repeat}
                      onChange={(e) => updateSentence(sentence.id, 'repeat', parseInt(e.target.value))}
                    >
                      <option value="1">{lang === 'zh' ? '1次' : '1x'}</option>
                      <option value="2">{lang === 'zh' ? '2次' : '2x'}</option>
                      <option value="3">{lang === 'zh' ? '3次' : '3x'}</option>
                    </select>

                    {/* 停顿 */}
                    <select
                      className="setting-select"
                      value={sentence.pauseAfter}
                      onChange={(e) => updateSentence(sentence.id, 'pauseAfter', parseInt(e.target.value))}
                    >
                      <option value="0">{lang === 'zh' ? '不停顿' : 'No pause'}</option>
                      <option value="1">1s</option>
                      <option value="2">2s</option>
                      <option value="3">3s</option>
                      <option value="5">5s</option>
                    </select>

                    {/* 试听 */}
                    <button
                      className="preview-btn"
                      onClick={() => previewSentence(sentence)}
                      disabled={!sentence.text.trim()}
                    >
                      {lang === 'zh' ? '试听' : 'Preview'}
                    </button>

                    {/* 操作 */}
                    <button className="move-btn" onClick={() => moveUp(sentence.id)} disabled={index === 0}>↑</button>
                    <button className="move-btn" onClick={() => moveDown(sentence.id)} disabled={index === sentences.length - 1}>↓</button>
                    <button className="delete-btn" onClick={() => deleteSentence(sentence.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>

            {/* 批量操作 */}
            <div className="batch-actions">
              <button className="add-btn" onClick={addSentence}>
                + {lang === 'zh' ? '添加一句' : 'Add Sentence'}
              </button>
              <button className="export-btn" onClick={exportConfig}>
                {lang === 'zh' ? '导出配置' : 'Export'}
              </button>
              <button className="import-btn" onClick={importConfig}>
                {lang === 'zh' ? '导入配置' : 'Import'}
              </button>
              <button className="clear-btn" onClick={clearDraft}>
                {lang === 'zh' ? '清空草稿' : 'Clear Draft'}
              </button>
            </div>
          </div>
        )}

        {/* 播放控制 */}
        {sentences.length > 0 && (
          <div className="playback-control">
            <div className="playback-info">
              {isPlaying && currentIndex >= 0 ? (
                <span className="current-sentence">
                  {lang === 'zh'
                    ? `正在朗读：第 ${currentIndex + 1} / ${sentences.length} 句`
                    : `Reading: Sentence ${currentIndex + 1} / ${sentences.length}`}
                </span>
              ) : (
                <span className="total-sentences">
                  {lang === 'zh' ? `共 ${sentences.length} 句` : `${sentences.length} sentences`}
                </span>
              )}
            </div>

            <div className="playback-progress">
              <div
                className="progress-bar"
                style={{ width: `${sentences.length > 0 ? ((currentIndex + 1) / sentences.length) * 100 : 0}%` }}
              />
            </div>

            <div className="playback-buttons">
              <button className="test-btn" onClick={testSound}>
                {lang === 'zh' ? '测试声音' : 'Test Sound'}
              </button>
              {!isPlaying ? (
                <button className="play-btn primary" onClick={playAll}>
                  {lang === 'zh' ? '开始朗读' : 'Start Reading'}
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button className="play-btn" onClick={resumeSpeech}>
                      {lang === 'zh' ? '继续' : 'Resume'}
                    </button>
                  ) : (
                    <button className="play-btn" onClick={pauseSpeech}>
                      {lang === 'zh' ? '暂停' : 'Pause'}
                    </button>
                  )}
                  <button className="stop-btn" onClick={stopSpeech}>
                    {lang === 'zh' ? '停止' : 'Stop'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* MP3 提示 */}
        <div className="mp3-notice">
          <span>📝</span>
          <span>{lang === 'zh' ? 'MP3 导出即将上线' : 'MP3 export coming soon'}</span>
          <button
            className="mp3-info-btn"
            onClick={() => showInfo(lang === 'zh'
              ? '当前版本支持课堂朗读，MP3 导出将在后续版本开放。'
              : 'Current version supports classroom reading. MP3 export will be available in future versions.')}
          >
            ℹ️
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClassroomReadingAudioTool;