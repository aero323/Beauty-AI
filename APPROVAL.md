# 审批功能 · 研发说明（SalesBoost AI 原型）

> 一句话：培训师产出在上线前由「审批管理者」确认——客户可用**总开关**决定这个功能是否生效；审批管理者在「审批流程配置」里按**对象类型 × 范围**逐项开关并指定审批人；单级审批，**任一被指定的审批人同意即生效**。
>
> 本版为前端原型：无后端，状态存 `localStorage`；App 推送 / WhatsApp 只模拟渠道状态，不真实发送；身份用工作台里的 Demo 切换器模拟登录态。

---

## 0. 核心设计决策（先读这一节）

| 决策 | 结论 | 说明 / 原因 |
| --- | --- | --- |
| 审批结构 | **单级审批，任一审批人同意即生效** | 明确不做多人会签、两级审批、审批代理 |
| 配置粒度 | **对象类型 × 范围**（全国 / 区域） | 每类可分别开全国流程与区域流程；区域未单独配置时**自动沿用全国流程** |
| 覆盖对象 | 7 类：课件、学习任务、练习任务、考试、音视频采集任务、**数字人顾客**、场景剧本 | 数字人顾客与场景剧本是后加入的两类，与其它对象共用同一套代码 |
| 不覆盖 | 题库题目、黄金素材、金句库 | 题库保留「待审核 → 已入库」、素材库保留「确认进入黄金素材」的轻量人工确认；再叠审批太重，沿用各自原有口径 |
| 变更重审 | 已生效内容修改时新开变更版本，**老版本在审批期间继续生效**；通过后替换、驳回不影响老版本 | 由 `liveApprovedRequestForTarget` 取版本最高的 approved 单据实现 |
| 审批中改内容 | 原型：同一对象已有在审单据时**再次提交被阻止**（提示先撤回或等结果），编辑入口不做硬锁 | 生产需服务端锁定在审版本，见 §14 |
| 版本号 | 数据层保留 `version` 与完整历史；**界面不展示 v1/v2 徽标** | 版本号用于状态机、重提与留痕，不作为展示信息 |
| 通知 | 站内信为主入口，渠道 = 站内信 + 通知设置里已启用的 App 推送 / WhatsApp（仅状态模拟） | 提交→审批人；同意/驳回→创建者；撤回→已收到待办的审批人；满 24h→催办一次；不自动通过、不升级 |
| 自审 | 原型允许（角色单选，创建者与审批者天然互斥） | **生产必须禁止同一账号自审**，见 §14 |

---

## 1. 文件清单

### 新增

