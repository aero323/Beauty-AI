/**
 * 研发标注（「注」徽标）总开关
 *
 * 原型里大量页面用右上角「注」徽标 + hover 气泡写产品 / 研发口径，评审时可能挡视线。
 * 这里给一个全站开关：顶栏切换后
 *   1. 新的 <DevNote> 组件直接不渲染；
 *   2. 存量零散写法的「注」徽标（统一使用 bg-blue-950 / bg-blue-950/95）由 index.css 里的
 *      html[data-dev-notes='off'] 规则统一隐藏。
 * 状态写在 localStorage（受限环境自动降级内存），默认开启——标注是原型评审的一部分，
 * 只有评审人主动关掉才隐藏。
 */

import React from 'react';
import { safeStorage } from './safeStorage';

const STORAGE_KEY = 'salesboost.dev-notes';

export interface DevNotesContextValue {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  toggle: () => void;
}

const DevNotesContext = React.createContext<DevNotesContextValue | null>(null);

function applyHtmlAttribute(enabled: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-dev-notes', enabled ? 'on' : 'off');
}

export function DevNotesProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = React.useState(() => {
    const initial = safeStorage.getItem(STORAGE_KEY) !== 'off';
    applyHtmlAttribute(initial);
    return initial;
  });

  const setEnabled = React.useCallback((value: boolean) => {
    setEnabledState(value);
    safeStorage.setItem(STORAGE_KEY, value ? 'on' : 'off');
    applyHtmlAttribute(value);
  }, []);

  const value = React.useMemo<DevNotesContextValue>(() => ({
    enabled,
    setEnabled,
    toggle: () => setEnabled(!enabled),
  }), [enabled, setEnabled]);

  return <DevNotesContext.Provider value={value}>{children}</DevNotesContext.Provider>;
}

/** 未包 Provider 时默认开启，保证零散页面单独渲染时标注仍在 */
export function useDevNotes(): DevNotesContextValue {
  return React.useContext(DevNotesContext) ?? { enabled: true, setEnabled: () => {}, toggle: () => {} };
}
