"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { updateFlightLogPreferences } from "@/app/(dashboard)/settings/actions";
import type { FlightLogPreferences } from "@/lib/types/database";

interface UptPreferencesCardProps {
  preferences: FlightLogPreferences;
  userId: string;
}

export function UptPreferencesCard({
  preferences,
  userId,
}: UptPreferencesCardProps) {
  const [uptEnabled, setUptEnabled] = useState(preferences.uptEnabled ?? false);
  const [saving, setSaving] = useState(false);

  async function toggleUpt() {
    const next = !uptEnabled;
    setUptEnabled(next);
    setSaving(true);
    try {
      await updateFlightLogPreferences(userId, {
        ...preferences,
        uptEnabled: next,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            UPT Grade Tracking
          </span>
        </CardTitle>
        <CardDescription>
          Enable Undergraduate Pilot Training grade tracking on flight logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-3 cursor-pointer">
            <div>
              <p className="text-sm text-slate-200">Enable UPT Grades</p>
              <p className="text-xs text-slate-500">
                Log progression grades, overall grades, and MIF notes on flights
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={uptEnabled}
                disabled={saving}
                onChange={toggleUpt}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-slate-700 peer-checked:bg-primary peer-disabled:opacity-50 transition-colors" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
