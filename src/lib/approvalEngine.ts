/**
 * 审批功能 · 规则引擎（纯函数）
 *
 * 所有状态迁移都在这里完成：提交、同意、驳回、撤回、重提、提醒、配置修改。
 * 不依赖 localStorage 与 React，便于单测；持久化在 approvalStore.ts 里做。
 * 口径：单级审批，任一被指定审批人同意即生效；驳回必填理由；老版本在变更重审期间继续生效。
 */

import type { Role } from '../types';
import {
  APPROVAL_TYPE_META,
  APPROVAL_TYPE_ORDER,
  APPROVER_ACCOUNTS,
  approverAccountById,
  regionNameOf,
  type AppNotification,
  type ApprovalActor,
  type ApprovalConfig,
  type ApprovalDecision,
  type ApprovalEvent,
  type ApprovalFlowRule,
  type ApprovalObjectType,
  type ApprovalRequest,
  type ApprovalScope,
  type ApprovalSnapshot,
  type ApprovalState,
  type ApprovalTypeFlow,
  type NotificationChannel,
  type NotificationKind,
} from './approvalTypes';

/** 原型里模拟「通知设置」已启用的外部渠道；生产接入时从通知设置读取 */
export const EXTERNAL_CHANNELS: NotificationChannel[] = ['app_push', 'whatsapp'];

export interface ApprovalMutationResult {
  state: ApprovalState;
  error?: string;
  request?: ApprovalRequest;
}

export interface SubmitApprovalInput {
  type: ApprovalObjectType;
  targetId: string;
  snapshot: ApprovalSnapshot;
  creator: ApprovalActor;
  /** 对已生效内容发起变更重审 */
  isRevision?: boolean;
  supersedesRequestId?: string;
}

export type SubmitApprovalResult = ApprovalMutationResult & { mode: 'direct' | 'pending' | 'blocked' };

export interface ResolvedApprovalRule {
  /** 是否需要审批 */
  required: boolean;
  approverIds: string[];
  /** 规则来源：总开关关闭 / 类型关闭 / 全国流程 / 区域流程 */
  source: 'master_off' | 'type_off' | 'national' | 'region';
  /** 区域内容是否沿用了全国流程 */
  regionFallback: boolean;
}

const emptyRule = (): ApprovalFlowRule => ({ enabled: false, approverIds: [] });

export function createDefaultApprovalConfig(): ApprovalConfig {
  const types = {} as Record<ApprovalObjectType, ApprovalTypeFlow>;
  for (const type of APPROVAL_TYPE_ORDER) {
    types[type] = { type, national: emptyRule(), regional: {} };
  }
  return { masterEnabled: true, types };
}

export function resolveApprovalRule(
  config: ApprovalConfig,
  type: ApprovalObjectType,
  scope: ApprovalScope,
  regionId?: string,
): ResolvedApprovalRule {
  const typeFlow = config.types[type];
  if (!config.masterEnabled || !typeFlow) {
    return { required: false, approverIds: [], source: 'master_off', regionFallback: false };
  }
  const regionalRule = scope === '区域' && regionId ? typeFlow.regional[regionId] : undefined;
  const rule = regionalRule ?? typeFlow.national;
  const source: ResolvedApprovalRule['source'] = regionalRule ? 'region' : typeFlow.national.enabled ? 'national' : 'type_off';
  if (!rule.enabled) {
    return { required: false, approverIds: [], source: 'type_off', regionFallback: false };
  }
  return {
    required: true,
    approverIds: [...rule.approverIds],
    source,
    regionFallback: scope === '区域' && !regionalRule,
  };
}

/** 当前登录角色在原型里对应的账号（与 Layout 的演示身份保持一致） */
export function currentActorForRole(role: Role, state?: ApprovalState): ApprovalActor {
  switch (role) {
    case 'Super Admin':
      return { id: 'usr_sa_admin', name: '系统管理员', role, label: '系统管理员' };
    case 'HQ Trainer':
      return { id: 'usr_ht_sarah', name: 'Sarah Lee', role, label: '总部培训师' };
    case 'Regional Manager':
      return { id: 'usr_rm_budi', name: 'Budi Santoso', role, label: '区域经理' };
    case 'Regional Training Manager':
      return { id: 'usr_rtm_fitriani', name: 'Fitriani', role, label: '区域培训师主管' };
    case 'Regional Trainer':
      return { id: 'usr_rt_nurul', name: 'Nurul Huda', role, label: '区域培训师（雅加达南区）' };
    case 'Approval Manager': {
      const id = state?.demoApproverId ?? APPROVER_ACCOUNTS[0].id;
      return actorForApprover(id);
    }
    default:
      return { id: 'usr_unknown', name: '未知账号', role, label: '未知角色' };
  }
}

