"use client";

import { useState, useRef, useCallback } from "react";
import { Clock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getRelevantPriorHoursFields } from "@/lib/flights/prior-hours";
import { updateFlightLogPreferences } from "@/app/(dashboard)/settings/actions";
import type { FlightLogPreferences, PriorHoursInput } from "@/lib/types/database";

interface PriorHoursFormProps {
  preferences: FlightLogPreferences;
  userId: string;
}

export function PriorHoursForm({ preferences, userId }: PriorHoursFormProps) {
  const trackedRatings = preferences.trackedRatings || [];
  const fields = getRelevantPriorHoursFields(trackedRatings);

  const [values, setValues] = useState<PriorHoursInput>(
    preferences.priorHours || {}
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const save = useCallback(
    async (next: PriorHoursInput) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setSaving(true);
      setError(null);
      try {
        const result = await updateFlightLogPreferences(userId, {
          ...preferences,
          priorHours: next,
        });
        if (result.error) setError(result.error);
      } catch {
        setError("Failed to save prior hours");
      } finally {
        setSaving(false);
        pendingRef.current = false;
      }
    },
    [userId, preferences]
  );

  // Don't render when no ratings are tracked
  if (!preferences.showRatingProgress || trackedRatings.length === 0 || fields.length === 0) {
    return null;
  }

  function handleBlur(key: keyof PriorHoursInput, raw: string) {
    const num = parseFloat(raw);
    const val = isNaN(num) || num < 0 ? 0 : Math.round(num * 10) / 10;
    const next = { ...values, [key]: val || undefined };
    // Remove zero/undefined keys to keep JSONB tidy
    if (!val) delete next[key];
    setValues(next);
    save(next);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-500" />
            Prior Flight Hours
          </span>
        </CardTitle>
        <CardDescription>
          Enter flight hours from before using MissionReady360. These count
          toward FAA rating progress but not currency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Only fields relevant to your tracked ratings are shown.
          </p>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <Input
                key={field.key}
                id={`prior-${field.key}`}
                label={field.label}
                type="number"
                min={0}
                step={0.1}
                placeholder="0.0"
                defaultValue={values[field.key] ?? ""}
                disabled={saving}
                hint="Hours"
                onBlur={(e) => handleBlur(field.key, e.target.value)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