| 文件 | 职责 |
| --- | --- |
| `src/lib/approvalTypes.ts` | 审批对象类型、区域口径、审批人演示账号、类型元数据（label / producers / targetTab）、单据与通知类型定义 |
| `src/lib/approvalEngine.ts` | **纯函数规则引擎**：配置解析、状态机（提交 / 同意 / 驳回 / 撤回 / 重提 / 变更重审）、催办、通知与派生选择器。不依赖 React 与 localStorage，可单测 |
| `src/lib/approvalStore.ts` | localStorage 持久化（键 `salesboost.approval.v1`，`SCHEMA = 12`）+ `useSyncExternalStore` 订阅 + 对外动作 API + 演示种子数据 |
| `src/lib/approvalEngine.test.ts` | 13 例单测，`npm run test:approval` |
| `src/lib/courseApprovalPreview.ts` | 课件预览构造器：`buildCourseApprovalPreview`（课件目录 4 条，各带二级详情）、`buildCourseDetail`（学习任务里"包含课件"用的课件二级详情）、`buildCourseHomeworkDetail`（附加题题干与答案）、`buildCourseVideoDetail`。提交端与演示数据**同源** |
| `src/lib/devNotes.tsx` | 「研发标注」总开关 Context（localStorage 键 `salesboost.dev-notes`，默认开启） |
| `src/components/DevNote.tsx` | 右上角「注」徽标 + hover/键盘聚焦气泡；开关关闭时整体不渲染 |
| `src/components/approval/ApprovalDetailDialog.tsx` | 宽版两栏审批详情弹窗（左：审批信息 + 流转时间线 + 动作；右：内容预览），含二级预览弹窗 |
| `src/components/approval/ApprovalStatusBadge.tsx` | 单据状态徽标（待审批 / 已生效 / 已驳回 / 已撤回 / 已被 XXX 处理） |
| `src/components/approval/ApproverIdentityBar.tsx` | 审批管理者工作台的 Demo 身份切换条 |
| `src/pages/ApprovalCenter.tsx` | 审批中心：数字卡（待办 / 今日已处理 / 平均处理时长 / 累计驳回）+ 三张快捷入口 + 最近动态 + 研发标注 |
| `src/pages/ApprovalInbox.tsx` | 待我审批：按类型 / 范围 / 提交时间筛选，点开详情处理 |
| `src/pages/ApprovalFlowConfig.tsx` | 审批流程配置：类型卡（全国流程 + 区域流程两档）、审批人多选、区域回退标注、只读态 |
| `src/pages/ApprovalRecords.tsx` | 审批记录：全部单据留痕（含已通过 / 已驳回 / 已撤回）、筛选、时间线、CSV 导出 |
| `src/pages/MessageCenter.tsx` | 全局消息中心（全部角色）：审批待办 / 审批结果 / 系统通知分类、全部已读、点审批消息直达详情 |
| `src/pages/MyApprovals.tsx` | **我的审批流转**（创建者独立页）：状态卡筛选 + 类型筛选 + 查看详情 / 撤回 / 重提 |
| `src/pages/SystemSettings.tsx` | Super Admin 系统设置：审批功能总开关 + 说明 |
| `qa/approval-*.png` | 交付截图，见 §13 |

### 修改

| 文件 | 改动 |
| --- | --- |
| `src/App.tsx` | 挂载审批相关页面路由；启动时执行一次 `runApprovalReminders()`；给业务页传 `userRole` |
| `src/components/Layout.tsx` | 新增 `Approval Manager` 角色导航（审批中心 / 待我审批 / 审批流程配置 / 审批记录）；顶栏铃铛进入消息中心（红点=未读数）；有效 tab 校验**放行隐藏路由 `message_center`**；顶栏「研发标注」开关 |
| `src/types.ts` | `Role` 增加 `'Approval Manager'` |
| `src/lib/i18n.tsx` | 审批导航与关键状态词的中 / 英 / 印尼语词条 |
| `src/index.css` | `html[data-dev-notes='off'] .bg-blue-950` 规则：总开关关闭时隐藏存量零散「注」徽标 |
| 提交端业务页 | `CourseCreation`、`CourseManagement`、`RTCourseManagement`（课件）、`StudyTaskManage`、`PracticeTaskManage`、`MediaCollectionTaskManage`、`ExamManage`、`BAScripts`、`RTBAScripts`、`BAAvatars`（数字人顾客） |
| 退出审批 | `ExamBank`（题库恢复直接入库）、`MaterialLibrary`（素材恢复精选直接入库） |
| 文档 | `README.md`、`CHANGELOG.md`、`PRODUCT_NOTES.md` 同步口径 |

---

## 2. 角色、路由与身份

- **角色**：`Role` 增加 `'Approval Manager'`。角色切换器、顶栏姓名 / 部门、账号管理角色选项三处同步。
- **审批管理者导航**（`Layout.getNavItems`）：审批中心（默认落地）、待我审批、审批流程配置、审批记录。
- **创建者导航**：总部培训师 / 区域培训师主管 / 区域培训师新增「我的审批流转」（`my_approvals`）。业务模块**不再内嵌审批流转分区**（避免把原列表挤到首屏之外），只保留提交后的轻量提示，引导到该页。
- **隐藏路由**：`message_center` 不占导航、全角色可进；`Layout` 的有效 tab 校验里显式放行，其余非法 tab 回落到该角色导航的第一项。
- **Demo 身份**：审批人账号在 `APPROVER_ACCOUNTS`（总部 Rani Wijaya、南区 Yoga Pratama）。`currentActorForRole(role, state)` 把当前角色映射为账号；审批管理者角色额外读 `state.demoApproverId` 演示总部 / 区域分流。生产环境这三个映射全部由登录态替换。

