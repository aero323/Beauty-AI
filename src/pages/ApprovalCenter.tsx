/**
 * 审批中心（审批管理者默认落地页）
 *
 * 数字卡看效率，三张快捷入口卡做导航，最近动态用来判断「现在要不要处理」。
 */

import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  History,
  ListChecks,
  Settings2,
  TriangleAlert,
} from 'lucide-react';
import { DevNote } from '../components/DevNote';
import { ApproverIdentityBar } from '../components/approval/ApproverIdentityBar';
import { ApprovalDetailDialog } from '../components/approval/ApprovalDetailDialog';
import { ApprovalStatusBadge } from '../components/approval/ApprovalStatusBadge';
import { useApprovalState } from '../lib/approvalStore';
import {
  approvalStatsFor,
  currentActorForRole,
  formatRelative,
  hoursWaiting,
  notificationsFor,
  pendingForApprover,
  scopeText,
  typeLabel,
} from '../lib/approvalEngine';
import { APPROVAL_TYPE_META, APPROVAL_TYPE_ORDER } from '../lib/approvalTypes';
import type { Role } from '../types';

export function ApprovalCenter({ role, onNavigate }: { role: Role; onNavigate: (tab: string) => void }) {
  const state = useApprovalState();
  const actor = currentActorForRole(role, state);
  const stats = approvalStatsFor(state, actor.id);
  const pending = pendingForApprover(state, actor.id);
  const recent = notificationsFor(state, actor.id).slice(0, 5);
  const [detailId, setDetailId] = React.useState<string | null>(null);

  const enabledTypes = APPROVAL_TYPE_ORDER.filter(type => {
    const flow = state.config.types[type];
    return flow.national.enabled || Object.values(flow.regional).some(rule => rule.enabled);
  });

  return (
    <div className="space-y-4 pt-2">
      <div className="relative">
        <ApproverIdentityBar />
        <DevNote className="-right-1 -top-2" tipClassName="w-[24rem]">
          原型用本地切换演示总部 / 区域审批人分流；生产环境取登录态（审批人 = 角色「审批管理者」+ 组织范围）。单级审批：任一被指定审批人同意即生效、先到先得；生产实现需显式禁止自审。
        </DevNote>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1F1C1F]">审批中心</h2>
          <p className="mt-1 text-sm text-[#766F73]">
            {actor.name} · {actor.label} · 单级审批，任一被指定审批人同意即生效
          </p>
        </div>
        {!state.config.masterEnabled && (
          <div className="flex items-center gap-2 rounded-xl border border-[#E8CCA0] bg-[#FFF7EA] px-3 py-2 text-xs font-bold text-[#8B621F]">
            <TriangleAlert className="h-4 w-4" />
            客户未启用审批功能：新的提交会直接生效，待审单据继续走完
          </div>
        )}
      </div>

      <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: '待我审批', value: stats.pending, suffix: '条', icon: ClipboardCheck, tone: 'text-[#A85F4B] bg-[#FFF0E8]' },
          { label: '今日已处理', value: stats.handledToday, suffix: '条', icon: CheckCircle2, tone: 'text-[#3B8F72] bg-[#EEF8F4]' },
          { label: '平均处理时长', value: stats.averageHours ?? '--', suffix: stats.averageHours === null ? '' : '小时', icon: Clock3, tone: 'text-[#515BCB] bg-[#EEF1FF]' },
          { label: '累计驳回', value: stats.rejected, suffix: '条', icon: TriangleAlert, tone: 'text-red-600 bg-red-50' },
        ].map(item => (
          <Card key={item.label} className="rounded-2xl border-[#E9E4DF] shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A9396]">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-[#242124]">
                  {item.value}
                  <span className="ml-1 text-xs font-medium text-[#9A9396]">{item.suffix}</span>
                </p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
                <item.icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        ))}
        <DevNote className="-right-1 -top-2" tipClassName="w-[23rem]">
          数字卡全部由 approvalStatsFor 从「当前审批人」的单据派生，和列表同源：待我审批=仍待我处理；今日已处理=resolvedAt 在今天的我处理过的单据；平均处理时长=（处理时间 − 提交时间）的均值，没处理过显示 --；累计驳回=我驳回过的数量。生产接入时按租户 / 组织范围在服务端聚合。
        </DevNote>
      </div>

      <div className="relative grid gap-3 md:grid-cols-3">
        {[
          { tab: 'approval_inbox', title: '待我审批', desc: `${stats.pending} 条待处理`, icon: ListChecks },
          { tab: 'approval_flow_config', title: '审批流程配置', desc: `${enabledTypes.length} / ${APPROVAL_TYPE_ORDER.length} 类已开启审批`, icon: Settings2 },
          { tab: 'approval_records', title: '审批记录', desc: `${state.requests.length} 条单据留痕`, icon: History },
        ].map(item => (
          <button
            key={item.tab}
            type="button"
            onClick={() => onNavigate(item.tab)}
            className="group flex items-center justify-between rounded-2xl border border-[#E9E4DF] bg-white p-4 text-left shadow-sm transition-colors hover:border-rose-200 hover:bg-[#FFFDFB]"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F5F3] text-[#A85F4B]">
                <item.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-[#242124]">{item.title}</span>
                <span className="mt-0.5 block text-xs text-[#766F73]">{item.desc}</span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-[#C9C1C4] transition-transform group-hover:translate-x-0.5 group-hover:text-[#A85F4B]" />
          </button>
        ))}
        <DevNote className="-right-1 -top-2" tipClassName="w-[22rem]">
          三张卡是导航不是指标：待我审批=我的待办条数；审批流程配置=已开启的类型数（全国或任一区域开启即算，共 {APPROVAL_TYPE_ORDER.length} 类对象）；审批记录=全部单据留痕数（跨审批人、含已撤回）。数字与目标页同源，避免两处对不上。
        </DevNote>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="relative">
          <DevNote className="-right-1 -top-2" tipClassName="w-[24rem]">
            只列当前审批人待办的前 3 条，按提交时间从早到晚（等最久的排最前）；点单条开审批详情弹窗可直接同意 / 驳回（驳回必填 1–200 字理由），点「全部待办」进待我审批列表。任一审批人处理后单据锁定，后到者看到「已被 XXX 处理」，重复点击不产生二次决定。
          </DevNote>
          <Card className="rounded-2xl border-[#E9E4DF] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#242124]">
                  <ClipboardCheck className="h-4 w-4 text-[#A85F4B]" /> 待我处理
                </p>
                <Button size="sm" variant="ghost" className="text-[#A85F4B]" onClick={() => onNavigate('approval_inbox')}>
                  全部待办 <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {pending.slice(0, 3).map(request => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setDetailId(request.id)}
                    className="w-full rounded-xl border border-[#E9E4DF] bg-[#FDFBFA] p-3 text-left transition-colors hover:border-rose-200 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ApprovalStatusBadge request={request} />
                      <Badge variant="outline" className="py-0 text-[10px] text-[#766F73]">{typeLabel(request.type)}</Badge>
                      <Badge variant="outline" className="py-0 text-[10px] text-[#766F73]">{scopeText(request.snapshot)}</Badge>
                      <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#B9822B]">
                        <Clock3 className="h-3 w-3" /> 等待 {hoursWaiting(request)} 小时
                      </span>
                    </div>
                    <p data-i18n-skip="true" className="mt-1.5 line-clamp-1 text-xs font-bold text-[#242124]">{request.snapshot.title}</p>
                    <p className="mt-0.5 text-[10px] text-[#9A9396]">{request.creatorName} · {formatRelative(request.submittedAt)} 提交</p>
                  </button>
                ))}
                {pending.length === 0 && (
                  <p className="rounded-xl bg-[#F8F5F3] px-3 py-6 text-center text-xs text-[#9A9396]">当前没有待处理的审批</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <DevNote className="-right-1 -top-2" tipClassName="w-[24rem]">
            取当前账号最近 5 条站内信（提交 / 变更 / 驳回 / 撤回 / 催办 / 系统），红点=未读；审批类消息点击直接打开对应审批详情，其余跳消息中心。它是「通知流水」而不是单据流水——完整流转与历史请看审批记录。
          </DevNote>
          <Card className="rounded-2xl border-[#E9E4DF] shadow-sm">
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#242124]">
                <Activity className="h-4 w-4 text-[#515BCB]" /> 最近动态
              </p>
              <div className="mt-3 space-y-2">
                {recent.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { if (item.requestId) setDetailId(item.requestId); else onNavigate('message_center'); }}
                    className="flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[#F8F5F3]"
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.readAt ? 'bg-[#E5DED8]' : 'bg-rose-500'}`} />
                    <span className="min-w-0">
                      <span data-i18n-skip="true" className="line-clamp-1 text-xs font-bold text-[#3F3A3D]">{item.title}</span>
                      <span className="mt-0.5 block text-[10px] text-[#9A9396]">{formatRelative(item.createdAt)}</span>
                    </span>
                  </button>
                ))}
                {recent.length === 0 && (
                  <p className="rounded-xl bg-[#F8F5F3] px-3 py-6 text-center text-xs text-[#9A9396]">还没有消息</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-[#9A9396]">
        注：{APPROVAL_TYPE_ORDER.map(type => APPROVAL_TYPE_META[type].label).join(' / ')}都会按「审批流程配置」决定是否走审批；客户总开关由系统管理员在「系统设置」里控制。
      </p>

      <ApprovalDetailDialog requestId={detailId} onClose={() => setDetailId(null)} actor={actor} role={role} />
    </div>
  );
}
