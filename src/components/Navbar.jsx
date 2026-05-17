import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './Navbar.css';

/**
 * 顶部导航栏组件
 * 更新为专业的 SaaS 风格导航
 */
function Navbar({ onToggleFullscreen }) {
  const { lang, t, setLanguage } = useLanguage();

  const handleLogin = () => {
    alert(lang === 'zh' ? '登录功能即将开放' : 'Login coming soon');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <a href="#home" className="brand-link">
            <span className="brand-icon">📚</span>
            <span className="brand-text">LumiTeach</span>
          </a>
        </div>

        <ul className="navbar-menu">
          <li className="nav-item active">
            <a href="#home">{lang === 'zh' ? '首页' : 'Home'}</a>
          </li>
          <li className="nav-item">
            <a href="#tools">{lang === 'zh' ? '全部工具' : 'Tools'}</a>
          </li>
          <li className="nav-item">
            <a href="#pricing">{lang === 'zh' ? '价格方案' : 'Pricing'}</a>
          </li>
          <li className="nav-item">
            <a href="#ai-prep">{lang === 'zh' ? 'AI备课' : 'AI Prep'}</a>
          </li>
        </ul>

        <div className="navbar-actions">
          <select
            className="lang-select"
            value={lang}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
          <button className="btn-cta" onClick={handleLogin}>
            {lang === 'zh' ? '免费开始' : 'Start for Free'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;