/**
 * 审批功能 · 类型与常量
 *
 * 范围：课件、学习任务、练习任务、考试、音视频采集任务、数字人顾客、场景剧本七类培训师产出。
 * 题库题目与黄金素材沿用各自原有的审核口径（题库「审核入库」、素材库「确认进入黄金素材」的精选确认），
 * 不进入审批流程：这两处已有轻量人工确认，再叠一层审批太重。
 * 结构：单级审批，任一被指定审批人同意即生效；驳回必填理由、同单据可改可重提。
 * 配置：类型 × 范围（全国 / 区域），区域未单独配置时沿用全国流程。
 */

import type { Role } from '../types';

export type ApprovalObjectType = 'course' | 'study_task' | 'practice_task' | 'exam' | 'media_task' | 'digital_human' | 'script';
export type ApprovalScope = '全国' | '区域';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';
export type ApprovalAction = 'submit' | 'approve' | 'reject' | 'withdraw' | 'resubmit';
export type ApprovalActorRole = Role | '审批管理者';

export const APPROVAL_MANAGER_ROLE: Role = 'Approval Manager';

export const APPROVAL_TYPE_ORDER: ApprovalObjectType[] = [
  'course',
  'study_task',
  'practice_task',
  'exam',
  'media_task',
  'digital_human',
  'script',
];

export const APPROVAL_TYPE_META: Record<ApprovalObjectType, {
  label: string;
  short: string;
  /** 原型里触发审批的角色，用于配置页与审批详情解释 */
  producers: string;
  /** 审批通过后内容进入的模块（给配置页展示用） */
  targetTab: string;
}> = {
  course: { label: '课件', short: '课件', producers: '总部培训师 / 区域培训师', targetTab: '课件管理' },
  study_task: { label: '学习任务', short: '学习任务', producers: '总部培训师 / 区域培训师', targetTab: '学习任务管理' },
  practice_task: { label: '练习任务', short: '练习任务', producers: '总部培训师 / 区域培训师', targetTab: '练习任务管理' },
  exam: { label: '考试', short: '考试', producers: '总部培训师', targetTab: '考试任务管理' },
  media_task: { label: '音视频采集任务', short: '采集任务', producers: '总部培训师 / 区域培训师', targetTab: '音视频采集任务' },
  digital_human: { label: '数字人顾客', short: '数字人', producers: '总部培训师 / 区域培训师', targetTab: '数字人顾客' },
  script: { label: '场景剧本', short: '剧本', producers: '总部培训师 / 区域培训师', targetTab: '场景剧本' },
};

export interface ApprovalRegion {
  id: string;
  name: string;
  ownerName: string;
}

/** 与培训巡检保持一致的区域口径 */
export const APPROVAL_REGIONS: ApprovalRegion[] = [
  { id: 'south', name: '雅加达南区', ownerName: 'Fitriani' },
  { id: 'north', name: '雅加达北区', ownerName: 'Dewi' },
  { id: 'bali', name: '巴厘岛区', ownerName: 'Putri' },
  { id: 'surabaya', name: '泗水区', ownerName: 'Rina' },
];

export function regionNameOf(regionId?: string): string | undefined {
  if (!regionId) return undefined;
  return APPROVAL_REGIONS.find(item => item.id === regionId)?.name ?? regionId;
}

export interface ApprovalApproverAccount {
  id: string;
  name: string;
  email: string;
  /** 归属：总部 / 区域 */
  scope: '总部' | '区域';
  regionId?: string;
  status: '已激活' | '未激活';
}

/**
 * 演示账号：审批人只能从拥有「审批管理者」角色的账号里选。
 * Layout 的「审批身份」切换器也读取这份名单。
 */
export const APPROVER_ACCOUNTS: ApprovalApproverAccount[] = [
  { id: 'usr_am_rani', name: 'Rani Wijaya', email: 'rani.w@lumina.id', scope: '总部', status: '已激活' },
  { id: 'usr_am_yoga', name: 'Yoga Pratama', email: 'yoga.p@lumina.id', scope: '区域', regionId: 'south', status: '已激活' },
];

export function approverAccountById(id: string): ApprovalApproverAccount | undefined {
  return APPROVER_ACCOUNTS.find(item => item.id === id);
}

export function approverLabel(id: string): string {
  const account = approverAccountById(id);
  if (!account) return id;
  return account.scope === '总部' ? `${account.name}（总部）` : `${account.name}（${regionNameOf(account.regionId)}）`;
}

