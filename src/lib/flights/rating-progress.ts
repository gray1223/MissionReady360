import {
  FAA_RATINGS,
  type FaaRating,
  type FaaRatingId,
  type FlightTotals,
  type RatingRequirement,
} from "@/lib/constants/faa-ratings";
import type { PriorHoursInput } from "@/lib/types/database";
import { priorHoursToTotals, mergeFlightTotals } from "./prior-hours";

export interface RequirementProgress {
  requirement: RatingRequirement;
  achieved: number;
  achievedFromPrior: number;
  percent: number;
}

export interface RatingProgress {
  rating: FaaRating;
  requirements: RequirementProgress[];
  overallPercent: number;
}

interface FlightRow {
  total_time: number;
  pic_time: number;
  xc_time: number;
  night_time: number;
  instrument_time: number;
  sim_instrument_time: number;
  solo_time: number;
  dual_received_time: number;
  is_simulator: boolean;
}

/**
 * Compute career totals from an array of flight rows.
 * Derives solo_xc_time, pic_xc_time, and instrument_time_no_sim.
 */
function computeTotals(flights: FlightRow[]): FlightTotals {
  const totals: FlightTotals = {
    total_time: 0,
    pic_time: 0,
    xc_time: 0,
    night_time: 0,
    instrument_time: 0,
    instrument_time_no_sim: 0,
    solo_time: 0,
    dual_received_time: 0,
    solo_xc_time: 0,
    pic_xc_time: 0,
  };

  for (const f of flights) {
    const total = Number(f.total_time) || 0;
    const pic = Number(f.pic_time) || 0;
    const xc = Number(f.xc_time) || 0;
    const night = Number(f.night_time) || 0;
    const instrument = Number(f.instrument_time) || 0;
    const simInstrument = Number(f.sim_instrument_time) || 0;
    const solo = Number(f.solo_time) || 0;
    const dual = Number(f.dual_received_time) || 0;
    const isSim = Boolean(f.is_simulator);

    totals.total_time += total;
    totals.pic_time += pic;
    totals.xc_time += xc;
    totals.night_time += night;
    totals.instrument_time += instrument + simInstrument;
    totals.solo_time += solo;
    totals.dual_received_time += dual;

    // Instrument time excluding simulator devices
    if (!isSim) {
      totals.instrument_time_no_sim += instrument;
    }

    // Cross-country while solo
    if (solo > 0 && xc > 0) {
      totals.solo_xc_time += Math.min(solo, xc);
    }

    // Cross-country while PIC
    if (pic > 0 && xc > 0) {
      totals.pic_xc_time += Math.min(pic, xc);
    }
  }

  return totals;
}

/**
 * Compute progress toward tracked FAA ratings.
 * Optional priorHours are merged into flight totals for rating progress
 * (but do NOT affect currency, which is computed separately via RPC).
 */
export function computeRatingProgress(
  flights: FlightRow[],
  trackedRatingIds: string[],
  priorHours?: PriorHoursInput
): RatingProgress[] {
  if (trackedRatingIds.length === 0) return [];

  const flightTotals = computeTotals(flights);
  const priorTotals = priorHours ? priorHoursToTotals(priorHours) : null;
  const totals = priorTotals
    ? mergeFlightTotals(flightTotals, priorTotals)
    : flightTotals;

  return trackedRatingIds
    .map((id) => FAA_RATINGS.find((r) => r.id === id))
    .filter((r): r is FaaRating => r !== undefined)
    .map((rating) => {
      const requirements = rating.requirements.map((req) => {
        const achieved = totals[req.field];
        const achievedFromPrior = priorTotals ? priorTotals[req.field] : 0;
        const percent = Math.min(Math.round((achieved / req.required) * 100), 100);
        return { requirement: req, achieved, achievedFromPrior, percent };
      });

      // Overall = minimum of all requirements (all must be met)
      const overallPercent =
        requirements.length > 0
          ? Math.min(...requirements.map((r) => r.percent))
          : 0;

      return { rating, requirements, overallPercent };
    });
}
