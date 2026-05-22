import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './ContactPage.css';

/**
 * 联系页面
 */
function ContactPage({ onNavigate }) {
  const { lang } = useLanguage();

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1>{lang === 'zh' ? '联系 HanClass' : 'Contact HanClass'}</h1>
          <p className="contact-subtitle">
            {lang === 'zh'
              ? '如果你有任何建议、反馈、合作或会员咨询，欢迎联系我们。'
              : 'For feedback, support, collaboration, or membership inquiries, contact us.'}
          </p>
        </div>

        <div className="contact-section">
          <h2>{lang === 'zh' ? '联系我们' : 'Contact Us'}</h2>
          <p className="contact-intro">
            {lang === 'zh'
              ? 'HanClass 目前处于 Free Beta 公测阶段，欢迎老师试用并反馈。'
              : 'HanClass is currently in Free Beta. Teachers are welcome to try and provide feedback.'}
          </p>

          <div className="contact-emails">
            <a href="mailto:2654450145@qq.com" className="contact-email">
              <span className="email-icon">📧</span>
              <span>2654450145@qq.com</span>
            </a>
            <a href="mailto:yy2068184@gmail.com" className="contact-email">
              <span className="email-icon">📧</span>
              <span>yy2068184@gmail.com</span>
            </a>
          </div>
        </div>

        <div className="contact-section">
          <h2>{lang === 'zh' ? '关于 HanClass' : 'About HanClass'}</h2>
          <p className="about-text">
            {lang === 'zh'
              ? 'HanClass 是为中文老师设计的课堂工具箱，帮助你快速制作课堂游戏、词卡、字帖、座位表、听力活动和备课材料。根据你的反馈，我们会持续优化和更新更多功能。'
              : 'HanClass is a classroom toolkit for Chinese teachers, helping you quickly create games, flashcards, worksheets, seating charts, listening activities, and teaching materials. We continue to improve and add more features based on your feedback.'}
          </p>
        </div>

        <div className="contact-actions">
          <button className="btn-primary" onClick={() => onNavigate && onNavigate('tools')}>
            {lang === 'zh' ? '查看全部工具' : 'Explore Tools'}
          </button>
          <button className="btn-secondary" onClick={() => onNavigate && onNavigate('home')}>
            {lang === 'zh' ? '返回首页' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;