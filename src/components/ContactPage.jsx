import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './ContactPage.css';

/**
 * 联系页面 - 全新布局
 */
function ContactPage({ onNavigate }) {
  const { lang } = useLanguage();

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* 主要联系卡片 - 左右布局 */}
        <div className="contact-card">
          <div className="contact-content">
            {/* 左侧：标题和说明 */}
            <div className="contact-left">
              <h1>{lang === 'zh' ? '联系我们' : 'Contact'}</h1>
              <p className="contact-intro">
                {lang === 'zh'
                  ? '如果你在使用 HanClass 的过程中遇到任何问题，或者有工具优化建议、功能需求、合作想法，欢迎联系我。'
                  : 'If you have any questions, feedback, feature suggestions, or collaboration ideas while using HanClass, feel free to contact me.'}
              </p>

              <div className="contact-info">
                {/* 邮箱 */}
                <div className="info-group">
                  <h3>{lang === 'zh' ? '邮箱' : 'Emails'}</h3>
                  <a href="mailto:2654450145@qq.com" className="info-item">
                    <span className="info-label">QQ {lang === 'zh' ? '邮箱' : 'Mail'}：</span>
                    <span>2654450145@qq.com</span>
                  </a>
                  <a href="mailto:yy2068184@gmail.com" className="info-item">
                    <span className="info-label">Gmail：</span>
                    <span>yy2068184@gmail.com</span>
                  </a>
                </div>

                {/* 小红书 */}
                <div className="info-group">
                  <h3>Xiaohongshu</h3>
                  <div className="info-item">
                    <span className="info-label">{lang === 'zh' ? '小红书' : 'Xiaohongshu'}：</span>
                    <span>对外汉语备课实验室</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{lang === 'zh' ? '小红书号' : 'Xiaohongshu ID'}：</span>
                    <span>95444228441</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：小红书二维码 */}
            <div className="contact-right">
              <div className="qr-card">
                <img
                  src="/contact/xiaohongshu-contact.jpg"
                  alt="Xiaohongshu QR Code"
                  className="qr-image"
                />
                <p className="qr-caption">
                  {lang === 'zh' ? '扫码在小红书找到我' : 'Scan to find me on Xiaohongshu'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 关于 HanClass */}
        <div className="about-card">
          <h2>{lang === 'zh' ? '关于 HanClass' : 'About HanClass'}</h2>
          <p className="about-text">
            {lang === 'zh'
              ? 'HanClass 是为中文老师设计的课堂工具箱，帮助你快速制作课堂游戏、词卡、字帖、座位表、听力活动和备课材料。根据你的反馈，我们会持续优化和更新更多功能。'
              : 'HanClass is a classroom toolkit for Chinese teachers, helping you quickly create games, flashcards, worksheets, seating charts, listening activities, and teaching materials. We continue to improve and add more features based on your feedback.'}
          </p>
        </div>

        {/* 行动按钮 */}
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