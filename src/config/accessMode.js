/**
 * 全局访问模式配置
 *
 * 用于控制网站的权限模式：
 * - "preview": 公开体验模式，所有工具都能访问
 * - "paywall": 正式付费模式，按照 Free / Pro / School 权限拦截
 *
 * 切换方式：
 * 1. 直接修改 ACCESS_MODE 值
 * 2. 或使用环境变量 VITE_ACCESS_MODE
 */

// 直接配置（开发用）
export const ACCESS_MODE = "preview";

// 环境变量配置（生产用，可覆盖上面的值）
// export const ACCESS_MODE = import.meta.env.VITE_ACCESS_MODE || "preview";

/**
 * 是否为预览模式
 */
export const isPreviewMode = ACCESS_MODE === "preview";

/**
 * 是否为付费墙模式
 */
export const isPaywallMode = ACCESS_MODE === "paywall";

/**
 * 获取访问模式描述
 */
export const getAccessModeDescription = (lang = 'zh') => {
  if (isPreviewMode) {
    return lang === 'zh'
      ? '当前为公开体验版，所有工具暂时免费开放'
      : 'Public preview: all tools are currently available';
  }
  return lang === 'zh'
    ? '正式模式：按照会员等级限制工具访问'
    : 'Production mode: tools restricted by subscription';
};

export default {
  ACCESS_MODE,
  isPreviewMode,
  isPaywallMode,
  getAccessModeDescription
};
