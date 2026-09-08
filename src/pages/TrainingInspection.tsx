import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  Filter,
  LockKeyhole,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import type { Role } from "../types";
import {
  actOnIssue,
  addDays,
  canEditTask,
  canSeeRegion,
  inspectionDay,
  isOpen,
  median,
  recordCompletion,
  regionLoads,
  runInspection,
  taskLoad,
  taskPeriods,
  updateTask,
  weekStart,
} from "../lib/inspectionEngine";
import {
  getInspectionStorageError,
  setInspectionState,
  useInspectionState,
} from "../lib/inspectionStore";
import type {
  InspectionActor,
  InspectionIssue,
  InspectionState,
  InspectionTask,
} from "../lib/inspectionTypes";
import "./TrainingInspection.css";

const kinds = { study: "学习", practice: "练习", exam: "考试", media: "采集" };
const tabs = [
  { id: "overview", label: "全国巡检", icon: Activity },
  { id: "plans", label: "区域计划", icon: ClipboardCheck },
  { id: "issues", label: "整改跟踪", icon: CheckCheck },
  { id: "brief", label: "管理简报", icon: FileText },
] as const;
type Tab = (typeof tabs)[number]["id"];
const formatTime = (date: string) =>
  new Date(date).toLocaleString("zh-CN", {
    timeZone: "Asia/Jakarta",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
const round = (n: number) => Math.round(n);
function Tag({
  children,
  tone = "",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`inspection-tag ${tone}`}>{children}</span>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="inspection-empty">
      <ShieldCheck size={26} />
      <p>{children}</p>
    </div>
  );
}

export function TrainingInspection({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate: (tab: string) => void;
}) {
  const state = useInspectionState();
  const today = inspectionDay(),
    currentWeek = weekStart(today);
  const actor: InspectionActor = useMemo(
    () => ({
      id:
        role === "HQ Trainer" || role === "Super Admin" ? "sarah" : "fitriani",
      name:
        role === "HQ Trainer" || role === "Super Admin"
          ? "Sarah Lee"
          : "Fitriani",
      hq: role === "HQ Trainer" || role === "Super Admin",
      regionId: role.startsWith("Regional") ? "south" : undefined,
      readOnly: role === "Regional Manager",
    }),
    [role],
  );
  const [tab, setTab] = useState<Tab>("overview");
  const [week, setWeek] = useState(currentWeek);
  const [regionId, setRegionId] = useState(actor.hq ? "all" : "south");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<InspectionTask | null>(null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("open");
  const [level, setLevel] = useState("all");
  const [owner, setOwner] = useState("all");
  const [briefMode, setBriefMode] = useState<"day" | "week">("day");
  const [scanBusy, setScanBusy] = useState(false);
  useEffect(() => {
    setRegionId(actor.hq ? "all" : "south");
    setSelectedIssue(null);
    setEditTask(null);
    setPolicyOpen(false);
    setNotificationsOpen(false);
    setSourceOpen(false);
  }, [actor]);
  useEffect(() => {
    setInspectionState((s) => runInspection(s, new Date(), [week]));
  }, [week]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timer);
  }, [message]);
  const regions = state.regions.filter((r) => canSeeRegion(actor, r.id));
  const scopedRegions = regions.filter(
    (r) => regionId === "all" || r.id === regionId,
  );
  const loads = regionLoads(state, week).filter((r) =>
    scopedRegions.some((region) => region.id === r.regionId),
  );
  const allIssues = state.issues.filter((i) =>
    scopedRegions.some((r) => r.id === i.regionId),
  );
  const weekIssues = allIssues.filter((i) => i.period === week);
  const openIssues = weekIssues.filter((i) => isOpen(i.status));
  const escalations = openIssues.filter(
    (i) =>
      i.escalated || i.ownerId === "sarah" || i.exception?.status === "pending",
  );
  const visibleIssues = weekIssues.filter(
    (i) =>
      (status === "all" ||
        (status === "open" ? isOpen(i.status) : i.status === status)) &&
      (level === "all" || i.level === level) &&
      (owner === "all" || i.ownerId === owner) &&
      `${i.title} ${i.id} ${i.ownerName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const notificationItems = state.notifications.filter(
    (n) => actor.hq || n.ownerId === actor.id,
  );
  const unread = notificationItems.filter((n) => !n.read).length;
  const tasks = state.tasks.filter(
    (t) =>
      t.origin === "demo" &&
      (t.scope === "hq" || scopedRegions.some((r) => r.id === t.regionId)) &&
      t.startsOn <= addDays(week, 6) &&
      t.endsOn >= week &&
      (t.participantIds === null ||
        t.participantIds.some((id) =>
          state.people.some(
            (p) =>
              p.id === id &&
              p.active &&
              scopedRegions.some((r) => r.id === p.regionId),
          ),
        )),
  );
  const issue = state.issues.find(
    (i) => i.id === selectedIssue && canSeeRegion(actor, i.regionId),
  );
  const affected = new Set(openIssues.flatMap((i) => i.personIds)).size;
  const allPeople = loads.flatMap((l) => l.people);
  const mean = allPeople.length
    ? round(allPeople.reduce((sum, p) => sum + p.planned, 0) / allPeople.length)
    : 0;
  function scan() {
    setScanBusy(true);
    window.setTimeout(() => {
      setInspectionState((s) => runInspection(s));
      setScanBusy(false);
      setMessage("巡检完成，证据与整改状态已更新。");
    }, 350);
  }
  function showIssue(id: string) {
    setSelectedIssue(id);
  }
  function showRegion(id: string) {
    setRegionId(id);
    setTab("plans");
  }
  const regionName = (id: string) =>
    state.regions.find((r) => r.id === id)?.name ?? id;
  function exportBrief() {
    const report = briefText();
    const url = URL.createObjectURL(
      new Blob([report], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `培训管理简报-${today}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("管理简报已导出。");
  }
  const briefStart = briefMode === "day" ? today : week;
  const briefEnd = briefMode === "day" ? today : addDays(week, 6);
  const inBrief = (date?: string) =>
    !!date &&
    inspectionDay(new Date(date)) >= briefStart &&
    inspectionDay(new Date(date)) <= briefEnd;
  const newIssues = allIssues.filter((i) => inBrief(i.detectedAt));
  const resolved = allIssues.filter(
    (i) => i.status === "已解决" && inBrief(i.resolvedAt),
  );
  const overdue = allIssues.filter((i) => i.escalated);
  const briefIssues = [
    ...new Map(
      [...newIssues, ...resolved, ...overdue].map((i) => [i.id, i]),
    ).values(),
  ];
  function briefText() {
    return `总部培训管理简报（模拟数据）\n${briefStart} 至 ${briefEnd} / Asia/Jakarta\n新增 ${newIssues.length}，解决 ${resolved.length}，当前逾期 ${overdue.length}\n\n${briefIssues.map((i) => `${i.id} ${regionName(i.regionId)} ${i.title}\n状态：${i.status}；责任人：${i.ownerName}\n${i.evidence.join("\n")}\n建议：${i.suggestion}`).join("\n\n")}\n\n策略 v${state.policy.version} / 数据 v${state.revision} / 更新时间 ${state.lastRunAt}`;
  }

  return (
    <div className="inspection-workspace" data-i18n-skip="true">
      <div className="inspection-heading">
        <div>
          <div className="inspection-eyebrow">
            <ShieldCheck size={15} /> TRAINING OPERATIONS
          </div>
          <h1>
            培训巡检 <Tag tone="blue">管理 Agent</Tag>
          </h1>
          <p>总部培训管理 / Hebe Beauty</p>
        </div>
        <div className="inspection-actions">
          <button
            className="inspection-icon"
            title="站内通知"
            aria-label="站内通知"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={18} />
            {unread > 0 && <span className="inspection-dot" />}
          </button>
          {actor.hq && (
            <button
              className="inspection-icon"
              title="管理策略"
              aria-label="管理策略"
              onClick={() => setPolicyOpen(true)}
            >
              <Settings2 size={18} />
            </button>
          )}
          <button
            className="inspection-button primary"
            onClick={scan}
            disabled={scanBusy}
          >
            <RefreshCw size={15} className={scanBusy ? "animate-spin" : ""} />
            {scanBusy ? "巡检中" : "立即巡检"}
          </button>
        </div>
      </div>
      <div className="inspection-runbar">
        <span>
          <span className="inspection-live" />
          {state.policy.mode === "observe" ? "观察模式" : "自动提醒"}
          <span className="inspection-divider">/</span>模拟数据 · 本地运行
        </span>
        <span>
          更新于 {state.lastRunAt ? formatTime(state.lastRunAt) : "尚未运行"}{" "}
          WIB{" "}
          <button onClick={() => setSourceOpen(true)}>
            数据接入 <ArrowRight size={12} />
          </button>
        </span>
      </div>
      {getInspectionStorageError() && (
        <div className="inspection-alert" role="alert">
          {getInspectionStorageError()}
        </div>
      )}
      <div className="inspection-tabs" role="tablist" aria-label="巡检视图">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={16} />
            {t.id === "overview" && !actor.hq ? "区域巡检" : t.label}
            {t.id === "issues" && <span>{openIssues.length}</span>}
          </button>
        ))}
      </div>
      <div className="inspection-filters">
        <div className="inspection-week">
          <button
            title="上一周"
            aria-label="上一周"
            onClick={() => setWeek(addDays(week, -7))}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            {week.slice(5).replace("-", ".")} -{" "}
            {addDays(week, 6).slice(5).replace("-", ".")}
          </span>
          <button
            title="下一周"
            aria-label="下一周"
            onClick={() => setWeek(addDays(week, 7))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        {week !== currentWeek && (
          <button
            className="inspection-link"
            onClick={() => setWeek(currentWeek)}
          >
            回到本周
          </button>
        )}
        <label className="inspection-region-select">
          <Filter size={14} />
          <select
            aria-label="筛选区域"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
          >
            {actor.hq && <option value="all">全部区域</option>}
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <span className="inspection-muted">
          {scopedRegions.length} 个区域 · {allPeople.length} 名 BA
        </span>
      </div>

      {tab === "overview" && (
        <>
          <div className="inspection-metrics">
            <Metric
              label="需关注的问题"
              value={openIssues.length}
              unit="项"
              detail={`${openIssues.filter((i) => i.level === "明确违规").length} 项明确违规`}
              tone="red"
            />
            <Metric
              label="受影响 BA"
              value={affected}
              unit="人"
              detail={`已去重 / 共 ${allPeople.length} 人`}
            />
            <Metric
              label="每人计划负荷"
              value={mean}
              unit="分钟"
              detail={
                loads.some((l) => l.unknownCount)
                  ? "部分数据缺失，显示已知负荷"
                  : "总部 + 区域任务"
              }
            />
            <Metric
              label="待总部决策"
              value={escalations.length}
              unit="项"
              detail={`${openIssues.filter((i) => i.exception?.status === "pending").length} 项例外待审批`}
              tone="blue"
            />
          </div>
          <div className="inspection-section-heading">
            <div>
              <h2>区域负荷与管理压力</h2>
              <p>
                统计周期：{week} 至 {addDays(week, 6)}
              </p>
            </div>
            <div className="inspection-legend">
              <span>
                <i className="hq" />
                总部
              </span>
              <span>
                <i className="regional" />
                区域
              </span>
            </div>
          </div>
          <div className="inspection-table-scroll">
            <table className="inspection-table">
              <thead>
                <tr>
                  <th>区域 / 负责人</th>
                  <th>每人计划负荷</th>
                  <th>P90 / 剩余</th>
                  <th>异常人数</th>
                  <th>培训师管理量</th>
                  <th>判断</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {loads.map((l) => {
                  const r = state.regions.find((r) => r.id === l.regionId)!;
                  const unknown =
                    l.unknownCount > 0 ||
                    (r.capacityMinutes === null && r.history.length < 4);
                  const stores = new Set(
                    state.people
                      .filter((p) => p.active && p.regionId === r.id)
                      .map((p) => p.storeId),
                  ).size;
                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.name}</strong>
                        <small>
                          {r.ownerName} · {l.people.length} 人 / {stores} 店
                        </small>
                      </td>
                      <td>
                        <div className="inspection-loadvalue">
                          <strong>
                            {l.mean}
                            <em> min</em>
                          </strong>
                          <small>
                            {r.capacityMinutes === null
                              ? "历史参考"
                              : `容量 ${r.capacityMinutes}`}
                          </small>
                        </div>
                        <div className="inspection-loadbar">
                          <span
                            className="hq"
                            style={{
                              width: `${Math.min(100, (l.hqMean / Math.max(200, l.mean)) * 100)}%`,
                            }}
                          />
                          <span
                            className="regional"
                            style={{
                              width: `${Math.min(100, (l.regionalMean / Math.max(200, l.mean)) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <strong>
                          {l.p90} / {l.remaining}
                        </strong>
                        <small>分钟 / 人</small>
                      </td>
                      <td>
                        <strong
                          className={
                            l.abnormalIds.length ? "inspection-red" : ""
                          }
                        >
                          {l.abnormalIds.length}
                        </strong>
                        <small>
                          {l.unknownCount
                            ? `${l.unknownCount} 人待补数据`
                            : "人"}
                        </small>
                      </td>
                      <td>
                        <strong>
                          {r.pendingReviews} <em>待复核</em>
                        </strong>
                        <small>
                          {l.taskCount} 项计划 ·{" "}
                          {
                            openIssues.filter(
                              (i) =>
                                i.regionId === r.id && i.ownerId === r.ownerId,
                            ).length
                          }{" "}
                          项整改
                        </small>
                      </td>
                      <td>
                        <Tag
                          tone={
                            unknown
                              ? "gray"
                              : l.abnormalIds.length
                                ? r.capacityMinutes === null
                                  ? "amber"
                                  : "red"
                                : "green"
                          }
                        >
                          {unknown
                            ? "数据不足"
                            : l.abnormalIds.length
                              ? r.capacityMinutes === null
                                ? "疑似异常"
                                : "超出容量"
                              : "未见异常"}
                        </Tag>
                      </td>
                      <td>
                        <button
                          className="inspection-icon"
                          title={`查看${r.name}计划`}
                          onClick={() => showRegion(r.id)}
                        >
                          <ArrowRight size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="inspection-section-heading">
            <div>
              <h2>需要总部介入</h2>
              <p>总部安排冲突、升级事项与例外申请</p>
            </div>
            <button
              className="inspection-link"
              onClick={() => {
                setTab("issues");
                setStatus("open");
              }}
            >
              全部整改 <ArrowRight size={14} />
            </button>
          </div>
          <div className="inspection-issue-list">
            {escalations.slice(0, 4).map((i) => (
              <React.Fragment key={i.id}>
                <IssueRow
                  issue={i}
                  region={regionName(i.regionId)}
                  onOpen={() => showIssue(i.id)}
                />
              </React.Fragment>
            ))}
            {!escalations.length && <Empty>本周期暂无需总部介入的事项</Empty>}
          </div>
        </>
      )}

      {tab === "plans" && (
        <>
          <div className="inspection-section-heading">
            <div>
              <h2>区域周计划</h2>
              <p>
                总部{" "}
                {
                  tasks.filter((t) => t.scope === "hq" && t.status === "active")
                    .length
                }{" "}
                项 · 区域{" "}
                {
                  tasks.filter(
                    (t) => t.scope === "regional" && t.status === "active",
                  ).length
                }{" "}
                项
              </p>
            </div>
            <Tag tone="blue">按截止周期归集</Tag>
          </div>
          <div className="inspection-table-scroll">
            <table className="inspection-table inspection-calendar">
              <thead>
                <tr>
                  <th>任务 / 分配对象</th>
                  {Array.from({ length: 7 }, (_, i) => (
                    <th
                      key={i}
                      className={addDays(week, i) === today ? "today" : ""}
                    >
                      {
                        [
                          "周一",
                          "周二",
                          "周三",
                          "周四",
                          "周五",
                          "周六",
                          "周日",
                        ][i]
                      }
                      <small>{addDays(week, i).slice(5)}</small>
                    </th>
                  ))}
                  <th>负荷 / 人</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => {
                  const ids =
                    t.participantIds?.filter((id) =>
                      allPeople.some((p) => p.personId === id),
                    ) ?? [];
                  const periods = taskPeriods(t, week);
                  const minutes = ids.length
                    ? taskLoad(t, ids[0], week).planned
                    : 0;
                  return (
                    <tr
                      key={t.id}
                      className={
                        t.status === "disabled" ? "inspection-disabled-row" : ""
                      }
                    >
                      <td>
                        <div className="inspection-task-title">
                          <Tag tone={t.scope === "hq" ? "blue" : "green"}>
                            {t.scope === "hq" ? "总部" : "区域"} ·{" "}
                            {kinds[t.kind]}
                          </Tag>
                          {t.locked && <LockKeyhole size={12} />}
                        </div>
                        <strong>{t.title}</strong>
                        <small>
                          {ids.length} 人 · {t.ownerName}
                          {t.status === "disabled" ? " · 已停用" : ""}
                        </small>
                      </td>
                      {Array.from({ length: 7 }, (_, i) => {
                        const day = addDays(week, i),
                          due = periods.some((p) => p.dueOn === day),
                          active =
                            t.status === "active" &&
                            day >= t.startsOn &&
                            day <= t.endsOn;
                        return (
                          <td key={i} className="inspection-calendar-day">
                            {active && (
                              <div
                                className={`inspection-schedule ${t.scope} ${due ? "due" : ""}`}
                                title={`${t.title} ${day}${due ? " 截止" : ""}`}
                              >
                                {due ? <Check size={12} /> : null}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td>
                        <strong>
                          {t.minutes === null ? "待补齐" : `${minutes} min`}
                        </strong>
                        <small>
                          {t.frequency
                            ? t.frequency.unit === "once"
                              ? "周期内一次"
                              : `${t.frequency.unit === "daily" ? "每日" : "每周"} ${t.frequency.count} 次`
                            : "频次缺失"}
                        </small>
                      </td>
                      <td>
                        <button
                          className="inspection-link"
                          onClick={() => setEditTask(structuredClone(t))}
                        >
                          {canEditTask(actor, t) ? "调整" : "查看"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!tasks.length && <Empty>本周期没有计划任务</Empty>}
          </div>
          <div className="inspection-section-heading">
            <div>
              <h2>逐人负荷</h2>
              <p>已知耗时合计；含附加题，按人员去重</p>
            </div>
          </div>
          <div className="inspection-table-scroll">
            <table className="inspection-table">
              <thead>
                <tr>
                  <th>BA / 门店</th>
                  <th>区域</th>
                  <th>总部</th>
                  <th>区域</th>
                  <th>计划合计</th>
                  <th>剩余</th>
                  <th>数据</th>
                </tr>
              </thead>
              <tbody>
                {allPeople.map((p) => {
                  const person = state.people.find(
                    (person) => person.id === p.personId,
                  )!;
                  return (
                    <tr key={p.personId}>
                      <td>
                        <strong>{person.name}</strong>
                        <small>{person.storeId}</small>
                      </td>
                      <td>{regionName(person.regionId)}</td>
                      <td>{p.hq} min</td>
                      <td>{p.planned - p.hq} min</td>
                      <td>
                        <strong>{p.planned} min</strong>
                      </td>
                      <td>{p.remaining} min</td>
                      <td>
                        <Tag tone={p.unknown ? "amber" : "green"}>
                          {p.unknown ? "不完整" : "完整"}
                        </Tag>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "issues" && (
        <>
          <div className="inspection-issue-filters">
            <label className="inspection-search">
              <Search size={16} />
              <input
                aria-label="搜索问题"
                placeholder="搜索问题、编号、负责人"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <select
              aria-label="整改状态"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="open">待处理</option>
              {["all", "待响应", "处理中", "待复查", "已解决", "例外生效"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "全部状态" : s}
                  </option>
                ),
              )}
            </select>
            <select
              aria-label="问题分类"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="all">全部判断</option>
              {["明确违规", "疑似异常", "数据不足"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              aria-label="整改负责人"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            >
              <option value="all">全部负责人</option>
              {[
                ...new Map(
                  weekIssues.map((i) => [i.ownerId, i.ownerName]),
                ).entries(),
              ].map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="inspection-section-heading">
            <h2>
              整改事项{" "}
              <span className="inspection-muted">{visibleIssues.length}</span>
            </h2>
            <span className="inspection-muted">按发现时间排序</span>
          </div>
          <div className="inspection-issue-list">
            {[...visibleIssues]
              .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
              .map((i) => (
                <React.Fragment key={i.id}>
                  <IssueRow
                    issue={i}
                    region={regionName(i.regionId)}
                    onOpen={() => showIssue(i.id)}
                  />
                </React.Fragment>
              ))}
            {!visibleIssues.length && <Empty>没有符合条件的整改事项</Empty>}
          </div>
        </>
      )}

      {tab === "brief" && (
        <>
          <div className="inspection-section-heading">
            <div>
              <h2>培训管理简报</h2>
              <p>
                {briefStart} 至 {briefEnd} · 确定性统计
              </p>
            </div>
            <div className="inspection-actions">
              <div className="inspection-segment">
                {(["day", "week"] as const).map((m) => (
                  <button
                    key={m}
                    aria-pressed={briefMode === m}
                    onClick={() => setBriefMode(m)}
                  >
                    {m === "day" ? "日报" : "周报"}
                  </button>
                ))}
              </div>
              <button
                className="inspection-icon"
                title="导出简报"
                aria-label="导出简报"
                onClick={exportBrief}
              >
                <Download size={17} />
              </button>
            </div>
          </div>
          <div className="inspection-metrics">
            <Metric
              label="本期新增"
              value={newIssues.length}
              unit="项"
              detail="按首次发现时间"
            />
            <Metric
              label="本期解决"
              value={resolved.length}
              unit="项"
              detail="规则复查通过"
              tone="green"
            />
            <Metric
              label="当前逾期"
              value={overdue.length}
              unit="项"
              detail="已升级总部"
              tone="red"
            />
            <Metric
              label="本期复发"
              value={
                allIssues.filter(
                  (i) => i.recurrence > 0 && inBrief(i.updatedAt),
                ).length
              }
              unit="项"
              detail="同周期同规则再次命中"
            />
          </div>
          <div className="inspection-summary">
            <FileText size={22} />
            <div>
              <h3>
                {newIssues.length
                  ? `本期发现 ${newIssues.length} 项安排问题，${resolved.length} 项已通过复查。`
                  : "本期暂无新增问题。"}
              </h3>
              <p>
                {overdue.length
                  ? `${overdue.length} 项超过响应或整改期限，需要总部关注。`
                  : "目前没有逾期整改。"}{" "}
                {state.policy.mode === "observe"
                  ? "处于观察期，提醒尚未自动发送。"
                  : "自动提醒已启用，通知按责任人每日合并。"}
              </p>
            </div>
          </div>
          <div className="inspection-section-heading">
            <h2>本周与近四周期对比</h2>
          </div>
          <div className="inspection-table-scroll">
            <table className="inspection-table">
              <thead>
                <tr>
                  <th>区域</th>
                  <th>本周每人负荷</th>
                  <th>历史中位数</th>
                  <th>变化</th>
                  <th>基线</th>
                </tr>
              </thead>
              <tbody>
                {loads.map((l) => {
                  const r = state.regions.find((r) => r.id === l.regionId)!;
                  const baseline =
                    r.history.length >= 4 ? median(r.history.slice(-4)) : null;
                  return (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{l.mean} min</td>
                      <td>
                        {baseline === null ? "不足四周期" : `${baseline} min`}
                      </td>
                      <td>
                        {baseline
                          ? `${l.mean >= baseline ? "+" : ""}${round((l.mean / baseline - 1) * 100)}%`
                          : "待积累"}
                      </td>
                      <td>
                        {r.capacityMinutes === null
                          ? "历史参考"
                          : `容量 ${r.capacityMinutes} min`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="inspection-section-heading">
            <h2>简报来源</h2>
            <span className="inspection-muted">
              策略 v{state.policy.version} · 数据 v{state.revision}
            </span>
          </div>
          <div className="inspection-issue-list">
            {briefIssues.map((i) => (
              <React.Fragment key={i.id}>
                <IssueRow
                  issue={i}
                  region={regionName(i.regionId)}
                  onOpen={() => showIssue(i.id)}
                />
              </React.Fragment>
            ))}
            {!briefIssues.length && <Empty>本期暂无问题记录</Empty>}
          </div>
        </>
      )}

      <footer className="inspection-footer">
        <span>
          <ShieldCheck size={13} />
          策略 v{state.policy.version} · 数据 v{state.revision}
        </span>
        <span>
          Asia/Jakarta ·{" "}
          {state.policy.mode === "observe"
            ? `观察始于 ${state.policy.observationStartedOn}`
            : "站内自动提醒"}
        </span>
      </footer>
      {message && (
        <div className="inspection-toast" role="status">
          {message}
          <button aria-label="关闭提示" onClick={() => setMessage("")}>
            <X size={14} />
          </button>
        </div>
      )}
      <Dialog
        open={!!issue}
        onOpenChange={(open) => {
          if (!open) setSelectedIssue(null);
        }}
      >
        <DialogContent className="inspection-modal sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{issue?.title ?? "整改详情"}</DialogTitle>
          </DialogHeader>
          {issue && (
            <React.Fragment key={issue.id}>
              <IssueDetail
                state={state}
                issue={issue}
                actor={actor}
                onEditTask={(task) => {
                  setSelectedIssue(null);
                  setEditTask(structuredClone(task));
                }}
                onMessage={setMessage}
              />
            </React.Fragment>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!editTask}
        onOpenChange={(open) => {
          if (!open) setEditTask(null);
        }}
      >
        <DialogContent className="inspection-modal sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTask?.title ?? "任务安排"}</DialogTitle>
          </DialogHeader>
          {editTask && (
            <React.Fragment key={editTask.id}>
              <TaskEditor
                state={state}
                task={editTask}
                actor={actor}
                onDone={() => {
                  setEditTask(null);
                  setMessage("任务已更新，巡检和整改结果已重新计算。");
                }}
              />
            </React.Fragment>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={policyOpen && actor.hq} onOpenChange={setPolicyOpen}>
        <DialogContent className="inspection-modal sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>管理策略</DialogTitle>
          </DialogHeader>
          {policyOpen && (
            <PolicyEditor
              state={state}
              actor={actor}
              onDone={() => {
                setPolicyOpen(false);
                setMessage("管理策略已保存并重新巡检。");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="inspection-modal sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              站内通知 <Tag>{unread} 未读</Tag>
            </DialogTitle>
          </DialogHeader>
          <div className="inspection-modal-body">
            {notificationItems.length ? (
              <>
                <button
                  className="inspection-link"
                  onClick={() =>
                    setInspectionState((s) => ({
                      ...s,
                      notifications: s.notifications.map((n) =>
                        actor.hq || n.ownerId === actor.id
                          ? { ...n, read: true }
                          : n,
                      ),
                    }))
                  }
                >
                  全部标为已读
                </button>
                {[...notificationItems].reverse().map((n) => (
                  <div className="inspection-notification" key={n.id}>
                    <strong>
                      {n.ownerName} · {n.day}{" "}
                      {!n.read && <Tag tone="blue">未读</Tag>}
                    </strong>
                    <p>{n.text}</p>
                    {n.issueIds.map((id) => (
                      <button
                        className="inspection-link"
                        key={id}
                        onClick={() => {
                          setNotificationsOpen(false);
                          setSelectedIssue(id);
                          setInspectionState((s) => ({
                            ...s,
                            notifications: s.notifications.map((item) =>
                              item.id === n.id ? { ...item, read: true } : item,
                            ),
                          }));
                        }}
                      >
                        {id}
                        <ArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                ))}
              </>
            ) : (
              <Empty>
                {state.policy.mode === "observe"
                  ? "观察模式，尚未发送自动提醒"
                  : "暂无站内通知"}
              </Empty>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={sourceOpen} onOpenChange={setSourceOpen}>
        <DialogContent className="inspection-modal sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>任务数据接入</DialogTitle>
          </DialogHeader>
          <div className="inspection-modal-body">
            <div className="inspection-alert">
              现有任务尚缺逐人分配、结构化频次、预计耗时或负责人。演示计划独立计算，原任务不计入全国负荷。
            </div>
            {Object.entries(kinds).map(([kind, label]) => {
              const sourceTasks = state.tasks.filter(
                (t) =>
                  t.origin === "source" &&
                  t.kind === kind &&
                  (actor.hq ||
                    t.scope === "hq" ||
                    t.regionId === actor.regionId),
              );
              return (
                <div className="inspection-notification" key={kind}>
                  <strong>
                    {label}任务 <Tag tone="amber">待补齐契约</Tag>
                  </strong>
                  <p>
                    {sourceTasks.length} 项已读取 ·{" "}
                    {state.sourceSyncedAt[kind]
                      ? formatTime(state.sourceSyncedAt[kind])
                      : "尚未同步"}
                  </p>
                  {sourceTasks.slice(0, 5).map((t) => (
                    <p key={t.id}>
                      {t.title} ·{" "}
                      {t.status === "disabled" ? "已结束 / 已停用" : "活动任务"}
                    </p>
                  ))}
                  <button
                    className="inspection-link"
                    onClick={() =>
                      onNavigate(
                        (
                          {
                            study: "study_task_manage",
                            practice: "practice_task_manage",
                            exam: "exam_task_manage",
                            media: "media_collection_manage",
                          } as Record<string, string>
                        )[kind],
                      )
                    }
                  >
                    查看原任务
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  detail,
  tone = "",
}: {
  label: string;
  value: number;
  unit: string;
  detail: string;
  tone?: string;
}) {
  return (
    <div className="inspection-metric">
      <span>{label}</span>
      <div className={`inspection-${tone}`}>
        <strong>{value}</strong>
        <em>{unit}</em>
      </div>
      <small>{detail}</small>
    </div>
  );
}
function IssueRow({
  issue: i,
  region,
  onOpen,
}: {
  issue: InspectionIssue;
  region: string;
  onOpen: () => void;
}) {
  return (
    <button className="inspection-issue-row" onClick={onOpen}>
      <span
        className={`inspection-issue-marker ${i.level === "明确违规" ? "red" : i.level === "疑似异常" ? "amber" : "gray"}`}
      />
      <div className="inspection-issue-main">
        <div>
          <Tag
            tone={
              i.level === "明确违规"
                ? "red"
                : i.level === "疑似异常"
                  ? "amber"
                  : "gray"
            }
          >
            {i.level}
          </Tag>
          <span className="inspection-muted">
            {i.id} · {region}
          </span>
          {i.escalated && <Tag tone="red">已升级</Tag>}
        </div>
        <strong>{i.title}</strong>
        <p>{i.evidence[0]}</p>
      </div>
      <div className="inspection-issue-owner">
        <strong>{i.ownerName}</strong>
        <small>
          {i.dueOn ? `整改期限 ${i.dueOn}` : `响应期限 ${i.responseDueOn}`}
        </small>
      </div>
      <Tag
        tone={
          i.status === "已解决"
            ? "green"
            : i.status === "例外生效"
              ? "blue"
              : ""
        }
      >
        {i.status}
      </Tag>
      <ChevronRight size={17} />
    </button>
  );
}

function IssueDetail({
  state,
  issue,
  actor,
  onEditTask,
  onMessage,
}: {
  state: InspectionState;
  issue: InspectionIssue;
  actor: InspectionActor;
  onEditTask: (task: InspectionTask) => void;
  onMessage: (message: string) => void;
}) {
  const [note, setNote] = useState("");
  const [date, setDate] = useState(issue.dueOn ?? addDays(inspectionDay(), 1));
  const [error, setError] = useState("");
  const allowed = !actor.readOnly && (actor.hq || issue.ownerId === actor.id);
  function act(action: Parameters<typeof actOnIssue>[3]) {
    try {
      setInspectionState((s) =>
        actOnIssue(s, actor, issue.id, action, note, date),
      );
      setNote("");
      setError("");
      onMessage(
        action === "review"
          ? "已提交复查，下一次巡检将重新验证。"
          : "处理记录已保存。",
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="inspection-modal-body">
      <div className="inspection-detail-meta">
        <Tag tone={issue.level === "明确违规" ? "red" : "amber"}>
          {issue.level}
        </Tag>
        <Tag>{issue.status}</Tag>
        <span>
          {issue.id} · {issue.ownerName}
        </span>
      </div>
      <h3>事实证据</h3>
      <ul className="inspection-evidence">
        {issue.evidence.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
      <p className="inspection-muted">
        命中规则：{issue.rule} · 周期：{issue.period} · 复发 {issue.recurrence}{" "}
        次
      </p>
      {issue.hypothesis && (
        <p className="inspection-alert">待核实：{issue.hypothesis}</p>
      )}
      <h3>建议措施</h3>
      <p>{issue.suggestion}</p>
      <h3>关联任务</h3>
      {issue.taskIds.map((id) => {
        const t = state.tasks.find((t) => t.id === id);
        return (
          t && (
            <button
              key={id}
              className="inspection-task-link"
              onClick={() => onEditTask(t)}
            >
              <span>
                {t.title}
                <small>
                  {t.ownerName} · {t.startsOn} 至 {t.endsOn}
                </small>
              </span>
              <ArrowRight size={15} />
            </button>
          )
        );
      })}
      {!issue.taskIds.length && (
        <p className="inspection-muted">
          此问题来自区域基线、覆盖要求或管理容量。
        </p>
      )}
      {issue.personIds.length > 0 && (
        <details>
          <summary>影响人员 · {issue.personIds.length} 人</summary>
          <div className="inspection-people">
            {issue.personIds.map((id) => (
              <React.Fragment key={id}>
                <Tag>{state.people.find((p) => p.id === id)?.name ?? id}</Tag>
              </React.Fragment>
            ))}
          </div>
        </details>
      )}
      {issue.exception && (
        <div className="inspection-alert">
          例外申请：{issue.exception.reason}
          <br />
          到期：{issue.exception.expiresOn} ·{" "}
          {
            { pending: "待总部审批", approved: "已批准", rejected: "已驳回" }[
              issue.exception.status
            ]
          }
        </div>
      )}
      {allowed &&
        (isOpen(issue.status) || issue.exception?.status === "pending") && (
          <div className="inspection-form">
            <h3>整改处理</h3>
            <label>
              处理说明
              <textarea
                aria-label="处理说明"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="填写措施、原因或审批意见"
              />
            </label>
            <label>
              整改承诺 / 例外到期日期
              <input
                aria-label="整改日期"
                type="date"
                min={inspectionDay()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            {error && (
              <p className="inspection-red" role="alert">
                {error}
              </p>
            )}
            <div className="inspection-actions wrap">
              {isOpen(issue.status) && (
                <>
                  <button
                    className="inspection-button primary"
                    onClick={() => act("respond")}
                  >
                    提交整改计划
                  </button>
                  <button
                    className="inspection-button"
                    onClick={() => act("review")}
                  >
                    提交复查
                  </button>
                  <button
                    className="inspection-button"
                    onClick={() => act("exception")}
                  >
                    申请例外
                  </button>
                </>
              )}
              {actor.hq && issue.exception?.status === "pending" && (
                <>
                  <button
                    className="inspection-button"
                    onClick={() => act("approve")}
                  >
                    批准例外
                  </button>
                  <button
                    className="inspection-button"
                    onClick={() => act("reject")}
                  >
                    驳回例外
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      {!allowed && (
        <p className="inspection-muted">
          <LockKeyhole size={14} className="inline" />由 {issue.ownerName}{" "}
          处理；当前角色可查看进展。
        </p>
      )}
      <h3>处理时间线</h3>
      <ol className="inspection-timeline">
        {[...issue.events].reverse().map((event, i) => (
          <li key={i}>
            <strong>{event.actor}</strong>
            <small>{formatTime(event.at)}</small>
            <p>{event.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TaskEditor({
  state,
  task,
  actor,
  onDone,
}: {
  state: InspectionState;
  task: InspectionTask;
  actor: InspectionActor;
  onDone: () => void;
}) {
  const [form, setForm] = useState(task),
    [error, setError] = useState("");
  const [completionPerson, setCompletionPerson] = useState("");
  const [completionCount, setCompletionCount] = useState(0);
  const editable = canEditTask(actor, task);
  const people = state.people.filter(
    (p) =>
      p.active &&
      (task.scope === "hq"
        ? actor.hq || p.regionId === actor.regionId
        : p.regionId === task.regionId),
  );
  const patch = (part: Partial<InspectionTask>) =>
    setForm((s) => ({ ...s, ...part }));
  const reportingPeriod = taskPeriods(task, weekStart(inspectionDay())).find(
    (p) => task.frequency?.unit !== "daily" || p.key === inspectionDay(),
  );
  return (
    <div className="inspection-modal-body inspection-form">
      <div className="inspection-detail-meta">
        <Tag tone={task.scope === "hq" ? "blue" : "green"}>
          {task.scope === "hq" ? "总部任务" : "区域任务"}
        </Tag>
        <span>
          {task.ownerName} · v{task.version}
        </span>
        {task.locked && (
          <Tag>
            <LockKeyhole size={12} />
            总部锁定
          </Tag>
        )}
      </div>
      {!editable && (
        <p className="inspection-alert">
          此任务由 {task.ownerName} 负责，当前角色无调整权限。
        </p>
      )}
      <fieldset disabled={!editable}>
        <div className="inspection-form-grid">
          <label>
            开始日期
            <input
              aria-label="任务开始日期"
              type="date"
              value={form.startsOn}
              onChange={(e) => patch({ startsOn: e.target.value })}
            />
          </label>
          <label>
            截止日期
            <input
              aria-label="任务截止日期"
              type="date"
              value={form.endsOn}
              min={form.startsOn}
              onChange={(e) => patch({ endsOn: e.target.value })}
            />
          </label>
          <label>
            每次预计耗时（分钟）
            <input
              aria-label="每次预计耗时"
              type="number"
              min="1"
              max="1440"
              value={form.minutes ?? ""}
              onChange={(e) =>
                patch({
                  minutes:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            附加题耗时（分钟）
            <input
              aria-label="附加题耗时"
              type="number"
              min="0"
              max="1440"
              value={form.additionalMinutes}
              onChange={(e) =>
                patch({ additionalMinutes: Number(e.target.value) })
              }
            />
          </label>
          <label>
            频次周期
            <select
              aria-label="频次周期"
              value={form.frequency?.unit ?? "once"}
              onChange={(e) =>
                patch({
                  frequency: {
                    unit: e.target.value as "once" | "daily" | "weekly",
                    count: form.frequency?.count ?? 1,
                  },
                })
              }
            >
              <option value="once">周期内一次</option>
              <option value="daily">每日</option>
              <option value="weekly">每周</option>
            </select>
          </label>
          <label>
            要求次数
            <input
              aria-label="要求次数"
              type="number"
              min="1"
              max="100"
              value={form.frequency?.count ?? 1}
              onChange={(e) =>
                patch({
                  frequency: {
                    unit: form.frequency?.unit ?? "once",
                    count: Number(e.target.value),
                  },
                })
              }
            />
          </label>
        </div>
        <label>
          复训理由
          <textarea
            aria-label="复训理由"
            rows={2}
            value={form.retrainingReason}
            onChange={(e) => patch({ retrainingReason: e.target.value })}
          />
        </label>
        <div className="inspection-actions wrap">
          <label className="inspection-checkbox">
            <input
              type="checkbox"
              checked={form.status === "active"}
              onChange={(e) =>
                patch({ status: e.target.checked ? "active" : "disabled" })
              }
            />
            任务启用
          </label>
          {actor.hq && (
            <>
              <label className="inspection-checkbox">
                <input
                  type="checkbox"
                  checked={form.mandatory}
                  onChange={(e) => patch({ mandatory: e.target.checked })}
                />
                重点必修
              </label>
              <label className="inspection-checkbox">
                <input
                  type="checkbox"
                  checked={form.locked}
                  onChange={(e) => patch({ locked: e.target.checked })}
                />
                仅总部可调整
              </label>
            </>
          )}
        </div>
        <h3>分配对象 · {form.participantIds?.length ?? 0} 人</h3>
        <div className="inspection-actions">
          <button
            type="button"
            className="inspection-link"
            onClick={() => patch({ participantIds: people.map((p) => p.id) })}
          >
            全选
          </button>
          <button
            type="button"
            className="inspection-link"
            onClick={() => patch({ participantIds: [] })}
          >
            清空
          </button>
        </div>
        <div className="inspection-roster">
          {people.map((p) => (
            <label className="inspection-checkbox" key={p.id}>
              <input
                type="checkbox"
                checked={form.participantIds?.includes(p.id) ?? false}
                onChange={(e) =>
                  patch({
                    participantIds: e.target.checked
                      ? [...(form.participantIds ?? []), p.id]
                      : (form.participantIds ?? []).filter((id) => id !== p.id),
                  })
                }
              />
              {p.name}
            </label>
          ))}
        </div>
      </fieldset>
      {error && (
        <p className="inspection-red" role="alert">
          {error}
        </p>
      )}
      {editable && (
        <button
          className="inspection-button primary"
          onClick={() => {
            try {
              setInspectionState((s) => updateTask(s, actor, form));
              onDone();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <Check size={15} />
          保存并重新巡检
        </button>
      )}
      {!actor.readOnly &&
        reportingPeriod &&
        task.startsOn <= inspectionDay() && (
          <details>
            <summary>本周期完成记录 · 模拟回传</summary>
            <div className="inspection-form-grid mt-3">
              <label>
                学员
                <select
                  aria-label="回传学员"
                  value={completionPerson}
                  onChange={(e) => {
                    setCompletionPerson(e.target.value);
                    setCompletionCount(
                      task.completed[e.target.value]?.[reportingPeriod.key] ??
                        0,
                    );
                  }}
                >
                  <option value="">选择学员</option>
                  {people
                    .filter((p) => task.participantIds?.includes(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                已完成次数 / {reportingPeriod.count}
                <input
                  aria-label="回传完成次数"
                  type="number"
                  min="0"
                  max={reportingPeriod.count}
                  value={completionCount}
                  onChange={(e) => setCompletionCount(Number(e.target.value))}
                />
              </label>
            </div>
            <button
              className="inspection-button"
              onClick={() => {
                try {
                  setInspectionState((s) =>
                    recordCompletion(
                      s,
                      actor,
                      task.id,
                      completionPerson,
                      reportingPeriod.key,
                      completionCount,
                    ),
                  );
                  onDone();
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              登记完成记录
            </button>
          </details>
        )}
    </div>
  );
}

function PolicyEditor({
  state,
  actor,
  onDone,
}: {
  state: InspectionState;
  actor: InspectionActor;
  onDone: () => void;
}) {
  const [policy, setPolicy] = useState(structuredClone(state.policy)),
    [regions, setRegions] = useState(structuredClone(state.regions)),
    [reason, setReason] = useState(""),
    [error, setError] = useState("");
  return (
    <div className="inspection-modal-body inspection-form">
      <div className="inspection-detail-meta">
        <Tag tone="blue">v{state.policy.version}</Tag>
        <span>观察始于 {state.policy.observationStartedOn}</span>
      </div>
      <div className="inspection-form-grid">
        <label>
          历史参考倍数
          <input
            aria-label="历史参考倍数"
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={policy.historyMultiplier}
            onChange={(e) =>
              setPolicy((p) => ({
                ...p,
                historyMultiplier: Number(e.target.value),
              }))
            }
          />
        </label>
        <label>
          默认响应期限（工作日）
          <input
            type="number"
            min="1"
            max="10"
            value={policy.responseBusinessDays}
            onChange={(e) =>
              setPolicy((p) => ({
                ...p,
                responseBusinessDays: Number(e.target.value),
              }))
            }
          />
        </label>
        <label>
          集中截止窗口（天）
          <input
            type="number"
            min="1"
            max="7"
            value={policy.deadlineDays}
            onChange={(e) =>
              setPolicy((p) => ({ ...p, deadlineDays: Number(e.target.value) }))
            }
          />
        </label>
        <label>
          窗口内任务数量
          <input
            type="number"
            min="2"
            max="20"
            value={policy.deadlineTaskCount}
            onChange={(e) =>
              setPolicy((p) => ({
                ...p,
                deadlineTaskCount: Number(e.target.value),
              }))
            }
          />
        </label>
        <label>
          待复核量上限（可留空）
          <input
            type="number"
            min="1"
            value={policy.reviewLimit ?? ""}
            onChange={(e) =>
              setPolicy((p) => ({
                ...p,
                reviewLimit:
                  e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
        </label>
        <label>
          运行模式
          <select
            aria-label="运行模式"
            value={policy.mode}
            onChange={(e) =>
              setPolicy((p) => ({
                ...p,
                mode: e.target.value as "observe" | "automatic",
              }))
            }
          >
            <option value="observe">观察模式</option>
            <option value="automatic">自动提醒（模拟）</option>
          </select>
        </label>
      </div>
      <label className="inspection-checkbox">
        <input
          type="checkbox"
          checked={policy.autoRemind}
          onChange={(e) =>
            setPolicy((p) => ({ ...p, autoRemind: e.target.checked }))
          }
        />
        启用站内提醒 · 每位负责人每日合并一条
      </label>
      <h3>区域容量与复核待办</h3>
      {regions.map((r) => (
        <div className="inspection-form-grid" key={r.id}>
          <label>
            {r.name} · 分钟 / 人 / 周
            <input
              aria-label={`${r.name}容量`}
              type="number"
              min="1"
              value={r.capacityMinutes ?? ""}
              placeholder="尚未确认"
              onChange={(e) =>
                setRegions((items) =>
                  items.map((item) =>
                    item.id === r.id
                      ? {
                          ...item,
                          capacityMinutes:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        }
                      : item,
                  ),
                )
              }
            />
          </label>
          <label>
            {r.ownerName} · 待复核份数
            <input
              aria-label={`${r.ownerName}待复核`}
              type="number"
              min="0"
              value={r.pendingReviews}
              onChange={(e) =>
                setRegions((items) =>
                  items.map((item) =>
                    item.id === r.id
                      ? { ...item, pendingReviews: Number(e.target.value) }
                      : item,
                  ),
                )
              }
            />
          </label>
        </div>
      ))}
      <h3>总部必修要求</h3>
      {policy.requirements.map((r) => (
        <p key={r.id}>
          {r.title} · {r.dueOn} · {r.regionIds.length} 个区域
        </p>
      ))}
      <label>
        变更说明
        <textarea
          aria-label="策略变更说明"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      {error && (
        <p className="inspection-red" role="alert">
          {error}
        </p>
      )}
      <button
        className="inspection-button primary"
        onClick={() => {
          const integer = (n: number, min: number, max: number) =>
            Number.isInteger(n) && n >= min && n <= max;
          if (!reason.trim()) {
            setError("请填写策略变更说明");
            return;
          }
          if (
            !Number.isFinite(policy.historyMultiplier) ||
            policy.historyMultiplier < 1 ||
            policy.historyMultiplier > 5 ||
            !integer(policy.responseBusinessDays, 1, 10) ||
            !integer(policy.deadlineDays, 1, 7) ||
            !integer(policy.deadlineTaskCount, 2, 20) ||
            (policy.reviewLimit !== null &&
              !integer(policy.reviewLimit, 1, 10000)) ||
            regions.some(
              (r) =>
                (r.capacityMinutes !== null &&
                  (!Number.isFinite(r.capacityMinutes) ||
                    r.capacityMinutes <= 0)) ||
                !integer(r.pendingReviews, 0, 10000),
            )
          ) {
            setError("请检查容量、次数和阈值的有效范围");
            return;
          }
          setInspectionState((s) =>
            runInspection({
              ...s,
              revision: s.revision + 1,
              policy: { ...policy, version: s.policy.version + 1 },
              regions,
              policyHistory: [
                ...s.policyHistory,
                {
                  at: new Date().toISOString(),
                  actor: actor.name,
                  text: `策略 v${s.policy.version + 1}：${reason.trim()}`,
                },
              ],
            }),
          );
          onDone();
        }}
      >
        <Check size={15} />
        保存策略
      </button>
      <h3>策略历史</h3>
      <ol className="inspection-timeline">
        {[...state.policyHistory].reverse().map((event, i) => (
          <li key={i}>
            <strong>{event.actor}</strong>
            <small>{formatTime(event.at)}</small>
            <p>{event.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
