import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getToolById } from '../config/toolsConfig';
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
    'climbmountain', 'twopuzzle', 'slingshot', 'worksheet',
    'readingaudio', 'wordcloud', 'luckypicker', 'fliptiles'
  ].map(getToolById).filter(Boolean);

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
        <button type="button" onClick={() => handleNav('contact')}>
          {isZh ? '反馈建议' : 'Send feedback'}
        </button>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-tag">
              <span className="hero-tag-dot"></span>
              {isZh ? '为中文教师打造的课堂工作台' : 'A classroom workspace for Chinese teachers'}
            </div>
            <h1 className="hero-title">
              {isZh ? (
                <><span>把备课的时间，</span><span>还给课堂。</span></>
              ) : (
                <><span>Spend less time preparing.</span><span>Teach more.</span></>
              )}
            </h1>
            <p className="hero-subtitle">
              {isZh
                ? '从课堂游戏、词卡字帖到点名和座位管理，把常用教学工具放进一个清晰、可靠的工作台。'
                : 'Games, flashcards, worksheets, student picking, and seating—all in one focused teaching workspace.'}
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => handleNav('tools')}>
                {isZh ? '进入工具台' : 'Open workspace'}
              </button>
              <button className="btn-hero-secondary" onClick={() => handleNav('tools')}>
                {isZh ? '浏览 24 个工具' : 'Browse 24 tools'}
              </button>
            </div>
            <div className="hero-metrics" aria-label={isZh ? '产品特点' : 'Product highlights'}>
              <div><strong>24</strong><span>{isZh ? '个教学工具' : 'teaching tools'}</span></div>
              <div><strong>0</strong><span>{isZh ? '安装步骤' : 'install steps'}</span></div>
              <div><strong>1</strong><span>{isZh ? '个课堂工作台' : 'workspace'}</span></div>
            </div>
          </div>

          {/* Tool Showcase Panel */}
          <div className="hero-panel">
            <div className="panel-window">
              <div className="panel-header">
                <div className="panel-title">{isZh ? '今天的课堂工具' : "Today's classroom tools"}</div>
                <div className="panel-status"><span></span>{isZh ? '可直接使用' : 'Ready'}</div>
              </div>
              <div className="panel-content">
                <div className="tool-grid-mini">
                  {featuredTools.map((tool, index) => (
                    <div
                      key={tool.id}
                      className="tool-card-mini"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectTool?.(tool.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') onSelectTool?.(tool.id);
                      }}
                    >
                      <span className="tool-icon-mini">{tool.icon}</span>
                      <span className="tool-name-mini">{isZh ? tool.titleZh : tool.titleEn}</span>
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
        <div className="section-heading">
          <span>{isZh ? '围绕真实课堂设计' : 'Designed around real classrooms'}</span>
          <h2>{isZh ? '备课、上课、管理，一处完成' : 'Prepare, teach, and manage in one place'}</h2>
        </div>
        <div className="values-container">
          <div className="value-card">
            <div className="value-icon">01</div>
            <h3>{isZh ? '课堂互动' : 'Classroom Games'}</h3>
            <p>{isZh
              ? '用游戏和竞赛让学生更愿意参与课堂。'
              : 'Engage students with games and quizzes.'}</p>
          </div>
          <div className="value-card">
            <div className="value-icon">02</div>
            <h3>{isZh ? '备课材料' : 'Lesson Materials'}</h3>
            <p>{isZh
              ? '快速生成词卡、字帖、卡牌和打印资料。'
              : 'Generate flashcards, worksheets, and printable materials.'}</p>
          </div>
          <div className="value-card">
            <div className="value-icon">03</div>
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
          <span className="cta-kicker">HANCLASS · FREE BETA</span>
          <h2>{isZh ? '下一节课，从这里开始。' : 'Start your next class here.'}</h2>
          <p>{isZh
            ? '不需要安装，选择工具，输入内容，就可以开始上课。'
            : 'No installation. Choose a tool, add your content, and teach.'}</p>
          <button className="btn-cta" onClick={() => handleNav('tools')}>
            {isZh ? '打开课堂工具台' : 'Open classroom workspace'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
