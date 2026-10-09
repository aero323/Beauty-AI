/**
 * 审批记录（审批管理者）
 *
 * 全部单据留痕：谁提交、谁处理、什么时候、什么理由，支持筛选与导出 CSV。
 */

import React from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Download, FileClock, Search } from 'lucide-react';
import { ApproverIdentityBar } from '../components/approval/ApproverIdentityBar';
import { ApprovalDetailDialog } from '../components/approval/ApprovalDetailDialog';
import { ApprovalStatusBadge } from '../components/approval/ApprovalStatusBadge';
import { useApprovalState } from '../lib/approvalStore';
import {
  currentActorForRole,
  formatDateTime,
  scopeText,
  typeLabel,
} from '../lib/approvalEngine';
import {
  APPROVAL_TYPE_META,
  APPROVAL_TYPE_ORDER,
  type ApprovalObjectType,
  type ApprovalStatus,
} from '../lib/approvalTypes';
import type { Role } from '../types';

const STATUS_OPTIONS: { value: 'all' | ApprovalStatus; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已生效' },
  { value: 'rejected', label: '已驳回' },
  { value: 'withdrawn', label: '已撤回' },
];

export function ApprovalRecords({ role }: { role: Role }) {
  const state = useApprovalState();
  const actor = currentActorForRole(role, state);
  const [statusFilter, setStatusFilter] = React.useState<'all' | ApprovalStatus>('all');
  const [typeFilter, setTypeFilter] = React.useState<'all' | ApprovalObjectType>('all');
  const [keyword, setKeyword] = React.useState('');
  const [detailId, setDetailId] = React.useState<string | null>(null);

  const rows = state.requests
    .filter(item => statusFilter === 'all' || item.status === statusFilter)
    .filter(item => typeFilter === 'all' || item.type === typeFilter)
    .filter(item => {
      if (!keyword.trim()) return true;
      const text = `${item.snapshot.title} ${item.creatorName} ${item.decision?.byName ?? ''}`;
      return text.toLowerCase().includes(keyword.trim().toLowerCase());
    })
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const exportCsv = () => {
    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const header = ['对象', '类型', '范围', '创建者', '状态', '提交时间', '处理人', '处理时间', '驳回理由'];
    const csv = [
      header,
      ...rows.map(item => [
        item.snapshot.title,
        typeLabel(item.type),
        scopeText(item.snapshot),
        item.creatorName,
        item.status === 'pending' ? (item.isRevision ? '变更待审批' : '待审批') : item.status === 'approved' ? '已生效' : item.status === 'rejected' ? '已驳回' : '已撤回',
        formatDateTime(item.submittedAt),
        item.decision?.byName ?? '',
        item.decision ? formatDateTime(item.decision.at) : '',
        item.decision?.reason ?? '',
      ]),
    ].map(row => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '审批记录.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pt-2">
      <ApproverIdentityBar />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1F1C1F]">审批记录</h2>
          <p className="mt-1 text-sm text-[#766F73]">全部单据留痕：提交、撤回、同意、驳回与理由都会保留版本历史。</p>
        </div>
        <Button size="sm" variant="outline" className="border-[#E5DED8]" onClick={exportCsv}>
          <Download className="h-3.5 w-3.5" /> 导出 CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9A9396]" />
          <input
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="搜索对象 / 创建者 / 审批人"
            className="h-8 w-60 rounded-lg border border-[#E5DED8] bg-white pl-8 pr-2 text-xs outline-none focus:border-rose-400"
          />
        </div>
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
          onChange={event => setStatusFilter(event.target.value as 'all' | ApprovalStatus)}
          className="h-8 rounded-lg border border-[#E5DED8] bg-white px-2 text-xs text-[#3F3A3D] outline-none"
        >
          {STATUS_OPTIONS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <span className="text-[11px] text-[#9A9396]">共 {rows.length} 条</span>
      </div>

      <Card className="overflow-hidden rounded-2xl border-[#E9E4DF] shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-[#F8F5F3]/80">
                <tr>
                  {['对象', '类型 / 范围', '创建者', '提交时间', '状态', '处理人', '操作'].map(head => (
                    <th key={head} className="border-b border-[#E9E4DF] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#766F73]">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE8]">
                {rows.map(request => (
                  <tr key={request.id} className="transition-colors hover:bg-[#FDFBFA]">
                    <td className="max-w-[280px] px-4 py-3">
                      <p data-i18n-skip="true" className="line-clamp-1 text-xs font-bold text-[#242124]">{request.snapshot.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge variant="outline" className="py-0 text-[10px] text-[#766F73]">{typeLabel(request.type)}</Badge>
                        <Badge variant="outline" className="py-0 text-[10px] text-[#766F73]">{scopeText(request.snapshot)}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5D565A]">{request.creatorName}</td>
                    <td className="px-4 py-3 text-xs text-[#766F73]">{formatDateTime(request.submittedAt)}</td>
                    <td className="px-4 py-3"><ApprovalStatusBadge request={request} /></td>
                    <td className="px-4 py-3 text-xs text-[#766F73]">
                      {request.decision ? `${request.decision.byName} · ${request.decision.outcome === 'approved' ? '同意' : '驳回'}` : '--'}
                    </td>
                    <td className="px-4 py-3">
                      <Button size="xs" variant="outline" className="border-[#E5DED8]" onClick={() => setDetailId(request.id)}>
                        查看详情
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <FileClock className="h-10 w-10 text-[#E5DED8]" />
              <p className="mt-3 text-sm font-bold text-[#766F73]">没有符合筛选条件的审批记录</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ApprovalDetailDialog requestId={detailId} onClose={() => setDetailId(null)} actor={actor} role={role} />
    </div>
  );
}
