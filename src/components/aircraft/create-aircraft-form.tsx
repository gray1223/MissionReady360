"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { BRANCHES } from "@/lib/constants/branches";
import { FAA_CATEGORIES, FAA_CLASSES, ENGINE_TYPES } from "@/lib/constants/aircraft";
import type { MilitaryBranch, EngineType, QualificationLevel } from "@/lib/types/database";

const QUAL_LEVELS: { value: QualificationLevel; label: string }[] = [
  { value: "initial_qual", label: "Initial Qual" },
  { value: "basic", label: "Basic" },
  { value: "senior", label: "Senior" },
  { value: "instructor", label: "Instructor" },
  { value: "evaluator", label: "Evaluator" },
  { value: "flight_lead", label: "Flight Lead" },
  { value: "mission_commander", label: "Mission Commander" },
];

interface CreateAircraftFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateAircraftForm({
  userId,
  onSuccess,
  onCancel,
}: CreateAircraftFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [designation, setDesignation] = useState("");
  const [name, setName] = useState("");
  const [isMilitary, setIsMilitary] = useState(false);
  const [branch, setBranch] = useState<MilitaryBranch | "">("");
  const [faaCategory, setFaaCategory] = useState("");
  const [faaClass, setFaaClass] = useState("");
  const [engineCount, setEngineCount] = useState("1");
  const [engineType, setEngineType] = useState<EngineType | "">("");
  const [qualLevel, setQualLevel] = useState<QualificationLevel>("basic");
  const [setPrimary, setSetPrimary] = useState(false);

  // Capability booleans
  const [hasNvg, setHasNvg] = useState(false);
  const [hasAirRefueling, setHasAirRefueling] = useState(false);
  const [hasWeapons, setHasWeapons] = useState(false);
  const [hasFormation, setHasFormation] = useState(false);
  const [hasAirdrop, setHasAirdrop] = useState(false);
  const [hasCarrier, setHasCarrier] = useState(false);
  const [hasTactical, setHasTactical] = useState(false);
  const [hasLowLevel, setHasLowLevel] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!designation.trim() || !name.trim()) {
      setError("Designation and name are required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const supabase = createClient();

      // Insert aircraft type
      const { data: aircraft, error: insertError } = await supabase
        .from("aircraft_types")
        .insert({
          designation: designation.trim(),
          name: name.trim(),
          is_military: isMilitary,
          branch: isMilitary && branch ? branch : null,
          faa_category: faaCategory || null,
          faa_class: faaClass || null,
          engine_count: parseInt(engineCount) || 1,
          engine_type: engineType || null,
          is_custom: true,
          created_by: userId,
          has_nvg: hasNvg,
          has_air_refueling: hasAirRefueling,
          has_weapons: hasWeapons,
          has_formation: hasFormation,
          has_airdrop: hasAirdrop,
          has_carrier: hasCarrier,
          has_tactical: hasTactical,
          has_low_level: hasLowLevel,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Add to user_aircraft
      if (aircraft) {
        const { error: uaError } = await supabase
          .from("user_aircraft")
          .insert({
            user_id: userId,
            aircraft_type_id: aircraft.id,
            qualification_level: qualLevel,
          });
        if (uaError) throw uaError;

        if (setPrimary) {
          await supabase
            .from("profiles")
            .update({ primary_aircraft_id: aircraft.id })
            .eq("id", userId);
        }
      }

      router.refresh();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create aircraft");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Designation"
          placeholder="e.g. C-172"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          required
        />
        <Input
          label="Name"
          placeholder="e.g. Skyhawk"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={isMilitary}
          onChange={(e) => {
            setIsMilitary(e.target.checked);
            if (!e.target.checked) setBranch("");
          }}
          className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
        />
        Military aircraft
      </label>

      {isMilitary && (
        <Select
          label="Branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value as MilitaryBranch)}
          options={[{ value: "", label: "Select branch..." }, ...BRANCHES]}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="FAA Category"
          value={faaCategory}
          onChange={(e) => setFaaCategory(e.target.value)}
          options={[{ value: "", label: "Select..." }, ...FAA_CATEGORIES]}
        />
        <Select
          label="FAA Class"
          value={faaClass}
          onChange={(e) => setFaaClass(e.target.value)}
          options={[{ value: "", label: "Select..." }, ...FAA_CLASSES]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Engine Count"
          type="number"
          min="1"
          max="8"
          value={engineCount}
          onChange={(e) => setEngineCount(e.target.value)}
        />
        <Select
          label="Engine Type"
          value={engineType}
          onChange={(e) => setEngineType(e.target.value as EngineType)}
          options={[{ value: "", label: "Select..." }, ...ENGINE_TYPES]}
        />
      </div>

      {isMilitary && (
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Capabilities</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["NVG", hasNvg, setHasNvg],
              ["Air Refueling", hasAirRefueling, setHasAirRefueling],
              ["Weapons", hasWeapons, setHasWeapons],
              ["Formation", hasFormation, setHasFormation],
              ["Airdrop", hasAirdrop, setHasAirdrop],
              ["Carrier", hasCarrier, setHasCarrier],
              ["Tactical", hasTactical, setHasTactical],
              ["Low Level", hasLowLevel, setHasLowLevel],
            ] as [string, boolean, (v: boolean) => void][]).map(([label, val, setter]) => (
              <label key={label} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => setter(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary h-3.5 w-3.5"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      <Select
        label="Qualification Level"
        value={qualLevel}
        onChange={(e) => setQualLevel(e.target.value as QualificationLevel)}
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

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Create & Add
        </Button>
      </div>
    </form>
  );
}
