import type { DebriefItemStatus } from "@/lib/types/database";

export const DEBRIEF_CATEGORIES = [
  "Procedures",
  "Airmanship",
  "Instrument",
  "Formation",
  "Navigation",
  "Academics",
  "CRM",
  "Emergency",
  "Below MIF",
  "Other",
] as const;

export const STATUS_CONFIG: Record<
  DebriefItemStatus,
  { label: string; variant: "danger" | "warning" | "success" }
> = {
  open: { label: "Open", variant: "danger" },
  in_progress: { label: "In Progress", variant: "warning" },
  resolved: { label: "Resolved", variant: "success" },
};

export const STATUS_CYCLE: Record<DebriefItemStatus, DebriefItemStatus> = {
  open: "in_progress",
  in_progress: "resolved",
  resolved: "open",
};