export function actorForApprover(approverId: string): ApprovalActor {
  const account = approverAccountById(approverId);
  if (!account) {
    return { id: approverId, name: approverId, role: '审批管理者', label: '审批管理者' };
  }
  const scopeLabel = account.scope === '总部' ? '总部' : regionNameOf(account.regionId) ?? '区域';
  return {
    id: account.id,
    name: account.name,
    role: '审批管理者',
    label: `审批管理者（${scopeLabel}）`,
  };
}

/** 创建者角色的默认范围：总部培训师产出为全国，区域培训师产出为雅加达南区 */
export function creatorContextForRole(role: Role): { scope: ApprovalScope; regionId?: string } {
  if (role === 'Regional Training Manager' || role === 'Regional Trainer') {
    return { scope: '区域', regionId: 'south' };
  }
  return { scope: '全国' };
}

export function approversOf(request: ApprovalRequest): ApprovalActor[] {
  return request.approverIds.map(actorForApprover);
}

function notify(
  state: ApprovalState,
  input: {
    kind: NotificationKind;
    title: string;
    body: string;
    recipientId: string;
    recipientName: string;
    requestId?: string;
    targetTab?: string;
    at: string;
  },
): ApprovalState {
  const notification: AppNotification = {
    id: `ntf-${input.at}-${state.notifications.length + 1}`,
    kind: input.kind,
    category: input.kind === 'system' ? 'system' : 'approval',
    title: input.title,
    body: input.body,
    createdAt: input.at,
    recipientId: input.recipientId,
    recipientName: input.recipientName,
    channels: ['inbox', ...EXTERNAL_CHANNELS],
    requestId: input.requestId,
    targetTab: input.targetTab,
  };
  return { ...state, notifications: [notification, ...state.notifications] };
}

function eventId(action: string, at: string, requestId: string): string {
  return `${requestId}-${action}-${at}`;
}

function withRequest(state: ApprovalState, request: ApprovalRequest): ApprovalState {
  return {
    ...state,
    requests: state.requests.map(item => (item.id === request.id ? request : item)),
  };
}

/** 同一对象（targetId）当前真正生效的已通过单据：取版本最高的 approved */
export function liveApprovedRequestForTarget(
  state: ApprovalState,
  type: ApprovalObjectType,
  targetId: string,
): ApprovalRequest | undefined {
  return state.requests
    .filter(item => item.type === type && item.targetId === targetId && item.status === 'approved')
    .sort((a, b) => b.version - a.version)[0];
}

export function latestRequestForTarget(state: ApprovalState, type: ApprovalObjectType, targetId: string): ApprovalRequest | undefined {
  return state.requests
    .filter(item => item.type === type && item.targetId === targetId)
    .sort((a, b) => b.version - a.version)[0];
}

export function requestById(state: ApprovalState, id: string): ApprovalRequest | undefined {
  return state.requests.find(item => item.id === id);
}

/** 某对象是否处于「有单据在审」状态 */
export function pendingRequestForTarget(state: ApprovalState, targetId: string): ApprovalRequest | undefined {
  return state.requests.find(item => item.targetId === targetId && item.status === 'pending');
}

