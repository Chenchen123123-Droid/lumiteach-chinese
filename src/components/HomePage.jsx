import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './HomePage.css';

/**
 * 首页组件 - Apple/SaaS 风格重构版
 */
function HomePage({ onSelectTool, onNavigate }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';

  const handleNav = (sectionId) => {
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  // Featured tools for right panel
  const featuredTools = [
    { icon: '⛰️', name: isZh ? '爬山竞赛' : 'Climb the Mountain' },
    { icon: '🧩', name: isZh ? '双字词拼图' : 'Word Puzzle' },
    { icon: '🎯', name: isZh ? '弹弓大作战' : 'Slingshot Quiz' },
    { icon: '📝', name: isZh ? '汉字字帖' : 'Hanzi Worksheets' },
    { icon: '🎧', name: isZh ? '课堂朗读' : 'Reading Audio' },
    { icon: '☁️', name: isZh ? '词云生成器' : 'Word Cloud' },
    { icon: '🎲', name: isZh ? '点名神器' : 'Lucky Picker' },
    { icon: '🎁', name: isZh ? '翻格子' : 'Flip Tiles' },
  ];

  return (
    <div className="home-page">
      {/* Beta Banner */}
      <div className="beta-banner">
        <span>🎉</span>
        <span>
          {isZh
            ? 'HanClass 正在 Free Beta 公测中，所有工具暂时免费开放。'
            : 'HanClass is in Free Beta. All tools are currently free to try.'}
        </span>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-tag">
              Free Beta · {isZh ? '所有工具暂时免费开放' : 'All tools free for now'}
            </div>
            <h1 className="hero-title">
              {isZh ? '中文课堂，\n更有趣。' : 'Chinese classes,\nmore engaging.'}
            </h1>
            <p className="hero-subtitle">
              {isZh
                ? 'HanClass 是为中文老师设计的课堂工具箱，帮助你快速制作课堂游戏、词卡、字帖、座位表和互动活动。'
                : 'HanClass is a classroom toolkit for Chinese teachers, helping you create games, flashcards, worksheets, seating charts and interactive activities.'}
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => handleNav('tools')}>
                {isZh ? '免费开始' : 'Get Started'}
              </button>
              <button className="btn-hero-secondary" onClick={() => handleNav('tools')}>
                {isZh ? '查看全部工具' : 'Explore Tools'}
              </button>
            </div>
          </div>

          {/* Tool Showcase Panel */}
          <div className="hero-panel">
            <div className="panel-window">
              <div className="panel-header">
                <div className="panel-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="panel-title">HanClass Tools</div>
              </div>
              <div className="panel-content">
                <div className="tool-grid-mini">
                  {featuredTools.map((tool, index) => (
                    <div
                      key={index}
                      className="tool-card-mini"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <span className="tool-icon-mini">{tool.icon}</span>
                      <span className="tool-name-mini">{tool.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Cards Section */}
      <section className="values-section">
        <div className="values-container">
          <div className="value-card">
            <div className="value-icon">🎮</div>
            <h3>{isZh ? '课堂互动' : 'Classroom Games'}</h3>
            <p>{isZh
              ? '用游戏和竞赛让学生更愿意参与课堂。'
              : 'Engage students with games and quizzes.'}</p>
          </div>
          <div className="value-card">
            <div className="value-icon">⚡</div>
            <h3>{isZh ? '备课材料' : 'Lesson Materials'}</h3>
            <p>{isZh
              ? '快速生成词卡、字帖、卡牌和打印资料。'
              : 'Generate flashcards, worksheets, and printable materials.'}</p>
          </div>
          <div className="value-card">
            <div className="value-icon">✨</div>
            <h3>{isZh ? '即开即用' : 'Ready to Use'}</h3>
            <p>{isZh
              ? '无需复杂设置，打开工具就能投屏上课。'
              : 'No setup needed. Open and project to class.'}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>{isZh ? '准备好了吗？' : 'Ready to get started?'}</h2>
          <p>{isZh
            ? '立即开始体验 HanClass，让你的中文课堂更有趣。'
            : 'Start using HanClass today and make your Chinese classes more engaging.'}</p>
          <button className="btn-cta" onClick={() => handleNav('tools')}>
            {isZh ? '免费开始' : 'Start for Free'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;