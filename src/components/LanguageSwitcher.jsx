import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './LanguageSwitcher.css';

/**
 * 语言切换组件
 * 放置在顶部导航栏右侧
 */

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  const handleChange = (e) => {
    setLang(e.target.value);
  };

  return (
    <div className="language-switcher">
      <span className="lang-icon">🌐</span>
      <select
        className="lang-select"
        value={lang}
        onChange={handleChange}
        aria-label="切换语言"
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
