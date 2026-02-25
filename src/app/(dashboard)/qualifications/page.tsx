"use client";

import { Award, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QualificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            Qualifications & Certifications
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage your military and FAA qualifications
          </p>
        </div>
        <Button variant="primary" size="md" disabled>
          <Plus className="h-4 w-4" />
          Add Qualification
        </Button>
      </div>

      {/* Empty state */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 mb-4">
              <Award className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300">
              No qualifications added
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Add your military qualifications, FAA certificates, ratings, and
              endorsements to track them in one place.
            </p>
            <Button variant="outline" size="md" className="mt-6" disabled>
              <Plus className="h-4 w-4" />
              Add Your First Qualification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
