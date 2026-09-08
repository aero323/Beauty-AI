import type {
  InspectionActor,
  InspectionFinding,
  InspectionState,
  InspectionTask,
  RegionLoad,
} from "./inspectionTypes";

export const inspectionDay = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
export const addDays = (day: string, count: number) =>
  new Date(Date.parse(`${day}T12:00:00Z`) + count * 86400000)
    .toISOString()
    .slice(0, 10);
export function weekStart(day: string) {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  return addDays(day, -((weekday + 6) % 7));
}
export function businessDue(day: string, days: number) {
  let result = day;
  for (let remaining = days; remaining > 0; ) {
    result = addDays(result, 1);
    if (![0, 6].includes(new Date(`${result}T12:00:00Z`).getUTCDay()))
      remaining--;
  }
  return result;
}
export const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length
    ? sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2
    : 0;
};
export const isOpen = (status: string) =>
  !["已解决", "例外生效"].includes(status);
export const canSeeRegion = (actor: InspectionActor, regionId: string) =>
  actor.hq || actor.regionId === regionId;
export const canEditTask = (actor: InspectionActor, task: InspectionTask) =>
  !actor.readOnly &&
  task.origin === "demo" &&
  (actor.hq ||
    (task.scope === "regional" &&
      task.regionId === actor.regionId &&
      !task.locked));

// Once-only work is allocated to its deadline week; recurring work has explicit period keys.
export function taskPeriods(task: InspectionTask, week: string) {
  const end = addDays(week, 6);
  if (
    task.status === "disabled" ||
    !task.frequency ||
    task.endsOn < week ||
    task.startsOn > end
  )
    return [];
  if (task.frequency.unit === "once")
    return task.endsOn <= end
      ? [{ key: "once", dueOn: task.endsOn, count: task.frequency.count }]
      : [];
  if (task.frequency.unit === "weekly")
    return [
      {
        key: week,
        dueOn: task.endsOn < end ? task.endsOn : end,
        count: task.frequency.count,
      },
    ];
  return Array.from({ length: 7 }, (_, i) => addDays(week, i))
    .filter((day) => day >= task.startsOn && day <= task.endsOn)
    .map((day) => ({ key: day, dueOn: day, count: task.frequency!.count }));
}
export function taskLoad(task: InspectionTask, personId: string, week: string) {
  const periods = taskPeriods(task, week);
  const minutes = (task.minutes ?? 0) + task.additionalMinutes;
  return {
    planned: periods.reduce((sum, p) => sum + p.count * minutes, 0),
    remaining: periods.reduce(
      (sum, p) =>
        sum +
        Math.max(0, p.count - (task.completed[personId]?.[p.key] ?? 0)) *
          minutes,
      0,
    ),
  };
}
const applies = (task: InspectionTask, regionId: string) =>
  task.scope === "hq" || task.regionId === regionId;
export function regionLoads(
  state: InspectionState,
  week: string,
): RegionLoad[] {
  return state.regions.map((region) => {
    const tasks = state.tasks.filter(
      (t) =>
        t.origin === "demo" &&
        t.status === "active" &&
        applies(t, region.id) &&
        t.startsOn <= addDays(week, 6) &&
        t.endsOn >= week,
    );
    const people = state.people
      .filter((p) => p.active && p.regionId === region.id)
      .map((person) => {
        const assigned = tasks.filter((t) =>
          t.participantIds?.includes(person.id),
        );
        return assigned.reduce(
          (load, task) => {
            const value = taskLoad(task, person.id, week);
            return {
              ...load,
              planned: load.planned + value.planned,
              remaining: load.remaining + value.remaining,
              hq: load.hq + (task.scope === "hq" ? value.planned : 0),
              unknown:
                load.unknown ||
                task.minutes === null ||
                task.frequency === null,
            };
          },
          {
            personId: person.id,
            planned: 0,
            remaining: 0,
            hq: 0,
            unknown: tasks.some((t) => t.participantIds === null),
          },
        );
      });
    const sorted = people.map((p) => p.planned).sort((a, b) => a - b);
    const mean = people.length
      ? people.reduce((sum, p) => sum + p.planned, 0) / people.length
      : 0;
    const hqMean = people.length
      ? people.reduce((sum, p) => sum + p.hq, 0) / people.length
      : 0;
    const threshold =
      region.capacityMinutes ??
      (region.history.length >= 4
        ? median(region.history.slice(-4)) * state.policy.historyMultiplier
        : null);
    return {
      regionId: region.id,
      people,
      mean: Math.round(mean),
      p90: sorted.length ? sorted[Math.ceil(sorted.length * 0.9) - 1] : 0,
      remaining: people.length
        ? Math.round(
            people.reduce((sum, p) => sum + p.remaining, 0) / people.length,
          )
        : 0,
      hqMean: Math.round(hqMean),
      regionalMean: Math.round(mean - hqMean),
      unknownCount: people.filter((p) => p.unknown).length,
      abnormalIds: people
        .filter(
          (p) => !p.unknown && threshold !== null && p.planned > threshold,
        )
        .map((p) => p.personId),
      taskCount: tasks.length,
    };
  });
}

