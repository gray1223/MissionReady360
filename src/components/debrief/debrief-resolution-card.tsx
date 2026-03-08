"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { CheckCircle } from "lucide-react";

interface DebriefResolutionCardProps {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export function DebriefResolutionCard({
  total,
  open,
  inProgress,
  resolved,
}: DebriefResolutionCardProps) {
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Resolution Rate
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <ProgressRing value={pct} size={96} strokeWidth={8}>
            <span className="text-lg font-bold text-slate-100">{pct}%</span>
          </ProgressRing>

          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="rounded-lg bg-red-900/20 border border-red-900/30 p-2 text-center">
              <p className="text-lg font-bold text-red-400">{open}</p>
              <p className="text-[10px] text-slate-500">Open</p>
            </div>
            <div className="rounded-lg bg-amber-900/20 border border-amber-900/30 p-2 text-center">
              <p className="text-lg font-bold text-amber-400">{inProgress}</p>
              <p className="text-[10px] text-slate-500">In Progress</p>
            </div>
            <div className="rounded-lg bg-emerald-900/20 border border-emerald-900/30 p-2 text-center">
              <p className="text-lg font-bold text-emerald-400">{resolved}</p>
              <p className="text-[10px] text-slate-500">Resolved</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