export interface ApprovalFlowRule {
  enabled: boolean;
  approverIds: string[];
}

export interface ApprovalTypeFlow {
  type: ApprovalObjectType;
  national: ApprovalFlowRule;
  /** key = 区域 id；缺失表示该区域沿用全国流程 */
  regional: Record<string, ApprovalFlowRule>;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ApprovalConfig {
  /** 客户（租户）总开关，由 Super Admin 控制 */
  masterEnabled: boolean;
  masterUpdatedAt?: string;
  masterUpdatedBy?: string;
  types: Record<ApprovalObjectType, ApprovalTypeFlow>;
}

export interface ApprovalTargetField {
  label: string;
  value: string;
}

/** 预览条目的二级详情：点「查看详情」弹出（课件逐页、附加题题干与答案等） */
export interface ApprovalPreviewDetailGroup {
  title?: string;
  lines: string[];
}

export interface ApprovalPreviewDetail {
  title: string;
  description?: string;
  groups: ApprovalPreviewDetailGroup[];
}

/** 预览条目：纯文本即可；带 detail 时右侧出现「查看详情」并弹二级弹窗 */
export type ApprovalPreviewItem = string | {
  text: string;
  detail?: ApprovalPreviewDetail;
};

/** 内容预览：审批详情右侧面板里的只读结构化片段（生产环境替换为真实内容渲染器） */
export interface ApprovalPreviewSection {
  label: string;
  items: ApprovalPreviewItem[];
}

export interface ApprovalSnapshot {
  title: string;
  summary: string;
  scope: ApprovalScope;
  regionId?: string;
  fields: ApprovalTargetField[];
  /** 审批人要看「批的是什么」：按类型渲染的结构化内容预览 */
  preview?: ApprovalPreviewSection[];
  /** 变更重审时列出与生效版本的差异点 */
  changeSummary?: string[];
}

export interface ApprovalEvent {
  id: string;
  action: ApprovalAction;
  at: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  version: number;
  note?: string;
  approverIds?: string[];
}

export interface ApprovalDecision {
  outcome: 'approved' | 'rejected';
  byId: string;
  byName: string;
  at: string;
  reason?: string;
}

export interface ApprovalRequest {
  id: string;
  type: ApprovalObjectType;
  targetId: string;
  snapshot: ApprovalSnapshot;
  creatorId: string;
  creatorName: string;
  creatorRole: Role;
  version: number;
  status: ApprovalStatus;
  /** 是否为对已生效内容的变更重审（老版本继续生效） */
  isRevision: boolean;
  /** 重审单据指向的生效版本单据 */
  supersedesRequestId?: string;
  submittedAt: string;
  resolvedAt?: string;
  approverIds: string[];
  decision?: ApprovalDecision;
  history: ApprovalEvent[];
  reminderSentAt?: string;
  /** 业务侧已消费「生效」事件的时间（例如考试生成考试任务） */
  appliedAt?: string;
}

export type NotificationCategory = 'approval' | 'system';
export type NotificationKind = 'todo' | 'result' | 'withdrawn' | 'reminder' | 'system';
export type NotificationChannel = 'inbox' | 'app_push' | 'whatsapp';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string;
  recipientId: string;
  recipientName: string;
  channels: NotificationChannel[];
  requestId?: string;
  targetTab?: string;
}

export interface ApprovalActor {
  id: string;
  name: string;
  role: ApprovalActorRole;
  label: string;
}

export interface ApprovalState {
  config: ApprovalConfig;
  requests: ApprovalRequest[];
  notifications: AppNotification[];
  /** 审批管理者演示身份（原型里用于切换总部 / 区域审批人） */
  demoApproverId: string;
}

export const STATUS_META: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: { label: '待审批', className: 'border-[#E8CCA0] bg-[#FFF7EA] text-[#8B621F]' },
  approved: { label: '已生效', className: 'border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]' },
  rejected: { label: '已驳回', className: 'border-red-200 bg-red-50 text-red-600' },
  withdrawn: { label: '已撤回', className: 'border-[#E5DED8] bg-[#F8F5F3] text-[#766F73]' },
};

export function isApprovalObjectType(value: unknown): value is ApprovalObjectType {
  return typeof value === 'string' && (APPROVAL_TYPE_ORDER as string[]).includes(value);
}