export function inspect(
  state: InspectionState,
  week: string,
  today: string,
): InspectionFinding[] {
  const findings: InspectionFinding[] = [];
  const loads = regionLoads(state, week);
  for (const region of state.regions) {
    const load = loads.find((r) => r.regionId === region.id)!;
    const tasks = state.tasks.filter(
      (t) =>
        t.origin === "demo" &&
        t.status === "active" &&
        applies(t, region.id) &&
        t.startsOn <= addDays(week, 6) &&
        t.endsOn >= week,
    );
    const personIds = state.people
      .filter((p) => p.active && p.regionId === region.id)
      .map((p) => p.id);
    const add = (
      rule: InspectionFinding["rule"],
      suffix: string,
      detail: Partial<InspectionFinding> &
        Pick<InspectionFinding, "title" | "evidence" | "suggestion" | "level">,
    ) =>
      findings.push({
        key: `${week}:${region.id}:${rule}:${suffix}`,
        rule,
        regionId: region.id,
        period: week,
        ownerId: region.ownerId,
        ownerName: region.ownerName,
        taskIds: [],
        personIds: [],
        ...detail,
      });
    for (const task of tasks) {
      const missing = [
        task.minutes === null && "预计耗时",
        task.frequency === null && "结构化频次",
        task.participantIds === null && "逐人分配",
        !task.ownerId && "任务负责人",
      ].filter(Boolean);
      if (missing.length)
        add("data", task.id, {
          level: "数据不足",
          title: `${task.title}数据不完整`,
          taskIds: [task.id],
          evidence: [
            `缺少：${missing.join("、")}`,
            "当前负荷仅包含已知数据，不能据此判定合理",
          ],
          suggestion: "补齐任务数据后重新巡检。",
        });
    }
    if (region.capacityMinutes === null && region.history.length < 4)
      add("data", "baseline", {
        level: "数据不足",
        title: "缺少容量基线和足够历史",
        evidence: [`可用完整历史周期 ${region.history.length} / 4`],
        suggestion: "确认区域每人每周培训容量，或积累四个完整周期。",
      });
    if (load.abnormalIds.length) {
      const hqCaused =
        region.capacityMinutes !== null &&
        load.people.some((p) => !p.unknown && p.hq > region.capacityMinutes!);
      const hqOwner = tasks.find((t) => t.scope === "hq" && t.mandatory);
      add(region.capacityMinutes === null ? "history" : "capacity", "load", {
        level: region.capacityMinutes === null ? "疑似异常" : "明确违规",
        title:
          region.capacityMinutes === null
            ? "训练安排高于历史参考"
            : hqCaused
              ? "总部必修已超区域容量"
              : "总部与区域任务叠加超容量",
        personIds: load.abnormalIds,
        taskIds: tasks
          .filter(
            (t) =>
              t.participantIds?.some((id) => load.abnormalIds.includes(id)) &&
              taskPeriods(t, week).length,
          )
          .map((t) => t.id),
        ...(hqCaused && hqOwner
          ? { ownerId: hqOwner.ownerId, ownerName: hqOwner.ownerName }
          : {}),
        evidence: [
          `人均 ${load.mean} 分钟，P90 ${load.p90} 分钟`,
          `总部 ${load.hqMean} + 区域 ${load.regionalMean} 分钟 / 人`,
          region.capacityMinutes === null
            ? `近四周期中位数 ${median(region.history.slice(-4))} 分钟，参考倍数 ${state.policy.historyMultiplier}`
            : `已确认容量 ${region.capacityMinutes} 分钟 / 人 / 周`,
          `影响 ${load.abnormalIds.length} / ${personIds.length} 人`,
        ],
        suggestion: hqCaused
          ? "总部协调必修排期，区域负责人协同错峰非必修任务。"
          : "核对实际可用时间，错峰安排或调整非必修任务频次。",
        hypothesis: "可能由多来源同时下发任务造成，需负责人核实。",
      });
    }
    for (let i = 0; i < tasks.length; i++)
      for (let j = i + 1; j < tasks.length; j++) {
        const a = tasks[i],
          b = tasks[j];
        const overlap = personIds.filter(
          (id) =>
            a.participantIds?.includes(id) && b.participantIds?.includes(id),
        );
        if (
          overlap.length &&
          a.startsOn <= b.endsOn &&
          b.startsOn <= a.endsOn &&
          !a.retrainingReason &&
          !b.retrainingReason &&
          a.contentIds.some((id) => b.contentIds.includes(id))
        )
          add("duplicate", [a.id, b.id].sort().join(":"), {
            level: "疑似异常",
            title: "同一内容重复分配",
            taskIds: [a.id, b.id],
            personIds: overlap,
            evidence: [
              `${a.title} / ${b.title}`,
              `${overlap.length} 人收到重复内容，尚无复训说明`,
            ],
            suggestion: "核实复训目的；合并重复安排或填写复训理由。",
          });
      }
    const clustered = personIds.filter((id) => {
      const dates = tasks.flatMap((t) =>
        t.participantIds?.includes(id)
          ? taskPeriods(t, week)
              .filter((p) => (t.completed[id]?.[p.key] ?? 0) < p.count)
              .map((p) => ({ id: t.id, day: p.dueOn }))
          : [],
      );
      return dates.some(
        (start) =>
          new Set(
            dates
              .filter(
                (d) =>
                  d.day >= start.day &&
                  d.day < addDays(start.day, state.policy.deadlineDays),
              )
              .map((d) => d.id),
          ).size >= state.policy.deadlineTaskCount,
      );
    });
    if (clustered.length)
      add("deadline", "cluster", {
        level: "疑似异常",
        title: "多个任务集中截止",
        personIds: clustered,
        taskIds: tasks
          .filter((t) => t.participantIds?.some((id) => clustered.includes(id)))
          .map((t) => t.id),
        evidence: [
          `${clustered.length} 人在连续 ${state.policy.deadlineDays} 天内至少有 ${state.policy.deadlineTaskCount} 个任务待完成`,
        ],
        suggestion: "按内容优先级分批执行，调整可变更任务的截止日期。",
      });
    for (const requirement of state.policy.requirements.filter(
      (r) =>
        r.regionIds.includes(region.id) &&
        r.dueOn >= week &&
        r.dueOn <= addDays(week, 6),
    )) {
      const eligible = tasks.filter(
        (t) =>
          t.contentIds.includes(requirement.contentId) &&
          t.endsOn <= requirement.dueOn,
      );
      if (eligible.some((t) => t.participantIds === null)) continue;
      const missing = personIds.filter(
        (id) => !eligible.some((t) => t.participantIds?.includes(id)),
      );
      if (missing.length)
        add("coverage", requirement.id, {
          level: "明确违规",
          title: `${requirement.title}覆盖遗漏`,
          personIds: missing,
          taskIds: eligible.map((t) => t.id),
          evidence: [
            `截至 ${requirement.dueOn} 应覆盖 ${personIds.length} 人，遗漏 ${missing.length} 人`,
          ],
          suggestion: "在原任务补充分配，或安排可在要求日期前完成的必修任务。",
        });
    }
    for (const task of tasks) {
      const ids = personIds.filter((id) => task.participantIds?.includes(id));
      const due = taskPeriods(task, week).filter(
        (p) => p.dueOn <= addDays(today, 2),
      );
      const incomplete = ids.filter((id) =>
        due.some((p) => (task.completed[id]?.[p.key] ?? 0) < p.count),
      );
      if (ids.length && due.length && incomplete.length / ids.length > 0.5)
        add("progress", task.id, {
          level: "疑似异常",
          title: "临期任务完成不足一半",
          personIds: incomplete,
          taskIds: [task.id],
          ownerId: task.ownerId || region.ownerId,
          ownerName: task.ownerName || region.ownerName,
          evidence: [
            `${incomplete.length} / ${ids.length} 人尚未完成临期或逾期要求`,
            `最早截止 ${due[0].dueOn}`,
          ],
          suggestion: "核实执行阻碍与剩余负荷，安排跟进并承诺处理日期。",
        });
    }
    const reviewThreshold =
      state.policy.reviewLimit ??
      (region.reviewHistory.length >= 4
        ? median(region.reviewHistory.slice(-4)) *
          state.policy.historyMultiplier
        : null);
    if (reviewThreshold !== null && region.pendingReviews > reviewThreshold)
      add("trainer", "reviews", {
        level: state.policy.reviewLimit === null ? "疑似异常" : "明确违规",
        title: "培训师待复核量集中",
        evidence: [
          `${region.ownerName} 待复核 ${region.pendingReviews} 份`,
          `${state.policy.reviewLimit === null ? "历史参考" : "已确认上限"} ${reviewThreshold} 份`,
          `管辖 ${personIds.length} 人、${new Set(state.people.filter((p) => p.active && p.regionId === region.id).map((p) => p.storeId)).size} 家门店`,
        ],
        suggestion: "确认复核难度和可用工时，申请分担复核或临时支援。",
      });
  }
  return findings;
}