export function submitForApproval(
  state: ApprovalState,
  input: SubmitApprovalInput,
  now = new Date(),
): SubmitApprovalResult {
  const { type, targetId, snapshot, creator } = input;
  // 同一个对象不重复排队：已经有一条在审单据时，先撤回或等结果
  const existingPending = state.requests.find(
    item => item.type === type && item.targetId === targetId && item.status === 'pending',
  );
  if (existingPending) {
    return {
      state,
      mode: 'blocked',
      error: `这条${typeLabel(type)}已有审批在审（v${existingPending.version}），可先在「我的审批流转」里撤回，或等待审批人处理。`,
    };
  }
  const rule = resolveApprovalRule(state.config, type, snapshot.scope, snapshot.regionId);
  if (!rule.required) {
    return { state, mode: 'direct' };
  }
  if (rule.approverIds.length === 0) {
    return {
      state,
      mode: 'blocked',
      error: `「${snapshot.scope === '区域' ? regionNameOf(snapshot.regionId) ?? '区域' : '全国'}」的${typeLabel(type)}审批已开启，但还没有指定审批人。请先让审批管理者在「审批流程配置」里补齐审批人。`,
    };
  }
  const at = now.toISOString();
  const existingVersions = state.requests
    .filter(item => item.type === type && item.targetId === targetId)
    .map(item => item.version);
  const version = existingVersions.length ? Math.max(...existingVersions) + 1 : 1;
  const creation = {
    id: `apr-${now.getTime()}-${state.requests.length + 1}`,
    type,
    targetId,
    snapshot,
    creatorId: creator.id,
    creatorName: creator.name,
    creatorRole: (creator.role === '审批管理者' ? 'HQ Trainer' : creator.role) as Role,
    version,
    status: 'pending' as const,
    isRevision: Boolean(input.isRevision),
    supersedesRequestId: input.supersedesRequestId,
    submittedAt: at,
    approverIds: rule.approverIds,
    history: [
      {
        id: eventId(input.isRevision ? 'resubmit' : 'submit', at, targetId),
        action: input.isRevision ? ('resubmit' as const) : ('submit' as const),
        at,
        actorId: creator.id,
        actorName: creator.name,
        actorRole: creator.label,
        version,
        note: input.isRevision ? '提交变更版本，等待审批' : '提交审批',
        approverIds: rule.approverIds,
      },
    ] as ApprovalEvent[],
  };
  let next: ApprovalState = { ...state, requests: [creation, ...state.requests] };
  for (const approverId of rule.approverIds) {
    const approver = actorForApprover(approverId);
    next = notify(next, {
      kind: 'todo',
      title: input.isRevision ? `变更待审批：${snapshot.title}` : `新的待审批：${snapshot.title}`,
      body: `${creator.name}（${creator.label}）提交了${typeLabel(type)}，范围：${scopeText(snapshot)}${rule.regionFallback ? '（沿用全国流程）' : ''}。请查看后处理。`,
      recipientId: approver.id,
      recipientName: approver.name,
      requestId: creation.id,
      targetTab: 'approval_inbox',
      at,
    });
  }
  return { state: next, mode: 'pending', request: creation };
}

function guardPending(state: ApprovalState, requestId: string, actor: ApprovalActor): { request?: ApprovalRequest; error?: string } {
  const request = requestById(state, requestId);
  if (!request) return { error: '审批单据不存在' };
  if (request.status !== 'pending') {
    const handled = request.decision ? `已被 ${request.decision.byName} 处理` : '已被处理';
    return { request, error: `该单据${handled}，无需重复操作。` };
  }
  if (!request.approverIds.includes(actor.id)) {
    return { request, error: '你不是这条流程指定的审批人。' };
  }
  return { request };
}

export function approveRequest(state: ApprovalState, requestId: string, actor: ApprovalActor, now = new Date()): ApprovalMutationResult {
  const { request, error } = guardPending(state, requestId, actor);
  if (!request) return { state, error };
  if (error) return { state, error, request };
  const at = now.toISOString();
  const decision: ApprovalDecision = { outcome: 'approved', byId: actor.id, byName: actor.name, at };
  const updated: ApprovalRequest = {
    ...request,
    status: 'approved',
    resolvedAt: at,
    decision,
    history: [
      ...request.history,
      {
        id: eventId('approve', at, request.id),
        action: 'approve',
        at,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.label,
        version: request.version,
        note: '同意，内容生效',
      },
    ],
  };
  let next = withRequest(state, updated);
  next = notify(next, {
    kind: 'result',
    title: `审批通过：${request.snapshot.title}`,
    body: `${actor.name} 已同意，${typeLabel(request.type)}已生效${request.isRevision ? '，新版本替换原生效版本' : ''}。`,
    recipientId: request.creatorId,
    recipientName: request.creatorName,
    requestId: request.id,
    targetTab: request.isRevision ? 'approval_records' : undefined,
    at,
  });
  return { state: next, request: updated };
}

