import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

/**
 * Toast 提供者
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 2000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    addToast(message, type, 2000);
  }, [addToast]);

  const showSuccess = useCallback((message) => {
    addToast(message, 'success', 2000);
  }, [addToast]);

  const showError = useCallback((message) => {
    addToast(message, 'error', 3000);
  }, [addToast]);

  const showWarning = useCallback((message) => {
    addToast(message, 'warning', 2500);
  }, [addToast]);

  const showInfo = useCallback((message) => {
    addToast(message, 'info', 2000);
  }, [addToast]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * 使用 Toast 的 hook
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}