import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { ToastProvider } from './context/ToastContext';
import { isPreviewMode } from './config/accessMode';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import ToolGrid from './components/ToolGrid';
import AIComingSoon from './components/AIComingSoon';
import ToastDisplay from './components/ToastDisplay';
import DisappearingTextGame from './components/DisappearingTextGame';
import SentenceOrderGame from './components/SentenceOrderGame';
import WordMatchingGame from './components/WordMatchingGame';
import TeachingGomokuGame from './components/TeachingGomokuGame';
import WordGachaGame from './components/WordGachaGame';
import GuessCharacterChallenge from './components/GuessCharacterChallenge';
import PinyinWheelGame from './components/PinyinWheelGame';
import PinyinGuessHanZiGame from './components/PinyinGuessHanZiGame';
import LuckyWordBoxGame from './components/LuckyWordBoxGame';
import WordMinesweeperGame from './components/WordMinesweeperGame';
import HanziWorksheetGenerator from './components/HanziWorksheetGenerator';
import LuckyPickerTool from './components/LuckyPickerTool';
import SeatManagerTool from './components/SeatManagerTool';
import HanziComponentCardGenerator from './components/HanziComponentCardGenerator';
import ChineseUnoCardGenerator from './components/ChineseUnoCardGenerator';
import WordCloudGenerator from './components/WordCloudGenerator';
import SpotItCardGenerator from './components/SpotItCardGenerator';
import SlingshotQuizBattle from './components/SlingshotQuizBattle';
import ChineseTypingChallenge from './components/ChineseTypingChallenge';
import IdiomSnakeGame from './components/IdiomSnakeGame';
import UpgradeModal from './components/UpgradeModal';
import PricingPage from './components/PricingPage';
import './App.css';

/**
 * 内部组件：使用语言上下文的 App 内容
 */
