/**
 * 审批功能 · 本地存储
 *
 * 状态保存在 localStorage（受限环境降级到内存），结构 schema=1。
 * 演示数据与运行数据分开生成：出现坏存档时整份重置为演示数据，不让页面白屏。
 * 配置、单据、站内信、催办都在这里落地，业务页只调用下面这些方法。
 */

import { useSyncExternalStore } from 'react';
import { safeStorage } from './safeStorage';
import { buildCourseApprovalPreview, buildCourseDetail, buildCourseHomeworkDetail } from './courseApprovalPreview';
import {
  clearRegionalRule,
  createDefaultApprovalConfig,
  resolveApprovalRule,
  runReminders,
  setDemoApprover,
  setFlowRule,
  setMasterEnabled,
  submitForApproval as engineSubmitForApproval,
  submitRevision as engineSubmitRevision,
  approveRequest as engineApproveRequest,
  rejectRequest as engineRejectRequest,
  withdrawRequest as engineWithdrawRequest,
  resubmitRequest as engineResubmitRequest,
  markAllNotificationsRead as engineMarkAllNotificationsRead,
  markNotificationRead as engineMarkNotificationRead,
  markRequestApplied as engineMarkRequestApplied,
  type ApprovalMutationResult,
  type ResolvedApprovalRule,
  type SubmitApprovalInput,
  type SubmitApprovalResult,
} from './approvalEngine';
import {
  APPROVAL_TYPE_ORDER,
  type ApprovalActor,
  type ApprovalConfig,
  type ApprovalFlowRule,
  type ApprovalObjectType,
  type ApprovalRequest,
  type ApprovalScope,
  type ApprovalSnapshot,
  type ApprovalState,
  type ApprovalTypeFlow,
  type AppNotification,
} from './approvalTypes';

const key = 'salesboost.approval.v1';
const SCHEMA = 13;

let current: ApprovalState | undefined;
let storageError = '';
const listeners = new Set<() => void>();

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

function hoursAgo(now: Date, hours: number): string {
  return new Date(now.getTime() - hours * HOUR).toISOString();
}

function buildConfig(): ApprovalConfig {
  const base = createDefaultApprovalConfig();
  const types = {} as Record<ApprovalObjectType, ApprovalTypeFlow>;
  for (const type of APPROVAL_TYPE_ORDER) {
    types[type] = { ...base.types[type] };
  }
  types.course = {
    type: 'course',
    national: { enabled: true, levels: [{ approverIds: ['usr_am_maya'] }, { approverIds: ['usr_am_rani'] }] },
    regional: { south: { enabled: true, levels: [{ approverIds: ['usr_am_yoga'] }] } },
    updatedAt: new Date().toISOString(),
    updatedBy: '审批管理者',
  };
  types.study_task = {
    type: 'study_task',
    national: { enabled: true, levels: [{ approverIds: ['usr_am_rani'] }] },
    regional: {},
    updatedAt: new Date().toISOString(),
    updatedBy: '审批管理者',
  };
  types.practice_task = {
    type: 'practice_task',
    national: { enabled: false, levels: [] },
    regional: { south: { enabled: true, levels: [{ approverIds: ['usr_am_yoga'] }] } },
    updatedAt: new Date().toISOString(),
    updatedBy: '审批管理者',
  };
  types.exam = {
    type: 'exam',
    national: { enabled: true, levels: [{ approverIds: ['usr_am_rani'] }] },
    regional: {},
    updatedAt: new Date().toISOString(),
    updatedBy: '审批管理者',
  };
  // 音视频采集任务默认关闭：留给演示「客户按类型打开审批」
  types.media_task = {
    type: 'media_task',
    national: { enabled: false, levels: [] },
    regional: {},
    updatedAt: new Date().toISOString(),
    updatedBy: '审批管理者',
  };
  // 数字人顾客接入同一套审批（AI 陪练模块的内容，与场景剧本同口径）
  types.digital_human = {
    type: 'digital_human',
    national: { enabled: true, levels: [{ approverIds: ['usr_am_rani'] }] },
    regional: { south: { enabled: true, levels: [{ approverIds: ['usr_am_yoga'] }] } },
    updatedAt: new Date().toISOString(),
    updatedBy: '审批管理者',
  };
  // 场景剧本接入同一套审批；题库与素材库保持各自原有的轻量审核，不进审批
  types.script = {
    type: 'script',
    national: { enabled: true, levels: [{ approverIds: ['usr_am_rani'] }] },
    regional: { south: { enabled: true, levels: [{ approverIds: ['usr_am_yoga'] }] } },
    updatedAt: new Date().toISOString(),
    updatedBy: '审批管理者',
  };
  return { masterEnabled: true, masterUpdatedAt: new Date().toISOString(), masterUpdatedBy: '系统管理员', types };
}