---

## 3. 审批对象与配置模型

### 3.1 对象类型

`APPROVAL_TYPE_ORDER`（顺序 = 配置页展示顺序）：

```ts
['course', 'study_task', 'practice_task', 'exam', 'media_task', 'digital_human', 'script']
```

`APPROVAL_TYPE_META` 为每类提供 `label`（展示名）、`short`（短名）、`producers`（创建角色说明）、`targetTab`（通过后进入的模块），配置页、筛选下拉、审批详情都从这里取文案。

### 3.2 配置结构

```ts
ApprovalConfig = {
  masterEnabled: boolean;            // 客户总开关（Super Admin）
  types: Record<ApprovalObjectType, {
    national: { enabled, approverIds };          // 全国流程
    regional: Record<regionId, { enabled, approverIds }>; // 区域流程，缺失=沿用全国
    updatedAt?, updatedBy?;
  }>
}
```

- 区域口径与培训巡检一致：雅加达南区 / 北区 / 巴厘岛区 / 泗水区（`APPROVAL_REGIONS`）。
- **审批人候选**只能是拥有「审批管理者」角色的账号（`APPROVER_ACCOUNTS`），可多选。
- **开启审批但未配审批人**：提交被阻止并提示先补齐配置（不做默认放行）。

### 3.3 解析规则（`resolveApprovalRule`）

按 `总开关 → 类型 → 范围` 依次判定，返回：

```ts
{ required, approverIds, source: 'master_off' | 'type_off' | 'national' | 'region', regionFallback }
```

- 总开关关 → `direct`（直接生效）。
- 类型 / 区域规则未开启 → `direct`。
- 区域单据有本区域规则 → 用区域审批人（`source: 'region'`）。
- 区域单据无本区域规则 → 沿用全国（`regionFallback: true`，配置页显式标注「当前沿用全国流程」）。

---

## 4. 数据模型（`src/lib/approvalTypes.ts`）

### 4.1 单据 `ApprovalRequest`

| 字段 | 说明 |
| --- | --- |
| `id` / `type` / `targetId` | 单据 id；对象类型；业务对象 id（重提、变更都指向同一个 target） |
| `snapshot` | 提交瞬间的**内容快照**（`ApprovalSnapshot`）：标题 / 摘要 / 范围 / 区域 / 字段列表 / 内容预览 / 变更点 |
| `creatorId` / `creatorName` / `creatorRole` | 提交人（用于「我的审批流转」、通知与权限判断） |
| `version` | 版本号，从 1 开始；重提与变更 +1 |
| `status` | `pending` / `approved` / `rejected` / `withdrawn` |
| `isRevision` / `supersedesRequestId` | 是否变更重审；被替代的已生效单据 id |
| `submittedAt` / `resolvedAt` | 提交时间 / 处理时间 |
| `approverIds` | 本次流程解析出的审批人（提交时固化，之后改配置不影响在途单据） |
| `decision` | `{ outcome, byId, byName, at, reason? }` 最终决定 |
| `history[]` | 流转时间线：`submit / approve / reject / withdraw / resubmit`，每条带动作人、时间、版本、备注、审批人快照 |
| `appliedAt` | 业务页把"已通过"落到本地状态后回写的标记（幂等，见 §7） |

### 4.2 内容预览 `ApprovalSnapshot.preview`

```ts
ApprovalPreviewSection = { label: string; items: ApprovalPreviewItem[] }
ApprovalPreviewItem   = string | { text: string; detail?: ApprovalPreviewDetail }
ApprovalPreviewDetail = { title: string; description?: string; groups: { title: string; lines: string[] }[] }
```

条目带 `detail` 时，右侧预览里渲染「查看详情」→ 打开二级 `Dialog`（课件逐页、附加题题干与答案、学习任务里每门"包含课件"等）。**不用绝对定位浮层**：浮层会随内层滚动顶出可视区，因此用独立 Dialog（并在 `DialogContent` 上 `initialFocus` 指向标题，避免焦点落到底部按钮）。

### 4.3 通知 `AppNotification`

`{ kind: 'todo' | 'result' | 'withdrawn' | 'reminder' | 'system', category: 'approval' | 'system', recipientId/Name, channels: ('inbox'|'app_push'|'whatsapp')[], requestId?, targetTab?, readAt? }`

