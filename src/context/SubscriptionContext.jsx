import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ACCESS_MODE, isPreviewMode } from '../config/accessMode';

const SubscriptionContext = createContext(null);

const STORAGE_KEY = 'lumi_user_plan';

/**
 * 订阅上下文
 * 管理用户会员状态和工具访问权限
 *
 * 在 preview 模式下：所有工具都可以访问，不拦截
 * 在 paywall 模式下：按照 Free / Pro / School 权限拦截
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

  /**
   * 判断是否可以访问某个工具
   * - preview 模式：永远返回 true
   * - paywall 模式：按照权限判断
   */
  const canAccessTool = useCallback((toolAccess) => {
    // 预览模式下，所有工具都可以访问
    if (isPreviewMode) {
      return true;
    }

    // 付费墙模式下，按照原逻辑判断
    if (!toolAccess) return true;
    if (toolAccess === 'free' || toolAccess === 'limited_free') return true;
    if (toolAccess === 'pro') return isPro;
    if (toolAccess === 'school') return isSchool;
    return false;
  }, [isPro, isSchool]);

  /**
   * 判断是否需要升级
   * - preview 模式：永远返回 false
   * - paywall 模式：没有权限时返回 true
   */
  const requireUpgrade = useCallback((toolAccess) => {
    // 预览模式下，不需要升级
    if (isPreviewMode) {
      return false;
    }

    // 付费墙模式下，按照原逻辑判断
    return !canAccessTool(toolAccess);
  }, [canAccessTool]);

  /**
   * 获取按钮文案（根据权限和模式）
   */
  const getButtonText = useCallback((toolAccess, lang = 'zh') => {
    if (isPreviewMode) {
      // 预览模式下的文案
      if (toolAccess === 'free' || toolAccess === 'limited_free') {
        return lang === 'zh' ? '开始使用' : 'Start';
      }
      return lang === 'zh' ? '免费体验' : 'Try for Free';
    }

    // 付费墙模式下的文案
    if (canAccessTool(toolAccess)) {
      return lang === 'zh' ? '开始使用' : 'Start';
    }
    return lang === 'zh' ? '升级解锁' : 'Upgrade';
  }, [canAccessTool]);

  const value = {
    userPlan,
    setUserPlan,
    isPro,
    isSchool,
    canAccessTool,
    requireUpgrade,
    getButtonText,
    isPreviewMode, // 导出当前模式供其他地方使用
    ACCESS_MODE // 导出配置供其他地方使用
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