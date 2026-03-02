import type { Flight, AircraftType } from "@/lib/types/database";
import { format } from "date-fns";

export interface FlightColumn {
  key: string;
  header: string;
  group: string;
  format: (flight: Flight & { aircraft_type?: AircraftType | null }) => string;
}

const num = (v: number | null | undefined) =>
  v && Number(v) > 0 ? Number(v).toFixed(1) : "";
const int = (v: number | null | undefined) =>
  v && Number(v) > 0 ? String(Number(v)) : "";

export const ALL_COLUMNS: FlightColumn[] = [
  // Core
  {
    key: "date",
    header: "Date",
    group: "Core",
    format: (f) => format(new Date(f.flight_date), "MM/dd/yyyy"),
  },
  {
    key: "aircraft",
    header: "Aircraft",
    group: "Core",
    format: (f) => f.aircraft_type?.designation || "",
  },
  {
    key: "tail_number",
    header: "Tail #",
    group: "Core",
    format: (f) => f.tail_number || "",
  },
  {
    key: "departure",
    header: "From",
    group: "Core",
    format: (f) => f.departure_icao || "",
  },
  {
    key: "arrival",
    header: "To",
    group: "Core",
    format: (f) => f.arrival_icao || "",
  },
  {
    key: "route",
    header: "Route",
    group: "Core",
    format: (f) => f.route || "",
  },
  {
    key: "remarks",
    header: "Remarks",
    group: "Core",
    format: (f) => f.remarks || "",
  },

  // Time
  {
    key: "total_time",
    header: "Total",
    group: "Time",
    format: (f) => num(f.total_time),
  },
  {
    key: "pilot_time",
    header: "Pilot",
    group: "Time",
    format: (f) => num(f.pilot_time),
  },
  {
    key: "copilot_time",
    header: "Copilot",
    group: "Time",
    format: (f) => num(f.copilot_time),
  },
  {
    key: "pic_time",
    header: "PIC",
    group: "Time",
    format: (f) => num(f.pic_time),
  },
  {
    key: "sic_time",
    header: "SIC",
    group: "Time",
    format: (f) => num(f.sic_time),
  },
  {
    key: "solo_time",
    header: "Solo",
    group: "Time",
    format: (f) => num(f.solo_time),
  },
  {
    key: "dual_received_time",
    header: "Dual Rcvd",
    group: "Time",
    format: (f) => num(f.dual_received_time),
  },
  {
    key: "instructor_time",
    header: "Instructor",
    group: "Time",
    format: (f) => num(f.instructor_time),
  },
  {
    key: "evaluator_time",
    header: "Evaluator",
    group: "Time",
    format: (f) => num(f.evaluator_time),
  },
  {
    key: "night_time",
    header: "Night",
    group: "Time",
    format: (f) => num(f.night_time),
  },
  {
    key: "nvg_time",
    header: "NVG",
    group: "Time",
    format: (f) => num(f.nvg_time),
  },
  {
    key: "instrument_time",
    header: "Inst (Actual)",
    group: "Time",
    format: (f) => num(f.instrument_time),
  },
  {
    key: "sim_instrument_time",
    header: "Inst (Sim)",
    group: "Time",
    format: (f) => num(f.sim_instrument_time),
  },
  {
    key: "xc_time",
    header: "XC",
    group: "Time",
    format: (f) => num(f.xc_time),
  },

  // Landings
  {
    key: "day_landings",
    header: "Day Ldg",
    group: "Landings",
    format: (f) => int(f.day_landings),
  },
  {
    key: "night_landings",
    header: "Night Ldg",
    group: "Landings",
    format: (f) => int(f.night_landings),
  },
  {
    key: "nvg_landings",
    header: "NVG Ldg",
    group: "Landings",
    format: (f) => int(f.nvg_landings),
  },
  {
    key: "full_stop_landings",
    header: "Full Stop",
    group: "Landings",
    format: (f) => int(f.full_stop_landings),
  },
  {
    key: "touch_and_go_landings",
    header: "T&G",
    group: "Landings",
    format: (f) => int(f.touch_and_go_landings),
  },
  {
    key: "carrier_traps",
    header: "Traps",
    group: "Landings",
    format: (f) => int(f.carrier_traps),
  },
  {
    key: "carrier_bolters",
    header: "Bolters",
    group: "Landings",
    format: (f) => int(f.carrier_bolters),
  },

  // Mission
  {
    key: "sortie_type",
    header: "Sortie Type",
    group: "Mission",
    format: (f) =>
      f.sortie_type ? f.sortie_type.replace(/_/g, " ") : "",
  },
  {
    key: "mission_number",
    header: "Mission #",
    group: "Mission",
    format: (f) => f.mission_number || "",
  },
  {
    key: "crew_position",
    header: "Crew Pos",
    group: "Mission",
    format: (f) =>
      f.crew_position ? f.crew_position.replace(/_/g, " ") : "",
  },
  {
    key: "flight_condition",
    header: "Condition",
    group: "Mission",
    format: (f) => f.flight_condition || "",
  },
];

export const DEFAULT_COLUMN_KEYS = [
  "date",
  "aircraft",
  "tail_number",
  "departure",
  "arrival",
  "total_time",
  "pic_time",
  "sic_time",
  "night_time",
  "instrument_time",
  "xc_time",
  "day_landings",
  "night_landings",
];

export function getColumnGroups(): { group: string; columns: FlightColumn[] }[] {
  const map = new Map<string, FlightColumn[]>();
  for (const col of ALL_COLUMNS) {
    if (!map.has(col.group)) map.set(col.group, []);
    map.get(col.group)!.push(col);
  }
  return Array.from(map.entries()).map(([group, columns]) => ({
    group,
    columns,
  }));
}
