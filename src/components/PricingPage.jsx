import React from 'react';
import './PricingPage.css';

/**
 * 价格方案页面 - Free Beta 版本
 */
function PricingPage({ lang = 'zh', onNavigate }) {

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1 className="pricing-title">
          {lang === 'zh' ? '会员系统即将开放' : 'Membership is Coming Soon'}
        </h1>
        <p className="pricing-subtitle">
          {lang === 'zh'
            ? 'HanClass 目前处于 Free Beta 公测阶段，所有工具暂时免费体验。'
            : 'HanClass is currently in Free Beta. All tools are free to try for now.'}
        </p>
      </div>

      <div className="free-beta-notice">
        <h2>🎉 Free Beta</h2>
        <p>
          {lang === 'zh'
            ? '目前所有工具暂时免费开放，欢迎老师试用并反馈。'
            : 'All tools are currently free to try. Teachers are welcome to provide feedback.'}
        </p>
      </div>

      <div className="contact-section-pricing">
        <h3>
          {lang === 'zh' ? '联系我们' : 'Contact Us'}
        </h3>
        <p>
          {lang === 'zh'
            ? '如果你有建议、合作需求，或希望了解后续会员计划，欢迎联系：'
            : 'For feedback, support, collaboration, or future membership plans, contact:'}
        </p>
        <div className="contact-emails-pricing">
          <a href="mailto:2654450145@qq.com">
            <span>📧</span> 2654450145@qq.com
          </a>
          <a href="mailto:yy2068184@gmail.com">
            <span>📧</span> yy2068184@gmail.com
          </a>
        </div>
      </div>

      <div className="pricing-actions">
        <button className="btn-contact-pricing" onClick={() => onNavigate && onNavigate('contact')}>
          {lang === 'zh' ? '联系我' : 'Contact'}
        </button>
        <button className="btn-explore-pricing" onClick={() => onNavigate && onNavigate('tools')}>
          {lang === 'zh' ? '查看全部工具' : 'Explore Tools'}
        </button>
      </div>
    </div>
  );
}

export default PricingPage;