export function createSeedApprovalState(now = new Date()): ApprovalState {
  const config = buildConfig();
  const at26h = hoursAgo(now, 26);
  const at6h = hoursAgo(now, 6);
  const at5h = hoursAgo(now, 5);
  const at3h = hoursAgo(now, 3);
  const at2d = hoursAgo(now, 50);
  const at1d = hoursAgo(now, 30);
  const at4h = hoursAgo(now, 4);
  const at2h = hoursAgo(now, 2);

  const pendingCourse: ApprovalRequest = {
    id: 'apr-seed-course-1',
    type: 'course',
    targetId: 'course-seed-winter-talk',
    snapshot: {
      title: '双萃精华冬季主推话术（2026版）',
      summary: '面向门店 BA 的冬季主推话术课件，包含 3 段演示视频与配套附加题。',
      scope: '全国',
      fields: [
        { label: '内容形式', value: '课件（AI 生成 + 人工校对）' },
        { label: '文件清单', value: '主课件 18 页 · 演示视频 3 段 · 附加题 5 题' },
        { label: '适用人群', value: '全国直营门店 BA' },
      ],
      preview: buildCourseApprovalPreview('双萃精华冬季主推话术（2026版）'),
      changeSummary: [],
    },
    creatorId: 'usr_ht_sarah',
    creatorName: 'Sarah Lee',
    creatorRole: 'HQ Trainer',
    version: 1,
    status: 'pending',
    isRevision: false,
    submittedAt: at26h,
    approverIds: ['usr_am_maya'],
    levelApprovers: [['usr_am_maya'], ['usr_am_rani']],
    currentLevel: 0,
    history: [
      { id: 'apr-seed-course-1-submit', action: 'submit', at: at26h, actorId: 'usr_ht_sarah', actorName: 'Sarah Lee', actorRole: '总部培训师', version: 1, note: '提交审批（共 2 级：市场部 → 总部）', approverIds: ['usr_am_maya'] },
    ],
  };

  const approvedStudy: ApprovalRequest = {
    id: 'apr-seed-study-1',
    type: 'study_task',
    targetId: 'task-seed-newcomer-course',
    snapshot: {
      title: '新人入职必修课（2026版）',
      summary: '面向新入职 BA 的必修学习任务，拼装 2 门课件，周期 30 天。',
      scope: '全国',
      fields: [
        { label: '分发对象', value: '全国新入职满 1 个月 BA' },
        { label: '任务周期', value: '30 天' },
        { label: '包含课件', value: '双萃系列核心卖点解析 · VIP 客户破冰话术实战' },
      ],
      preview: [
        {
          label: '学习内容',
          items: [
            { text: '双萃系列核心卖点解析', detail: buildCourseDetail('双萃系列核心卖点解析') },
            { text: 'VIP 客户破冰话术实战', detail: buildCourseDetail('VIP 客户破冰话术实战') },
          ],
        },
        { label: '完成要求', items: ['30 天内完成 2 门课件', '完成后计入新人学习档案'] },
      ],
    },
    creatorId: 'usr_ht_sarah',
    creatorName: 'Sarah Lee',
    creatorRole: 'HQ Trainer',
    version: 1,
    status: 'approved',
    isRevision: false,
    submittedAt: at2d,
    resolvedAt: at2d,
    approverIds: ['usr_am_rani'],
    levelApprovers: [['usr_am_rani']],
    currentLevel: 0,
    decision: { outcome: 'approved', byId: 'usr_am_rani', byName: 'Rani Wijaya', at: at2d },
    history: [
      { id: 'apr-seed-study-1-submit', action: 'submit', at: at2d, actorId: 'usr_ht_sarah', actorName: 'Sarah Lee', actorRole: '总部培训师', version: 1, note: '提交审批', approverIds: ['usr_am_rani'] },
      { id: 'apr-seed-study-1-approve', action: 'approve', at: at2d, actorId: 'usr_am_rani', actorName: 'Rani Wijaya', actorRole: '审批管理者（总部）', version: 1, note: '同意，内容生效' },
    ],
  };

  const revisionCourse: ApprovalRequest = {
    id: 'apr-seed-course-2',
    type: 'course',
    targetId: 'course-seed-winter-talk-2025',
    snapshot: {
      title: '敏感肌换季护理指南（2026 修订版）',
      summary: '基于已生效版本的修订：补充油敏肌鉴别话术，替换 2 页过时成分说明。',
      scope: '全国',
      fields: [
        { label: '内容形式', value: '课件（人工修订）' },
        { label: '文件清单', value: '主课件 22 页 · 附加题 6 题' },
        { label: '生效版本', value: '上一版继续对学员开放，通过后替换为新版本' },
      ],
      preview: [
        {
          label: '本次修订后的目录',
          items: [
            {
              text: '新增 · 油敏肌鉴别话术（2 页）',
              detail: {
                title: '课件预览 · 新增页（油敏肌鉴别）',
                description: '共 2 页',
                groups: [
                  { title: '第 9 页 · 油敏肌自测', lines: ['油敏肌的三个典型信号：外油内干、泛红刺痛、易闷痘', '门店 3 步快速判断法'] },
                  { title: '第 10 页 · 应对与话术', lines: ['先修护屏障，再谈功效叠加', '柜面安抚话术与禁忌成分提醒'] },
                ],
              },
            },
            {
              text: '替换 · 第 8 页过时成分表',
              detail: {
                title: '替换页对比 · 第 8 页',
                description: '原型展示新旧内容对比',
                groups: [
                  { title: '旧版（已过时）', lines: ['含 2024 版成分清单', '未标注新备案的防腐体系'] },
                  { title: '新版', lines: ['更新为 2026 版成分清单', '补充新备案成分与敏感肌提示'] },
                ],
              },
            },
            {
              text: '附加题由 4 题增加到 6 题',
              detail: buildCourseHomeworkDetail(),
            },
          ],
        },
        { label: '仍沿用上一版结构', items: ['封面 · 换季护理要点', '敏感肌分级与应对', '成分避雷清单'] },
      ],
      changeSummary: [
        '新增「油敏肌鉴别」2 页话术',
        '替换旧版成分表第 8 页（已过时）',
        '附加题由 4 题增加到 6 题',
      ],
    },
    creatorId: 'usr_ht_sarah',
    creatorName: 'Sarah Lee',
    creatorRole: 'HQ Trainer',
    version: 2,
    status: 'pending',
    isRevision: true,
    supersedesRequestId: 'apr-seed-course-live-1',
    submittedAt: at5h,
    approverIds: ['usr_am_rani'],
    levelApprovers: [['usr_am_rani']],
    currentLevel: 0,
    history: [
      { id: 'apr-seed-course-2-submit', action: 'resubmit', at: at5h, actorId: 'usr_ht_sarah', actorName: 'Sarah Lee', actorRole: '总部培训师', version: 2, note: '提交变更版本，等待审批', approverIds: ['usr_am_rani'] },
    ],
  };

  const liveCourseV1: ApprovalRequest = {
    id: 'apr-seed-course-live-1',
    type: 'course',
    targetId: 'course-seed-winter-talk-2025',
    snapshot: {
      title: '敏感肌换季护理指南（2025 版）',
      summary: '已生效版本，变更审批期间继续对学员开放。',
      scope: '全国',
      fields: [
        { label: '内容形式', value: '课件' },
        { label: '文件清单', value: '主课件 20 页 · 附加题 4 题' },
      ],
      preview: [
        { label: '课件目录', items: ['封面 · 换季护理要点', '敏感肌分级与应对', '成分避雷清单', '结尾 · 附加题 4 题'] },
      ],
    },
    creatorId: 'usr_ht_sarah',
    creatorName: 'Sarah Lee',
    creatorRole: 'HQ Trainer',
    version: 1,
    status: 'approved',
    isRevision: false,
    submittedAt: hoursAgo(now, 14 * 24),
    resolvedAt: hoursAgo(now, 14 * 24),
    approverIds: ['usr_am_rani'],
    levelApprovers: [['usr_am_rani']],
    currentLevel: 0,
    decision: { outcome: 'approved', byId: 'usr_am_rani', byName: 'Rani Wijaya', at: hoursAgo(now, 14 * 24) },
    history: [
      { id: 'apr-seed-course-live-1-submit', action: 'submit', at: hoursAgo(now, 14 * 24), actorId: 'usr_ht_sarah', actorName: 'Sarah Lee', actorRole: '总部培训师', version: 1, note: '提交审批', approverIds: ['usr_am_rani'] },
      { id: 'apr-seed-course-live-1-approve', action: 'approve', at: hoursAgo(now, 14 * 24), actorId: 'usr_am_rani', actorName: 'Rani Wijaya', actorRole: '审批管理者（总部）', version: 1, note: '同意，内容生效' },
    ],
  };

  const pendingPractice: ApprovalRequest = {
    id: 'apr-seed-practice-1',
    type: 'practice_task',
    targetId: 'task-seed-south-practice',
    snapshot: {
      title: '南区新人陪练周挑战',
      summary: '面向南区新人的每周陪练任务，包含数字人顾客与场景剧本各 1 个。',
      scope: '区域',
      regionId: 'south',
      fields: [
        { label: '分发对象', value: '雅加达南区所有门店 BA' },
        { label: '练习频次', value: '每周完成 3 次' },
        { label: '采集要求', value: '音频录制，单次最长 10 分钟' },
      ],
      preview: [
        { label: '练习内容', items: ['数字人顾客 · 换季敏感肌咨询', '场景剧本 · 需求确认与安抚'] },
        { label: '完成要求', items: ['每周完成 3 次陪练', '含音频录制，单次最长 10 分钟'] },
      ],
    },
    creatorId: 'usr_rt_nurul',
    creatorName: 'Nurul Huda',
    creatorRole: 'Regional Trainer',
    version: 1,
    status: 'pending',
    isRevision: false,
    submittedAt: at3h,
    approverIds: ['usr_am_yoga'],
    levelApprovers: [['usr_am_yoga']],
    currentLevel: 0,
    history: [
      { id: 'apr-seed-practice-1-submit', action: 'submit', at: at3h, actorId: 'usr_rt_nurul', actorName: 'Nurul Huda', actorRole: '区域培训师（雅加达南区）', version: 1, note: '提交审批，等待区域审批人确认', approverIds: ['usr_am_yoga'] },
    ],
  };

  const rejectedMedia: ApprovalRequest = {
    id: 'apr-seed-media-1',
    type: 'media_task',
    targetId: 'task-seed-media-service',
    snapshot: {
      title: '南区门店服务标准采集',
      summary: '采集门店服务标准执行情况，评估维度 4 项。',
      scope: '区域',
      regionId: 'south',
      fields: [
        { label: '分发对象', value: '雅加达南区所有门店 BA' },
        { label: '采集类型', value: '视频，单次最长 5 分钟' },
        { label: '评分维度', value: '需求识别 25% · 方案说明 35% · 异议处理 25% · 表达状态 15%' },
      ],
      preview: [
        { label: '采集要求', items: ['视频录制 + 上传，单次最长 5 分钟', '需顾客同意许可后方可提交'] },
        { label: '评分维度', items: ['需求识别 25%', '方案说明 35%', '异议处理 25%', '表达状态 15%'] },
      ],
    },
    creatorId: 'usr_rtm_fitriani',
    creatorName: 'Fitriani',
    creatorRole: 'Regional Training Manager',
    version: 1,
    status: 'rejected',
    isRevision: false,
    submittedAt: at1d,
    resolvedAt: hoursAgo(now, 28),
    approverIds: ['usr_am_yoga'],
    levelApprovers: [['usr_am_yoga']],
    currentLevel: 0,
    decision: {
      outcome: 'rejected',
      byId: 'usr_am_yoga',
      byName: 'Yoga Pratama',
      at: hoursAgo(now, 28),
      reason: '评分维度权重合计 100%，但「方案说明」缺少判定说明，请补充后再提交。',
    },
    history: [
      { id: 'apr-seed-media-1-submit', action: 'submit', at: at1d, actorId: 'usr_rtm_fitriani', actorName: 'Fitriani', actorRole: '区域培训师主管', version: 1, note: '提交审批', approverIds: ['usr_am_yoga'] },
      { id: 'apr-seed-media-1-reject', action: 'reject', at: hoursAgo(now, 28), actorId: 'usr_am_yoga', actorName: 'Yoga Pratama', actorRole: '审批管理者（雅加达南区）', version: 1, note: '评分维度权重合计 100%，但「方案说明」缺少判定说明，请补充后再提交。' },
    ],
  };

  const pendingScript: ApprovalRequest = {
    id: 'apr-seed-script-1',
    type: 'script',
    targetId: 'script-seed-south-1',
    snapshot: {
      title: '场景剧本：敏感肌换季安抚（南区版）',
      summary: '针对南区换季敏感肌客诉的场景剧本，含 4 个步骤与考核提示。',
      scope: '区域',
      regionId: 'south',
      fields: [
        { label: '剧本步骤', value: '4 个步骤（开场安抚 / 需求确认 / 方案说明 / 异议处理）' },
        { label: '引用素材', value: '黄金素材 2 条：换季泛红安抚、网上比价异议' },
        { label: '生效范围', value: '雅加达南区' },
      ],
      preview: [
        { label: '剧本步骤', items: ['1. 开场安抚', '2. 需求确认', '3. 方案说明', '4. 异议处理'] },
        { label: '引用素材', items: ['换季泛红安抚', '网上比价异议'] },
      ],
    },
    creatorId: 'usr_rt_nurul',
    creatorName: 'Nurul Huda',
    creatorRole: 'Regional Trainer',
    version: 1,
    status: 'pending',
    isRevision: false,
    submittedAt: at2h,
    approverIds: ['usr_am_yoga'],
    levelApprovers: [['usr_am_yoga']],
    currentLevel: 0,
    history: [
      { id: 'apr-seed-script-1-submit', action: 'submit', at: at2h, actorId: 'usr_rt_nurul', actorName: 'Nurul Huda', actorRole: '区域培训师（雅加达南区）', version: 1, note: '提交区域剧本审批', approverIds: ['usr_am_yoga'] },
    ],
  };

  const pendingAvatar: ApprovalRequest = {
    id: 'apr-seed-avatar-1',
    type: 'digital_human',
    targetId: 'avatar-seed-south-skincare',
    snapshot: {
      title: '数字人顾客：成分党深挖型顾客（南区版）',
      summary: '面向南区的成分敏感型顾客陪练，会追问浓度与配方逻辑，含 5 步对话流程。',
      scope: '区域',
      regionId: 'south',
      fields: [
        { label: '语种与音色', value: '印尼语 · 印尼语女声 Sari' },
        { label: '顾客画像', value: '成分党 · 强比价 · 关注浓度与备案' },
        { label: '生效范围', value: '雅加达南区' },
      ],
      preview: [
        { label: '人格设定', items: ['关注成分与配方的美妆顾客', '会追问浓度、复配逻辑与备案信息'] },
        { label: '对话流程', items: ['1. 进店提出抗老需求', '2. 追问成分浓度与功效依据', '3. 对价格提出异议', '4. 要求对比竞品', '5. 决定是否试用'] },
        { label: '引用素材', items: ['黄金素材 2 条：双萃成分卖点、网上比价异议'] },
      ],
    },
    creatorId: 'usr_rt_nurul',
    creatorName: 'Nurul Huda',
    creatorRole: 'Regional Trainer',
    version: 1,
    status: 'pending',
    isRevision: false,
    submittedAt: at4h,
    approverIds: ['usr_am_yoga'],
    levelApprovers: [['usr_am_yoga']],
    currentLevel: 0,
    history: [
      { id: 'apr-seed-avatar-1-submit', action: 'submit', at: at4h, actorId: 'usr_rt_nurul', actorName: 'Nurul Huda', actorRole: '区域培训师（雅加达南区）', version: 1, note: '提交数字人顾客审批', approverIds: ['usr_am_yoga'] },
    ],
  };

  const notifications: AppNotification[] = [
    {
      id: 'ntf-seed-1',
      kind: 'result',
      category: 'approval',
      title: '审批被驳回：南区门店服务标准采集',
      body: 'Yoga Pratama 驳回：评分维度权重合计 100%，但「方案说明」缺少判定说明，请补充后再提交。可修改后重新提交，审批历史会保留。',
      createdAt: hoursAgo(now, 28),
      recipientId: 'usr_rtm_fitriani',
      recipientName: 'Fitriani',
      channels: ['inbox', 'app_push'],
      requestId: rejectedMedia.id,
      targetTab: 'approval_records',
    },
    {
      id: 'ntf-seed-2',
      kind: 'todo',
      category: 'approval',
      title: '新的待审批：双萃精华冬季主推话术（2026版）',
      body: 'Sarah Lee（总部培训师）提交了课件，范围：全国。本单共 2 级审批（市场部 → 总部），当前第 1 级。请查看后处理。',
      createdAt: at26h,
      readAt: undefined,
      recipientId: 'usr_am_maya',
      recipientName: 'Maya Kusuma',
      channels: ['inbox', 'app_push', 'whatsapp'],
      requestId: pendingCourse.id,
      targetTab: 'approval_inbox',
    },
    {
      id: 'ntf-seed-3',
      kind: 'todo',
      category: 'approval',
      title: '变更待审批：敏感肌换季护理指南（2026 修订版）',
      body: 'Sarah Lee（总部培训师）提交了课件变更版本，原版本继续生效。',
      createdAt: at5h,
      recipientId: 'usr_am_rani',
      recipientName: 'Rani Wijaya',
      channels: ['inbox', 'app_push', 'whatsapp'],
      requestId: revisionCourse.id,
      targetTab: 'approval_inbox',
    },
    {
      id: 'ntf-seed-4',
      kind: 'todo',
      category: 'approval',
      title: '新的待审批：南区新人陪练周挑战',
      body: 'Nurul Huda（区域培训师）提交了练习任务，范围：雅加达南区。',
      createdAt: at3h,
      recipientId: 'usr_am_yoga',
      recipientName: 'Yoga Pratama',
      channels: ['inbox', 'app_push', 'whatsapp'],
      requestId: pendingPractice.id,
      targetTab: 'approval_inbox',
    },
    {
      id: 'ntf-seed-s1',
      kind: 'todo',
      category: 'approval',
      title: '新的待审批：场景剧本：敏感肌换季安抚（南区版）',
      body: 'Nurul Huda（区域培训师）提交了场景剧本，范围：雅加达南区。',
      createdAt: at2h,
      recipientId: 'usr_am_yoga',
      recipientName: 'Yoga Pratama',
      channels: ['inbox', 'app_push', 'whatsapp'],
      requestId: pendingScript.id,
      targetTab: 'approval_inbox',
    },
    {
      id: 'ntf-seed-av1',
      kind: 'todo',
      category: 'approval',
      title: '新的待审批：数字人顾客：成分党深挖型顾客（南区版）',
      body: 'Nurul Huda（区域培训师）提交了数字人顾客，范围：雅加达南区。',
      createdAt: at4h,
      recipientId: 'usr_am_yoga',
      recipientName: 'Yoga Pratama',
      channels: ['inbox', 'app_push', 'whatsapp'],
      requestId: pendingAvatar.id,
      targetTab: 'approval_inbox',
    },
    {
      id: 'ntf-seed-5',
      kind: 'result',
      category: 'approval',
      title: '审批通过：新人入职必修课（2026版）',
      body: 'Rani Wijaya 已同意，学习任务已生效。',
      createdAt: at2d,
      readAt: at6h,
      recipientId: 'usr_ht_sarah',
      recipientName: 'Sarah Lee',
      channels: ['inbox', 'app_push'],
      requestId: approvedStudy.id,
    },
    {
      id: 'ntf-seed-6',
      kind: 'system',
      category: 'system',
      title: '审批功能已启用',
      body: '客户已开启审批功能：课件、学习任务、练习任务、考试等对象需审批后生效，可在「审批流程配置」里调整；题库保持原有轻量审核，不受影响。',
      createdAt: hoursAgo(now, 3 * 24),
      readAt: hoursAgo(now, 2 * 24),
      recipientId: 'usr_am_rani',
      recipientName: 'Rani Wijaya',
      channels: ['inbox'],
    },
  ];

  return {
    config,
    requests: [pendingAvatar, pendingScript, revisionCourse, pendingCourse, pendingPractice, rejectedMedia, approvedStudy, liveCourseV1],
    notifications,
    demoApproverId: 'usr_am_rani',
  };
}

