import { z } from "zod";

const approachSchema = z.object({
  type: z.string().min(1, "Approach type required"),
  runway: z.string().optional().default(""),
  airport: z.string().optional().default(""),
});

const crewMemberSchema = z.object({
  name: z.string().min(1, "Name required"),
  position: z.string().min(1, "Position required"),
  callsign: z.string().optional(),
});

export const flightSchema = z.object({
  // Basic
  flight_date: z.string().min(1, "Date is required"),
  aircraft_type_id: z.string().optional().nullable(),
  tail_number: z.string().optional().default(""),
  departure_icao: z.string().optional().default(""),
  arrival_icao: z.string().optional().default(""),
  route: z.string().optional().default(""),
  remarks: z.string().optional().default(""),

  // Military
  sortie_type: z.string().optional().nullable(),
  mission_number: z.string().optional().default(""),
  mission_symbol: z.string().optional().default(""),
  crew_position: z.string().optional().nullable(),
  flight_condition: z.enum(["day", "night", "nvg", "mixed"]).default("day"),
  crew_members: z.array(crewMemberSchema).default([]),

  // Time (decimal hours)
  total_time: z.coerce.number().min(0).default(0),
  pilot_time: z.coerce.number().min(0).default(0),
  copilot_time: z.coerce.number().min(0).default(0),
  instructor_time: z.coerce.number().min(0).default(0),
  evaluator_time: z.coerce.number().min(0).default(0),
  night_time: z.coerce.number().min(0).default(0),
  nvg_time: z.coerce.number().min(0).default(0),
  instrument_time: z.coerce.number().min(0).default(0),
  sim_instrument_time: z.coerce.number().min(0).default(0),

  // FAA
  pic_time: z.coerce.number().min(0).default(0),
  sic_time: z.coerce.number().min(0).default(0),
  xc_time: z.coerce.number().min(0).default(0),
  solo_time: z.coerce.number().min(0).default(0),
  dual_received_time: z.coerce.number().min(0).default(0),

  // Landings
  day_landings: z.coerce.number().int().min(0).default(0),
  night_landings: z.coerce.number().int().min(0).default(0),
  nvg_landings: z.coerce.number().int().min(0).default(0),
  full_stop_landings: z.coerce.number().int().min(0).default(0),
  touch_and_go_landings: z.coerce.number().int().min(0).default(0),
  carrier_traps: z.coerce.number().int().min(0).default(0),
  carrier_bolters: z.coerce.number().int().min(0).default(0),

  // Approaches
  approaches: z.array(approachSchema).default([]),

  // Mission
  formation_position: z.string().optional().nullable(),
  formation_type: z.string().optional().default(""),
  weapons_events: z.array(z.record(z.unknown())).default([]),
  air_refueling_type: z.string().optional().nullable(),
  air_refueling_contacts: z.coerce.number().int().min(0).default(0),
  airdrop_events: z.array(z.record(z.unknown())).default([]),
  low_level_time: z.coerce.number().min(0).default(0),
  low_level_type: z.string().optional().default(""),
  combat_time: z.coerce.number().min(0).default(0),
  combat_sorties: z.coerce.number().int().min(0).default(0),

  // Mode
  is_military_flight: z.boolean().default(true),

  // Simulator
  is_simulator: z.boolean().default(false),
  simulator_type: z.string().optional().default(""),
});

export type FlightFormData = z.infer<typeof flightSchema>;

export const flightDefaults: FlightFormData = {
  flight_date: new Date().toISOString().split("T")[0],
  aircraft_type_id: null,
  tail_number: "",
  departure_icao: "",
  arrival_icao: "",
  route: "",
  remarks: "",
  sortie_type: null,
  mission_number: "",
  mission_symbol: "",
  crew_position: null,
  flight_condition: "day",
  crew_members: [],
  total_time: 0,
  pilot_time: 0,
  copilot_time: 0,
  instructor_time: 0,
  evaluator_time: 0,
  night_time: 0,
  nvg_time: 0,
  instrument_time: 0,
  sim_instrument_time: 0,
  pic_time: 0,
  sic_time: 0,
  xc_time: 0,
  solo_time: 0,
  dual_received_time: 0,
  day_landings: 0,
  night_landings: 0,
  nvg_landings: 0,
  full_stop_landings: 0,
  touch_and_go_landings: 0,
  carrier_traps: 0,
  carrier_bolters: 0,
  approaches: [],
  formation_position: null,
  formation_type: "",
  weapons_events: [],
  air_refueling_type: null,
  air_refueling_contacts: 0,
  airdrop_events: [],
  low_level_time: 0,
  low_level_type: "",
  combat_time: 0,
  combat_sorties: 0,
  is_military_flight: true,
  is_simulator: false,
  simulator_type: "",
};
