import test from "node:test";
import assert from "node:assert/strict";
import {
  actOnIssue,
  addDays,
  businessDue,
  canEditTask,
  inspectionDay,
  inspect,
  recordCompletion,
  regionLoads,
  runInspection,
  taskLoad,
  taskPeriods,
  updateTask,
  weekStart,
} from "./inspectionEngine";
import type {
  InspectionActor,
  InspectionState,
  InspectionTask,
} from "./inspectionTypes";

const week = weekStart(inspectionDay());
const hq: InspectionActor = { id: "sarah", name: "Sarah Lee", hq: true };
const regional: InspectionActor = {
  id: "fitriani",
  name: "Fitriani",
  hq: false,
  regionId: "south",
};
function task(overrides: Partial<InspectionTask> = {}): InspectionTask {
  return {
    id: "t1",
    title: "Product learning",
    kind: "study",
    origin: "demo",
    sourceId: "study_task_manage",
    scope: "hq",
    ownerId: "sarah",
    ownerName: "Sarah Lee",
    startsOn: week,
    endsOn: addDays(week, 6),
    minutes: 50,
    additionalMinutes: 5,
    frequency: { unit: "once", count: 1 },
    participantIds: ["p1", "p2"],
    contentIds: ["product"],
    mandatory: true,
    locked: true,
    retrainingReason: "",
    status: "active",
    completed: {},
    version: 1,
    ...overrides,
  };
}
function fixture(tasks = [task()]): InspectionState {
  return {
    schema: 1,
    revision: 1,
    people: [
      { id: "p1", name: "P1", active: true, regionId: "south", storeId: "s1" },
      { id: "p2", name: "P2", active: true, regionId: "south", storeId: "s2" },
    ],
    regions: [
      {
        id: "south",
        name: "South",
        ownerId: "fitriani",
        ownerName: "Fitriani",
        capacityMinutes: 90,
        history: [40, 40, 50, 50],
        pendingReviews: 10,
        reviewHistory: [10, 10, 10, 10],
      },
    ],
    tasks,
    policy: {
      version: 1,
      mode: "observe",
      autoRemind: true,
      observationStartedOn: inspectionDay(),
      historyMultiplier: 1.5,
      deadlineDays: 3,
      deadlineTaskCount: 3,
      reviewLimit: null,
      responseBusinessDays: 1,
      requirements: [],
    },
    issues: [],
    notifications: [],
    policyHistory: [],
    lastRunAt: null,
    sourceSyncedAt: {},
  };
}
test("HQ + regional load is per person, includes additional questions, and attributes HQ overload", () => {
  const state = fixture([
    task({ minutes: 100 }),
    task({
      id: "t2",
      scope: "regional",
      regionId: "south",
      minutes: 30,
      additionalMinutes: 0,
      mandatory: false,
      ownerId: "fitriani",
      ownerName: "Fitriani",
    }),
  ]);
  assert.equal(regionLoads(state, week)[0].mean, 135);
  const issue = inspect(state, week, inspectionDay()).find(
    (f) => f.rule === "capacity",
  )!;
  assert.equal(issue.ownerId, "sarah");
  assert.equal(issue.personIds.length, 2);
});
test("daily and weekly cycles cap completion independently and never multiply weeks by days", () => {
  const daily = task({
    minutes: 10,
    additionalMinutes: 0,
    frequency: { unit: "daily", count: 2 },
    startsOn: addDays(week, 2),
    endsOn: addDays(week, 4),
    completed: { p1: { [addDays(week, 2)]: 9 } },
  });
  assert.equal(taskPeriods(daily, week).length, 3);
  assert.deepEqual(taskLoad(daily, "p1", week), { planned: 60, remaining: 40 });
  const weekly = task({
    minutes: 10,
    additionalMinutes: 0,
    frequency: { unit: "weekly", count: 3 },
    endsOn: addDays(week, 13),
    completed: { p1: { [week]: 2 } },
  });
  assert.deepEqual(taskLoad(weekly, "p1", week), {
    planned: 30,
    remaining: 10,
  });
  assert.deepEqual(taskLoad(weekly, "p1", addDays(week, 7)), {
    planned: 30,
    remaining: 30,
  });
});
test("once-only work is counted in deadline week, not duplicated across the interval", () => {
  const once = task({ endsOn: addDays(week, 10) });
  assert.equal(taskLoad(once, "p1", week).planned, 0);
  assert.equal(taskLoad(once, "p1", addDays(week, 7)).planned, 55);
});
test("incomplete data cannot produce a clean assessment or invented capacity", () => {
  const state = fixture([task({ minutes: null })]);
  state.regions[0].capacityMinutes = null;
  state.regions[0].history = [50];
  assert.equal(regionLoads(state, week)[0].unknownCount, 2);
  assert.ok(
    inspect(state, week, inspectionDay()).filter((f) => f.rule === "data")
      .length >= 2,
  );
  assert.equal(
    inspect(state, week, inspectionDay()).some((f) => f.rule === "capacity"),
    false,
  );
});
test("historical outliers stay suspected rather than confirmed violations", () => {
  const state = fixture([task({ minutes: 100 })]);
  state.regions[0].capacityMinutes = null;
  assert.equal(
    inspect(state, week, inspectionDay()).find((f) => f.rule === "history")
      ?.level,
    "疑似异常",
  );
});
test("duplicate-content detection uses common participants and respects a retraining reason", () => {
  const state = fixture([task(), task({ id: "t2", participantIds: ["p1"] })]);
  assert.deepEqual(
    inspect(state, week, inspectionDay()).find((f) => f.rule === "duplicate")
      ?.personIds,
    ["p1"],
  );
  state.tasks[1].retrainingReason = "Confirmed refresher";
  assert.equal(
    inspect(state, week, inspectionDay()).some((f) => f.rule === "duplicate"),
    false,
  );
});
test("coverage checks active personnel, due date, and actual allocations", () => {
  const state = fixture([task({ participantIds: ["p1"] })]);
  state.policy.requirements = [
    {
      id: "r",
      title: "Mandatory product",
      contentId: "product",
      regionIds: ["south"],
      dueOn: addDays(week, 6),
    },
  ];
  assert.deepEqual(
    inspect(state, week, inspectionDay()).find((f) => f.rule === "coverage")
      ?.personIds,
    ["p2"],
  );
  state.people[1].active = false;
  assert.equal(
    inspect(state, week, inspectionDay()).some((f) => f.rule === "coverage"),
    false,
  );
});
test("repeated scans and reminders are idempotent per owner/day; observation is quiet", () => {
  let state = runInspection(fixture([task({ minutes: 100 })]));
  assert.equal(state.notifications.length, 0);
  state.policy.mode = "automatic";
  state = runInspection(state);
  const again = runInspection(state);
  assert.equal(again.issues.length, state.issues.length);
  assert.equal(again.notifications.length, state.notifications.length);
  assert.equal(
    new Set(again.notifications.map((n) => `${n.ownerId}:${n.day}`)).size,
    again.notifications.length,
  );
});
test("reply does not resolve an issue; failing review stays open; adjustment closes it", () => {
  let state = runInspection(fixture([task({ minutes: 100 })]));
  const id = state.issues.find((i) => i.rule === "capacity")!.id;
  state = actOnIssue(
    state,
    hq,
    id,
    "respond",
    "Coordinate schedule",
    addDays(inspectionDay(), 1),
  );
  assert.equal(state.issues.find((i) => i.id === id)!.status, "处理中");
  state = runInspection(
    actOnIssue(state, hq, id, "review", "Please review", ""),
  );
  assert.equal(state.issues.find((i) => i.id === id)!.status, "处理中");
  state = updateTask(state, hq, { ...state.tasks[0], minutes: 50 });
  assert.equal(state.issues.find((i) => i.id === id)!.status, "已解决");
  state = updateTask(state, hq, { ...state.tasks[0], minutes: 100 });
  assert.equal(state.issues.find((i) => i.id === id)!.recurrence, 1);
});
test("regional users cannot mutate HQ tasks, other regions, or approve exceptions", () => {
  let state = runInspection(fixture([task({ minutes: 100 })]));
  assert.equal(canEditTask(regional, state.tasks[0]), false);
  assert.throws(() => updateTask(state, regional, state.tasks[0]));
  const id = state.issues[0].id;
  assert.throws(() =>
    actOnIssue(state, regional, id, "respond", "test", inspectionDay()),
  );
  state = actOnIssue(
    state,
    hq,
    id,
    "exception",
    "Launch week",
    addDays(inspectionDay(), 2),
  );
  assert.throws(() =>
    actOnIssue(state, regional, id, "approve", "Approved", ""),
  );
  assert.equal(
    canEditTask(
      regional,
      task({ scope: "regional", regionId: "other", locked: false }),
    ),
    false,
  );
});
test("approved exceptions expire and return to inspection", () => {
  let state = runInspection(fixture([task({ minutes: 100 })]));
  const id = state.issues[0].id;
  state = actOnIssue(
    state,
    hq,
    id,
    "exception",
    "Launch week",
    inspectionDay(),
  );
  state = actOnIssue(state, hq, id, "approve", "One day only", "");
  assert.equal(state.issues.find((i) => i.id === id)!.status, "例外生效");
  state = runInspection(
    state,
    new Date(`${addDays(inspectionDay(), 1)}T05:00:00Z`),
  );
  assert.equal(state.issues.find((i) => i.id === id)!.status, "待响应");
});
test("working-day deadlines skip weekends and timezone day is deterministic", () => {
  assert.equal(businessDue("2026-09-11", 1), "2026-09-14");
  assert.equal(inspectionDay(new Date("2026-09-07T18:00:00Z")), "2026-09-08");
});
test("deadline clustering requires distinct tasks assigned to the same person", () => {
  const state = fixture([task({ frequency: { unit: "daily", count: 1 } })]);
  assert.equal(
    inspect(state, week, inspectionDay()).some((f) => f.rule === "deadline"),
    false,
  );
  state.tasks.push(task({ id: "t2" }), task({ id: "t3" }));
  assert.equal(
    inspect(state, week, inspectionDay()).find((f) => f.rule === "deadline")
      ?.personIds.length,
    2,
  );
});
test("completion updates remaining workload, validates participants/counts, and keeps plan total", () => {
  const state = fixture();
  const updated = recordCompletion(state, regional, "t1", "p1", "once", 1);
  assert.equal(regionLoads(updated, week)[0].mean, 55);
  assert.equal(regionLoads(updated, week)[0].remaining, 28);
  assert.throws(() => recordCompletion(state, regional, "t1", "p1", "once", 2));
  assert.throws(() =>
    recordCompletion(state, regional, "t1", "unknown", "once", 1),
  );
  assert.throws(() =>
    recordCompletion(
      state,
      { ...regional, readOnly: true },
      "t1",
      "p1",
      "once",
      1,
    ),
  );
});
test("person transfers stop regional task contributions in the old region", () => {
  const state = fixture([task({ scope: "regional", regionId: "south" })]);
  state.people[1].regionId = "north";
  assert.equal(regionLoads(state, week)[0].people.length, 1);
  assert.equal(regionLoads(state, week)[0].mean, 55);
});