export function rejectRequest(
  state: ApprovalState,
  requestId: string,
  actor: ApprovalActor,
  reason: string,
  now = new Date(),
): ApprovalMutationResult {
  const trimmed = reason.trim();
  if (!trimmed) return { state, error: '驳回必须填写理由。' };
  if (trimmed.length > 200) return { state, error: '驳回理由请控制在 200 字以内。' };
  const { request, error } = guardPending(state, requestId, actor);
  if (!request) return { state, error };
  if (error) return { state, error, request };
  const at = now.toISOString();
  const decision: ApprovalDecision = { outcome: 'rejected', byId: actor.id, byName: actor.name, at, reason: trimmed };
  const updated: ApprovalRequest = {
    ...request,
    status: 'rejected',
    resolvedAt: at,
    decision,
    history: [
      ...request.history,
      {
        id: eventId('reject', at, request.id),
        action: 'reject',
        at,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.label,
        version: request.version,
        note: trimmed,
      },
    ],
  };
  let next = withRequest(state, updated);
  next = notify(next, {
    kind: 'result',
    title: `审批被驳回：${request.snapshot.title}`,
    body: request.isRevision
      ? `${actor.name} 驳回：${trimmed}。原生效版本继续对学员开放，可在记录里查看。`
      : `${actor.name} 驳回：${trimmed}。可修改后重新提交，审批历史会保留。`,
    recipientId: request.creatorId,
    recipientName: request.creatorName,
    requestId: request.id,
    targetTab: 'approval_records',
    at,
  });
  return { state: next, request: updated };
}

export function withdrawRequest(state: ApprovalState, requestId: string, actor: ApprovalActor, now = new Date()): ApprovalMutationResult {
  const request = requestById(state, requestId);
  if (!request) return { state, error: '审批单据不存在' };
  if (request.status !== 'pending') return { state, error: '只有待审批的单据可以撤回。', request };
  if (request.creatorId !== actor.id) return { state, error: '只有提交人可以撤回这条单据。', request };
  const at = now.toISOString();
  const updated: ApprovalRequest = {
    ...request,
    status: 'withdrawn',
    resolvedAt: at,
    history: [
      ...request.history,
      {
        id: eventId('withdraw', at, request.id),
        action: 'withdraw',
        at,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.label,
        version: request.version,
        note: '提交人撤回',
      },
    ],
  };
  let next = withRequest(state, updated);
  for (const approverId of request.approverIds) {
    const approver = actorForApprover(approverId);
    next = notify(next, {
      kind: 'withdrawn',
      title: `单据已撤回：${request.snapshot.title}`,
      body: `${request.creatorName} 撤回了${typeLabel(request.type)}审批，无需再处理。`,
      recipientId: approver.id,
      recipientName: approver.name,
      requestId: request.id,
      targetTab: 'approval_inbox',
      at,
    });
  }
  return { state: next, request: updated };
}

export function resubmitRequest(
  state: ApprovalState,
  requestId: string,
  actor: ApprovalActor,
  note: string,
  now = new Date(),
): ApprovalMutationResult {
  const request = requestById(state, requestId);
  if (!request) return { state, error: '审批单据不存在' };
  if (request.status !== 'rejected') return { state, error: '只有被驳回的单据可以重新提交。', request };
  if (request.creatorId !== actor.id) return { state, error: '只有提交人可以重新提交这条单据。', request };
  const at = now.toISOString();
  const version = request.version + 1;
  const updated: ApprovalRequest = {
    ...request,
    version,
    status: 'pending',
    submittedAt: at,
    resolvedAt: undefined,
    decision: undefined,
    reminderSentAt: undefined,
    history: [
      ...request.history,
      {
        id: eventId('resubmit', at, request.id),
        action: 'resubmit',
        at,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.label,
        version,
        note: note.trim() || '修改后重新提交',
        approverIds: request.approverIds,
      },
    ],
  };
  let next = withRequest(state, updated);
  for (const approverId of request.approverIds) {
    const approver = actorForApprover(approverId);
    next = notify(next, {
      kind: 'todo',
      title: `重新提交待审批：${request.snapshot.title}`,
      body: `${actor.name} 已按驳回意见修改并重新提交（v${version}）。`,
      recipientId: approver.id,
      recipientName: approver.name,
      requestId: request.id,
      targetTab: 'approval_inbox',
      at,
    });
  }
  return { state: next, request: updated };
}

