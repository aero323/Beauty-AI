import { cn } from '../lib/utils';

export type EffectiveStatus = 'pending' | 'active';

interface EffectiveStatusBadgeProps {
  status: EffectiveStatus;
  className?: string;
}

export function EffectiveStatusBadge({ status, className }: EffectiveStatusBadgeProps) {
  const isActive = status === 'active';

  return (
    <span
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-bold',
        isActive
          ? 'border-[#BFE3D4] bg-[#EEF8F4] text-[#2F735C]'
          : 'border-[#F1D39D] bg-[#FFF7EA] text-[#8B621F]',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isActive ? 'bg-[#3B8F72]' : 'bg-[#B9822B]'
        )}
      />
      {isActive ? '已生效' : '待生效'}
    </span>
  );
}
