import React, { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import ToolGrid from './components/ToolGrid';
import AIComingSoon from './components/AIComingSoon';
import ToastDisplay from './components/ToastDisplay';
import UpgradeModal from './components/UpgradeModal';
import PricingPage from './components/PricingPage';
import ContactPage from './components/ContactPage';
import { getToolById } from './config/toolsConfig';
import './App.css';

const PAGE_PATHS = {
  home: '/',
  tools: '/tools',
  pricing: '/pricing',
  ai: '/ai',
  contact: '/contact'
};

function readRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path.startsWith('/tools/')) {
    return { page: 'tool', toolId: decodeURIComponent(path.slice('/tools/'.length)) };
  }
  const page = Object.entries(PAGE_PATHS).find(([, value]) => value === path)?.[0];
  return { page: page || 'home', toolId: null };
}

class ToolErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Tool render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="tool-error-state" role="alert">
          <h2>工具暂时无法打开</h2>
          <p>当前工具发生了错误，其他工具仍可继续使用。</p>
          <button className="btn-back" onClick={this.props.onBack}>返回全部工具</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { lang } = useLanguage();
  const { requireUpgrade } = useSubscription();
  const [route, setRoute] = useState(readRoute);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pendingScrollY, setPendingScrollY] = useState(null);
  const [disableToolEntrance, setDisableToolEntrance] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setIsFullscreen(false);
      setRoute(readRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useLayoutEffect(() => {
    if (route.page !== 'tools' || pendingScrollY === null) return;

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, pendingScrollY);
    root.style.scrollBehavior = previousBehavior;
    setPendingScrollY(null);
  }, [pendingScrollY, route.page]);

  const navigate = (path, { replace = false, scroll = true } = {}) => {
    if (replace) window.history.replaceState({}, '', path);
    else window.history.pushState({}, '', path);
    setIsFullscreen(false);
    setRoute(readRoute());
    if (scroll) window.scrollTo(0, 0);
  };

  const activeTool = route.page === 'tool' ? getToolById(route.toolId) : null;
  const ActiveToolComponent = useMemo(
    () => activeTool ? React.lazy(activeTool.load) : null,
    [activeTool]
  );

  const handleToolSelect = toolId => {
    const tool = getToolById(toolId);
    if (!tool) return;

    if (requireUpgrade(tool.access)) {
      setShowUpgradeModal(true);
      return;
    }

    sessionStorage.setItem('toolsScrollY', String(window.scrollY));
    setDisableToolEntrance(false);
    navigate(`/tools/${encodeURIComponent(tool.id)}`);
  };

  const handleNavigate = page => {
    navigate(PAGE_PATHS[page] || '/');
  };

  const handleBackToTools = () => {
    const savedY = Number(sessionStorage.getItem('toolsScrollY') || 0);
    setDisableToolEntrance(true);
    setPendingScrollY(savedY);
    sessionStorage.removeItem('toolsScrollY');
    navigate('/tools', { scroll: false });
  };

  const renderContent = () => {
    if (route.page === 'tool') {
      if (!activeTool || !ActiveToolComponent) {
        return (
          <div className="tool-error-state">
            <h2>{lang === 'zh' ? '没有找到这个工具' : 'Tool not found'}</h2>
            <button className="btn-back" onClick={handleBackToTools}>{lang === 'zh' ? '返回全部工具' : 'Back to tools'}</button>
          </div>
        );
      }

      return (
        <section className="game-section">
          <div className="game-header-controls">
            <button className="btn-back" onClick={handleBackToTools}>{lang === 'zh' ? '← 返回全部工具' : '← Back to tools'}</button>
          </div>
          <ToolErrorBoundary key={activeTool.id} onBack={handleBackToTools}>
            <Suspense fallback={<div className="tool-loading">{lang === 'zh' ? '正在加载工具…' : 'Loading tool…'}</div>}>
              <ActiveToolComponent
                text=""
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(value => !value)}
              />
            </Suspense>
          </ToolErrorBoundary>
        </section>
      );
    }

    if (route.page === 'pricing') {
      return (
        <div className="pricing-page-full">
          <button className="btn-back" onClick={() => handleNavigate('home')}>{lang === 'zh' ? '← 返回首页' : '← Back to Home'}</button>
          <PricingPage lang={lang} onNavigate={handleNavigate} />
        </div>
      );
    }

    if (route.page === 'tools') return <div className="tools-page"><ToolGrid onToolSelect={handleToolSelect} disableEntranceAnimation={disableToolEntrance} /></div>;
    if (route.page === 'ai') return <AIComingSoon onNavigate={handleNavigate} />;
    if (route.page === 'contact') return <ContactPage onNavigate={handleNavigate} />;
    return <HomePage onSelectTool={handleToolSelect} onNavigate={handleNavigate} />;
  };

  const navbarPage = route.page === 'tool' ? 'tools' : route.page;

  return (
    <div className="app">
      <Navbar onNavigate={handleNavigate} currentPage={navbarPage} />
      <main className="main-content"><div className="page-transition">{renderContent()}</div></main>

      {route.page !== 'tool' && (
        <footer className="footer">
          <div className="footer-main">
            <div className="footer-brand-section">
              <span className="footer-icon">📚</span>
              <div className="footer-brand-text">
                <span className="footer-text">HanClass</span>
                <span className="footer-subtitle">{lang === 'zh' ? '中文课堂工具箱' : 'Chinese Class Toolkit'}</span>
              </div>
            </div>
            <div className="footer-nav">
              <div className="footer-nav-group">
                <a href="/" onClick={event => { event.preventDefault(); handleNavigate('home'); }}>{lang === 'zh' ? '首页' : 'Home'}</a>
                <a href="/tools" onClick={event => { event.preventDefault(); handleNavigate('tools'); }}>{lang === 'zh' ? '全部工具' : 'Tools'}</a>
                <a href="/pricing" onClick={event => { event.preventDefault(); handleNavigate('pricing'); }}>{lang === 'zh' ? '价格方案' : 'Pricing'}</a>
                <a href="/ai" onClick={event => { event.preventDefault(); handleNavigate('ai'); }}>{lang === 'zh' ? 'AI备课' : 'AI Prep'}</a>
                <a href="/contact" onClick={event => { event.preventDefault(); handleNavigate('contact'); }}>{lang === 'zh' ? '联系' : 'Contact'}</a>
              </div>
            </div>
            <div className="footer-contact">
              <span className="footer-contact-label">{lang === 'zh' ? '联系方式' : 'Contact'}</span>
              <div className="contact-items">
                <a href="mailto:2654450145@qq.com"><span className="contact-label">QQ：</span>2654450145@qq.com</a>
                <a href="mailto:yy2068184@gmail.com"><span className="contact-label">Gmail：</span>yy2068184@gmail.com</a>
                <span className="contact-item"><span className="contact-label">小红书：</span>对外汉语备课实验室</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 HanClass. All rights reserved.</span>
            <span className="footer-tagline">{lang === 'zh' ? '让中文课堂更有趣，也让备课更简单' : 'Make Chinese classes more engaging and lesson prep easier'}</span>
          </div>
        </footer>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onViewPricing={() => { setShowUpgradeModal(false); handleNavigate('pricing'); }}
      />
      <ToastDisplay />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <SubscriptionProvider><AppContent /></SubscriptionProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
