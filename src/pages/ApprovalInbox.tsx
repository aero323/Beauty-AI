/**
 * 待我审批（审批管理者）
 *
 * 只展示「当前审批人被指定为审批人」的单据；任一审批人处理后单据即锁定，
 * 其他审批人会看到「已被 XXX 处理」。
 */

import React from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle2, Clock3, Inbox, ShieldAlert } from 'lucide-react';
import { ApproverIdentityBar } from '../components/approval/ApproverIdentityBar';
import { ApprovalDetailDialog } from '../components/approval/ApprovalDetailDialog';
import { ApprovalStatusBadge } from '../components/approval/ApprovalStatusBadge';
import { approveRequest, useApprovalState } from '../lib/approvalStore';
import {
  currentActorForRole,
  formatDateTime,
  handledByApprover,
  hoursWaiting,
  pendingForApprover,
  scopeText,
  typeLabel,
} from '../lib/approvalEngine';
import { APPROVAL_TYPE_META, APPROVAL_TYPE_ORDER, type ApprovalObjectType } from '../lib/approvalTypes';
import type { Role } from '../types';

type TabKey = 'pending' | 'handled';
type ScopeFilter = 'all' | '全国' | '区域';

export function ApprovalInbox({ role }: { role: Role }) {
  const state = useApprovalState();
  const actor = currentActorForRole(role, state);
  const [tab, setTab] = React.useState<TabKey>('pending');
  const [typeFilter, setTypeFilter] = React.useState<'all' | ApprovalObjectType>('all');
  const [scopeFilter, setScopeFilter] = React.useState<ScopeFilter>('all');
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState('');

  const pending = pendingForApprover(state, actor.id);
  const handled = handledByApprover(state, actor.id);
  const rows = (tab === 'pending' ? pending : handled)
    .filter(item => typeFilter === 'all' || item.type === typeFilter)
    .filter(item => scopeFilter === 'all' || item.snapshot.scope === scopeFilter);

  return (
    <div className="space-y-4 pt-2">
      <ApproverIdentityBar />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1F1C1F]">待我审批</h2>
          <p className="mt-1 text-sm text-[#766F73]">多级审批按顺序逐级进行：每级任一审批人同意后进入下一级，最后一级同意才生效。</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-[#F8F5F3] p-1">
          {([['pending', `待我审批 ${pending.length}`], ['handled', `我已处理 ${handled.length}`]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${tab === key ? 'bg-white text-[#A85F4B] shadow-sm ring-1 ring-[#F3C9BC]' : 'text-[#766F73] hover:text-[#3F3A3D]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={typeFilter}
          onChange={event => setTypeFilter(event.target.value as 'all' | ApprovalObjectType)}
          className="h-8 rounded-lg border border-[#E5DED8] bg-white px-2 text-xs text-[#3F3A3D] outline-none"
        >
          <option value="all">全部类型</option>
          {APPROVAL_TYPE_ORDER.map(type => <option key={type} value={type}>{APPROVAL_TYPE_META[type].label}</option>)}
        </select>
        <select
          value={scopeFilter}
          onChange={event => setScopeFilter(event.target.value as ScopeFilter)}
          className="h-8 rounded-lg border border-[#E5DED8] bg-white px-2 text-xs text-[#3F3A3D] outline-none"
        >
          <option value="all">全部范围</option>
          <option value="全国">全国</option>
          <option value="区域">区域</option>
        </select>
        {feedback && <span data-i18n-skip="true" className="text-[11px] font-medium text-[#A85F4B]">{feedback}</span>}
      </div>

      <div className="space-y-2">
        {rows.map(request => (
          <Card key={request.id} className="rounded-2xl border-[#E9E4DF] shadow-sm transition-colors hover:border-rose-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ApprovalStatusBadge request={request} />
                    <Badge variant="outline" className="py-0 text-[10px] text-[#766F73]">{typeLabel(request.type)}</Badge>
                    <Badge variant="outline" className="py-0 text-[10px] text-[#766F73]">{scopeText(request.snapshot)}</Badge>
                    {request.levelApprovers.length > 1 && (
                      <Badge variant="outline" className="border-[#C7CDFF] bg-[#F3F5FF] py-0 text-[10px] text-[#3F48B4]">
                        第 {Math.min(request.currentLevel + 1, request.levelApprovers.length)}/{request.levelApprovers.length} 级
                      </Badge>
                    )}
                    {request.status === 'pending' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#B9822B]">
                        <Clock3 className="h-3 w-3" /> 已等待 {hoursWaiting(request)} 小时
                      </span>
                    )}
                  </div>
                  <h3 data-i18n-skip="true" className="mt-2 text-sm font-bold leading-snug text-[#242124]">{request.snapshot.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#766F73]">{request.snapshot.summary}</p>
                  <p className="mt-1.5 text-[10px] text-[#9A9396]">
                    {request.creatorName} 提交 · {formatDateTime(request.submittedAt)}
                    {request.decision ? ` · ${request.decision.byName} 已${request.decision.outcome === 'approved' ? '同意' : '驳回'}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="sm" variant="outline" className="border-[#E5DED8]" onClick={() => setDetailId(request.id)}>
                    查看详情
                  </Button>
                  {request.status === 'pending' && (
                    <Button
                      size="sm"
                      className="bg-[#3B8F72] text-white hover:bg-[#2F735C]"
                      onClick={() => {
                        const result = approveRequest(request.id, actor);
                        if (result.error) {
                          setFeedback(result.error);
                        } else if (result.request && result.request.status === 'approved') {
                          setFeedback(`已同意：${request.snapshot.title} 已生效`);
                        } else {
                          setFeedback(`已通过第 ${request.currentLevel + 1} 级：进入第 ${request.currentLevel + 2} 级审批`);
                        }
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {request.levelApprovers.length > 1 && request.currentLevel < request.levelApprovers.length - 1
                        ? `同意（进入第 ${request.currentLevel + 2} 级）`
                        : '同意'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5DED8] bg-white px-6 py-14 text-center">
            <Inbox className="h-10 w-10 text-[#E5DED8]" />
            <p className="mt-3 text-sm font-bold text-[#766F73]">
              {tab === 'pending' ? '当前没有待你处理的审批' : '你还没有处理过审批单据'}
            </p>
            <p className="mt-1 text-xs text-[#9A9396]">新提交会通过站内信、App 推送和 WhatsApp 通知你。</p>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-[#F8F5F3] px-3 py-2 text-[11px] leading-relaxed text-[#766F73]">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A85F4B]" />
        注：审批人由「审批流程配置」按类型和范围指定；原型里角色单选，提交人与审批人天然互斥，生产实现需显式禁止自审。
      </div>

      <ApprovalDetailDialog requestId={detailId} onClose={() => setDetailId(null)} actor={actor} role={role} />
    </div>
  );
}
