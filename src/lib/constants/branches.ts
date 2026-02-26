import type { MilitaryBranch } from "@/lib/types/database";

export const BRANCHES: { value: MilitaryBranch; label: string }[] = [
  { value: "USAF", label: "U.S. Air Force" },
  { value: "USN", label: "U.S. Navy" },
  { value: "USA", label: "U.S. Army" },
  { value: "USMC", label: "U.S. Marine Corps" },
  { value: "USCG", label: "U.S. Coast Guard" },
];

export const DUTY_STATUSES = [
  { value: "active", label: "Active Duty" },
  { value: "reserve", label: "Reserve" },
  { value: "guard", label: "National Guard" },
  { value: "retired", label: "Retired" },
  { value: "separated", label: "Separated" },
];
