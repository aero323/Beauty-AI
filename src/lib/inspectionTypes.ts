export type InspectionKind = "study" | "practice" | "exam" | "media";
export type InspectionStatus =
  | "待响应"
  | "处理中"
  | "待复查"
  | "已解决"
  | "例外生效";
export type FindingLevel = "明确违规" | "疑似异常" | "数据不足";
export interface InspectionPerson {
  id: string;
  name: string;
  regionId: string;
  storeId: string;
  active: boolean;
}
export interface InspectionRegion {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  capacityMinutes: number | null;
  history: number[];
  reviewHistory: number[];
  pendingReviews: number;
}
export interface InspectionTask {
  id: string;
  title: string;
  kind: InspectionKind;
  origin: "demo" | "source";
  sourceId: string;
  scope: "hq" | "regional";
  regionId?: string;
  ownerId: string;
  ownerName: string;
  startsOn: string;
  endsOn: string;
  minutes: number | null;
  additionalMinutes: number;
  frequency: { unit: "once" | "daily" | "weekly"; count: number } | null;
  participantIds: string[] | null;
  contentIds: string[];
  mandatory: boolean;
  locked: boolean;
  retrainingReason: string;
  status: "active" | "disabled";
  completed: Record<string, Record<string, number>>;
  version: number;
}
export interface InspectionPolicy {
  version: number;
  historyMultiplier: number;
  deadlineDays: number;
  deadlineTaskCount: number;
  autoRemind: boolean;
  mode: "observe" | "automatic";
  observationStartedOn: string;
  reviewLimit: number | null;
  responseBusinessDays: number;
  requirements: {
    id: string;
    title: string;
    contentId: string;
    regionIds: string[];
    dueOn: string;
  }[];
}
export interface InspectionFinding {
  key: string;
  rule:
    | "capacity"
    | "history"
    | "deadline"
    | "duplicate"
    | "coverage"
    | "progress"
    | "trainer"
    | "data";
  level: FindingLevel;
  title: string;
  regionId: string;
  period: string;
  ownerId: string;
  ownerName: string;
  taskIds: string[];
  personIds: string[];
  evidence: string[];
  suggestion: string;
  hypothesis?: string;
}
export interface InspectionEvent {
  at: string;
  actor: string;
  text: string;
}
export interface InspectionIssue extends InspectionFinding {
  id: string;
  status: InspectionStatus;
  detectedAt: string;
  updatedAt: string;
  responseDueOn: string;
  dueOn?: string;
  resolvedAt?: string;
  recurrence: number;
  events: InspectionEvent[];
  escalated: boolean;
  exception?: {
    reason: string;
    expiresOn: string;
    status: "pending" | "approved" | "rejected";
    approver?: string;
  };
}
export interface InspectionNotification {
  id: string;
  ownerId: string;
  ownerName: string;
  day: string;
  issueIds: string[];
  sentAt: string;
  read: boolean;
  text: string;
}
export interface InspectionState {
  schema: 1;
  revision: number;
  people: InspectionPerson[];
  regions: InspectionRegion[];
  tasks: InspectionTask[];
  policy: InspectionPolicy;
  issues: InspectionIssue[];
  notifications: InspectionNotification[];
  policyHistory: InspectionEvent[];
  lastRunAt: string | null;
  sourceSyncedAt: Record<string, string>;
}
export interface InspectionActor {
  id: string;
  name: string;
  hq: boolean;
  regionId?: string;
  readOnly?: boolean;
}
export interface PersonLoad {
  personId: string;
  planned: number;
  remaining: number;
  hq: number;
  unknown: boolean;
}
export interface RegionLoad {
  regionId: string;
  people: PersonLoad[];
  mean: number;
  p90: number;
  remaining: number;
  hqMean: number;
  regionalMean: number;
  unknownCount: number;
  abnormalIds: string[];
  taskCount: number;
}
