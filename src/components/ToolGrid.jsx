import React, { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { teachingPhases, tools } from '../config/toolsConfig';
import './ToolGrid.css';

function ToolCard({ tool, lang, onToolSelect, featured = false, disableEntranceAnimation = false, index = 0 }) {
  const isZh = lang === 'zh';

  return (
    <article
      className={`tool-card ${featured ? 'tool-card-featured' : ''} ${disableEntranceAnimation ? 'no-entrance-animation' : ''}`}
      style={{ animationDelay: `${index * 0.035}s` }}
    >
      {featured && tool.preview ? (
        <div className="tool-preview">
          <img src={tool.preview} alt={isZh ? `${tool.titleZh}界面预览` : `${tool.titleEn} preview`} loading="lazy" />
          <span className="featured-label">{isZh ? '推荐' : 'FEATURED'}</span>
        </div>
      ) : (
        <div className="tool-card-header">
          <span className="tool-icon" aria-hidden="true">{tool.icon}</span>
          <span className="tool-access">{isZh ? '公测免费' : 'FREE BETA'}</span>
        </div>
      )}

      <div className="tool-card-body">
        <h3 className="tool-name">{isZh ? tool.titleZh : tool.titleEn}</h3>
        <p className="tool-desc">{isZh ? tool.descriptionZh : tool.descriptionEn}</p>
        <div className="tool-tags">
          {(isZh ? tool.tagsZh : tool.tagsEn).slice(0, 3).map(tag => <span key={tag} className="tool-tag">{tag}</span>)}
        </div>
        <button className="tool-start-btn" onClick={() => onToolSelect?.(tool.id)}>
          {isZh ? '开始使用' : 'Start'}
        </button>
      </div>
    </article>
  );
}

function ToolGrid({ onToolSelect, disableEntranceAnimation = false }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState('all');

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tools.filter(tool => {
      if (filterPhase !== 'all' && !tool.phases.includes(filterPhase)) return false;
      if (!query) return true;
      return [tool.titleZh, tool.titleEn, tool.descriptionZh, tool.descriptionEn, ...tool.tagsZh, ...tool.tagsEn]
        .join(' ').toLowerCase().includes(query);
    });
  }, [filterPhase, searchQuery]);

  const featuredTools = tools.filter(tool => tool.featured);
  const activePhase = filterPhase === 'all' ? null : teachingPhases[filterPhase];
  const showFeatured = filterPhase === 'all' && !searchQuery.trim();

  return (
    <div className="tool-grid-page">
      <div className="tool-grid-header">
        <span className="library-kicker">HANCLASS · TOOL LIBRARY</span>
        <h1 className="page-title">{isZh ? '中文课堂工具台' : 'Chinese Classroom Toolkit'}</h1>
        <p className="page-subtitle">
          {isZh ? `按课堂阶段找到合适工具，当前 ${tools.length} 个工具公测免费。` : `Find the right tool for each teaching stage. ${tools.length} tools are free during beta.`}
        </p>
      </div>

      <div className="tool-grid-controls">
        <input
          type="search"
          className="search-input"
          aria-label={isZh ? '搜索工具' : 'Search tools'}
          placeholder={isZh ? '搜索拼音、字帖、点名……' : 'Search pinyin, worksheet, picker…'}
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
        />
        <div className="filter-buttons" aria-label={isZh ? '按课堂阶段筛选' : 'Filter by teaching stage'}>
          <button className={`filter-btn ${filterPhase === 'all' ? 'active' : ''}`} onClick={() => setFilterPhase('all')}>
            {isZh ? '全部工具' : 'All'}
          </button>
          {Object.values(teachingPhases).map(phase => (
            <button key={phase.id} className={`filter-btn ${filterPhase === phase.id ? 'active' : ''}`} onClick={() => setFilterPhase(phase.id)}>
              {isZh ? phase.titleZh : phase.titleEn}
            </button>
          ))}
        </div>
      </div>

      {showFeatured && (
        <section className="featured-section">
          <div className="section-title-row">
            <div>
              <span className="section-eyebrow">{isZh ? '第一次来，先从这里开始' : 'Start here'}</span>
              <h2>{isZh ? '教师常用工具' : 'Teacher favourites'}</h2>
            </div>
            <p>{isZh ? '挑选了六个最能代表 HanClass 的课堂工具，其余工具都保留在下方。' : 'Six tools that best represent HanClass. Every other tool remains below.'}</p>
          </div>
          <div className="featured-grid">
            {featuredTools.map((tool, index) => <ToolCard key={tool.id} tool={tool} lang={lang} featured index={index} onToolSelect={onToolSelect} disableEntranceAnimation={disableEntranceAnimation} />)}
          </div>
        </section>
      )}

      <section className="all-tools-section">
        <div className="section-title-row compact">
          <div>
            <span className="section-eyebrow">{activePhase ? (isZh ? activePhase.descriptionZh : activePhase.descriptionEn) : (isZh ? '完整工具库' : 'Full library')}</span>
            <h2>{activePhase ? (isZh ? activePhase.titleZh : activePhase.titleEn) : (isZh ? '全部工具' : 'All tools')}</h2>
          </div>
          <span className="result-count">{filteredTools.length} {isZh ? '个工具' : 'tools'}</span>
        </div>
        <div className="tools-grid">
          {filteredTools.map((tool, index) => <ToolCard key={tool.id} tool={tool} lang={lang} index={index} onToolSelect={onToolSelect} disableEntranceAnimation={disableEntranceAnimation} />)}
        </div>
      </section>

      {!filteredTools.length && <div className="no-results"><p>{isZh ? '没有找到匹配的工具，换一个关键词试试。' : 'No matching tools. Try another search.'}</p></div>}
    </div>
  );
}

export default ToolGrid;
