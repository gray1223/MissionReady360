import {
  FAA_RATINGS,
  type FlightTotals,
} from "@/lib/constants/faa-ratings";
import type { PriorHoursInput } from "@/lib/types/database";

/**
 * Convert user-entered prior hours into a FlightTotals object.
 * instrument_time = actual + sim, instrument_time_no_sim = actual only.
 */
export function priorHoursToTotals(input: PriorHoursInput): FlightTotals {
  const actual = input.instrument_actual ?? 0;
  const sim = input.instrument_sim ?? 0;

  return {
    total_time: input.total_time ?? 0,
    pic_time: input.pic_time ?? 0,
    xc_time: input.xc_time ?? 0,
    night_time: input.night_time ?? 0,
    instrument_time: actual + sim,
    instrument_time_no_sim: actual,
    solo_time: input.solo_time ?? 0,
    dual_received_time: input.dual_received_time ?? 0,
    solo_xc_time: input.solo_xc_time ?? 0,
    pic_xc_time: input.pic_xc_time ?? 0,
  };
}

/**
 * Add two FlightTotals together field-by-field.
 */
export function mergeFlightTotals(
  a: FlightTotals,
  b: FlightTotals
): FlightTotals {
  return {
    total_time: a.total_time + b.total_time,
    pic_time: a.pic_time + b.pic_time,
    xc_time: a.xc_time + b.xc_time,
    night_time: a.night_time + b.night_time,
    instrument_time: a.instrument_time + b.instrument_time,
    instrument_time_no_sim: a.instrument_time_no_sim + b.instrument_time_no_sim,
    solo_time: a.solo_time + b.solo_time,
    dual_received_time: a.dual_received_time + b.dual_received_time,
    solo_xc_time: a.solo_xc_time + b.solo_xc_time,
    pic_xc_time: a.pic_xc_time + b.pic_xc_time,
  };
}

/** Maps FlightTotals fields to PriorHoursInput keys and labels */
const FIELD_MAP: Record<
  keyof FlightTotals,
  { key: keyof PriorHoursInput; label: string }[]
> = {
  total_time: [{ key: "total_time", label: "Total Time" }],
  pic_time: [{ key: "pic_time", label: "PIC Time" }],
  xc_time: [{ key: "xc_time", label: "Cross-Country Time" }],
  night_time: [{ key: "night_time", label: "Night Time" }],
  instrument_time: [
    { key: "instrument_actual", label: "Instrument (Actual)" },
    { key: "instrument_sim", label: "Instrument (Sim)" },
  ],
  instrument_time_no_sim: [
    { key: "instrument_actual", label: "Instrument (Actual)" },
  ],
  solo_time: [{ key: "solo_time", label: "Solo Time" }],
  dual_received_time: [
    { key: "dual_received_time", label: "Dual Received Time" },
  ],
  solo_xc_time: [{ key: "solo_xc_time", label: "Solo Cross-Country Time" }],
  pic_xc_time: [{ key: "pic_xc_time", label: "PIC Cross-Country Time" }],
};

export interface PriorHoursField {
  key: keyof PriorHoursInput;
  label: string;
}

/**
 * Given the set of tracked rating IDs, return the de-duped list of
 * PriorHoursInput fields (with labels) the user should fill in.
 */
export function getRelevantPriorHoursFields(
  trackedRatingIds: string[]
): PriorHoursField[] {
  const seen = new Set<keyof PriorHoursInput>();
  const result: PriorHoursField[] = [];

  for (const ratingId of trackedRatingIds) {
    const rating = FAA_RATINGS.find((r) => r.id === ratingId);
    if (!rating) continue;

    for (const req of rating.requirements) {
      const entries = FIELD_MAP[req.field] || [];
      for (const entry of entries) {
        if (!seen.has(entry.key)) {
          seen.add(entry.key);
          result.push(entry);
        }
      }
    }
  }

  return result;
}