---

## 5. 规则引擎（`src/lib/approvalEngine.ts`，纯函数）

所有状态迁移都在这里完成，输入 `ApprovalState` 返回新 `ApprovalState`，不触碰 localStorage / React。

| 函数 | 行为 |
| --- | --- |
| `resolveApprovalRule` | §3.3 的解析规则 |
| `submitForApproval` | 三态返回 `direct`（直接生效）/ `pending`（生成单据 + 通知审批人）/ `blocked`（未配审批人或同对象已有在审单据，`error` 给出原因）。重复排队拦截靠 `pendingRequestForTarget` |
| `approveRequest` | 任一被指定审批人可同意；已处理过的单据再点 → 返回 `已被 XXX 处理`，**不产生二次决定**（幂等 / 并发保护）；同意后通知创建者 |
| `rejectRequest` | 理由必填 1–200 字；驳回后通知创建者，单据保留 |
| `withdrawRequest` | 仅创建人可撤回；撤回后通知**已收到待办**的审批人 |
| `resubmitRequest` | 驳回 / 撤回后同单据重提：`version + 1`，历史保留（`resubmit` 事件） |
| `submitRevision` | 已生效内容提交修改：新开变更版本（`isRevision`、`supersedesRequestId`），老版本保持 approved 继续生效 |
| `setMasterEnabled` / `setFlowRule` / `clearRegionalRule` | 总开关与流程配置写入，附带 `updatedAt / updatedBy` |
| `runReminders` | 提交满 24 小时且未处理 → 向审批人发**一次** `reminder` 通知；不自动通过、不升级 |
| `markNotificationRead` / `markAllNotificationsRead` | 消息已读 |
| `markRequestApplied` | 业务页应用通过结果后回写 `appliedAt`（幂等标记） |
| 派生选择器 | `pendingForApprover` / `handledByApprover` / `approvalStatsFor`（数字卡）/ `requestsForCreator` / `liveApprovedRequestForTarget`（取版本最高的 approved）/ `latestRequestForTarget` / `pendingRequestForTarget` / `unreadCountFor` / `notificationsFor` |
| 工具 | `typeLabel` / `scopeText` / `statusLabel` / `statusToneClass` / `formatDateTime` / `formatRelative` / `hoursWaiting` |

### 状态机

```
草稿 ──提交──▶ 待审批 ──任一审批人同意──▶ 已生效
                 │  └── 驳回（必填理由）──▶ 已驳回 ──修改后重提（version+1）──┐
                 └── 创建者撤回 ──▶ 已撤回 ──重新提交（version+1）──────────┘
已生效 ──编辑提交变更──▶ 变更待审批（老版本继续生效）──通过──▶ 替换为新版本
                                                └──驳回──▶ 丢弃新版本，老版本不受影响
```

---

## 6. 存储（`src/lib/approvalStore.ts`）

- **键**：`salesboost.approval.v1`（经 `safeStorage`，受限环境自动降级内存）。
- **Schema**：`SCHEMA = 12`。存档结构不完整（schema 不符 / 配置缺类型 / 单据字段非法 / 通知非法）**整份重置为演示数据**，坏记录不让页面白屏。
- **演示数据与运行数据分离**：`createSeedApprovalState()` 生成；`commit()` 每次变更写库并通知订阅者；页面用 `useApprovalState()`（`useSyncExternalStore`）订阅。
- **演示种子**：2 个审批人账号；待审：课件（全国，26h 前提交——打开应用时由 `runApprovalReminders()` 触发一次催办）、课件变更（老版本继续生效）、练习任务（南区）、场景剧本（南区）、数字人顾客（南区）；已通过：学习任务 1 条、课件老版本 1 条；已驳回：采集任务 1 条；通知若干（含已读 / 未读、多渠道）。
- **对外 API**（业务页只 import 这些）：`getApprovalState` / `subscribeApprovalState` / `useApprovalState` / `resolveApprovalFor` / `submitForApproval` / `submitRevision` / `approveRequest` / `rejectRequest` / `withdrawRequest` / `resubmitRequest` / `setApprovalMasterEnabled` / `setApprovalFlowRule` / `clearRegionalApprovalRule` / `setApprovalDemoApprover` / `markNotificationRead` / `markAllNotificationsRead` / `markRequestApplied` / `runApprovalReminders` / `getApprovalStorageError`。
- `App.tsx` 启动时执行一次 `runApprovalReminders()`（24h 催办的触发点）。

