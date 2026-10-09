/**
 * 我的审批流转（创建者视角的独立功能页）
 *
 * 培训师类角色提交的审批都集中在这里查看：待审批 / 变更待审批 / 已驳回 / 已生效 / 已撤回。
 * 业务页（课件管理、任务管理、剧本、素材库等）只保留提交后的轻量提示，不再内嵌审批流转分区，
 * 避免挤压原有列表；查看进度、撤回、被驳回后重提都统一到本页。
 */

import React from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle2, Clock3, FileClock, Inbox, RotateCcw, ShieldAlert, Undo2, XCircle } from 'lucide-react';
import { ApprovalDetailDialog } from '../components/approval/ApprovalDetailDialog';
import { ApprovalStatusBadge } from '../components/approval/ApprovalStatusBadge';
import { useApprovalState, withdrawRequest } from '../lib/approvalStore';
import {
  currentActorForRole,
  formatDateTime,
  hoursWaiting,
  requestsByCreator,
  scopeText,
  typeLabel,
} from '../lib/approvalEngine';
import { APPROVAL_TYPE_META, APPROVAL_TYPE_ORDER, type ApprovalObjectType, type ApprovalRequest } from '../lib/approvalTypes';
import type { Role } from '../types';

type StatusFilter = 'all' | 'pending' | 'revision' | 'rejected' | 'approved' | 'withdrawn';

const STATUS_FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: '全部状态' },
  { id: 'pending', label: '待审批' },
  { id: 'revision', label: '变更待审批' },
  { id: 'rejected', label: '已驳回' },
  { id: 'approved', label: '已生效' },
  { id: 'withdrawn', label: '已撤回' },
];

function matchesStatus(request: ApprovalRequest, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'pending') return request.status === 'pending' && !request.isRevision;
  if (filter === 'revision') return request.status === 'pending' && request.isRevision;
  return request.status === filter;
}

function statusBucket(request: ApprovalRequest): 'pending' | 'revision' | 'rejected' | 'approved' | 'withdrawn' {
  if (request.status === 'pending') return request.isRevision ? 'revision' : 'pending';
  return request.status;
}

export function MyApprovals({ role }: { role: Role }) {
  const state = useApprovalState();
  const actor = currentActorForRole(role, state);
  const [typeFilter, setTypeFilter] = React.useState<'all' | ApprovalObjectType>('all');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState('');

  const mine = requestsByCreator(state, actor.id);
  const rows = mine
    .filter(item => typeFilter === 'all' || item.type === typeFilter)
    .filter(item => matchesStatus(item, statusFilter));

  const counts = mine.reduce(
    (acc, item) => {
      acc[statusBucket(item)] += 1;
      return acc;
    },
    { pending: 0, revision: 0, rejected: 0, approved: 0, withdrawn: 0 } as Record<'pending' | 'revision' | 'rejected' | 'approved' | 'withdrawn', number>,
  );

  const cards = [
    { key: 'pending' as const, label: '待审批', value: counts.pending, icon: Clock3, tone: 'border-[#E8CCA0] bg-[#FFF7EA] text-[#8B621F]' },
    { key: 'revision' as const, label: '变更待审批', value: counts.revision, icon: FileClock, tone: 'border-[#C7CDFF] bg-[#F3F5FF] text-[#3F48B4]' },
    { key: 'rejected' as const, label: '已驳回', value: counts.rejected, icon: XCircle, tone: 'border-red-200 bg-red-50 text-red-600' },
    { key: 'approved' as const, label: '已生效', value: counts.approved, icon: CheckCircle2, tone: 'border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]' },
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1F1C1F]">我的审批流转</h2>
          <p className="mt-1 text-sm text-[#766F73]">
            你提交的全部审批单据都在这里：查看进度、撤回重提、变更版本一目了然；业务模块只保留提交时的轻量提示。
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <button
            key={card.key}
            type="button"
            onClick={() => setStatusFilter(prev => (prev === card.key ? 'all' : card.key))}
            className={`rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${card.tone} ${statusFilter === card.key ? 'ring-2 ring-rose-500/25' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold">{card.label}</span>
              <card.icon className="h-4 w-4 opacity-70" />
            </div>
            <div className="mt-2 text-2xl font-bold">{card.value}</div>
            <p className="mt-1 text-[10px] opacity-70">点击按该状态筛选</p>
          </button>
        ))}
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
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value as StatusFilter)}
          className="h-8 rounded-lg border border-[#E5DED8] bg-white px-2 text-xs text-[#3F3A3D] outline-none"
        >
          {STATUS_FILTERS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
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
                    {request.status === 'pending' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#B9822B]">
                        <Clock3 className="h-3 w-3" /> 已等待 {hoursWaiting(request)} 小时
                      </span>
                    )}
                  </div>
                  <h3 data-i18n-skip="true" className="mt-2 text-sm font-bold leading-snug text-[#242124]">{request.snapshot.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#766F73]">{request.snapshot.summary}</p>
                  <p className="mt-1.5 text-[10px] text-[#9A9396]">
                    提交于 {formatDateTime(request.submittedAt)}
                    {request.status === 'pending' && request.isRevision ? ' · 原版本继续生效' : ''}
                    {request.resolvedAt ? ` · ${formatDateTime(request.resolvedAt)} 处理完成` : ''}
                  </p>
                  {request.decision?.outcome === 'rejected' && (
                    <p className="mt-1.5 line-clamp-2 rounded-md bg-red-50 px-2 py-1 text-[10px] leading-snug text-red-600">
                      驳回理由：{request.decision.reason}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="sm" variant="outline" className="border-[#E5DED8]" onClick={() => setDetailId(request.id)}>
                    查看详情
                  </Button>
                  {request.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#766F73] hover:text-rose-600"
                      onClick={() => {
                        const result = withdrawRequest(request.id, actor);
                        setFeedback(result.error ?? `已撤回：${request.snapshot.title}，可修改后重新提交。`);
                      }}
                    >
                      <Undo2 className="h-3.5 w-3.5" /> 撤回
                    </Button>
                  )}
                  {request.status === 'rejected' && (
                    <Button size="sm" className="bg-rose-600 text-white hover:bg-rose-700" onClick={() => setDetailId(request.id)}>
                      <RotateCcw className="h-3.5 w-3.5" /> 修改后重提
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5DED8] bg-white px-6 py-14 text-center">
            {mine.length === 0 ? <Inbox className="h-10 w-10 text-[#E5DED8]" /> : <ShieldAlert className="h-10 w-10 text-[#E5DED8]" />}
            <p className="mt-3 text-sm font-bold text-[#766F73]">
              {mine.length === 0 ? '你还没有提交过审批' : '当前筛选条件下没有单据'}
            </p>
            <p className="mt-1 text-xs text-[#9A9396]">
              {mine.length === 0
                ? '在课件、任务、剧本、素材库等模块发布内容时，如果需要审批会自动出现在这里。'
                : '换个类型或状态再看一次。'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-[#F8F5F3] px-3 py-2 text-[11px] leading-relaxed text-[#766F73]">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A85F4B]" />
        注：审批中不能直接改内容，可撤回后修改；被驳回可在详情里按理由改完重提（版本 +1，历史保留）；已生效内容的修改会新开变更版本，审批期间老版本继续对学员开放。判定是否需要审批由「审批流程配置」按对象类型与范围决定。
      </div>

      <ApprovalDetailDialog requestId={detailId} onClose={() => setDetailId(null)} actor={actor} role={role} />
    </div>
  );
}
