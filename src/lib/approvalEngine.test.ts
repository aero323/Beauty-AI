import assert from 'node:assert/strict';
import test from 'node:test';
import {
  actorForApprover,
  approveRequest,
  createDefaultApprovalConfig,
  liveApprovedRequestForTarget,
  pendingForApprover,
  rejectRequest,
  resubmitRequest,
  resolveApprovalRule,
  runReminders,
  setFlowRule,
  submitForApproval,
  submitRevision,
  unreadCountFor,
  withdrawRequest,
} from './approvalEngine';
import type { ApprovalSnapshot, ApprovalState } from './approvalTypes';

const now = new Date('2026-10-08T10:00:00.000Z');
const hqApprover = actorForApprover('usr_am_rani');
const southApprover = actorForApprover('usr_am_yoga');
const creator = { id: 'usr_ht_sarah', name: 'Sarah Lee', role: 'HQ Trainer' as const, label: '总部培训师' };
const regionalCreator = { id: 'usr_rt_nurul', name: 'Nurul Huda', role: 'Regional Trainer' as const, label: '区域培训师（雅加达南区）' };

function baseState(): ApprovalState {
  return {
    config: createDefaultApprovalConfig(),
    requests: [],
    notifications: [],
    demoApproverId: 'usr_am_rani',
  };
}

function withNationalCourseRule(state: ApprovalState, approverIds = ['usr_am_rani']): ApprovalState {
  return setFlowRule(state, 'course', 'national', { enabled: true, approverIds }, 'test', now);
}

function nationalSnapshot(): ApprovalSnapshot {
  return {
    title: '双萃精华冬季主推话术',
    summary: '课程摘要',
    scope: '全国',
    fields: [{ label: '文件清单', value: '主课件 18 页' }],
  };
}

function regionalSnapshot(): ApprovalSnapshot {
  return {
    title: '南区新人陪练周挑战',
    summary: '练习摘要',
    scope: '区域',
    regionId: 'south',
    fields: [{ label: '分发对象', value: '雅加达南区所有门店 BA' }],
  };
}

test('配置解析：总开关、类型开关、区域回退与未配审批人', () => {
  const offMaster: ApprovalState = { ...withNationalCourseRule(baseState()), config: { ...createDefaultApprovalConfig(), masterEnabled: false } };
  assert.equal(resolveApprovalRule(offMaster.config, 'course', '全国').required, false);

  const nationalOnly = withNationalCourseRule(baseState());
  const national = resolveApprovalRule(nationalOnly.config, 'course', '全国');
  assert.equal(national.required, true);
  assert.deepEqual(national.approverIds, ['usr_am_rani']);

  // 区域未单独配置 → 沿用全国流程
  const fallback = resolveApprovalRule(nationalOnly.config, 'course', '区域', 'south');
  assert.equal(fallback.required, true);
  assert.equal(fallback.regionFallback, true);
  assert.equal(fallback.source, 'national');

  // 区域单独配置 → 使用区域审批人
  const regional = setFlowRule(nationalOnly, 'course', 'south', { enabled: true, approverIds: ['usr_am_yoga'] }, 'test', now);
  const resolved = resolveApprovalRule(regional.config, 'course', '区域', 'south');
  assert.equal(resolved.source, 'region');
  assert.deepEqual(resolved.approverIds, ['usr_am_yoga']);

  // 开启但没配审批人：需要审批但池子为空，提交会被阻止
  const missing = resolveApprovalRule(withNationalCourseRule(baseState(), []).config, 'course', '全国');
  assert.equal(missing.required, true);
  assert.deepEqual(missing.approverIds, []);
});

test('提交：生成待审批单据并通知审批人', () => {
  const state = withNationalCourseRule(baseState());
  const result = submitForApproval(state, { type: 'course', targetId: 'course-1', snapshot: nationalSnapshot(), creator }, now);
  assert.equal(result.mode, 'pending');
  const request = result.request!;
  assert.equal(request.status, 'pending');
  assert.deepEqual(request.approverIds, ['usr_am_rani']);
  assert.equal(request.version, 1);
  assert.equal(request.history.length, 1);
  assert.equal(unreadCountFor(result.state, 'usr_am_rani'), 1);
  assert.equal(pendingForApprover(result.state, 'usr_am_rani').length, 1);
  // 创建者不会收到自己的待办通知
  assert.equal(unreadCountFor(result.state, 'usr_ht_sarah'), 0);
});

test('提交：开启审批但未指定审批人时被阻止', () => {
  const state = withNationalCourseRule(baseState(), []);
  const result = submitForApproval(state, { type: 'course', targetId: 'course-1', snapshot: nationalSnapshot(), creator }, now);
  assert.equal(result.mode, 'blocked');
  assert.match(result.error ?? '', /还没有指定审批人/);
});