/** 存档兼容性校验：结构不完整直接重置为演示数据 */
function isCompatible(saved: any): boolean {
  if (!saved || saved.schema !== SCHEMA) return false;
  if (!saved.state || typeof saved.state !== 'object') return false;
  const { config, requests, notifications } = saved.state;
  if (!config || typeof config.masterEnabled !== 'boolean' || !config.types) return false;
  if (!Array.isArray(requests) || !Array.isArray(notifications)) return false;
  for (const type of APPROVAL_TYPE_ORDER) {
    const flow = config.types[type];
    if (!flow || !Array.isArray(flow.national?.levels)) return false;
    for (const rule of Object.values(flow.regional ?? {}) as any[]) {
      if (!Array.isArray(rule?.levels)) return false;
    }
  }
  for (const request of requests) {
    if (!request || typeof request.id !== 'string' || typeof request.targetId !== 'string') return false;
    if (!APPROVAL_TYPE_ORDER.includes(request.type)) return false;
    if (!['pending', 'approved', 'rejected', 'withdrawn'].includes(request.status)) return false;
    if (!request.snapshot || typeof request.snapshot.title !== 'string') return false;
    if (!Array.isArray(request.history) || !Array.isArray(request.approverIds)) return false;
    if (!Array.isArray(request.levelApprovers) || !request.levelApprovers.every((ids: unknown) => Array.isArray(ids))) return false;
    if (typeof request.currentLevel !== 'number') return false;
  }
  for (const item of notifications) {
    if (!item || typeof item.id !== 'string' || typeof item.recipientId !== 'string') return false;
    if (!['todo', 'result', 'withdrawn', 'reminder', 'system'].includes(item.kind)) return false;
  }
  return true;
}