export function runInspection(
  input: InspectionState,
  now = new Date(),
  requestedWeeks: string[] = [],
): InspectionState {
  const state: InspectionState = structuredClone(input);
  const today = inspectionDay(now),
    at = now.toISOString();
  const weeks = [
    ...new Set([
      weekStart(today),
      addDays(weekStart(today), 7),
      ...requestedWeeks,
      ...state.issues
        .filter((i) => isOpen(i.status) || i.status === "例外生效")
        .map((i) => i.period),
    ]),
  ];
  const findings = weeks.flatMap((week) => inspect(state, week, today));
  const found = new Set(findings.map((f) => f.key));
  for (const finding of findings) {
    const issue = state.issues.find((i) => i.key === finding.key);
    if (!issue)
      state.issues.push({
        ...finding,
        id: `IN-${state.issues.length + 1001}`,
        status: "待响应",
        detectedAt: at,
        updatedAt: at,
        responseDueOn: businessDue(today, state.policy.responseBusinessDays),
        recurrence: 0,
        events: [
          {
            at,
            actor: "巡检 Agent",
            text: `规则命中；策略 v${state.policy.version}，数据 v${state.revision}`,
          },
        ],
        escalated: false,
      });
    else {
      const wasResolved = issue.status === "已解决";
      const oldOwner = issue.ownerId;
      if (JSON.stringify(issue.evidence) !== JSON.stringify(finding.evidence))
        issue.events.push({
          at,
          actor: "巡检 Agent",
          text: `事实更新：${finding.evidence.join("；")}（策略 v${state.policy.version}，数据 v${state.revision}）`,
        });
      Object.assign(issue, finding);
      if (oldOwner !== issue.ownerId)
        issue.events.push({
          at,
          actor: "巡检 Agent",
          text: `责任归属更新：${issue.ownerName}`,
        });
      if (
        issue.status === "例外生效" &&
        issue.exception?.expiresOn &&
        issue.exception.expiresOn < today
      ) {
        issue.status = "待响应";
        issue.updatedAt = at;
        issue.responseDueOn = businessDue(
          today,
          state.policy.responseBusinessDays,
        );
        issue.events.push({
          at,
          actor: "巡检 Agent",
          text: "例外到期，重新核查。",
        });
      }
      if (wasResolved) {
        issue.status = "待响应";
        issue.resolvedAt = undefined;
        issue.dueOn = undefined;
        issue.recurrence++;
        issue.updatedAt = at;
        issue.responseDueOn = businessDue(
          today,
          state.policy.responseBusinessDays,
        );
        issue.events.push({
          at,
          actor: "巡检 Agent",
          text: "相同问题再次出现，重新开启。",
        });
      }
      if (issue.status === "待复查") {
        issue.status = "处理中";
        issue.updatedAt = at;
        issue.events.push({
          at,
          actor: "巡检 Agent",
          text: "复查未通过，规则仍命中，请继续调整。",
        });
      }
    }
  }
  for (const issue of state.issues) {
    if (!found.has(issue.key) && issue.status !== "已解决") {
      issue.status = "已解决";
      issue.resolvedAt = at;
      issue.updatedAt = at;
      issue.events.push({
        at,
        actor: "巡检 Agent",
        text: "重算后规则不再命中，复查通过。",
      });
    }
    issue.escalated =
      isOpen(issue.status) && (issue.dueOn ?? issue.responseDueOn) < today;
  }
  // One owner/day digest. Further scans update its content without sending another notification.
  if (state.policy.autoRemind && state.policy.mode === "automatic") {
    const recipients = new Set(
      state.issues.filter((i) => isOpen(i.status)).map((i) => i.ownerId),
    );
    if (state.issues.some((i) => i.escalated)) recipients.add("sarah");
    for (const ownerId of recipients) {
      const candidates = state.issues.filter(
        (i) =>
          (i.ownerId === ownerId || (ownerId === "sarah" && i.escalated)) &&
          isOpen(i.status) &&
          (!state.notifications.some(
            (n) => n.ownerId === ownerId && n.issueIds.includes(i.id),
          ) ||
            (i.dueOn ?? i.responseDueOn) <= addDays(today, 1)),
      );
      if (!candidates.length) continue;
      const existing = state.notifications.find(
        (n) => n.ownerId === ownerId && n.day === today,
      );
      const ids = [
        ...new Set([
          ...(existing?.issueIds ?? []),
          ...candidates.map((i) => i.id),
        ]),
      ];
      const ownerName =
        ownerId === "sarah" ? "Sarah Lee" : candidates[0].ownerName;
      const message = `${ownerName}：${ids.length} 项培训安排需关注，请查看证据并更新处理计划。`;
      if (existing) {
        existing.issueIds = ids;
        existing.text = message;
      } else
        state.notifications.push({
          id: `NT-${state.notifications.length + 1}`,
          ownerId,
          ownerName,
          day: today,
          issueIds: ids,
          sentAt: at,
          read: false,
          text: message,
        });
    }
  }
  state.lastRunAt = at;
  return state;
}

