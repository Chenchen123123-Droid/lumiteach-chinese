import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { translations } from './translations';

/**
 * 语言上下文
 * 管理当前语言、提供 t 翻译函数
 * 支持从 localStorage 读取和保存
 */

const LanguageContext = createContext(null);

const STORAGE_KEY = 'classroom-lang';

/** 获取嵌套对象值 */
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined) return undefined;
    result = result[key];
  }
  return result;
}

export function LanguageProvider({ children }) {
  // 从 localStorage 读取，默认 zh
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'zh' || saved === 'en')) return saved;
    } catch {
      // localStorage 不可用
    }
    return 'zh';
  });

  // 切换语言并保存
  const setLang = useCallback((newLang) => {
    if (newLang !== 'zh' && newLang !== 'en') return;
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // localStorage 不可用
    }
  }, []);

  // 翻译函数：优先当前语言，回退中文，最后返回 key
  const t = useCallback(
    (key) => {
      const current = getNestedValue(translations[lang], key);
      if (current !== undefined) return current;

      const fallback = getNestedValue(translations['zh'], key);
      if (fallback !== undefined) return fallback;

      return key;
    },
    [lang]
  );

  // 批量翻译（支持 {n} 占位符替换）
  const tReplace = useCallback(
    (key, vars = {}) => {
      let text = t(key);
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
      return text;
    },
    [t]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, tReplace }),
    [lang, setLang, t, tReplace]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/** 在组件中使用语言上下文 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
