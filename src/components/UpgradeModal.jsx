import React from 'react';
import './UpgradeModal.css';

/**
 * 升级提示弹窗
 * 当 Free 用户点击 PRO 工具时显示
 */
function UpgradeModal({ isOpen, onClose, onViewPricing }) {
  if (!isOpen) return null;

  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="upgrade-modal-icon">⭐</div>
        <h2 className="upgrade-modal-title">
          升级 Pro 解锁此工具
        </h2>
        <p className="upgrade-modal-description">
          此工具属于 Pro 功能。当前订阅功能还未正式开放，你可以先查看价格方案。
        </p>
        <div className="upgrade-modal-buttons">
          <button className="btn-view-pricing" onClick={onViewPricing}>
            查看价格方案
          </button>
          <button className="btn-maybe-later" onClick={onClose}>
            稍后再说
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;