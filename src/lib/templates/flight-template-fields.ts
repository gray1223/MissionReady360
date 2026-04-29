/**
 * Whitelist of FlightFormData fields that participate in a saved template.
 *
 * Excludes per-flight values that should never be copied: date, mission_number,
 * crew_members, approaches, weapons_events, airdrop_events, debrief_items,
 * upt_grades, remarks.
 */

import type { FlightFormData } from "@/lib/flights/validation";

export const TEMPLATE_FIELDS = [
  "aircraft_type_id",
  "tail_number",
  "departure_icao",
  "arrival_icao",
  "route",
  "sortie_type",
  "mission_symbol",
  "crew_position",
  "flight_condition",
  "total_time",
  "pilot_time",
  "copilot_time",
  "instructor_time",
  "evaluator_time",
  "night_time",
  "nvg_time",
  "instrument_time",
  "sim_instrument_time",
  "pic_time",
  "sic_time",
  "xc_time",
  "solo_time",
  "dual_received_time",
  "day_landings",
  "night_landings",
  "nvg_landings",
  "full_stop_landings",
  "touch_and_go_landings",
  "carrier_traps",
  "carrier_bolters",
  "formation_position",
  "formation_type",
  "air_refueling_type",
  "air_refueling_contacts",
  "low_level_time",
  "low_level_type",
  "combat_time",
  "combat_sorties",
  "is_military_flight",
  "is_simulator",
  "simulator_type",
] as const satisfies readonly (keyof FlightFormData)[];

export type TemplateField = (typeof TEMPLATE_FIELDS)[number];

export type FlightTemplatePayload = Partial<
  Pick<FlightFormData, TemplateField>
>;

export interface FlightTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  payload: FlightTemplatePayload;
  created_at: string;
  updated_at: string;
}

export function pickTemplatePayload(
  values: FlightFormData,
): FlightTemplatePayload {
  const out: Record<string, unknown> = {};
  for (const key of TEMPLATE_FIELDS) {
    const v = values[key];
    if (v !== undefined && v !== null && v !== "") {
      out[key] = v;
    }
  }
  return out as FlightTemplatePayload;
}
