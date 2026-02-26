"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Save, Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleSection } from "./collapsible-section";
import { ApproachInput } from "./approach-input";
import { CrewInput } from "./crew-input";
import {
  flightSchema,
  flightDefaults,
  type FlightFormData,
} from "@/lib/flights/validation";
import {
  SORTIE_TYPES,
  CREW_POSITIONS,
  FLIGHT_CONDITIONS,
  FORMATION_POSITIONS,
} from "@/lib/constants/mission-symbols";
import type { AircraftType, Flight, FlightLogPreferences, LogbookMode } from "@/lib/types/database";

interface FlightFormProps {
  aircraft: AircraftType[];
  initialData?: Partial<Flight>;
  flightId?: string;
  preferences?: FlightLogPreferences;
  logbookMode?: LogbookMode;
}

export function FlightForm({ aircraft, initialData, flightId, preferences, logbookMode = "military" }: FlightFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!flightId;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlightFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(flightSchema) as any,
    defaultValues: initialData
      ? {
          ...flightDefaults,
          is_military_flight: logbookMode === "military",
          ...Object.fromEntries(
            Object.entries(initialData).map(([k, v]) => [k, v === null ? undefined : v])
          ),
        }
      : { ...flightDefaults, is_military_flight: logbookMode === "military" },
  });

  const selectedAircraftId = watch("aircraft_type_id");
  const selectedAircraft = aircraft.find((a) => a.id === selectedAircraftId);
  const isSim = watch("is_simulator");
  const isMilitaryFlight = watch("is_military_flight");
  const hiddenSections = new Set(preferences?.hiddenSections || []);

  // Auto-set is_military_flight when aircraft changes (only for new flights)
  useEffect(() => {
    if (!isEdit && selectedAircraft) {
      setValue("is_military_flight", selectedAircraft.is_military);
    }
  }, [selectedAircraftId, selectedAircraft, isEdit, setValue]);

  const aircraftOptions = aircraft.map((a) => ({
    value: a.id,
    label: `${a.designation} - ${a.name}`,
  }));

  async function onSubmit(data: FlightFormData) {
    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        ...data,
        user_id: user.id,
        aircraft_type_id: data.aircraft_type_id || null,
        sortie_type: data.sortie_type || null,
        crew_position: data.crew_position || null,
        formation_position: data.formation_position || null,
        air_refueling_type: data.air_refueling_type || null,
      };

      if (isEdit) {
        const { error: updateError } = await supabase
          .from("flights")
          .update(payload)
          .eq("id", flightId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("flights")
          .insert(payload);
        if (insertError) throw insertError;
      }

      router.push("/flights");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flight");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Basic Flight Info - Always open */}
      <CollapsibleSection title="Flight Info" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            {...register("flight_date")}
            label="Date"
            type="date"
            error={errors.flight_date?.message}
          />
          <Select
            {...register("aircraft_type_id")}
            label="Aircraft"
            options={aircraftOptions}
            placeholder="Select aircraft"
          />
          <Input
            {...register("tail_number")}
            label="Tail Number"
            placeholder="e.g., 89-0024"
          />
          <Input
            {...register("departure_icao")}
            label="Departure"
            placeholder="ICAO (e.g., KLUF)"
          />
          <Input
            {...register("arrival_icao")}
            label="Arrival"
            placeholder="ICAO (e.g., KNFL)"
          />
          <Input
            {...register("route")}
            label="Route"
            placeholder="e.g., KLUF MOA1 KNFL"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              {...register("is_military_flight")}
              className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
            />
            Military Flight
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              {...register("is_simulator")}
              className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
            />
            Simulator
          </label>
          {isSim && (
            <Input
              {...register("simulator_type")}
              placeholder="Sim type (e.g., FTD, FFS)"
              className="max-w-xs"
            />
          )}
        </div>
      </CollapsibleSection>

      {/* Military Mission Info — hidden for civilian flights */}
      {isMilitaryFlight && !hiddenSections.has("mission_details") && <CollapsibleSection title="Mission Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            {...register("sortie_type")}
            label="Sortie Type"
            options={SORTIE_TYPES}
            placeholder="Select type"
          />
          <Input
            {...register("mission_number")}
            label="Mission #"
            placeholder="e.g., RAZOR 11"
          />
          <Input
            {...register("mission_symbol")}
            label="Mission Symbol"
            placeholder="e.g., T1"
          />
          <Select
            {...register("crew_position")}
            label="Crew Position"
            options={CREW_POSITIONS}
            placeholder="Select position"
          />
          <Select
            {...register("flight_condition")}
            label="Flight Condition"
            options={FLIGHT_CONDITIONS}
          />
        </div>
        <div className="mt-4">
          <CrewInput control={control} register={register} />
        </div>
      </CollapsibleSection>}

      {/* Flight Time */}
      <CollapsibleSection title="Flight Time" defaultOpen>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Input
            {...register("total_time")}
            label="Total"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("pilot_time")}
            label="Pilot"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("copilot_time")}
            label="Copilot"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("instructor_time")}
            label="Instructor"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("evaluator_time")}
            label="Evaluator"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("night_time")}
            label="Night"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("nvg_time")}
            label="NVG"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("instrument_time")}
            label="Instrument (Actual)"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("sim_instrument_time")}
            label="Instrument (Sim)"
            type="number"
            step="0.1"
            min="0"
          />
        </div>
      </CollapsibleSection>

      {/* FAA Time */}
      {!hiddenSections.has("faa_time") && <CollapsibleSection title="FAA Time">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Input
            {...register("pic_time")}
            label="PIC"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("sic_time")}
            label="SIC"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("xc_time")}
            label="Cross Country"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("solo_time")}
            label="Solo"
            type="number"
            step="0.1"
            min="0"
          />
          <Input
            {...register("dual_received_time")}
            label="Dual Received"
            type="number"
            step="0.1"
            min="0"
          />
        </div>
      </CollapsibleSection>}

      {/* Landings */}
      {!hiddenSections.has("landings") && <CollapsibleSection title="Landings">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Input
            {...register("day_landings")}
            label="Day"
            type="number"
            min="0"
          />
          <Input
            {...register("night_landings")}
            label="Night"
            type="number"
            min="0"
          />
          <Input
            {...register("full_stop_landings")}
            label="Full Stop"
            type="number"
            min="0"
          />
          <Input
            {...register("touch_and_go_landings")}
            label="Touch & Go"
            type="number"
            min="0"
          />
          {selectedAircraft?.has_nvg && (
            <Input
              {...register("nvg_landings")}
              label="NVG"
              type="number"
              min="0"
            />
          )}
          {selectedAircraft?.has_carrier && (
            <>
              <Input
                {...register("carrier_traps")}
                label="Carrier Traps"
                type="number"
                min="0"
              />
              <Input
                {...register("carrier_bolters")}
                label="Bolters"
                type="number"
                min="0"
              />
            </>
          )}
        </div>
      </CollapsibleSection>}

      {/* Approaches */}
      {!hiddenSections.has("approaches") && <CollapsibleSection title="Approaches">
        <ApproachInput control={control} register={register} />
      </CollapsibleSection>}

      {/* Mission Specific - conditionally show based on aircraft capabilities, hidden for civilian flights */}
      {isMilitaryFlight && !hiddenSections.has("mission_specific") && selectedAircraft && (selectedAircraft.has_formation || selectedAircraft.has_weapons || selectedAircraft.has_air_refueling || selectedAircraft.has_airdrop || selectedAircraft.has_low_level) && (
        <CollapsibleSection title="Mission Specific">
          <div className="space-y-6">
            {selectedAircraft.has_formation && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">Formation</h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Select
                    {...register("formation_position")}
                    label="Position"
                    options={FORMATION_POSITIONS}
                    placeholder="Select position"
                  />
                  <Input
                    {...register("formation_type")}
                    label="Formation Type"
                    placeholder="e.g., 2-ship, 4-ship"
                  />
                </div>
              </div>
            )}

            {selectedAircraft.has_air_refueling && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">
                  Air Refueling
                </h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Select
                    {...register("air_refueling_type")}
                    label="Type"
                    options={[
                      { value: "boom", label: "Boom" },
                      { value: "drogue", label: "Drogue" },
                      { value: "both", label: "Both" },
                    ]}
                    placeholder="Select type"
                  />
                  <Input
                    {...register("air_refueling_contacts")}
                    label="Contacts"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            )}

            {selectedAircraft.has_low_level && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">Low Level</h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Input
                    {...register("low_level_time")}
                    label="Time"
                    type="number"
                    step="0.1"
                    min="0"
                  />
                  <Input
                    {...register("low_level_type")}
                    label="Type"
                    placeholder="e.g., VR, IR, SR"
                  />
                </div>
              </div>
            )}

            {selectedAircraft.has_tactical && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">Combat</h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Input
                    {...register("combat_time")}
                    label="Combat Time"
                    type="number"
                    step="0.1"
                    min="0"
                  />
                  <Input
                    {...register("combat_sorties")}
                    label="Combat Sorties"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Remarks */}
      {!hiddenSections.has("remarks") && <CollapsibleSection title="Remarks">
        <Textarea
          {...register("remarks")}
          placeholder="Additional notes about this flight..."
          rows={3}
        />
      </CollapsibleSection>}

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          <Save className="h-4 w-4" />
          {isEdit ? "Update Flight" : "Log Flight"}
        </Button>
      </div>
    </form>
  );
}
