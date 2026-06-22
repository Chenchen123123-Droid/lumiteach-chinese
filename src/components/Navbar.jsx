import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './Navbar.css';

/**
 * 顶部导航栏组件
 */
function Navbar({ onNavigate, currentPage = 'home' }) {
  const { lang, setLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page, e) => {
		e.preventDefault();
		if (onNavigate) {
			onNavigate(page);
		}
		setMobileOpen(false);
	};

	const isActive = (page) => currentPage === page ? 'active' : '';

	return (
		<nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
			<div className="navbar-container">
				<div className="navbar-brand">
					<a href="#" className="brand-link" onClick={(e) => handleNavClick('home', e)}>
						<span className="brand-mark" aria-hidden="true">汉</span>
						<span className="brand-text">HanClass</span>
					</a>
				</div>

				<ul className="navbar-menu">
					<li className={`nav-item ${isActive('home')}`}>
						<a href="#" onClick={(e) => handleNavClick('home', e)}>
							{lang === 'zh' ? '首页' : 'Home'}
						</a>
					</li>
					<li className={`nav-item ${isActive('tools')}`}>
						<a href="#" onClick={(e) => handleNavClick('tools', e)}>
							{lang === 'zh' ? '全部工具' : 'Tools'}
						</a>
					</li>
					<li className={`nav-item ${isActive('contact')}`}>
						<a href="#" onClick={(e) => handleNavClick('contact', e)}>
							{lang === 'zh' ? '联系' : 'Contact'}
						</a>
					</li>
				</ul>

				<div className="navbar-actions">
					<span className="beta-pill">BETA</span>
					<select
						className="lang-select"
						value={lang}
						onChange={(e) => setLang(e.target.value)}
					>
						<option value="zh">中文</option>
						<option value="en">English</option>
					</select>
					<button className="btn-cta" onClick={(e) => handleNavClick('tools', e)}>
						{lang === 'zh' ? '免费开始' : 'Start for Free'}
					</button>
					<button
						className="mobile-menu-toggle"
						type="button"
						aria-expanded={mobileOpen}
						aria-label={lang === 'zh' ? '打开导航菜单' : 'Open navigation menu'}
						onClick={() => setMobileOpen(value => !value)}
					>
						<span></span><span></span><span></span>
					</button>
				</div>
			</div>
			{mobileOpen && (
				<div className="mobile-menu">
					<a href="/" onClick={(e) => handleNavClick('home', e)}>{lang === 'zh' ? '首页' : 'Home'}</a>
					<a href="/tools" onClick={(e) => handleNavClick('tools', e)}>{lang === 'zh' ? '全部工具' : 'Tools'}</a>
					<a href="/contact" onClick={(e) => handleNavClick('contact', e)}>{lang === 'zh' ? '联系与反馈' : 'Contact & feedback'}</a>
					<div className="mobile-language">
						<span>{lang === 'zh' ? '语言' : 'Language'}</span>
						<button className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>中文</button>
						<button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>English</button>
					</div>
				</div>
			)}
		</nav>
	);
}

export default Navbar;
