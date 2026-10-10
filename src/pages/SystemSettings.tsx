/**
 * 系统设置（Super Admin）
 *
 * 审批功能的客户级总开关放在这里：客户可以选择是否使用审批功能。
 * 关闭后新的提交直接生效，已经在审的单据继续走完；类型 / 审批人由审批管理者维护。
 */

import React from 'react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle2, Info, Settings2, ShieldCheck, TriangleAlert } from 'lucide-react';
import { setApprovalMasterEnabled, useApprovalState } from '../lib/approvalStore';
import { APPROVAL_TYPE_META, APPROVAL_TYPE_ORDER, approverLabel, type ApprovalTypeFlow } from '../lib/approvalTypes';
import { cn } from '../lib/utils';

export function SystemSettings() {
  const state = useApprovalState();
  const enabled = state.config.masterEnabled;

  return (
    <div className="flex-1 flex flex-col pt-2 h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#1F1C1F]">系统设置</h2>
        <p className="mt-1 text-sm text-[#766F73]">客户级功能开关与平台配置；具体审批流程由审批管理者在「审批流程配置」里维护。</p>
      </div>

      <div className="max-w-4xl space-y-4">
        <Card className={cn('rounded-2xl border shadow-sm', enabled ? 'border-[#DCEFE7]' : 'border-[#E9E4DF]')}>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', enabled ? 'bg-[#EEF8F4] text-[#3B8F72]' : 'bg-[#F8F5F3] text-[#9A9396]')}>
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-[#1F1C1F]">
                    审批功能
                    <Badge variant="outline" className={cn('py-0 text-[10px]', enabled ? 'border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]' : 'border-[#E5DED8] bg-[#F8F5F3] text-[#766F73]')}>
                      {enabled ? '客户已启用' : '客户未启用'}
                    </Badge>
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#766F73]">
                    开启后，培训师上传课件、创建练习、发布任务等动作会先进入审批：由审批管理者在站内信 / 待办里点「同意」后才对学员生效。
                    关闭后全部产出恢复即时生效；已经在审的单据会继续走完，不会半路失效。
                  </p>
                  <p className="mt-2 text-xs text-[#9A9396]">
                    总开关由系统管理员控制 · 类型开关与审批人由审批管理者在「审批流程配置」里维护
                    {state.config.masterUpdatedBy ? ` · 最近修改：${state.config.masterUpdatedBy}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setApprovalMasterEnabled(!enabled, '系统管理员')}
                className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', enabled ? 'bg-[#3B8F72]' : 'bg-[#D8D2CE]')}
              >
                <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all', enabled ? 'left-[22px]' : 'left-0.5')} />
              </button>
            </div>

            <div className="mt-5 grid gap-2 border-t border-[#F1ECE8] pt-4 sm:grid-cols-2">
              {APPROVAL_TYPE_ORDER.map(type => {
                const flow = state.config.types[type];
                const regionalEnabled = Object.entries(flow.regional).filter(([, rule]) => rule.enabled);
                const on = flow.national.enabled || regionalEnabled.length > 0;
                return (
                  <div key={type} className="flex items-start justify-between gap-3 rounded-xl border border-[#EFE9E5] bg-[#FDFBFA] px-3 py-2.5">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold text-[#3F3A3D]">
                        {APPROVAL_TYPE_META[type].label}
                        {on
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-[#3B8F72]" />
                          : <span className="text-[10px] font-medium text-[#9A9396]">未开启审批</span>}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-[#9A9396]">
                        {flow.national.enabled
                          ? `全国：${summarizeLevels(flow.national.levels)}`
                          : '全国：未开启'}
                        {regionalEnabled.length > 0 ? ` · 区域：${regionalEnabled.length} 个区域单独配置` : ''}
                      </p>
                    </div>
                   <PendingHint flow={flow} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E9E4DF] shadow-sm">
          <CardContent className="flex items-start gap-3 p-5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#9A9396]" />
            <div className="text-xs leading-relaxed text-[#766F73]">
              <p className="font-bold text-[#3F3A3D]">给研发的口径</p>
              <p className="mt-1">1. 这里的总开关是客户级（租户级）开关：关闭时所有类型直接生效，审批配置页只读。</p>
              <p>2. 开启时按「类型 × 范围」判断是否需要审批；区域未单独配置就沿用全国流程；开启但层级未配齐（缺审批人）时提交会被阻止并提示补齐配置。</p>
            <p>2.1 多级审批按层级顺序逐级进行，最后一级同意才生效；任一级驳回即整单驳回。审批流程配置归超管（本页总开关 + 「审批流程配置」页）。</p>
              <p>3. 原型里审批人来自固定的演示账号名单，生产环境需要接到账号管理 / 组织权限系统，并禁止自审。</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 text-[11px] text-[#9A9396]">
          <Settings2 className="h-3.5 w-3.5" />
          说明：本页替换了原「系统设置 - 即将上线」占位；通知渠道配置仍在「通知设置」。
        </div>
      </div>
    </div>
  );
}

/** 把多级规则压成一行：第1级 A、B → 第2级 C */
function summarizeLevels(levels: ApprovalTypeFlow['national']['levels']): string {
  if (levels.length === 0 || levels.some(level => level.approverIds.length === 0)) return '未配齐审批人';
  if (levels.length === 1) return levels[0].approverIds.map(approverLabel).join('、');
  return levels
    .map((level, index) => `第${index + 1}级 ${level.approverIds.map(approverLabel).join('、')}`)
    .join(' → ');
}

function ruleIncomplete(rule: ApprovalTypeFlow['national']): boolean {
  return rule.levels.length === 0 || rule.levels.some(level => level.approverIds.length === 0);
}

function PendingHint({ flow }: { flow: ApprovalTypeFlow }) {
  const missing = (flow.national.enabled && ruleIncomplete(flow.national))
    || Object.values(flow.regional).some(rule => rule.enabled && ruleIncomplete(rule));
  if (!missing) return <span className="mt-1 shrink-0" />;
  return (
    <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FFF7EA] px-1.5 py-0.5 text-[10px] font-bold text-[#8B621F]">
      <TriangleAlert className="h-3 w-3" /> 缺审批人
    </span>
  );
}
