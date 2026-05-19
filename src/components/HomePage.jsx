import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { toolsConfig, categories } from '../config/toolsConfig';
import { isPreviewMode } from '../config/accessMode';
import './HomePage.css';

/**
 * 首页组件
 * 新的专业 SaaS 风格首页
 */
function HomePage({ onSelectTool, onNavigate }) {
  const { lang, t } = useLanguage();

  // 精选工具：免费引流 + Pro价值
  const featuredToolsFree = ['gacha', 'pinyinwheel', 'luckypicker'];
  const featuredToolsPro = ['worksheet', 'chineseuno', 'seatmanager'];

  const getToolInfo = (id) => toolsConfig[id];

  const scrollToSection = (sectionId) => {
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  return (
    <div className="home-page">
      {/* Preview Banner */}
      {isPreviewMode && (
        <div className="preview-banner">
          {lang === 'zh'
            ? '🎉 当前为公开体验版，所有工具暂时免费开放'
            : '🎉 Public preview: all tools are currently available to try for free'}
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            {lang === 'zh'
              ? '让中文课堂更有趣，也让备课更简单'
              : 'Make Chinese classes more interactive and lesson prep easier'}
          </h1>
          <p className="hero-subtitle">
            {lang === 'zh'
              ? '一站式对外汉语教师工具箱，快速生成课堂游戏、词卡、字帖、卡牌、座位表和打印材料。'
              : 'An all-in-one toolkit for Chinese teachers: games, worksheets, flashcards, card decks, seating charts, and printables.'}
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => scrollToSection('tools')}>
              {lang === 'zh' ? '免费开始使用' : 'Start for Free'}
            </button>
            <button className="btn-hero-secondary" onClick={() => scrollToSection('tools')}>
              {lang === 'zh' ? '查看全部工具' : 'Explore Tools'}
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="preview-card">
            <div className="preview-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="preview-content">
              <div className="preview-icon">🎴</div>
              <div className="preview-text">Spot It Cards</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>{lang === 'zh' ? '上课更有趣' : 'More Fun Classes'}</h3>
            <p>{lang === 'zh'
              ? '快速生成投屏游戏，让学生更愿意开口、抢答和参与。'
              : 'Interactive games that get students speaking, competing, and participating.'}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>{lang === 'zh' ? '备课更省时' : 'Save Prep Time'}</h3>
            <p>{lang === 'zh'
              ? '几分钟生成字帖、词卡、卡牌和打印材料。'
              : 'Generate worksheets, flashcards, and printables in minutes.'}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>{lang === 'zh' ? '简单好用' : 'Simple to Use'}</h3>
            <p>{lang === 'zh'
              ? '无需复杂设置，输入词语或课文就能开始。'
              : 'No complex setup—just enter words or text to get started.'}</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2 className="section-title">
          {lang === 'zh' ? '三大核心分类' : 'Three Core Categories'}
        </h2>
        <div className="categories-grid">
          <div className="category-card" onClick={() => scrollToSection('games')}>
            <div className="category-icon">🎮</div>
            <h3>{lang === 'zh' ? '课堂互动游戏' : 'Classroom Games'}</h3>
            <p>{lang === 'zh'
              ? '适合投屏上课、课堂热身、小组活动和词汇复习。'
              : 'Interactive games for live teaching, warm-ups, and vocabulary review.'}</p>
            <span className="category-count">10 {lang === 'zh' ? '个游戏' : 'games'}</span>
          </div>
          <div className="category-card" onClick={() => scrollToSection('prep')}>
            <div className="category-icon">📝</div>
            <h3>{lang === 'zh' ? '备课生成工具' : 'Lesson Prep Tools'}</h3>
            <p>{lang === 'zh'
              ? '快速生成字帖、词卡、卡牌和可打印PDF教学材料。'
              : 'Create worksheets, flashcards, and printable materials.'}</p>
            <span className="category-count">5 {lang === 'zh' ? '个工具' : 'tools'}</span>
          </div>
          <div className="category-card" onClick={() => scrollToSection('management')}>
            <div className="category-icon">🪑</div>
            <h3>{lang === 'zh' ? '课堂管理工具' : 'Classroom Management'}</h3>
            <p>{lang === 'zh'
              ? '管理学生名单、随机点名、分组和座位表。'
              : 'Manage student lists, random picking, grouping, seating.'}</p>
            <span className="category-count">2 {lang === 'zh' ? '个工具' : 'tools'}</span>
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="featured-section" id="tools">
        <h2 className="section-title">
          {lang === 'zh' ? '精选工具' : 'Featured Tools'}
        </h2>
        <div className="section-subtitle">
          {lang === 'zh'
            ? '从课堂游戏到备课材料，一站式满足您的教学需求'
            : 'From classroom games to lesson prep materials—everything you need in one place'}
        </div>

        <div className="featured-group">
          <h3 className="group-title">{lang === 'zh' ? '免费工具' : 'Free Tools'}</h3>
          <div className="tools-grid">
            {featuredToolsFree.map(id => {
              const tool = getToolInfo(id);
              return (
                <div key={id} className="tool-card" onClick={() => onSelectTool && onSelectTool(id)}>
                  <div className="tool-card-icon">{tool.icon}</div>
                  <div className="tool-card-content">
                    <span className="tool-card-title">{lang === 'zh' ? tool.titleZh : tool.titleEn}</span>
                    <span className="tool-card-desc">{lang === 'zh' ? tool.descriptionZh : tool.descriptionEn}</span>
                    <div className="tool-card-tags">
                      <span className="tag free">{lang === 'zh' ? '免费' : 'FREE'}</span>
                      {tool.scenes?.slice(0, 2).map((scene, i) => (
                        <span key={i} className="tag scene">{scene}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="featured-group">
          <h3 className="group-title">{lang === 'zh' ? 'Pro 专属工具' : 'Pro Tools'}</h3>
          <div className="tools-grid">
            {featuredToolsPro.map(id => {
              const tool = getToolInfo(id);
              return (
                <div key={id} className="tool-card pro" onClick={() => onSelectTool && onSelectTool(id)}>
                  <div className="tool-card-icon">{tool.icon}</div>
                  <div className="tool-card-content">
                    <span className="tool-card-title">{lang === 'zh' ? tool.titleZh : tool.titleEn}</span>
                    <span className="tool-card-desc">{lang === 'zh' ? tool.descriptionZh : tool.descriptionEn}</span>
                    <div className="tool-card-tags">
                      <span className="tag pro">{lang === 'zh' ? 'Pro' : 'PRO'}</span>
                      {tool.scenes?.slice(0, 2).map((scene, i) => (
                        <span key={i} className="tag scene">{scene}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="view-all-container">
          <button className="btn-view-all" onClick={() => scrollToSection('all-tools')}>
            {lang === 'zh' ? '查看全部工具 →' : 'View All Tools →'}
          </button>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="pricing-teaser">
        <div className="pricing-teaser-content">
          <h2>{lang === 'zh' ? '解锁全部工具' : 'Unlock All Tools'}</h2>
          <p>{lang === 'zh'
            ? '升级 Pro，解锁全部课堂游戏、PDF导出、座位管理和更多高级功能。'
            : 'Upgrade to Pro to unlock all games, PDF export, seat management, and more.'}</p>
          <button className="btn-pricing" onClick={() => scrollToSection('pricing')}>
            {lang === 'zh' ? '查看价格方案' : 'View Pricing'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;