test('提交：未开启审批时直接生效（不产生单据）', () => {
  const result = submitForApproval(baseState(), { type: 'course', targetId: 'course-1', snapshot: nationalSnapshot(), creator }, now);
  assert.equal(result.mode, 'direct');
  assert.equal(result.state.requests.length, 0);
});

test('同意：任一审批人处理后生效并通知创建者，重复操作被拒绝', () => {
  const submitted = submitForApproval(withNationalCourseRule(baseState()), { type: 'course', targetId: 'course-1', snapshot: nationalSnapshot(), creator }, now).state;
  const approved = approveRequest(submitted, submitted.requests[0].id, hqApprover, now);
  assert.equal(approved.error, undefined);
  assert.equal(approved.request?.status, 'approved');
  assert.equal(approved.request?.decision?.byName, 'Rani Wijaya');
  assert.equal(unreadCountFor(approved.state, 'usr_ht_sarah'), 1);

  const second = approveRequest(approved.state, approved.request!.id, hqApprover, now);
  assert.match(second.error ?? '', /已被 Rani Wijaya 处理/);
  assert.equal(second.state.requests[0].status, 'approved');
});

test('驳回：理由必填，驳回后可同单据重提并保留历史', () => {
  const submitted = submitForApproval(withNationalCourseRule(baseState()), { type: 'course', targetId: 'course-1', snapshot: nationalSnapshot(), creator }, now).state;
  const requestId = submitted.requests[0].id;

  const emptyReason = rejectRequest(submitted, requestId, hqApprover, '   ', now);
  assert.match(emptyReason.error ?? '', /必须填写理由/);
  assert.equal(emptyReason.state.requests[0].status, 'pending');

  const rejected = rejectRequest(submitted, requestId, hqApprover, '缺少合规审查说明，请补充。', now);
  assert.equal(rejected.request?.status, 'rejected');
  assert.equal(rejected.request?.decision?.reason, '缺少合规审查说明，请补充。');

  const resubmitted = resubmitRequest(rejected.state, requestId, creator, '已补充合规审查说明', now);
  assert.equal(resubmitted.request?.status, 'pending');
  assert.equal(resubmitted.request?.version, 2);
  assert.equal(resubmitted.request?.history.length, 3);
  assert.equal(resubmitted.request?.decision, undefined);
});

test('撤回：仅提交人可撤回，撤回后通知已分配的审批人', () => {
  const submitted = submitForApproval(withNationalCourseRule(baseState()), { type: 'course', targetId: 'course-1', snapshot: nationalSnapshot(), creator }, now).state;
  const requestId = submitted.requests[0].id;

  const other = withdrawRequest(submitted, requestId, hqApprover, now);
  assert.match(other.error ?? '', /只有提交人/);

  const withdrawn = withdrawRequest(submitted, requestId, creator, now);
  assert.equal(withdrawn.request?.status, 'withdrawn');
  const approverMessages = withdrawn.state.notifications.filter(item => item.recipientId === 'usr_am_rani');
  assert.ok(approverMessages.some(item => item.kind === 'withdrawn'));
});

test('变更重审：新版本审批期间老版本继续生效', () => {
  let state = withNationalCourseRule(baseState());
  const first = submitForApproval(state, { type: 'course', targetId: 'course-1', snapshot: nationalSnapshot(), creator }, now);
  state = approveRequest(first.state, first.request!.id, hqApprover, now).state;
  assert.ok(liveApprovedRequestForTarget(state, 'course', 'course-1'));

  const revisionSnapshot: ApprovalSnapshot = {
    ...nationalSnapshot(),
    title: '双萃精华冬季主推话术（修订版）',
    changeSummary: ['新增 2 页话术'],
  };
  const revision = submitRevision(state, first.request!.id, creator, revisionSnapshot, now);
  assert.equal(revision.error, undefined);
  assert.equal(revision.request?.isRevision, true);
  assert.equal(revision.request?.version, 2);

  const live = liveApprovedRequestForTarget(revision.state, 'course', 'course-1');
  assert.equal(live?.version, 1, '新版本未通过前，生效版本应保持 v1');

  const approved = approveRequest(revision.state, revision.request!.id, hqApprover, now);
  assert.equal(liveApprovedRequestForTarget(approved.state, 'course', 'course-1')?.version, 2);
});

test('区域流程：区域审批人处理区域单据，未被指定的审批人不能操作', () => {
  let state = setFlowRule(baseState(), 'practice_task', 'south', { enabled: true, approverIds: ['usr_am_yoga'] }, 'test', now);
  const submitted = submitForApproval(state, { type: 'practice_task', targetId: 'task-1', snapshot: regionalSnapshot(), creator: regionalCreator }, now);
  assert.equal(submitted.mode, 'pending');
  state = submitted.state;

  const wrongApprover = approveRequest(state, submitted.request!.id, hqApprover, now);
  assert.match(wrongApprover.error ?? '', /不是这条流程指定的审批人/);

  const approved = approveRequest(state, submitted.request!.id, southApprover, now);
  assert.equal(approved.request?.status, 'approved');
});

