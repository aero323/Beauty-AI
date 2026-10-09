/**
 * 研发标注徽标（右上角「注」）
 *
 * 用法：放在标注对象外层的 relative 容器里，徽标绝对定位到右上角，不占布局；
 * hover / 键盘聚焦徽标时展示蓝色气泡里的研发备注。顶栏「研发标注」开关关闭时整体不渲染。
 * 注意：如果外层是 overflow-hidden 的容器（如 shadcn Card），请把 DevNote 放到外层
 * relative 包装 div 上，避免徽标与气泡被裁掉。
 */

import React from 'react';
import { cn } from '../lib/utils';
import { useDevNotes } from '../lib/devNotes';

export function DevNote({
  children,
  className,
  tipClassName,
}: {
  children: React.ReactNode;
  className?: string;
  tipClassName?: string;
}) {
  const { enabled } = useDevNotes();
  if (!enabled) return null;

  return (
    <span className={cn('group/devnote absolute -right-1.5 -top-2 z-30 inline-flex', className)}>
      <button
        type="button"
        aria-label="研发标注"
        className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-950 px-1 text-center text-[9px] font-bold leading-4 text-white shadow-sm outline-none ring-blue-300 transition-colors hover:bg-blue-900 focus:ring-2"
      >
        注
      </button>
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute right-0 top-full z-[80] mt-2 hidden w-80 max-w-[80vw] rounded-lg bg-blue-950/95 px-3 py-2 text-left text-xs font-normal leading-relaxed text-white shadow-xl backdrop-blur-sm group-hover/devnote:block group-focus-within/devnote:block',
          tipClassName,
        )}
      >
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-white/50">研发备注</span>
        {children}
      </span>
    </span>
  );
}
