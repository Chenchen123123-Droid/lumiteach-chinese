import React, { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { categories, tools } from '../config/toolsConfig';
import './ToolGrid.css';

const accessLabels = {
  free: { zh: '免费', en: 'FREE' },
  limited_free: { zh: '限时免费', en: 'FREE' },
  pro: { zh: 'Pro', en: 'PRO' },
  school: { zh: '学校版', en: 'SCHOOL' }
};

function ToolGrid({ onToolSelect, disableEntranceAnimation = false }) {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tools.filter(tool => {
      if (query) {
        const searchable = [
          tool.titleZh,
          tool.titleEn,
          tool.descriptionZh,
          tool.descriptionEn,
          ...tool.tagsZh,
          ...tool.tagsEn
        ].join(' ').toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      if (filterCategory !== 'all' && tool.category !== filterCategory) return false;
      if (filterAccess === 'free' && tool.access === 'pro') return false;
      if (filterAccess === 'pro' && tool.access !== 'pro') return false;
      return true;
    });
  }, [filterAccess, filterCategory, searchQuery]);

  const groupedTools = useMemo(() => {
    const groups = { games: [], tools: [], management: [] };
    filteredTools.forEach(tool => groups[tool.category]?.push(tool));
    return groups;
  }, [filteredTools]);

  return (
    <div className="tool-grid-page">
      <div className="tool-grid-header">
        <h1 className="page-title">{lang === 'zh' ? '全部工具' : 'All Tools'}</h1>
        <p className="page-subtitle">
          {lang === 'zh'
            ? `共 ${tools.length} 个课堂互动、备课生成和课堂管理工具`
            : `${tools.length} tools for classroom interaction, lesson preparation, and management`}
        </p>
      </div>

      <div className="tool-grid-controls">
        <input
          type="search"
          className="search-input"
          aria-label={lang === 'zh' ? '搜索工具' : 'Search tools'}
          placeholder={lang === 'zh' ? '搜索工具，例如：拼音、字帖、点名' : 'Search tools, e.g. pinyin, worksheet, picker'}
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
        />

        <div className="filter-buttons" aria-label={lang === 'zh' ? '工具筛选' : 'Tool filters'}>
          <button className={`filter-btn ${filterCategory === 'all' && filterAccess === 'all' ? 'active' : ''}`} onClick={() => { setFilterCategory('all'); setFilterAccess('all'); }}>
            {lang === 'zh' ? '全部' : 'All'}
          </button>
          <button className={`filter-btn ${filterCategory === 'games' ? 'active' : ''}`} onClick={() => { setFilterCategory('games'); setFilterAccess('all'); }}>
            {lang === 'zh' ? '课堂互动' : 'Games'}
          </button>
          <button className={`filter-btn ${filterCategory === 'tools' ? 'active' : ''}`} onClick={() => { setFilterCategory('tools'); setFilterAccess('all'); }}>
            {lang === 'zh' ? '备课生成' : 'Prep'}
          </button>
          <button className={`filter-btn ${filterCategory === 'management' ? 'active' : ''}`} onClick={() => { setFilterCategory('management'); setFilterAccess('all'); }}>
            {lang === 'zh' ? '课堂管理' : 'Manage'}
          </button>
          <span className="filter-divider" aria-hidden="true">|</span>
          <button className={`filter-btn ${filterAccess === 'free' ? 'active' : ''}`} onClick={() => { setFilterCategory('all'); setFilterAccess('free'); }}>
            {lang === 'zh' ? '免费' : 'Free'}
          </button>
          <button className={`filter-btn ${filterAccess === 'pro' ? 'active' : ''}`} onClick={() => { setFilterCategory('all'); setFilterAccess('pro'); }}>Pro</button>
        </div>
      </div>

      {Object.entries(categories).map(([categoryId, category]) => {
        const categoryTools = groupedTools[categoryId];
        if (!categoryTools.length) return null;

        return (
          <section key={categoryId} className="tool-category">
            <div className="category-header">
              <h2 className="category-title">{lang === 'zh' ? category.titleZh : category.titleEn}</h2>
              <p className="category-desc">{lang === 'zh' ? category.descriptionZh : category.descriptionEn}</p>
            </div>

            <div className="tools-grid">
              {categoryTools.map((tool, index) => (
                <article key={tool.id} className={`tool-card ${disableEntranceAnimation ? 'no-entrance-animation' : ''}`} style={{ animationDelay: `${index * 0.04}s` }}>
                  <div className="tool-card-header">
                    <span className="tool-icon" aria-hidden="true">{tool.icon}</span>
                    <span className={`tool-access ${tool.access === 'pro' ? 'access-pro' : 'access-free'}`}>
                      {accessLabels[tool.access]?.[lang] || tool.access}
                    </span>
                  </div>

                  <h3 className="tool-name">{lang === 'zh' ? tool.titleZh : tool.titleEn}</h3>
                  <p className="tool-desc">{lang === 'zh' ? tool.descriptionZh : tool.descriptionEn}</p>
                  <div className="tool-tags">
                    {(lang === 'zh' ? tool.tagsZh : tool.tagsEn).slice(0, 3).map(tag => <span key={tag} className="tool-tag">{tag}</span>)}
                  </div>
                  <button className="tool-start-btn" onClick={() => onToolSelect?.(tool.id)}>
                    {lang === 'zh' ? '开始使用' : 'Start'}
                  </button>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {!filteredTools.length && <div className="no-results"><p>{lang === 'zh' ? '没有找到匹配的工具' : 'No tools found'}</p></div>}
    </div>
  );
}

export default ToolGrid;
