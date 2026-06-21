import React from 'react';
import './AIPrepComingSoon.css';

const translations = {
  zh: {
    title: 'AI 备课即将开放',
    subtitle: '输入课文、主题或学生水平，自动生成课堂游戏、词汇练习、活动流程和打印材料。',
    comingSoon: '即将支持',
    feature1: '从课文生成课堂活动',
    feature2: '从主题生成词汇游戏',
    feature3: '自动生成练习题',
    feature4: '一键导入到现有工具',
    cta: '加入等待名单',
    badge: '即将开放'
  },
  en: {
    title: 'AI Lesson Prep Coming Soon',
    subtitle: 'Enter a text, topic, or student level and generate classroom games, vocabulary activities, lesson flows, and printable materials.',
    comingSoon: 'Coming Soon',
    feature1: 'Generate activities from a text',
    feature2: 'Generate games from a topic',
    feature3: 'Create exercises automatically',
    feature4: 'Send results into existing tools',
    cta: 'Join Waitlist',
    badge: 'Coming Soon'
  }
};

function AIPrepComingSoon({ lang = 'zh' }) {
  const t = translations[lang] || translations.zh;

  return (
    <div className="ai-prep-section">
      <div className="ai-prep-card">
        <div className="ai-badge">{t.badge}</div>
        <div className="ai-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="ai-title">{t.title}</h3>
        <p className="ai-subtitle">{t.subtitle}</p>

        <div className="ai-features">
          <div className="ai-feature-label">{t.comingSoon}</div>
          <ul className="ai-feature-list">
            <li>{t.feature1}</li>
            <li>{t.feature2}</li>
            <li>{t.feature3}</li>
            <li>{t.feature4}</li>
          </ul>
        </div>

        <button className="ai-cta-btn" onClick={() => alert(lang === 'zh' ? '感谢关注！功能即将开放。' : 'Thanks for your interest! Coming soon.')}>
          {t.cta}
        </button>
      </div>
    </div>
  );
}

export default AIPrepComingSoon;