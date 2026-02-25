"use client";

import { BarChart3, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Reports</h2>
        <p className="mt-1 text-sm text-slate-400">
          Flight analytics, trends, and exportable reports
        </p>
      </div>

      {/* Coming soon state */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 mb-4">
              <BarChart3 className="h-8 w-8 text-slate-600" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-slate-300">
                Reports Coming Soon
              </h3>
              <Badge variant="info">
                <Clock className="h-3 w-3 mr-1" />
                In Development
              </Badge>
            </div>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              We are building detailed flight analytics, currency trend reports,
              and exportable summaries. This feature will include hour breakdowns
              by type, currency timeline views, and printable AF Form 781
              summaries.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