---

## 7. 业务页接入（提交端）

| 页面 | type | 触发动作 | 范围判定 | 通过后效果 |
| --- | --- | --- | --- | --- |
| `CourseCreation`（发布）/ `CourseManagement` / `RTCourseManagement`（编辑提交） | `course` | 确认发布 / 提交修改 | 总部=全国，区域=本区域 | 课件可上架、可被学习任务引用 |
| `StudyTaskManage` | `study_task` | 发布任务 | 同上 | 按原逻辑下发目标人群 |
| `PracticeTaskManage` | `practice_task` | 发布任务 | 同上 | 下发 |
| `MediaCollectionTaskManage` | `media_task` | 发布任务 | 同上 | 下发 |
| `ExamManage` | `exam` | 发布考试 | 总部=全国 | 生成考试任务 |
| `BAScripts` / `RTBAScripts` | `script` | 保存剧本 | 总部=全国，区域=南区 | 剧本「待生效 → 已生效」 |
| `BAAvatars` | `digital_human` | 保存配置 | 总部=全国，区域=南区 | 数字人顾客「待生效 → 已生效」 |

**统一接入模式**（照抄 `BAAvatars.handleSave` / `BAScripts.handleSave` 即可）：

```ts
const result = submitForApproval({ type, targetId, creator: approvalActor, snapshot });

if (result.mode === 'blocked') { showFeedback(result.error ?? '…', 'warning'); return; }
if (result.mode === 'pending') {
  const names = (result.request?.approverIds ?? []).map(id => actorForApprover(id).name).join('、');
  showFeedback(`已提交审批，等待 ${names || '审批人'} 处理；通过前保持待生效，可到「我的审批流转」查看进度或撤回。`, 'warning');
  return;
}
applyLocally(true);   // direct：未开启审批，直接生效
```

**通过结果回落到业务页**（每个提交端都要有，参照脚本页 / 数字人页）：

```ts
React.useEffect(() => {
  const approved = approvalState.requests.filter(item =>
    item.type === 'xxx' && item.status === 'approved' && !item.appliedAt && item.creatorId === approvalActor.id);
  approved.forEach(item => { applyLocally(item.targetId); markRequestApplied(item.id); });
}, [approvalState, approvalActor.id]);
```

- `appliedAt` 保证幂等：同一条通过单据只落一次，不会每次进页面都重放。
- 提交端 `snapshot.preview` 尽量带结构化预览（课件目录 / 学习内容 / 剧本步骤 / 人格设定与对话流程…），审批人才能"看得见再批"。课件类预览统一走 `src/lib/courseApprovalPreview.ts`。

**范围判定**：`creatorContextForRole(role)` —— 区域培训师主管 / 区域培训师 → `{ scope: '区域', regionId: 'south' }`，总部培训师 → `{ scope: '全国' }`。

**为什么题库 / 素材库不接**：两处已有轻量人工确认（题库「审核入库」、素材库「确认进入黄金素材」），再叠一层审批会变成"每个题都要批"，评审明确去掉。题库的 `question` 与素材的 `material` 不再出现在 `APPROVAL_TYPE_ORDER` / 配置页 / 演示单据里。

---

## 8. 审批人端页面

