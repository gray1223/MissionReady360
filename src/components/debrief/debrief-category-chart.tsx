"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface CategoryCount {
  category: string;
  open: number;
  total: number;
}

interface DebriefCategoryChartProps {
  categories: CategoryCount[];
}

export function DebriefCategoryChart({ categories }: DebriefCategoryChartProps) {
  const maxTotal = Math.max(...categories.map((c) => c.total), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Category Breakdown
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map((cat) => {
            const pct = Math.round((cat.total / maxTotal) * 100);
            const openPct = cat.total > 0 ? Math.round((cat.open / cat.total) * 100) : 0;
            return (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">{cat.category || "Uncategorized"}</span>
                  <span className="text-xs font-medium text-slate-300">
                    {cat.total} items
                    {cat.open > 0 && (
                      <span className="ml-1.5 text-red-400">({cat.open} open)</span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-700">
                  <div
                    className="h-1.5 rounded-full bg-primary/80 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No items to display.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
