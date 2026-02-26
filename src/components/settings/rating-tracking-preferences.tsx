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
import { FAA_RATINGS } from "@/lib/constants/faa-ratings";
import { updateFlightLogPreferences } from "@/app/(dashboard)/settings/actions";
import type { FlightLogPreferences } from "@/lib/types/database";

const GROUPS = [
  { key: "certificate" as const, label: "Certificates" },
  { key: "rating" as const, label: "Ratings" },
  { key: "atp" as const, label: "ATP" },
];

interface RatingTrackingPreferencesCardProps {
  preferences: FlightLogPreferences;
  userId: string;
}

export function RatingTrackingPreferencesCard({
  preferences,
  userId,
}: RatingTrackingPreferencesCardProps) {
  const [showOnDashboard, setShowOnDashboard] = useState(
    preferences.showRatingProgress ?? false
  );
  const [tracked, setTracked] = useState<Set<string>>(
    new Set(preferences.trackedRatings || [])
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextShow: boolean, nextTracked: Set<string>) {
    setSaving(true);
    setError(null);
    try {
      const result = await updateFlightLogPreferences(userId, {
        ...preferences,
        showRatingProgress: nextShow,
        trackedRatings: Array.from(nextTracked),
      });
      if (result.error) {
        setError(result.error);
      }
    } catch (e) {
      setError("Failed to save preferences");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function toggleDashboard() {
    const next = !showOnDashboard;
    setShowOnDashboard(next);
    save(next, tracked);
  }

  function toggleRating(ratingId: string) {
    const next = new Set(tracked);
    if (next.has(ratingId)) {
      next.delete(ratingId);
    } else {
      next.add(ratingId);
    }
    setTracked(next);
    save(showOnDashboard, next);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            FAA Rating Progress
          </span>
        </CardTitle>
        <CardDescription>
          Track your progress toward FAA civilian ratings using logged flight hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Master toggle */}
          <label className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-3 cursor-pointer">
            <div>
              <p className="text-sm text-slate-200">Show on Dashboard</p>
              <p className="text-xs text-slate-500">
                Display rating progress widget on your dashboard
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={showOnDashboard}
                disabled={saving}
                onChange={toggleDashboard}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-slate-700 peer-checked:bg-primary peer-disabled:opacity-50 transition-colors" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          {/* Rating checkboxes */}
          {showOnDashboard && (
            <div className="space-y-4 pt-2">
              {GROUPS.map((group) => {
                const ratings = FAA_RATINGS.filter((r) => r.group === group.key);
                if (ratings.length === 0) return null;
                return (
                  <div key={group.key}>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                      {group.label}
                    </p>
                    <div className="space-y-2">
                      {ratings.map((rating) => (
                        <label
                          key={rating.id}
                          className="flex items-center gap-3 rounded-lg bg-slate-800/20 px-4 py-2.5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={tracked.has(rating.id)}
                            disabled={saving}
                            onChange={() => toggleRating(rating.id)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary/30 focus:ring-offset-0"
                          />
                          <div>
                            <p className="text-sm text-slate-200">
                              {rating.shortName}
                              <span className="ml-2 text-xs text-slate-500">
                                {rating.regulation}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">{rating.name}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
