"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Check } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  applySquadronPreset,
  clearSquadronPreset,
} from "@/app/(dashboard)/settings/actions";
import {
  getAllPresets,
  getPresetById,
  getPresetsForMode,
  type PresetMode,
} from "@/lib/presets/squadron-presets";
import type { FlightLogPreferences } from "@/lib/types/database";

interface SquadronPresetCardProps {
  preferences: FlightLogPreferences;
  userId: string;
  mode: PresetMode;
}

export function SquadronPresetCard({
  preferences,
  userId,
  mode,
}: SquadronPresetCardProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(
    preferences.presetId || "",
  );
  const [busy, setBusy] = useState(false);
  const [justApplied, setJustApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = useMemo(
    () =>
      mode === "civilian"
        ? getPresetsForMode("civilian")
        : getPresetsForMode("military"),
    [mode],
  );

  const currentPreset = preferences.presetId
    ? getPresetById(preferences.presetId)
    : undefined;

  const allPresets = getAllPresets();
  const currentIsCrossMode =
    currentPreset && currentPreset.mode !== mode
      ? currentPreset
      : undefined;

  async function handleApply() {
    if (!selectedId || busy) return;
    setBusy(true);
    setError(null);
    setJustApplied(false);
    const res = await applySquadronPreset(userId, selectedId);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setJustApplied(true);
    router.refresh();
    setTimeout(() => setJustApplied(false), 2500);
  }

  async function handleClear() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await clearSquadronPreset(userId);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSelectedId("");
    router.refresh();
  }

  const selectedPreset = selectedId
    ? allPresets.find((p) => p.id === selectedId)
    : undefined;
  const previewSections =
    selectedPreset?.preferences.hiddenSections ?? [];
  const previewUpt = selectedPreset?.preferences.uptEnabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Squadron Preset
          </span>
        </CardTitle>
        <CardDescription>
          Apply sensible defaults for your branch and airframe — visible form
          sections, UPT grading, and rating tracking — in one click. You can
          still override anything afterward.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentPreset && !currentIsCrossMode && (
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-emerald-300">
                  Active: {currentPreset.label}
                </p>
                <p className="mt-0.5 text-xs text-emerald-200/70">
                  {currentPreset.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={busy}
              >
                Clear
              </Button>
            </div>
          )}

          {currentIsCrossMode && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Active preset <strong>{currentIsCrossMode.label}</strong> belongs
              to a different logbook mode. Apply a preset below to switch.
            </div>
          )}

          <div>
            <label
              htmlFor="preset-select"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500"
            >
              Choose a preset
            </label>
            <select
              id="preset-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={busy}
            >
              <option value="">— Select a preset —</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {selectedPreset && (
            <div className="rounded-lg bg-slate-800/30 px-4 py-3 text-xs text-slate-300">
              <p className="font-medium text-slate-200">
                {selectedPreset.label}
              </p>
              <p className="mt-1 text-slate-400">
                {selectedPreset.description}
              </p>
              <ul className="mt-2 space-y-0.5 text-slate-400">
                <li>
                  Hidden sections:{" "}
                  <span className="text-slate-300">
                    {previewSections.length > 0
                      ? previewSections.join(", ")
                      : "none"}
                  </span>
                </li>
                <li>
                  UPT grading:{" "}
                  <span className="text-slate-300">
                    {previewUpt ? "enabled" : "disabled"}
                  </span>
                </li>
                {selectedPreset.preferences.trackedRatings && (
                  <li>
                    Tracked ratings:{" "}
                    <span className="text-slate-300">
                      {selectedPreset.preferences.trackedRatings.join(", ")}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              disabled={!selectedId || busy || selectedId === preferences.presetId}
            >
              {justApplied ? (
                <>
                  <Check className="h-4 w-4" />
                  Applied
                </>
              ) : (
                <>Apply preset</>
              )}
            </Button>
            <p className="text-xs text-slate-500">
              Applying overrides hidden sections, UPT grading, and rating
              tracking. Prior hours and other personal data stay.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