/** 已生效内容发变更：新开一张变更单据，老版本继续生效 */
export function submitRevision(
  state: ApprovalState,
  requestId: string,
  actor: ApprovalActor,
  snapshot: ApprovalSnapshot,
  now = new Date(),
): ApprovalMutationResult {
  const live = requestById(state, requestId);
  if (!live) return { state, error: '找不到生效版本。' };
  if (live.status !== 'approved') return { state, error: '只有已生效的内容可以提交变更。', request: live };
  const result = submitForApproval(
    state,
    {
      type: live.type,
      targetId: live.targetId,
      snapshot,
      creator: { ...actor, role: live.creatorRole },
      isRevision: true,
      supersedesRequestId: live.id,
    },
    now,
  );
  if (result.mode === 'blocked') return { state, error: result.error };
  return { state: result.state, request: result.request };
}

export function setMasterEnabled(state: ApprovalState, enabled: boolean, actorName: string, now = new Date()): ApprovalState {
  return {
    ...state,
    config: {
      ...state.config,
      masterEnabled: enabled,
      masterUpdatedAt: now.toISOString(),
      masterUpdatedBy: actorName,
    },
  };
}

/** 修改某类型在「全国」或某区域下的流程开关 / 审批人 */
export function setFlowRule(
  state: ApprovalState,
  type: ApprovalObjectType,
  key: 'national' | string,
  patch: Partial<ApprovalFlowRule>,
  actorName: string,
  now = new Date(),
): ApprovalState {
  const typeFlow = state.config.types[type];
  const at = now.toISOString();
  const nextTypeFlow: ApprovalTypeFlow = key === 'national'
    ? {
        ...typeFlow,
        national: { ...typeFlow.national, ...patch },
        updatedAt: at,
        updatedBy: actorName,
      }
    : {
        ...typeFlow,
        regional: {
          ...typeFlow.regional,
          [key]: { ...(typeFlow.regional[key] ?? emptyRule()), ...patch },
        },
        updatedAt: at,
        updatedBy: actorName,
      };
  return {
    ...state,
    config: { ...state.config, types: { ...state.config.types, [type]: nextTypeFlow } },
  };
}

/** 清除某区域单独配置，恢复「沿用全国流程」 */
export function clearRegionalRule(state: ApprovalState, type: ApprovalObjectType, regionId: string, actorName: string, now = new Date()): ApprovalState {
  const typeFlow = state.config.types[type];
  const regional = { ...typeFlow.regional };
  delete regional[regionId];
  return {
    ...state,
    config: {
      ...state.config,
      types: {
        ...state.config.types,
        [type]: { ...typeFlow, regional, updatedAt: now.toISOString(), updatedBy: actorName },
      },
    },
  };
}

export function markNotificationRead(state: ApprovalState, id: string, now = new Date()): ApprovalState {
  const at = now.toISOString();
  return {
    ...state,
    notifications: state.notifications.map(item => (item.id === id && !item.readAt ? { ...item, readAt: at } : item)),
  };
}

export function markAllNotificationsRead(state: ApprovalState, recipientId: string, now = new Date()): ApprovalState {
  const at = now.toISOString();
  return {
    ...state,
    notifications: state.notifications.map(item =>
      item.recipientId === recipientId && !item.readAt ? { ...item, readAt: at } : item,
    ),
  };
}

export function markRequestApplied(state: ApprovalState, requestId: string, now = new Date()): ApprovalState {
  const request = requestById(state, requestId);
  if (!request || request.appliedAt) return state;
  return withRequest(state, { ...request, appliedAt: now.toISOString() });
}

/** 提交满 24 小时未处理 → 催办一次（不自动通过、不升级） */
export function runReminders(state: ApprovalState, now = new Date()): ApprovalState {
  const due = state.requests.filter(item => {
    if (item.status !== 'pending' || item.reminderSentAt) return false;
    return now.getTime() - new Date(item.submittedAt).getTime() >= 24 * 60 * 60 * 1000;
  });
  if (due.length === 0) return state;
  const at = now.toISOString();
  let next = state;
  for (const request of due) {
    next = withRequest(next, { ...request, reminderSentAt: at });
    const waitedHours = Math.max(24, Math.round((now.getTime() - new Date(request.submittedAt).getTime()) / 3600000));
    for (const approverId of request.approverIds) {
      const approver = actorForApprover(approverId);
      next = notify(next, {
        kind: 'reminder',
        title: `待审超过 ${waitedHours} 小时：${request.snapshot.title}`,
        body: `${request.creatorName} 提交的${typeLabel(request.type)}还没处理，请尽快审批。系统不会自动通过。`,
        recipientId: approver.id,
        recipientName: approver.name,
        requestId: request.id,
        targetTab: 'approval_inbox',
        at,
      });
    }
  }
  return next;
}