function AppContent() {
  const { lang, t } = useLanguage();
  const { canAccessTool, requireUpgrade } = useSubscription();

  // 状态管理
  const [text, setText] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [view, setView] = useState('home');

  // 工具权限配置
  const toolAccessMap = {
    slingshot: 'free',
    typing: 'limited_free',
    snake: 'limited_free',
    disappearing: 'pro',
    sentence: 'pro',
    matching: 'limited_free',
    gomoku: 'pro',
    guesschar: 'pro',
    luckybox: 'pro',
    minesweeper: 'pro',
    worksheet: 'pro',
    seatmanager: 'pro',
    hanzicomponent: 'pro',
    chineseuno: 'pro',
    wordcloud: 'free',
    spotit: 'free',
    gacha: 'free',
    pinyinwheel: 'free',
    pinyinguess: 'free',
    luckypicker: 'free'
  };

  const noTextRequired = ['slingshot', 'typing', 'snake', 'gomoku', 'gacha', 'guesschar', 'pinyinwheel', 'pinyinguess', 'luckybox', 'minesweeper', 'worksheet', 'luckypicker', 'seatmanager', 'hanzicomponent', 'chineseuno', 'wordcloud', 'spotit', 'matching'];

  const handleGenerate = () => {
    // 预览模式下，所有工具都可以直接生成
    if (isPreviewMode) {
      if (noTextRequired.includes(selectedGame)) {
        setIsGenerating(true);
        return;
      }
      if (!text.trim()) {
        alert(t('messages.emptyInput'));
        return;
      }
      if (!selectedGame) {
        alert(t('messages.selectGameFirst'));
        return;
      }
      setIsGenerating(true);
      return;
    }

    // 付费墙模式下，按照权限判断
    const toolAccess = toolAccessMap[selectedGame] || 'free';

    if (requireUpgrade(toolAccess)) {
      setShowUpgradeModal(true);
      return;
    }

    if (noTextRequired.includes(selectedGame)) {
      setIsGenerating(true);
      return;
    }
    if (!text.trim()) {
      alert(t('messages.emptyInput'));
      return;
    }
    if (!selectedGame) {
      alert(t('messages.selectGameFirst'));
      return;
    }
    setIsGenerating(true);
  };

  const handleGameSelect = (gameId) => {
    // 设置选中的游戏
    setSelectedGame(gameId);

    // 预览模式下，所有工具都可以直接打开
    if (isPreviewMode) {
      setIsGenerating(true);
      return;
    }

    // 付费墙模式下，按照权限判断
    const toolAccess = toolAccessMap[gameId] || 'free';
    if (requireUpgrade(toolAccess)) {
      setShowUpgradeModal(true);
    }
    // 无论是否需要升级，都可以开始使用
    setIsGenerating(true);
  };

  const handleToolSelect = (toolId) => {
    if (toolId) {
      handleGameSelect(toolId);
    } else {
      setView('home');
    }
  };

  const handleNavigate = (sectionId) => {
    if (sectionId === 'tools' || sectionId === 'all-tools') {
      setView('tools');
    } else if (sectionId === 'pricing') {
      setShowPricing(true);
    } else if (sectionId === 'ai') {
      setView('ai');
    } else {
      setView('home');
    }
  };

  const handleViewPricing = () => {
    setShowUpgradeModal(false);
    setShowPricing(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleBack = () => {
    setIsGenerating(false);
    setIsFullscreen(false);
    setSelectedGame(null);
  };

  const renderTool = () => {
    switch (selectedGame) {
      case 'slingshot':
        return <SlingshotQuizBattle />;
      case 'typing':
        return <ChineseTypingChallenge />;
      case 'snake':
        return <IdiomSnakeGame />;
      case 'disappearing':
        return <DisappearingTextGame text={text} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'sentence':
        return <SentenceOrderGame text={text} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'matching':
        return <WordMatchingGame isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'gomoku':
        return <TeachingGomokuGame />;
      case 'gacha':
        return <WordGachaGame />;
      case 'guesschar':
        return <GuessCharacterChallenge />;
      case 'pinyinwheel':
        return <PinyinWheelGame />;
      case 'pinyinguess':
        return <PinyinGuessHanZiGame />;
      case 'luckybox':
        return <LuckyWordBoxGame />;
      case 'minesweeper':
        return <WordMinesweeperGame />;
      case 'worksheet':
        return <HanziWorksheetGenerator />;
      case 'luckypicker':
        return <LuckyPickerTool />;
      case 'seatmanager':
        return <SeatManagerTool />;
      case 'hanzicomponent':
        return <HanziComponentCardGenerator />;
      case 'chineseuno':
        return <ChineseUnoCardGenerator />;
      case 'wordcloud':
        return <WordCloudGenerator />;
      case 'spotit':
        return <SpotItCardGenerator />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (isGenerating) {
      return (
        <section className="game-section">
          <div className="game-header-controls">
            <button className="btn-back" onClick={handleBack}>
              {lang === 'zh' ? '← 返回' : '← Back'}
            </button>
          </div>
          {renderTool()}
        </section>
      );
    }

    if (showPricing) {
      return (
        <div className="pricing-page-full">
          <button className="btn-back" onClick={() => setShowPricing(false)}>
            {lang === 'zh' ? '← 返回首页' : '← Back to Home'}
          </button>
          <PricingPage lang={lang} onSelectPlan={() => {}} />
        </div>
      );
    }

    switch (view) {
      case 'home':
        return <HomePage onSelectTool={handleToolSelect} onNavigate={handleNavigate} />;
      case 'tools':
        return (
          <div className="tools-page">
            <ToolGrid onToolSelect={handleGameSelect} />
          </div>
        );
      case 'ai':
        return <AIComingSoon onNavigate={handleNavigate} />;
      default:
        return <HomePage onSelectTool={handleToolSelect} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      <Navbar onNavigate={handleNavigate} currentPage={view} />

      <main className="main-content">
        <div className="page-transition">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-icon">📚</span>
            <span className="footer-text">LumiTeach</span>
          </div>
          <div className="footer-links">
            <span>© 2024 LumiTeach Chinese</span>
            <span> | </span>
            <span>{lang === 'zh' ? '让中文课堂更有趣' : 'Make Chinese classes more interactive'}</span>
          </div>
        </div>
      </footer>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onViewPricing={handleViewPricing}
      />

      {/* Toast 提示 */}
      <ToastDisplay />
    </div>
  );
}

/**
 * 主应用组件
 */
function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;