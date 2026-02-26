"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Cog, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import type { QualificationLevel } from "@/lib/types/database";

const QUAL_LEVELS: { value: QualificationLevel; label: string }[] = [
  { value: "initial_qual", label: "Initial Qual" },
  { value: "basic", label: "Basic" },
  { value: "senior", label: "Senior" },
  { value: "instructor", label: "Instructor" },
  { value: "evaluator", label: "Evaluator" },
  { value: "flight_lead", label: "Flight Lead" },
  { value: "mission_commander", label: "Mission Commander" },
];

interface UserAircraftRow {
  id: string;
  qualification_level: QualificationLevel;
  is_primary: boolean;
  aircraft_types: {
    id: string;
    designation: string;
    name: string;
    engine_count?: number;
    engine_type?: string | null;
  };
}

interface AircraftListProps {
  userAircraft: UserAircraftRow[];
  userId: string;
  primaryAircraftId: string | null;
}

export function AircraftList({
  userAircraft,
  userId,
  primaryAircraftId,
}: AircraftListProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<UserAircraftRow | null>(null);

  async function handleSetPrimary(aircraftTypeId: string) {
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ primary_aircraft_id: aircraftTypeId })
      .eq("id", userId);
    router.refresh();
  }

  async function handleQualChange(
    userAircraftId: string,
    level: QualificationLevel
  ) {
    const supabase = createClient();
    await supabase
      .from("user_aircraft")
      .update({ qualification_level: level })
      .eq("id", userAircraftId);
    router.refresh();
  }

  async function handleRemove(userAircraftId: string, aircraftTypeId: string) {
    setRemoving(userAircraftId);
    const supabase = createClient();
    await supabase.from("user_aircraft").delete().eq("id", userAircraftId);
    // If this was primary, clear it
    if (aircraftTypeId === primaryAircraftId) {
      await supabase
        .from("profiles")
        .update({ primary_aircraft_id: null })
        .eq("id", userId);
    }
    setConfirmRemove(null);
    setRemoving(null);
    router.refresh();
  }

  if (userAircraft.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 mb-4">
          <Cog className="h-8 w-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300">
          No aircraft added
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Add the aircraft types you are qualified to fly. This helps track
          type-specific currencies and requirements.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {userAircraft.map((ua) => {
          const isPrimary = ua.aircraft_types.id === primaryAircraftId;
          return (
            <div
              key={ua.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-slate-100">
                      {ua.aircraft_types.designation}
                    </h3>
                    {isPrimary && (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {ua.aircraft_types.name}
                  </p>
                  {ua.aircraft_types.engine_type && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ua.aircraft_types.engine_count}x {ua.aircraft_types.engine_type}
                    </p>
                  )}
                </div>
                <Badge variant="info">
                  {ua.qualification_level.replace(/_/g, " ")}
                </Badge>
              </div>

              <div>
                <Select
                  label="Qual Level"
                  value={ua.qualification_level}
                  onChange={(e) =>
                    handleQualChange(
                      ua.id,
                      e.target.value as QualificationLevel
                    )
                  }
                  options={QUAL_LEVELS}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                {!isPrimary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleSetPrimary(ua.aircraft_types.id)
                    }
                  >
                    <Star className="h-3.5 w-3.5" />
                    Set Primary
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => setConfirmRemove(ua)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Remove confirmation modal */}
      <Modal
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        title="Remove Aircraft"
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to remove{" "}
          <strong>{confirmRemove?.aircraft_types.designation}</strong> from your
          aircraft? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setConfirmRemove(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={!!removing}
            onClick={() =>
              confirmRemove &&
              handleRemove(confirmRemove.id, confirmRemove.aircraft_types.id)
            }
          >
            Remove
          </Button>
        </div>
      </Modal>
    </>
  );
}
