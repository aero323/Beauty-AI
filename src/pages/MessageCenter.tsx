/**
 * 消息中心（全角色）
 *
 * 站内信是审批的默认入口：审批待办、审批结果、撤回与催办都会进来，
 * 点开一条审批消息直接打开审批详情弹窗；外部渠道（App 推送 / WhatsApp）在原型里只展示状态。
 */

import React from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { BellRing, CheckCheck, Inbox, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { ApprovalDetailDialog } from '../components/approval/ApprovalDetailDialog';
import { markAllNotificationsRead, markNotificationRead, useApprovalState } from '../lib/approvalStore';
import { currentActorForRole, formatDateTime, formatRelative } from '../lib/approvalEngine';
import type { AppNotification, NotificationChannel } from '../lib/approvalTypes';
import type { Role } from '../types';

type TabKey = 'all' | 'approval' | 'system';

const CHANNEL_META: Record<NotificationChannel, { label: string; icon: React.ElementType }> = {
  inbox: { label: '站内信', icon: Mail },
  app_push: { label: 'App 推送', icon: Smartphone },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare },
};

const KIND_LABEL: Record<AppNotification['kind'], string> = {
  todo: '待审批',
  result: '审批结果',
  withdrawn: '已撤回',
  reminder: '催办',
  system: '系统',
};

export function MessageCenter({ role }: { role: Role }) {
  const state = useApprovalState();
  const actor = currentActorForRole(role, state);
  const [tab, setTab] = React.useState<TabKey>('all');
  const [detailId, setDetailId] = React.useState<string | null>(null);

  const messages = state.notifications
    .filter(item => item.recipientId === actor.id)
    .filter(item => tab === 'all' || (tab === 'approval' ? item.category === 'approval' : item.category === 'system'))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unread = state.notifications.filter(item => item.recipientId === actor.id && !item.readAt).length;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#1F1C1F]">
            <BellRing className="h-5 w-5 text-[#A85F4B]" /> 消息中心
          </h2>
          <p className="mt-1 text-sm text-[#766F73]">
            {actor.name} 的消息 · 未读 {unread} 条 · 审批消息点开即可处理
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-[#F8F5F3] p-1">
            {([['all', '全部'], ['approval', '审批'], ['system', '系统']] as const).map(([key, label]) => (
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
          <Button size="sm" variant="outline" className="border-[#E5DED8]" onClick={() => markAllNotificationsRead(actor.id)}>
            <CheckCheck className="h-3.5 w-3.5" /> 全部已读
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {messages.map(item => (
          <Card
            key={item.id}
            className={`rounded-2xl border shadow-sm transition-colors ${item.readAt ? 'border-[#E9E4DF]' : 'border-[#F3C9BC] bg-[#FFFDFB]'}`}
          >
            <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.readAt ? 'bg-[#E5DED8]' : 'bg-rose-500'}`} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="py-0 text-[10px] text-[#766F73]">{KIND_LABEL[item.kind]}</Badge>
                    {item.channels.map(channel => {
                      const meta = CHANNEL_META[channel];
                      const Icon = meta.icon;
                      return (
                        <span key={channel} className="inline-flex items-center gap-0.5 rounded-full bg-[#F8F5F3] px-1.5 py-0.5 text-[10px] font-medium text-[#9A9396]">
                          <Icon className="h-3 w-3" /> {meta.label}
                        </span>
                      );
                    })}
                  </div>
                  <p data-i18n-skip="true" className="mt-1.5 text-sm font-bold leading-snug text-[#242124]">{item.title}</p>
                  <p data-i18n-skip="true" className="mt-1 text-xs leading-relaxed text-[#766F73]">{item.body}</p>
                  <p className="mt-1 text-[10px] text-[#9A9396]">{formatDateTime(item.createdAt)} · {formatRelative(item.createdAt)}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!item.readAt && (
                  <Button size="xs" variant="ghost" className="text-[#766F73]" onClick={() => markNotificationRead(item.id)}>
                    标为已读
                  </Button>
                )}
                {item.requestId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#E5DED8]"
                    onClick={() => {
                      markNotificationRead(item.id);
                      setDetailId(item.requestId!);
                    }}
                  >
                    查看审批
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5DED8] bg-white px-6 py-14 text-center">
            <Inbox className="h-10 w-10 text-[#E5DED8]" />
            <p className="mt-3 text-sm font-bold text-[#766F73]">暂时没有消息</p>
            <p className="mt-1 text-xs text-[#9A9396]">提交审批、审批结果、催办都会在这里出现。</p>
          </div>
        )}
      </div>

      <p className="text-[10px] leading-relaxed text-[#9A9396]">
        注：原型只展示渠道状态，不真正发送 App 推送 / WhatsApp；生产接入时站内信落库，外部渠道复用「通知设置」里已启用的通道。
      </p>

      <ApprovalDetailDialog requestId={detailId} onClose={() => setDetailId(null)} actor={actor} role={role} />
    </div>
  );
}
