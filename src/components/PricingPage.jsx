import React from 'react';
import { subscriptionPlans } from '../config/subscriptionPlans';
import './PricingPage.css';

/**
 * 价格方案页面
 * 展示 Free / Pro / School 三档会员
 */
function PricingPage({ lang = 'zh', onSelectPlan }) {
  const plans = Object.values(subscriptionPlans);

  const handlePlanClick = (planId) => {
    if (planId === 'free') return;
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else {
      alert(
        lang === 'zh'
          ? '订阅功能即将开放，当前为前端演示版本。'
          : 'Subscription is coming soon. This is a front-end demo for now.'
      );
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1 className="pricing-title">
          {lang === 'zh' ? '价格方案' : 'Pricing'}
        </h1>
        <p className="pricing-subtitle">
          {lang === 'zh'
            ? '选择适合你的中文课堂工具方案'
            : 'Choose the best plan for your Chinese classroom'}
        </p>
      </div>

      <div className="pricing-cards">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`pricing-card ${plan.recommended ? 'recommended' : ''}`}
          >
            {plan.recommended && (
              <div className="recommended-badge">
                {lang === 'zh' ? '推荐' : 'Recommended'}
              </div>
            )}

            <div className="plan-header">
              <h3 className="plan-name">
                {lang === 'zh' ? plan.nameZh : plan.nameEn}
              </h3>
              <div className="plan-price">
                {lang === 'zh' ? plan.priceZh : plan.priceEn}
              </div>
              <p className="plan-description">
                {lang === 'zh' ? plan.descriptionZh : plan.descriptionEn}
              </p>
            </div>

            <ul className="plan-features">
              {(lang === 'zh' ? plan.featuresZh : plan.featuresEn).map((feature, idx) => (
                <li key={idx} className="feature-item">
                  <span className="feature-check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`plan-button ${plan.id}`}
              onClick={() => handlePlanClick(plan.id)}
            >
              {lang === 'zh' ? plan.buttonZh : plan.buttonEn}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <p>
          {lang === 'zh'
            ? '* 价格可能会根据地区有所不同，实际价格以支付时为准'
            : '* Prices may vary by region. Actual price at checkout.'}
        </p>
      </div>
    </div>
  );
}

export default PricingPage;