"use client";

import { useState } from "react";
import { Plane } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { FlightLogPreferences } from "@/lib/types/database";

const SECTIONS = [
  { id: "flight_info", label: "Flight Info", alwaysOn: true },
  { id: "flight_time", label: "Flight Time", alwaysOn: true },
  { id: "mission_details", label: "Mission Details", alwaysOn: false },
  { id: "faa_time", label: "FAA Time", alwaysOn: false },
  { id: "landings", label: "Landings", alwaysOn: false },
  { id: "approaches", label: "Approaches", alwaysOn: false },
  { id: "mission_specific", label: "Mission Specific", alwaysOn: false },
  { id: "remarks", label: "Remarks", alwaysOn: false },
];

interface FlightLogPreferencesCardProps {
  preferences: FlightLogPreferences;
  userId: string;
}

export function FlightLogPreferencesCard({
  preferences,
  userId,
}: FlightLogPreferencesCardProps) {
  const [hidden, setHidden] = useState<Set<string>>(
    new Set(preferences.hiddenSections || [])
  );
  const [saving, setSaving] = useState(false);

  async function toggle(sectionId: string) {
    const next = new Set(hidden);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    setHidden(next);

    setSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({
          flight_log_preferences: { ...preferences, hiddenSections: Array.from(next) },
        })
        .eq("id", userId);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-emerald-500" />
            Flight Log Preferences
          </span>
        </CardTitle>
        <CardDescription>
          Choose which sections appear on the flight log form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const isHidden = hidden.has(section.id);
            const isOn = section.alwaysOn || !isHidden;

            return (
              <label
                key={section.id}
                className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-3 cursor-pointer"
              >
                <div>
                  <p className="text-sm text-slate-200">{section.label}</p>
                  {section.alwaysOn && (
                    <p className="text-xs text-slate-500">Always visible</p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isOn}
                    disabled={section.alwaysOn || saving}
                    onChange={() => toggle(section.id)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-700 peer-checked:bg-emerald-600 peer-disabled:opacity-50 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