export function updateTask(
  state: InspectionState,
  actor: InspectionActor,
  task: InspectionTask,
): InspectionState {
  const old = state.tasks.find((t) => t.id === task.id);
  if (!old || !canEditTask(actor, old))
    throw new Error("当前角色不能调整此任务");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(task.startsOn) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(task.endsOn) ||
    task.endsOn < task.startsOn
  )
    throw new Error("截止日期不能早于开始日期");
  if (
    (task.minutes !== null &&
      (!Number.isFinite(task.minutes) ||
        task.minutes <= 0 ||
        task.minutes > 1440)) ||
    !Number.isFinite(task.additionalMinutes) ||
    task.additionalMinutes < 0 ||
    task.additionalMinutes > 1440 ||
    !task.frequency ||
    !Number.isInteger(task.frequency.count) ||
    task.frequency.count < 1 ||
    task.frequency.count > 100
  )
    throw new Error("请填写有效耗时及 1 至 100 的整数次数");
  if (
    task.participantIds?.some(
      (id) =>
        !state.people.some(
          (p) =>
            p.id === id &&
            p.active &&
            (old.scope === "hq" || p.regionId === old.regionId),
        ),
    )
  )
    throw new Error("分配对象不在任务权限范围内");
  const next = structuredClone(state);
  next.tasks = next.tasks.map((t) =>
    t.id === old.id
      ? {
          ...old,
          startsOn: task.startsOn,
          endsOn: task.endsOn,
          minutes: task.minutes,
          additionalMinutes: task.additionalMinutes,
          frequency: task.frequency,
          participantIds: task.participantIds
            ? [...new Set(task.participantIds)]
            : null,
          retrainingReason: task.retrainingReason.trim(),
          status: task.status,
          mandatory: actor.hq ? task.mandatory : old.mandatory,
          locked: actor.hq ? task.locked : old.locked,
          version: old.version + 1,
        }
      : t,
  );
  next.revision++;
  for (const issue of next.issues.filter((i) => i.taskIds.includes(old.id)))
    issue.events.push({
      at: new Date().toISOString(),
      actor: actor.name,
      text: `调整任务「${old.title}」至 v${old.version + 1}，等待重算。`,
    });
  return runInspection(next, new Date(), [weekStart(task.endsOn)]);
}

