"use client";

import { cn } from "@/lib/utils/cn";
import { STATUS_CONFIG } from "@/lib/constants/debrief";
import type { DebriefItemStatus } from "@/lib/types/database";

interface DebriefFilterProps {
  status: DebriefItemStatus | "all";
  onStatusChange: (status: DebriefItemStatus | "all") => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  uptOnly: boolean;
  onUptOnlyChange: (value: boolean) => void;
  showUptToggle: boolean;
}

const statusTabs: { value: DebriefItemStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export function DebriefFilter({
  status,
  onStatusChange,
  category,
  onCategoryChange,
  categories,
  uptOnly,
  onUptOnlyChange,
  showUptToggle,
}: DebriefFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status pill tabs */}
      <div className="flex rounded-lg border border-slate-800 bg-slate-900/50 p-0.5">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              status === tab.value
                ? "bg-slate-700 text-slate-100"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category dropdown */}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="all">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* UPT-only toggle */}
      {showUptToggle && (
        <button
          onClick={() => onUptOnlyChange(!uptOnly)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            uptOnly
              ? "border-primary bg-primary/10 text-primary"
              : "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200"
          )}
        >
          UPT Only
        </button>
      )}
    </div>
  );
}
