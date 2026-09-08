import {
  addDays,
  inspectionDay,
  runInspection,
  weekStart,
} from "./inspectionEngine";
import type { InspectionState, InspectionTask } from "./inspectionTypes";

export function createInspectionState(): InspectionState {
  const today = inspectionDay(),
    week = weekStart(today),
    nextWeek = addDays(week, 7);
  const regions: InspectionState["regions"] = [
    {
      id: "south",
      name: "雅加达南区",
      ownerId: "fitriani",
      ownerName: "Fitriani",
      capacityMinutes: 90,
      history: [75, 80, 85, 80],
      pendingReviews: 42,
      reviewHistory: [18, 20, 22, 20],
    },
    {
      id: "north",
      name: "雅加达北区",
      ownerId: "dewi",
      ownerName: "Dewi",
      capacityMinutes: 120,
      history: [80, 90, 85, 85],
      pendingReviews: 14,
      reviewHistory: [12, 14, 15, 13],
    },
    {
      id: "bali",
      name: "巴厘岛区",
      ownerId: "putri",
      ownerName: "Putri",
      capacityMinutes: null,
      history: [35, 40, 40, 45],
      pendingReviews: 9,
      reviewHistory: [9, 10, 8, 11],
    },
    {
      id: "surabaya",
      name: "泗水区",
      ownerId: "rina",
      ownerName: "Rina",
      capacityMinutes: null,
      history: [60, 65],
      pendingReviews: 7,
      reviewHistory: [8, 7],
    },
  ];
  const names = [
    "Siti",
    "Ayu",
    "Maya",
    "Rizky",
    "Lia",
    "Nadia",
    "Budi",
    "Dimas",
  ];
  const people = regions.flatMap((region, r) =>
    Array.from({ length: r === 0 ? 12 : 8 }, (_, i) => ({
      id: `${region.id}-${i + 1}`,
      name: `${names[i % names.length]} ${["Aminah", "Lestari", "Wijaya", "Santoso"][r]} ${i + 1}`,
      regionId: region.id,
      storeId: `${region.id}-store-${Math.floor(i / 4) + 1}`,
      active: true,
    })),
  );
  const all = people.map((p) => p.id),
    ids = (region: string) =>
      people.filter((p) => p.regionId === region).map((p) => p.id);
  const tasks: InspectionTask[] = [];
  const task = (
    input: Partial<InspectionTask> & Pick<InspectionTask, "id" | "title">,
  ) =>
    tasks.push({
      kind: "study",
      origin: "demo",
      sourceId: "study_task_manage",
      scope: "hq",
      ownerId: "sarah",
      ownerName: "Sarah Lee",
      startsOn: week,
      endsOn: addDays(week, 4),
      minutes: 30,
      additionalMinutes: 0,
      frequency: { unit: "once", count: 1 },
      participantIds: all,
      contentIds: [],
      mandatory: false,
      locked: false,
      retrainingReason: "",
      status: "active",
      completed: {},
      version: 1,
      ...input,
    });
  task({
    id: "hq-product",
    title: "新品核心卖点与附加题",
    minutes: 45,
    additionalMinutes: 5,
    mandatory: true,
    locked: true,
    contentIds: ["c1"],
    participantIds: all.filter((id) => id !== "north-8"),
  });
  task({
    id: "hq-practice",
    title: "全国新品场景每周通关",
    kind: "practice",
    sourceId: "practice_task_manage",
    minutes: 10,
    frequency: { unit: "weekly", count: 5 },
    mandatory: true,
    locked: true,
    contentIds: ["s1"],
    endsOn: addDays(nextWeek, 6),
  });
  task({
    id: "south-study",
    title: "南区新品卖点巩固",
    scope: "regional",
    regionId: "south",
    ownerId: "fitriani",
    ownerName: "Fitriani",
    minutes: 30,
    contentIds: ["c1"],
    participantIds: ids("south"),
  });
  task({
    id: "south-exam",
    title: "南区新品通关考核",
    kind: "exam",
    sourceId: "exam_task_manage",
    scope: "regional",
    regionId: "south",
    ownerId: "fitriani",
    ownerName: "Fitriani",
    minutes: 30,
    contentIds: ["exam-new"],
    participantIds: ids("south"),
  });
  task({
    id: "bali-daily",
    title: "巴厘岛顾客异议每日练习",
    kind: "practice",
    sourceId: "practice_task_manage",
    scope: "regional",
    regionId: "bali",
    ownerId: "putri",
    ownerName: "Putri",
    minutes: 5,
    frequency: { unit: "daily", count: 1 },
    contentIds: ["s2"],
    participantIds: ids("bali"),
    endsOn: addDays(nextWeek, 6),
  });
  task({
    id: "surabaya-media",
    title: "泗水门店服务录音采集",
    kind: "media",
    sourceId: "media_collection_manage",
    scope: "regional",
    regionId: "surabaya",
    ownerId: "rina",
    ownerName: "Rina",
    minutes: null,
    contentIds: ["media-service"],
    participantIds: ids("surabaya"),
  });
  task({
    id: "next-hq",
    title: "下周敏感肌新品必修",
    startsOn: nextWeek,
    endsOn: addDays(nextWeek, 4),
    minutes: 50,
    mandatory: true,
    locked: true,
    contentIds: ["c2"],
  });
  task({
    id: "next-south",
    title: "下周南区服务跟进",
    scope: "regional",
    regionId: "south",
    ownerId: "fitriani",
    ownerName: "Fitriani",
    startsOn: nextWeek,
    endsOn: addDays(nextWeek, 4),
    minutes: 20,
    contentIds: ["service"],
    participantIds: ids("south"),
  });
  for (const t of tasks)
    for (const [i, id] of (t.participantIds ?? []).entries()) {
      if (i % 3 === 0 && t.startsOn === week)
        t.completed[id] = { once: 1, [week]: 2 };
    }
  return runInspection({
    schema: 1,
    revision: 1,
    regions,
    people,
    tasks,
    policy: {
      version: 1,
      historyMultiplier: 1.5,
      deadlineDays: 3,
      deadlineTaskCount: 3,
      autoRemind: true,
      mode: "observe",
      observationStartedOn: today,
      reviewLimit: null,
      responseBusinessDays: 1,
      requirements: [
        {
          id: "new-product",
          title: "新品必修",
          contentId: "c1",
          regionIds: regions.map((r) => r.id),
          dueOn: addDays(week, 4),
        },
      ],
    },
    issues: [],
    notifications: [],
    policyHistory: [
      {
        at: new Date().toISOString(),
        actor: "Sarah Lee",
        text: "建立策略 v1；模拟观察模式。",
      },
    ],
    lastRunAt: null,
    sourceSyncedAt: {},
  });
}