export function recordCompletion(
  state: InspectionState,
  actor: InspectionActor,
  taskId: string,
  personId: string,
  period: string,
  count: number,
) {
  const task = state.tasks.find((t) => t.id === taskId);
  const person = state.people.find((p) => p.id === personId && p.active);
  if (
    !task ||
    !person ||
    !canSeeRegion(actor, person.regionId) ||
    actor.readOnly ||
    !task.participantIds?.includes(personId)
  )
    throw new Error("当前角色不能更新此人员的任务记录");
  const week = weekStart(inspectionDay());
  const currentPeriod = taskPeriods(task, week).find((p) => p.key === period);
  if (
    !currentPeriod ||
    !Number.isInteger(count) ||
    count < 0 ||
    count > currentPeriod.count
  )
    throw new Error("完成次数超出当前周期要求");
  if (
    task.startsOn > inspectionDay() ||
    (task.frequency?.unit === "daily" && period > inspectionDay())
  )
    throw new Error("尚未开始的任务不能登记完成");
  const next = structuredClone(state);
  const updated = next.tasks.find((t) => t.id === taskId)!;
  updated.completed[personId] = {
    ...updated.completed[personId],
    [period]: count,
  };
  updated.version++;
  next.revision++;
  for (const issue of next.issues.filter((i) => i.taskIds.includes(taskId)))
    issue.events.push({
      at: new Date().toISOString(),
      actor: actor.name,
      text: `${person.name} 的 ${period} 周期完成记录更新为 ${count} 次。`,
    });
  return runInspection(next);
}

