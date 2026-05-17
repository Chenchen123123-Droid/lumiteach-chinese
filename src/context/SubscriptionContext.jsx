import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SubscriptionContext = createContext(null);

const STORAGE_KEY = 'lumi_user_plan';

/**
 * 订阅上下文
 * 管理用户会员状态和工具访问权限
 */
export function SubscriptionProvider({ children }) {
  // 从 localStorage 读取用户订阅状态
  const [userPlan, setUserPlanState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || 'free';
    } catch {
      return 'free';
    }
  });

  // 保存用户订阅状态到 localStorage
  const setUserPlan = useCallback((plan) => {
    try {
      localStorage.setItem(STORAGE_KEY, plan);
      setUserPlanState(plan);
    } catch (e) {
      console.error('Error saving user plan:', e);
    }
  }, []);

  // 监听变化，同步到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, userPlan);
    } catch (e) {
      console.error('Error syncing user plan:', e);
    }
  }, [userPlan]);

  // 判断是否是 Pro 或更高
  const isPro = userPlan === 'pro' || userPlan === 'school';

  // 判断是否是 School
  const isSchool = userPlan === 'school';

  // 判断是否可以访问某个工具
  const canAccessTool = useCallback((toolAccess) => {
    if (!toolAccess) return true;
    if (toolAccess === 'free' || toolAccess === 'limited_free') return true;
    if (toolAccess === 'pro') return isPro;
    if (toolAccess === 'school') return isSchool;
    return false;
  }, [isPro, isSchool]);

  // 如果没有权限，返回需要升级的提示
  const requireUpgrade = useCallback((toolAccess) => {
    return !canAccessTool(toolAccess);
  }, [canAccessTool]);

  const value = {
    userPlan,
    setUserPlan,
    isPro,
    isSchool,
    canAccessTool,
    requireUpgrade
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * 使用订阅上下文的 Hook
 */
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export default SubscriptionContext;