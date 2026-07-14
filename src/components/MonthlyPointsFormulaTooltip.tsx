import { Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface MonthlyPointsFormulaTooltipProps {
  className?: string;
  tooltipClassName?: string;
}

export function MonthlyPointsFormulaTooltip({ className, tooltipClassName }: MonthlyPointsFormulaTooltipProps) {
  return (
    <span className={cn('relative inline-flex items-center justify-center align-middle normal-case tracking-normal group/monthly-points', className)}>
      <button
        type="button"
        aria-label="当月积分计算公式"
        className="inline-flex items-center justify-center gap-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[#B9822B]/20"
      >
        <span>当月积分</span>
        <Info className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
      </button>

      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 top-full z-[90] mt-2 hidden w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-[#E5DED8] bg-white p-3 text-left text-[11px] font-medium leading-relaxed text-[#5D565A] shadow-xl group-hover/monthly-points:block group-focus-within/monthly-points:block',
          tooltipClassName
        )}
      >
        <span className="block text-xs font-bold text-[#242124]">当月积分计算公式</span>
        <span className="mt-2 block rounded-md bg-[#F8F5F3] px-2 py-1.5 font-bold text-[#A85F4B]">
          当月积分 = 已完成任务数 x 10 + 考试成绩
        </span>
        <span className="mt-2 block">
          <span className="font-bold text-[#242124]">任务完成分：</span>
          <span>每完成 1 个任务计 10 分。</span>
        </span>
        <span className="mt-1 block">
          <span className="font-bold text-[#242124]">考试成绩：</span>
          <span>按当月考试原始分直接计入，不再折算。</span>
        </span>
        <span className="mt-2 block border-t border-[#E9E4DF] pt-2 text-[10px] text-[#766F73]">
          同一统计周期内实时累计，月底冻结归档。
        </span>
      </span>
    </span>
  );
}

export function StorePointsFormulaTooltip({ className, tooltipClassName }: MonthlyPointsFormulaTooltipProps) {
  return (
    <span className={cn('relative inline-flex items-center justify-center align-middle normal-case tracking-normal group/store-points', className)}>
      <button
        type="button"
        aria-label="门店积分计算公式"
        className="inline-flex items-center justify-center gap-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[#B9822B]/20"
      >
        <span>门店积分</span>
        <Info className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
      </button>

      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 top-full z-[90] mt-2 hidden w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-[#E5DED8] bg-white p-3 text-left text-[11px] font-medium leading-relaxed text-[#5D565A] shadow-xl group-hover/store-points:block group-focus-within/store-points:block',
          tooltipClassName
        )}
      >
        <span className="block text-xs font-bold text-[#242124]">门店积分计算公式</span>
        <span className="mt-2 block rounded-md bg-[#F8F5F3] px-2 py-1.5 font-bold text-[#A85F4B]">
          门店积分 = 全店员工当月积分合计 / 店员人数
        </span>
        <span className="mt-2 block text-[#766F73]">
          按当前门店员工列表计算，员工积分变动后门店积分同步更新。
        </span>
      </span>
    </span>
  );
}