export function actOnIssue(
  state: InspectionState,
  actor: InspectionActor,
  id: string,
  action: "respond" | "review" | "exception" | "approve" | "reject",
  note: string,
  date: string,
) {
  const next = structuredClone(state),
    issue = next.issues.find((i) => i.id === id);
  if (
    !issue ||
    actor.readOnly ||
    !canSeeRegion(actor, issue.regionId) ||
    (!actor.hq && issue.ownerId !== actor.id)
  )
    throw new Error("当前角色不能处理此问题");
  if (!note.trim()) throw new Error("请填写处理说明");
  const today = inspectionDay(),
    at = new Date().toISOString();
  if (action === "approve" || action === "reject") {
    if (!actor.hq || issue.exception?.status !== "pending")
      throw new Error("仅总部可审批待审核例外");
    if (action === "approve" && issue.exception.expiresOn < today)
      throw new Error("例外已过期，请重新申请");
    issue.exception.status = action === "approve" ? "approved" : "rejected";
    issue.exception.approver = actor.name;
    if (action === "approve") issue.status = "例外生效";
  } else {
    if (!isOpen(issue.status)) throw new Error("当前问题已关闭");
    if (
      (action === "respond" || action === "exception") &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today)
    )
      throw new Error("请选择今天或之后的有效日期");
    if (action === "respond") {
      issue.status = "处理中";
      issue.dueOn = date;
    }
    if (action === "review") issue.status = "待复查";
    if (action === "exception")
      issue.exception = {
        reason: note.trim(),
        expiresOn: date,
        status: "pending",
      };
  }
  issue.updatedAt = at;
  const labels = {
    respond: "提交整改计划",
    review: "提交复查",
    exception: "申请例外",
    approve: "批准例外",
    reject: "驳回例外",
  };
  issue.events.push({
    at,
    actor: actor.name,
    text: `${labels[action]}：${note.trim()}${date && ["respond", "exception"].includes(action) ? `；日期 ${date}` : ""}`,
  });
  next.revision++;
  return next;
}
