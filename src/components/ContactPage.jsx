import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './ContactPage.css';

const XHS_IMAGE = '/contact/aa429a9c4b40ea34bcc2097818e65b1b.jpg';

function ContactPage({ onNavigate }) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-copy">
          <span className="contact-eyebrow"><i />HANCLASS · CONTACT</span>
          <h1>{isZh ? <>一起把中文课堂，<br />做得更好。</> : <>Let’s make Chinese classes<br />work even better.</>}</h1>
          <p>{isZh
            ? '遇到问题、想到新工具，或者希望一起合作，都欢迎告诉我。每一条真实的课堂反馈，都会帮助 HanClass 变得更实用。'
            : 'Questions, tool ideas, or collaboration proposals are all welcome. Real classroom feedback helps HanClass improve.'}</p>
        </div>
        <div className="contact-hero-note">
          <span>{isZh ? '反馈范围' : 'You can share'}</span>
          <strong>{isZh ? '问题反馈 · 功能建议 · 教学合作' : 'Bugs · Ideas · Collaboration'}</strong>
        </div>
      </section>

      <section className="contact-grid">
        <div className="contact-channel-card">
          <div className="contact-card-heading">
            <span>01</span>
            <div>
              <small>DIRECT CONTACT</small>
              <h2>{isZh ? '通过邮箱联系' : 'Contact by email'}</h2>
            </div>
          </div>

          <div className="contact-links">
            <a href="mailto:2654450145@qq.com">
              <span className="contact-link-icon">Q</span>
              <span><small>QQ MAIL</small><strong>2654450145@qq.com</strong></span>
              <b>↗</b>
            </a>
            <a href="mailto:yy2068184@gmail.com">
              <span className="contact-link-icon gmail">G</span>
              <span><small>GMAIL</small><strong>yy2068184@gmail.com</strong></span>
              <b>↗</b>
            </a>
          </div>

          <div className="contact-tip">
            <span>✦</span>
            <p><strong>{isZh ? '写反馈时可以附上截图' : 'Screenshots are helpful'}</strong>{isZh
              ? '请简单说明使用的工具和遇到的情况，我会更快定位问题。'
              : 'Mention the tool and what happened so the issue is easier to locate.'}</p>
          </div>

          <div className="contact-checklist">
            <small>{isZh ? '一条清楚的反馈最好包含' : 'A useful report includes'}</small>
            <div>
              <span><b>01</b>{isZh ? '工具名称' : 'Tool name'}</span>
              <span><b>02</b>{isZh ? '问题截图' : 'Screenshot'}</span>
              <span><b>03</b>{isZh ? '操作步骤' : 'Steps'}</span>
            </div>
          </div>
        </div>

        <div className="contact-social-card">
          <div className="contact-card-heading light">
            <span>02</span>
            <div>
              <small>XIAOHONGSHU</small>
              <h2>{isZh ? '关注备课实验室' : 'Follow the lesson lab'}</h2>
            </div>
          </div>
          <div className="xhs-profile">
            <img src={XHS_IMAGE} alt={isZh ? '对外汉语备课实验室小红书联系卡' : 'Xiaohongshu contact card'} />
          </div>
          <div className="xhs-meta">
            <div><small>{isZh ? '账号' : 'Account'}</small><strong>对外汉语备课实验室</strong></div>
            <div><small>{isZh ? '小红书号' : 'ID'}</small><strong>95444228441</strong></div>
          </div>
        </div>
      </section>

      <section className="contact-about">
        <div>
          <span className="contact-about-kicker">ABOUT HANCLASS</span>
          <h2>{isZh ? '工具来自课堂，也会回到课堂。' : 'Built from classrooms, for classrooms.'}</h2>
        </div>
        <div className="contact-about-copy">
          <p>{isZh
            ? 'HanClass 是为中文教师设计的课堂工具台，涵盖课堂游戏、词卡字帖、座位管理、听力活动和备课材料。现在仍在持续完善，你的使用体验会直接影响下一步优化。'
            : 'HanClass is a workspace for Chinese teachers, covering games, flashcards, worksheets, seating, listening activities, and lesson materials.'}</p>
          <div className="contact-actions">
            <button className="contact-primary" onClick={() => onNavigate?.('tools')}>{isZh ? '查看全部工具' : 'Explore tools'}</button>
            <button className="contact-secondary" onClick={() => onNavigate?.('home')}>{isZh ? '返回首页' : 'Back home'}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
