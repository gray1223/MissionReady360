"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { UptGrades } from "@/lib/types/database";

export interface UptFlightData {
  flightDate: string;
  grades: UptGrades;
}

interface UptPerformanceCardProps {
  flights: UptFlightData[];
  belowMifOpen: number;
  belowMifResolved: number;
}

const GRADE_VALUES: Record<string, number> = {
  WB: 1,
  BA: 2,
  SB: 3,
  AV: 4,
  SA: 5,
  AA: 6,
  WA: 7,
};

const GRADE_COLORS: Record<string, string> = {
  WB: "bg-red-500",
  BA: "bg-red-400",
  SB: "bg-amber-500",
  AV: "bg-amber-400",
  SA: "bg-emerald-400",
  AA: "bg-emerald-500",
  WA: "bg-emerald-600",
};

export function UptPerformanceCard({
  flights,
  belowMifOpen,
  belowMifResolved,
}: UptPerformanceCardProps) {
  const totalUpgrades = flights.reduce((sum, f) => sum + (f.grades.upgrades || 0), 0);
  const totalDowngrades = flights.reduce((sum, f) => sum + (f.grades.downgrades || 0), 0);
  const maxGradeVal = 7;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            UPT Performance
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grade progression timeline */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 mb-3">Grade Progression</h4>
            {flights.length > 0 ? (
              <div className="flex items-end gap-1 h-28">
                {flights.map((f, i) => {
                  const grade = f.grades.progression_grade;
                  if (!grade) return null;
                  const val = GRADE_VALUES[grade] || 4;
                  const heightPct = (val / maxGradeVal) * 100;
                  const colorClass = GRADE_COLORS[grade] || "bg-slate-500";

                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1 min-w-0"
                    >
                      <div className="w-full flex items-end h-20">
                        <div
                          className={`w-full rounded-t ${colorClass} transition-all min-h-[4px]`}
                          style={{ height: `${heightPct}%` }}
                          title={`${grade} — ${f.flightDate}`}
                        />
                      </div>
                      <span className="text-[8px] text-slate-500 truncate max-w-full">
                        {grade}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4">No graded flights yet.</p>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-4">
            {/* Upgrades vs Downgrades */}
            <div>
              <h4 className="text-xs font-medium text-slate-400 mb-2">Upgrades vs Downgrades</h4>
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg bg-emerald-900/20 border border-emerald-900/30 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{totalUpgrades}</p>
                  <p className="text-[10px] text-slate-500">Upgrades</p>
                </div>
                <div className="flex-1 rounded-lg bg-red-900/20 border border-red-900/30 p-3 text-center">
                  <p className="text-xl font-bold text-red-400">{totalDowngrades}</p>
                  <p className="text-[10px] text-slate-500">Downgrades</p>
                </div>
              </div>
            </div>

            {/* Below MIF items */}
            <div>
              <h4 className="text-xs font-medium text-slate-400 mb-2">Below MIF Items</h4>
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg bg-red-900/20 border border-red-900/30 p-3 text-center">
                  <p className="text-xl font-bold text-red-400">{belowMifOpen}</p>
                  <p className="text-[10px] text-slate-500">Open</p>
                </div>
                <div className="flex-1 rounded-lg bg-emerald-900/20 border border-emerald-900/30 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{belowMifResolved}</p>
                  <p className="text-[10px] text-slate-500">Resolved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