export function setDemoApprover(state: ApprovalState, approverId: string): ApprovalState {
  return { ...state, demoApproverId: approverId };
}

/* ------------------------------ 派生选择器 ------------------------------ */

export function pendingForApprover(state: ApprovalState, approverId: string): ApprovalRequest[] {
  return state.requests
    .filter(item => item.status === 'pending' && item.approverIds.includes(approverId))
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

export function handledByApprover(state: ApprovalState, approverId: string): ApprovalRequest[] {
  return state.requests
    .filter(item => item.decision?.byId === approverId)
    .sort((a, b) => (b.resolvedAt ?? '').localeCompare(a.resolvedAt ?? ''));
}

export function unreadCountFor(state: ApprovalState, recipientId: string): number {
  return state.notifications.filter(item => item.recipientId === recipientId && !item.readAt).length;
}

export function notificationsFor(state: ApprovalState, recipientId: string): AppNotification[] {
  return state.notifications
    .filter(item => item.recipientId === recipientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface ApprovalStats {
  pending: number;
  handledToday: number;
  handledTotal: number;
  averageHours: number | null;
  rejected: number;
}

export function approvalStatsFor(state: ApprovalState, approverId: string, now = new Date()): ApprovalStats {
  const pending = pendingForApprover(state, approverId).length;
  const handled = handledByApprover(state, approverId);
  const todayKey = now.toISOString().slice(0, 10);
  const handledToday = handled.filter(item => (item.resolvedAt ?? '').slice(0, 10) === todayKey).length;
  const durations = handled
    .map(item => (item.resolvedAt ? new Date(item.resolvedAt).getTime() - new Date(item.submittedAt).getTime() : 0))
    .filter(value => value > 0);
  const averageHours = durations.length
    ? Math.round((durations.reduce((sum, value) => sum + value, 0) / durations.length / 3600000) * 10) / 10
    : null;
  const rejected = handled.filter(item => item.decision?.outcome === 'rejected').length;
  return { pending, handledToday, handledTotal: handled.length, averageHours, rejected };
}

/** 某创建者的全部审批单据（「我的审批流转」独立页面按类型 / 状态再筛选） */
export function requestsByCreator(state: ApprovalState, creatorId: string): ApprovalRequest[] {
  return state.requests
    .filter(item => item.creatorId === creatorId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

/** 某创建者在某类型下可见的审批单据（用于课件/任务列表里的「审批中」分区） */
export function requestsForCreator(
  state: ApprovalState,
  type: ApprovalObjectType,
  creatorId: string,
): ApprovalRequest[] {
  return state.requests
    .filter(item => item.type === type && item.creatorId === creatorId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function typeLabel(type: ApprovalObjectType): string {
  return APPROVAL_TYPE_META[type]?.label ?? String(type);
}

export function scopeText(snapshot: ApprovalSnapshot): string {
  if (snapshot.scope === '全国') return '全国';
  return regionNameOf(snapshot.regionId) ?? '区域';
}

export function statusLabel(request: ApprovalRequest): string {
  if (request.status === 'pending') return request.isRevision ? '变更待审批' : '待审批';
  if (request.status === 'approved') return request.isRevision ? '已生效（新版本）' : '已生效';
  if (request.status === 'rejected') return '已驳回';
  return '已撤回';
}

export function statusToneClass(request: ApprovalRequest): string {
  if (request.status === 'pending') {
    return request.isRevision
      ? 'border-[#C7CDFF] bg-[#F3F5FF] text-[#3F48B4]'
      : 'border-[#E8CCA0] bg-[#FFF7EA] text-[#8B621F]';
  }
  if (request.status === 'approved') return 'border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]';
  if (request.status === 'rejected') return 'border-red-200 bg-red-50 text-red-600';
  return 'border-[#E5DED8] bg-[#F8F5F3] text-[#766F73]';
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '--';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '--';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatRelative(iso: string, now = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return '--';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return formatDateTime(iso);
}

export function hoursWaiting(request: ApprovalRequest, now = new Date()): number {
  return Math.max(0, Math.round((now.getTime() - new Date(request.submittedAt).getTime()) / 3600000));
}