- **审批中心**（`ApprovalCenter`）：待我审批 / 今日已处理 / 平均处理时长 / 累计驳回四张数字卡 + 三张快捷入口（待我审批、审批流程配置、审批记录）+ 最近动态。数字都来自 `approvalStatsFor`，与目标页同源。
- **待我审批**（`ApprovalInbox`）：只列 `pendingForApprover` 的单据；按类型 / 范围 / 提交时间筛选；点「查看详情」开 `ApprovalDetailDialog` 直接处理。
- **审批流程配置**（`ApprovalFlowConfig`）：每类一张卡（全国 + 四个区域分组），开关 + `ApproverPicker` 多选审批人；区域卡标注「当前沿用全国流程（全国审批人）/（全国未开启，区域也不审批）」；总开关关闭时整页只读并提示「由系统管理员控制」。
- **审批记录**（`ApprovalRecords`）：全部单据（跨审批人、含已撤回）；关键词 / 类型 / 状态筛选；时间线弹窗；导出 CSV（界面不含版本列）。
- **系统设置**（`SystemSettings`，仅 Super Admin）：审批功能总开关 + 边界说明（关闭后新提交直接生效，已在审单据继续走完）。

## 9. 创建者端页面（我的审批流转）

- 五张状态卡：待审批 / 变更待审批 / 已驳回 / 已生效 / 已撤回，点击即筛选；另有类型筛选。
- 行内动作：查看详情、撤回（仅待审批）、被驳回后重提。
- 详情弹窗里，提交人看自己的单据**不再重复显示「提交人」**，只显示提交时间；审批人视角仍显示提交人。
- 详情右侧是内容预览与本次变更点；课件目录、附加题、学习任务"包含课件"等条目可点「查看详情」看二级内容。

---

## 10. 全局消息中心与通知触发

| 事件 | 收件人 | kind | 说明 |
| --- | --- | --- | --- |
| 提交审批 | 单据审批人 | `todo` | 标题「新的待审批：…」/「变更待审批：…」 |
| 同意 | 创建者 | `result` | 「审批通过：…」 |
| 驳回 | 创建者 | `result` | 带驳回理由 |
| 撤回 | 已收到待办的审批人 | `withdrawn` | 待办从列表消失 |
| 满 24h 未处理 | 审批人 | `reminder` | 仅一次，不自动通过 |
| 总开关启用 | 审批管理者 | `system` | 说明已开启的对象范围 |

- 顶栏铃铛红点 = 当前账号未读消息数（`unreadCountFor`）；点击进入 `message_center`（**全角色放行的隐藏路由**）。
- 消息中心分「审批待办 / 审批结果 / 系统通知」；支持全部已读；每条消息带渠道标记（站内信 / App 推送 / WhatsApp，原型仅状态）；审批类消息点击直达 `ApprovalDetailDialog`。
- 渠道口径：原型里「通知设置」已启用的外部渠道（`EXTERNAL_CHANNELS = ['app_push', 'whatsapp']`）在消息上打标；生产接真实推送时替换 `notify()` 的落库实现。

---

## 11. 研发标注总开关（DevNote）

- 顶栏「研发标注」开关写入 `localStorage: salesboost.dev-notes`，默认开启；关闭时：
  1. `<DevNote>` 组件不渲染（React 层）；
  2. 存量零散「注」徽标由 `src/index.css` 的 `html[data-dev-notes='off'] .bg-blue-950` 规则统一隐藏（CSS 层）。
- 给新模块加注：在**外层 `relative` 容器**里放 `<DevNote className tipClassName>备注内容</DevNote>`；如果外层是 `overflow-hidden` 的 Card，把 DevNote 放到再外一层的 `relative` 包装上，避免徽标和气泡被裁掉。
- 审批中心五个模块（身份条 / 数字卡 / 快捷入口 / 待我处理 / 最近动态）都带研发标注：数据来源与算法、先到先得与幂等、通知流水 vs 单据流水、Demo 身份与生产登录态的差别。

---

## 12. 如何新增一个审批对象（How-to）

1. **类型**：`approvalTypes.ts` 的 `ApprovalObjectType` 加联合类型、`APPROVAL_TYPE_ORDER` 加位置、`APPROVAL_TYPE_META` 加 `label / short / producers / targetTab`。配置页、筛选下拉、详情文案全部自动出现。
2. **默认流程**：`approvalStore.createDefaultApprovalConfig` 由 ORDER 自动生成空流程；如果演示需要默认开启，在 `buildConfig()` 里补 `types.xxx = { national, regional }`，并按需加演示单据 / 通知。
3. **业务页接入**：照 §7 的模式加 `submitForApproval` 三分支 + 通过结果 `useEffect`（`markRequestApplied`）。页面从 `App.tsx` 接收 `userRole`，用 `currentActorForRole` / `creatorContextForRole` 得到提交人与范围。
4. **预览**：给 `snapshot.preview` 填结构化内容；课件类复用 `courseApprovalPreview.ts`。
5. **i18n**：新导航 / 新关键状态词补 `src/lib/i18n.tsx` 中 / 英 / 印尼语词条（三个字典都在同一文件）。
6. **测试**：`approvalEngine.test.ts` 加一条"新类型走同一套配置与流程"用例；跑 `npm run lint && npm run test:approval && npm run test:inspection && npm run build`。

