import React from 'react';
import './InputFormatHelp.css';

const translations = {
  zh: {
    title: '输入格式说明',
    supportedFormats: '支持格式',
    format1: '只输入中文',
    format2: '中文 + 拼音',
    format3: '中文 + 拼音 + 英文',
    example: '示例',
    note: '每行一个词语，系统会自动解析',
    tip: '提示：不支持解析的内容将原样显示'
  },
  en: {
    title: 'Input Format',
    supportedFormats: 'Supported Formats',
    format1: 'Chinese only',
    format2: 'Chinese + Pinyin',
    format3: 'Chinese + Pinyin + English',
    example: 'Example',
    note: 'One word per line, the system will parse automatically',
    tip: 'Unsupported content will be displayed as-is'
  }
};

function InputFormatHelp({ lang = 'zh' }) {
  const t = translations[lang] || translations.zh;

  return (
    <div className="input-format-help">
      <div className="help-title">{t.title}</div>
      <div className="help-section">
        <div className="help-label">{t.supportedFormats}</div>
        <div className="format-list">
          <div className="format-item">
            <span className="format-badge">1</span>
            <span className="format-text">{t.format1}</span>
            <code className="format-code">苹果</code>
          </div>
          <div className="format-item">
            <span className="format-badge">2</span>
            <span className="format-text">{t.format2}</span>
            <code className="format-code">苹果|píng guǒ</code>
          </div>
          <div className="format-item">
            <span className="format-badge">3</span>
            <span className="format-text">{t.format3}</span>
            <code className="format-code">苹果|píng guǒ|apple</code>
          </div>
        </div>
      </div>
      <div className="help-section">
        <div className="help-label">{t.example}</div>
        <div className="example-box">
          <div className="example-line">
            <span className="example-input">苹果|píng guǒ|apple</span>
            <span className="arrow">→</span>
            <span className="example-output">苹果 / píng guǒ / apple</span>
          </div>
          <div className="example-line">
            <span className="example-input">老师|lǎo shī|teacher</span>
            <span className="arrow">→</span>
            <span className="example-output">老师 / lǎo shī / teacher</span>
          </div>
          <div className="example-line">
            <span className="example-input">学校|xué xiào|school</span>
            <span className="arrow">→</span>
            <span className="example-output">学校 / xué xiào / school</span>
          </div>
        </div>
      </div>
      <div className="help-note">
        {t.note}
      </div>
    </div>
  );
}

export default InputFormatHelp;