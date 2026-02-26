"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { AircraftType, QualificationLevel } from "@/lib/types/database";

const QUAL_LEVELS: { value: QualificationLevel; label: string }[] = [
  { value: "initial_qual", label: "Initial Qual" },
  { value: "basic", label: "Basic" },
  { value: "senior", label: "Senior" },
  { value: "instructor", label: "Instructor" },
  { value: "evaluator", label: "Evaluator" },
  { value: "flight_lead", label: "Flight Lead" },
  { value: "mission_commander", label: "Mission Commander" },
];

interface AddAircraftButtonProps {
  availableAircraft: AircraftType[];
  userId: string;
  existingAircraftIds: string[];
}

export function AddAircraftButton({
  availableAircraft,
  userId,
  existingAircraftIds,
}: AddAircraftButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qualLevel, setQualLevel] = useState<QualificationLevel>("basic");
  const [setPrimary, setSetPrimary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const existing = new Set(existingAircraftIds);
  const filtered = useMemo(() => {
    return availableAircraft.filter(
      (a) =>
        !existing.has(a.id) &&
        (a.designation.toLowerCase().includes(search.toLowerCase()) ||
          a.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [availableAircraft, search, existing]);

  const selectedAircraft = availableAircraft.find((a) => a.id === selectedId);

  async function handleAdd() {
    if (!selectedId) return;
    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from("user_aircraft")
        .insert({
          user_id: userId,
          aircraft_type_id: selectedId,
          qualification_level: qualLevel,
        });
      if (insertError) throw insertError;

      if (setPrimary) {
        await supabase
          .from("profiles")
          .update({ primary_aircraft_id: selectedId })
          .eq("id", userId);
      }

      setOpen(false);
      setSelectedId(null);
      setSearch("");
      setQualLevel("basic");
      setSetPrimary(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add aircraft");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="primary" size="md" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Aircraft
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Aircraft"
        className="max-w-md"
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search aircraft..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Aircraft list */}
          <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-slate-800 p-1">
            {filtered.length > 0 ? (
              filtered.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedId === a.id
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-slate-300 hover:bg-slate-800/50 border border-transparent"
                  }`}
                >
                  <span className="font-medium">{a.designation}</span>
                  <span className="text-slate-500"> — {a.name}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-sm text-slate-500">
                {search ? "No matching aircraft" : "All aircraft already added"}
              </p>
            )}
          </div>

          {selectedAircraft && (
            <>
              <Select
                label="Qualification Level"
                value={qualLevel}
                onChange={(e) =>
                  setQualLevel(e.target.value as QualificationLevel)
                }
                options={QUAL_LEVELS}
              />

              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={setPrimary}
                  onChange={(e) => setSetPrimary(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
                />
                Set as primary aircraft
              </label>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!selectedId}
              loading={saving}
            >
              Add Aircraft
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
