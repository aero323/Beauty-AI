import { useSyncExternalStore } from "react";
import { createInspectionState } from "./inspectionData";
import { inspectionDay, runInspection } from "./inspectionEngine";
import type { InspectionKind, InspectionState } from "./inspectionTypes";

const key = "salesboost.training-inspection.v1";
let current: InspectionState | undefined;
let storageError = "";
const listeners = new Set<() => void>();
function initial() {
  if (current) return current;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const saved = JSON.parse(raw);
      if (
        saved.schema === 1 &&
        Array.isArray(saved.tasks) &&
        Array.isArray(saved.issues) &&
        saved.policy &&
        Array.isArray(saved.people) &&
        Array.isArray(saved.regions) &&
        Array.isArray(saved.notifications) &&
        Array.isArray(saved.policyHistory) &&
        saved.sourceSyncedAt
      )
        current = runInspection(saved);
    }
  } catch {
    storageError = "本地记录读取失败，已载入演示数据。";
  }
  current ??= createInspectionState();
  return current;
}
export function getInspectionState() {
  return initial();
}
export function getInspectionStorageError() {
  return storageError;
}
export function setInspectionState(
  update: InspectionState | ((previous: InspectionState) => InspectionState),
) {
  current = typeof update === "function" ? update(initial()) : update;
  try {
    localStorage.setItem(key, JSON.stringify(current));
    storageError = "";
  } catch {
    storageError = "本地存储不可用，本次修改仅保留在当前会话。";
  }
  listeners.forEach((listener) => listener());
}
export function useInspectionState() {
  return useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, getInspectionState);
}
export interface LegacyInspectionTask {
  id: string;
  title: string;
  status: string;
  publishTime?: string;
  startAt?: string;
  deadline?: string;
  scope?: string;
  region?: string;
}
export function syncInspectionSource(
  kind: InspectionKind,
  sourceId: string,
  records: LegacyInspectionTask[],
) {
  const state = getInspectionState();
  const mapped = records.map((record) => ({
    id: `source:${kind}:${record.id}`,
    title: record.title,
    kind,
    origin: "source" as const,
    sourceId,
    scope: record.scope === "区域" ? ("regional" as const) : ("hq" as const),
    regionId:
      record.scope === "区域"
        ? record.region?.includes("南")
          ? "south"
          : undefined
        : undefined,
    ownerId: "",
    ownerName: "",
    startsOn: record.startAt ?? record.publishTime?.slice(0, 10) ?? "",
    endsOn: record.deadline ?? "",
    minutes: null,
    additionalMinutes: 0,
    frequency: null,
    participantIds: null,
    contentIds: [],
    mandatory: false,
    locked: false,
    retrainingReason: "",
    status: /停用|结束|复核结束/.test(record.status)
      ? ("disabled" as const)
      : ("active" as const),
    completed: {},
    version: 1,
  }));
  if (
    JSON.stringify(
      state.tasks.filter((t) => t.origin === "source" && t.kind === kind),
    ) === JSON.stringify(mapped)
  )
    return;
  setInspectionState({
    ...state,
    revision: state.revision + 1,
    tasks: [
      ...state.tasks.filter((t) => t.origin !== "source" || t.kind !== kind),
      ...mapped,
    ],
    sourceSyncedAt: {
      ...state.sourceSyncedAt,
      [kind]: new Date().toISOString(),
    },
  });
}
let timer: ReturnType<typeof setInterval> | undefined;
export function startInspectionScheduler() {
  if (timer) return () => {};
  const scan = () => setInspectionState((previous) => runInspection(previous));
  timer = setInterval(scan, 60_000);
  const visibility = () => {
    if (
      document.visibilityState === "visible" &&
      getInspectionState().lastRunAt?.slice(0, 10) !== inspectionDay()
    )
      scan();
  };
  document.addEventListener("visibilitychange", visibility);
  return () => {
    clearInterval(timer);
    timer = undefined;
    document.removeEventListener("visibilitychange", visibility);
  };
}
