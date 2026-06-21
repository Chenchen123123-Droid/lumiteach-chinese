import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import './PlanDevSwitcher.css';

/**
 * 开发者工具：会员状态切换器
 *
 * ！！！正式上线前可删除或隐藏此组件！！！
 *
 * 用于开发测试时快速切换不同会员状态
 */
function PlanDevSwitcher({ lang = 'zh' }) {
  const { userPlan, setUserPlan } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);

  const plans = [
    { id: 'free', name: 'Free' },
    { id: 'pro', name: 'Pro' },
    { id: 'school', name: 'School' }
  ];

  const currentPlanName = plans.find(p => p.id === userPlan)?.name || 'Free';

  return (
    <div className="plan-dev-switcher">
      <button
        className="dev-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={lang === 'zh' ? '切换测试方案' : 'Switch Test Plan'}
      >
        🧪 {currentPlanName}
      </button>

      {isOpen && (
        <div className="dev-switcher-dropdown">
          <div className="dev-label">
            {lang === 'zh' ? '当前方案' : 'Current Plan'}: {currentPlanName}
          </div>
          <div className="dev-options">
            {plans.map(plan => (
              <button
                key={plan.id}
                className={`dev-option ${userPlan === plan.id ? 'active' : ''}`}
                onClick={() => {
                  setUserPlan(plan.id);
                  setIsOpen(false);
                }}
              >
                {plan.name}
                {userPlan === plan.id && <span className="current-tag">✓</span>}
              </button>
            ))}
          </div>
          <div className="dev-hint">
            {lang === 'zh'
              ? '⚠️ 开发测试用，正式上线前删除'
              : '⚠️ For development only, remove before production'}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanDevSwitcher;