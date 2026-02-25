"use client";

import { Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CurrenciesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Currency Status</h2>
        <p className="mt-1 text-sm text-slate-400">
          Track your flight currency requirements and expiration dates
        </p>
      </div>

      {/* Empty state */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 mb-4">
              <Clock className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300">
              No currency data yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Complete your profile setup to see currency tracking. Add your
              aircraft type and qualifications to get started.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-900/20 border border-amber-800/50 px-4 py-2">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-400">
                Complete your profile setup to see currency tracking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