function initial(): ApprovalState {
  if (current) return current;
  try {
    const raw = safeStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isCompatible(parsed)) {
        current = parsed.state as ApprovalState;
        return current;
      }
      storageError = '本地审批存档不兼容，已重置为演示数据。';
    }
  } catch {
    storageError = '本地审批存档读取失败，已使用内存演示数据。';
  }
  current = createSeedApprovalState();
  persist(current);
  return current;
}

function persist(state: ApprovalState) {
  try {
    safeStorage.setItem(key, JSON.stringify({ schema: SCHEMA, state }));
  } catch {
    storageError = '本地审批存档写入失败，本次修改只在当前页面有效。';
  }
}

function emit() {
  listeners.forEach(listener => listener());
}

function commit(next: ApprovalState): ApprovalState {
  if (next !== current) {
    current = next;
    persist(next);
    emit();
  }
  return next;
}

export function getApprovalState(): ApprovalState {
  return initial();
}

export function subscribeApprovalState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useApprovalState(): ApprovalState {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => initial(),
    () => initial(),
  );
}

export function getApprovalStorageError(): string {
  initial();
  return storageError;
}

export function resolveApprovalFor(type: ApprovalObjectType, scope: ApprovalScope, regionId?: string): ResolvedApprovalRule {
  return resolveApprovalRule(initial().config, type, scope, regionId);
}

