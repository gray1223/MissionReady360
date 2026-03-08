"use client";

import { useState } from "react";
import {
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DebriefFilter } from "@/components/debrief/debrief-filter";
import { DebriefItemList, type FlatDebriefItem } from "@/components/debrief/debrief-item-list";
import { DebriefCategoryChart } from "@/components/debrief/debrief-category-chart";
import { DebriefResolutionCard } from "@/components/debrief/debrief-resolution-card";
import { UptPerformanceCard, type UptFlightData } from "@/components/debrief/upt-performance-card";
import type { DebriefItemStatus } from "@/lib/types/database";

interface DebriefPageClientProps {
  items: FlatDebriefItem[];
  stats: { total: number; open: number; inProgress: number; resolved: number };
  categoryBreakdown: { category: string; open: number; total: number }[];
  uniqueCategories: string[];
  uptEnabled: boolean;
  uptFlights: UptFlightData[];
  belowMifOpen: number;
  belowMifResolved: number;
}

export function DebriefPageClient({
  items,
  stats,
  categoryBreakdown,
  uniqueCategories,
  uptEnabled,
  uptFlights,
  belowMifOpen,
  belowMifResolved,
}: DebriefPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<DebriefItemStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uptOnly, setUptOnly] = useState(false);

  // Client-side filtering
  const filtered = items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (uptOnly && !item.hasUptGrades) return false;
    return true;
  });

  const statCards = [
    { label: "Total", value: stats.total, icon: FileText, color: "text-slate-400" },
    { label: "Open", value: stats.open, icon: AlertCircle, color: "text-red-400" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-400" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-400" },
  ];

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Debrief Summary</h2>
          <p className="mt-1 text-sm text-slate-400">
            Track performance and debrief items across flights
          </p>
        </div>
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 mb-4">
              <ClipboardList className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300">
              No debrief items yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Add debrief items to your flights to track performance and resolutions here.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Debrief Summary</h2>
        <p className="mt-1 text-sm text-slate-400">
          Track performance and debrief items across flights
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-2 sm:gap-3">
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${stat.color}`} />
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-bold text-slate-100">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter Bar */}
      <DebriefFilter
        status={statusFilter}
        onStatusChange={setStatusFilter}
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={uniqueCategories}
        uptOnly={uptOnly}
        onUptOnlyChange={setUptOnly}
        showUptToggle={uptEnabled}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DebriefCategoryChart categories={categoryBreakdown} />
        <DebriefResolutionCard
          total={stats.total}
          open={stats.open}
          inProgress={stats.inProgress}
          resolved={stats.resolved}
        />

        {/* UPT Performance (conditional) */}
        {uptEnabled && uptFlights.length > 0 && (
          <UptPerformanceCard
            flights={uptFlights}
            belowMifOpen={belowMifOpen}
            belowMifResolved={belowMifResolved}
          />
        )}
      </div>

      {/* Item List */}
      <DebriefItemList items={filtered} />
    </div>
  );
}