test('催办：提交满 24 小时提醒一次，不自动通过', () => {
  const submittedAt = new Date(now.getTime() - 26 * 3600 * 1000);
  const submitted = submitForApproval(withNationalCourseRule(baseState()), { type: 'course', targetId: 'course-1', snapshot: nationalSnapshot(), creator }, submittedAt).state;
  const reminded = runReminders(submitted, now);
  assert.equal(reminded.requests[0].reminderSentAt, now.toISOString());
  assert.equal(reminded.requests[0].status, 'pending', '催办不改变单据状态，也不会自动通过');
  assert.ok(reminded.notifications.some(item => item.kind === 'reminder' && item.recipientId === 'usr_am_rani'));

  const again = runReminders(reminded, new Date(now.getTime() + 60 * 60 * 1000));
  assert.equal(again, reminded, '同一单据只催办一次');
});

test('已有在审单据时不重复排队', () => {
  const state = withNationalCourseRule(baseState());
  const first = submitForApproval(state, { type: 'course', targetId: 'course-1', snapshot: nationalSnapshot(), creator }, now);
  assert.equal(first.mode, 'pending');
  const second = submitForApproval(first.state, { type: 'course', targetId: 'course-1', snapshot: nationalSnapshot(), creator }, now);
  assert.equal(second.mode, 'blocked');
  assert.match(second.error ?? '', /已有审批在审/);
  assert.equal(second.state.requests.length, 1);
});

test('数字人顾客接入同一套配置与审批流程（全国 / 区域两档）', () => {
  let state = baseState();
  state = setFlowRule(state, 'digital_human', 'national', { enabled: true, approverIds: ['usr_am_rani'] }, 'test', now);
  state = setFlowRule(state, 'digital_human', 'south', { enabled: true, approverIds: ['usr_am_yoga'] }, 'test', now);

  // 区域单据走区域审批人；未单独配置的区域沿用全国流程
  const southRule = resolveApprovalRule(state.config, 'digital_human', '区域', 'south');
  assert.equal(southRule.source, 'region');
  assert.deepEqual(southRule.approverIds, ['usr_am_yoga']);
  const northRule = resolveApprovalRule(state.config, 'digital_human', '区域', 'north');
  assert.equal(northRule.source, 'national');
  assert.equal(northRule.regionFallback, true);
  assert.deepEqual(northRule.approverIds, ['usr_am_rani']);

  // 提交后进入待审批；通过前不生效，任一区域审批人同意即生效
  const snapshot: ApprovalSnapshot = {
    title: '数字人顾客：成分党深挖型顾客（南区版）',
    summary: '区域数字人顾客摘要',
    scope: '区域',
    regionId: 'south',
    fields: [{ label: '语种与音色', value: '印尼语 · 印尼语女声 Sari' }],
    preview: [{ label: '对话流程', items: ['1. 进店提出抗老需求', '2. 追问成分浓度与功效依据'] }],
  };
  const submitted = submitForApproval(state, { type: 'digital_human', targetId: 'avatar-1', snapshot, creator: regionalCreator }, now);
  assert.equal(submitted.mode, 'pending');
  assert.deepEqual(submitted.request?.approverIds, ['usr_am_yoga']);

  const approved = approveRequest(submitted.state, submitted.request!.id, southApprover, now);
  assert.equal(approved.request?.status, 'approved');
  assert.equal(approved.request?.type, 'digital_human');
});

test('场景剧本接入同一套配置与审批流程（题库与素材库不接审批）', () => {
  let state = baseState();
  state = setFlowRule(state, 'script', 'south', { enabled: true, approverIds: ['usr_am_yoga'] }, 'test', now);

  // 题库与素材库已从审批对象里移除，配置里不再存在对应流程
  assert.equal(Object.prototype.hasOwnProperty.call(state.config.types, 'question'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(state.config.types, 'material'), false);
  const scriptRule = resolveApprovalRule(state.config, 'script', '区域', 'south');
  assert.equal(scriptRule.source, 'region');
  assert.deepEqual(scriptRule.approverIds, ['usr_am_yoga']);

  const scriptSnapshot: ApprovalSnapshot = {
    title: '场景剧本：敏感肌换季安抚（南区版）',
    summary: '区域剧本摘要',
    scope: '区域',
    regionId: 'south',
    fields: [{ label: '剧本步骤', value: '4 个步骤' }],
  };
  const submitted = submitForApproval(state, { type: 'script', targetId: 'script-1', snapshot: scriptSnapshot, creator: regionalCreator }, now);
  assert.equal(submitted.mode, 'pending');
  const approved = approveRequest(submitted.state, submitted.request!.id, southApprover, now);
  assert.equal(approved.request?.status, 'approved');
  assert.equal(approved.request?.type, 'script');
});
