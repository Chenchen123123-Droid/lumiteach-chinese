import React from 'react';
import { isPreviewMode } from '../config/accessMode';
import './UpgradeModal.css';

/**
 * 升级提示弹窗
 * 当 Free 用户点击 PRO 工具时显示
 */
function UpgradeModal({ isOpen, onClose, onViewPricing, lang = 'zh' }) {
  if (!isOpen) return null;

  const title = isPreviewMode
    ? (lang === 'zh' ? '免费体验中' : 'Try for Free')
    : (lang === 'zh' ? '升级 Pro 解锁此工具' : 'Upgrade to Pro');

  const description = isPreviewMode
    ? (lang === 'zh'
        ? '当前为公开体验版，所有工具都可以免费试用。点击上方按钮开始使用！'
        : 'This is a public preview. All tools are available. Click the button above to start!')
    : (lang === 'zh'
        ? '此工具属于 Pro 功能。当前订阅功能还未正式开放，你可以先查看价格方案。'
        : 'This tool requires Pro subscription. You can view the pricing.');

  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="upgrade-modal-icon">
          {isPreviewMode ? '🎉' : '⭐'}
        </div>
        <h2 className="upgrade-modal-title">
          {title}
        </h2>
        <p className="upgrade-modal-description">
          {description}
        </p>
        <div className="upgrade-modal-buttons">
          {isPreviewMode ? (
            <button className="btn-view-pricing" onClick={onClose}>
              {lang === 'zh' ? '开始使用' : 'Start'}
            </button>
          ) : (
            <>
              <button className="btn-view-pricing" onClick={onViewPricing}>
                {lang === 'zh' ? '查看价格方案' : 'View Pricing'}
              </button>
              <button className="btn-maybe-later" onClick={onClose}>
                {lang === 'zh' ? '稍后再说' : 'Later'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;