---

## 13. 测试与验收

### 单测（`npm run test:approval`，13 例）

配置解析（总开关 / 类型开关 / 区域回退 / 未配审批人）· 提交生成待审批并通知 · 未配审批人阻止 · 未开启审批直接生效 · 同意与重复操作拒绝 · 驳回理由必填与同单据重提 · 撤回权限与通知 · 变更重审期间老版本继续生效 · 区域审批人权限 · 24h 催办只发一次 · 已有在审单据不重复排队 · **数字人顾客接入同一套流程** · 场景剧本接入同一套流程（断言题库 / 素材库流程不存在）。

### 静态检查

`npm run lint`（tsc --noEmit）· `npm run build`。

### 手工验收路径

1. 超管关总开关 → 发布不审批；开总开关、只启课件 / 练习 → 提交后列表显示待审批且学员端不可见。
2. 切审批管理者 → 铃铛红点 → 站内信点开 → 同意 → 生效并通知创建者。
3. 驳回 → 改后重提 → 再审通过；撤回 → 重新提交。
4. 编辑已生效内容 → 老版本仍可用 → 通过后替换。
5. 区域内容走区域审批人；未配区域自动回退全国。
6. 数字人顾客：保存配置 → 待审批 → 详情看人格设定 / 对话流程 → 同意 → 已生效。
7. 24h 催办只发一次（用时间注入模拟，见单测）。
8. 顶栏「研发标注」开关：关闭后全站「注」徽标消失（含存量零散徽标）。

### QA 截图（`qa/`）

`approval-center.png`、`approval-inbox.png`、`approval-flow-config.png`、`approval-flow-config-digital-human.png`、`approval-records.png`、`approval-message-center.png`、`approval-my-approvals.png`、`approval-my-approvals-detail.png`、`approval-my-approvals-course-detail.png`、`approval-detail-preview.png`、`approval-detail-revision.png`、`approval-preview-course-detail.png`、`approval-preview-homework-detail.png`、`approval-creator-list.png`、`approval-script-module.png`、`approval-system-settings.png`、`approval-home-dev-notes.png`、`approval-home-dev-notes-off.png`、`approval-digital-human-submit.png`、`approval-digital-human-detail.png`、`material-library-no-approval.png`。

---

## 14. 已知边界与生产接入 TODO

1. **禁止自审**：生产必须在服务端校验「创建人 ≠ 审批人」；原型因角色单选天然互斥，未做硬拦截。
2. **服务端状态机**：单据与状态迁移落库，前端只做展示与提交；同意 / 驳回接口要幂等（重复点击返回「已被 XXX 处理」）。
3. **在审锁定**：审批中不允许直接改内容——生产需要在服务端锁版本，前端仅靠"重复排队拦截 + 撤回后修改"是不够的。
4. **真实差异对比**：变更重审的"新增页 / 替换页"目前用结构化文本模拟，生产按文件版本做逐项 diff。
5. **真实消息服务**：站内信 / App 推送 / WhatsApp 接真实通道，保证通知幂等，站内信要能深链回审批详情。
6. **组织与账号**：审批人来自账号与权限系统（角色 = 审批管理者 + 组织范围）；账号 / 组织停用后要能重新指派在途单据的处理人。
7. **内容渲染器**：审批详情右栏的预览目前渲染结构化数据（PPT 逐页 / 视频播放器 / 题目组件为模拟），生产替换为真实内容渲染器。
8. **不做的事**（明确边界）：多人会签、两级审批、审批代理 / 换人、自动通过、审批升级、与题库 / 素材库既有审核合并。
