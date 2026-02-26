"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { updateFlightLogPreferences } from "@/app/(dashboard)/settings/actions";
import type { FlightLogPreferences } from "@/lib/types/database";

interface CurrencyPreferencesCardProps {
  preferences: FlightLogPreferences;
  userId: string;
}

export function CurrencyPreferencesCard({
  preferences,
  userId,
}: CurrencyPreferencesCardProps) {
  const [showFaa, setShowFaa] = useState(preferences.showFaaCurrencies ?? true);
  const [saving, setSaving] = useState(false);

  async function toggleFaa() {
    const next = !showFaa;
    setShowFaa(next);
    setSaving(true);
    try {
      await updateFlightLogPreferences(userId, {
        ...preferences,
        showFaaCurrencies: next,
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
            <Clock className="h-5 w-5 text-primary" />
            Currency Preferences
          </span>
        </CardTitle>
        <CardDescription>
          Control which currency rules are tracked and displayed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-3 cursor-pointer">
            <div>
              <p className="text-sm text-slate-200">FAA Currencies</p>
              <p className="text-xs text-slate-500">
                Show FAA currency rules (day/night passenger, IFR, flight review)
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={showFaa}
                disabled={saving}
                onChange={toggleFaa}
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