export function submitForApproval(input: SubmitApprovalInput): SubmitApprovalResult {
  const result = engineSubmitForApproval(initial(), input);
  if (result.mode !== 'direct') commit(result.state);
  return result;
}

export function submitRevision(requestId: string, actor: ApprovalActor, snapshot: ApprovalSnapshot): ApprovalMutationResult {
  const result = engineSubmitRevision(initial(), requestId, actor, snapshot);
  if (!result.error) commit(result.state);
  return result;
}

export function approveRequest(requestId: string, actor: ApprovalActor): ApprovalMutationResult {
  const result = engineApproveRequest(initial(), requestId, actor);
  if (!result.error) commit(result.state);
  return result;
}

export function rejectRequest(requestId: string, actor: ApprovalActor, reason: string): ApprovalMutationResult {
  const result = engineRejectRequest(initial(), requestId, actor, reason);
  if (!result.error) commit(result.state);
  return result;
}

export function withdrawRequest(requestId: string, actor: ApprovalActor): ApprovalMutationResult {
  const result = engineWithdrawRequest(initial(), requestId, actor);
  if (!result.error) commit(result.state);
  return result;
}

export function resubmitRequest(requestId: string, actor: ApprovalActor, note: string): ApprovalMutationResult {
  const result = engineResubmitRequest(initial(), requestId, actor, note);
  if (!result.error) commit(result.state);
  return result;
}

export function setApprovalMasterEnabled(enabled: boolean, actorName: string) {
  commit(setMasterEnabled(initial(), enabled, actorName));
}

export function setApprovalFlowRule(
  type: ApprovalObjectType,
  key: 'national' | string,
  patch: Partial<ApprovalFlowRule>,
  actorName: string,
) {
  commit(setFlowRule(initial(), type, key, patch, actorName));
}

export function clearRegionalApprovalRule(type: ApprovalObjectType, regionId: string, actorName: string) {
  commit(clearRegionalRule(initial(), type, regionId, actorName));
}

export function setApprovalDemoApprover(approverId: string) {
  commit(setDemoApprover(initial(), approverId));
}

export function markNotificationRead(id: string) {
  commit(engineMarkNotificationRead(initial(), id));
}

export function markAllNotificationsRead(recipientId: string) {
  commit(engineMarkAllNotificationsRead(initial(), recipientId));
}

export function markRequestApplied(id: string) {
  commit(engineMarkRequestApplied(initial(), id));
}

/** 启动时执行一次：提交满 24 小时未处理的单据发一次催办 */
export function runApprovalReminders() {
  const state = initial();
  const next = runReminders(state);
  if (next !== state) commit(next);
}
