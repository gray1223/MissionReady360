export type FaaRatingId =
  | "ppl"
  | "instrument"
  | "cpl"
  | "atp"
  | "ratp_military"
  | "ratp_bachelors"
  | "ratp_associates";

export interface RatingRequirement {
  id: string;
  label: string;
  required: number;
  field: keyof FlightTotals;
  excludeSimulator?: boolean;
}

export interface FaaRating {
  id: FaaRatingId;
  name: string;
  shortName: string;
  regulation: string;
  group: "certificate" | "rating" | "atp";
  requirements: RatingRequirement[];
}

/** Fields we aggregate from the flights table */
export interface FlightTotals {
  total_time: number;
  pic_time: number;
  xc_time: number;
  night_time: number;
  instrument_time: number;
  instrument_time_no_sim: number;
  solo_time: number;
  dual_received_time: number;
  solo_xc_time: number;
  pic_xc_time: number;
}

export const FAA_RATINGS: FaaRating[] = [
  {
    id: "ppl",
    name: "Private Pilot License",
    shortName: "PPL",
    regulation: "14 CFR 61.109",
    group: "certificate",
    requirements: [
      { id: "ppl_total", label: "Total Time", required: 40, field: "total_time" },
      { id: "ppl_dual", label: "Dual Received", required: 20, field: "dual_received_time" },
      { id: "ppl_solo", label: "Solo", required: 10, field: "solo_time" },
      { id: "ppl_solo_xc", label: "Solo Cross-Country", required: 5, field: "solo_xc_time" },
      { id: "ppl_night", label: "Night", required: 3, field: "night_time" },
      { id: "ppl_instrument", label: "Instrument", required: 3, field: "instrument_time" },
    ],
  },
  {
    id: "instrument",
    name: "Instrument Rating",
    shortName: "IR",
    regulation: "14 CFR 61.65",
    group: "rating",
    requirements: [
      { id: "ir_pic_xc", label: "PIC Cross-Country", required: 50, field: "pic_xc_time" },
      { id: "ir_instrument", label: "Instrument", required: 40, field: "instrument_time" },
    ],
  },
  {
    id: "cpl",
    name: "Commercial Pilot License",
    shortName: "CPL",
    regulation: "14 CFR 61.129",
    group: "certificate",
    requirements: [
      { id: "cpl_total", label: "Total Time", required: 250, field: "total_time" },
      { id: "cpl_pic", label: "PIC", required: 100, field: "pic_time" },
      { id: "cpl_pic_xc", label: "PIC Cross-Country", required: 50, field: "pic_xc_time" },
      { id: "cpl_dual", label: "Dual Received", required: 20, field: "dual_received_time" },
    ],
  },
  {
    id: "atp",
    name: "Airline Transport Pilot",
    shortName: "ATP",
    regulation: "14 CFR 61.159",
    group: "atp",
    requirements: [
      { id: "atp_total", label: "Total Time", required: 1500, field: "total_time" },
      { id: "atp_pic", label: "PIC", required: 250, field: "pic_time" },
      { id: "atp_xc", label: "Cross-Country", required: 500, field: "xc_time" },
      { id: "atp_night", label: "Night", required: 100, field: "night_time" },
      { id: "atp_instrument", label: "Instrument (no sim)", required: 75, field: "instrument_time_no_sim" },
    ],
  },
  {
    id: "ratp_military",
    name: "R-ATP (Military)",
    shortName: "R-ATP Mil",
    regulation: "14 CFR 61.160",
    group: "atp",
    requirements: [
      { id: "ratp_mil_total", label: "Total Time", required: 750, field: "total_time" },
      { id: "ratp_mil_xc", label: "Cross-Country", required: 200, field: "xc_time" },
      { id: "ratp_mil_night", label: "Night", required: 100, field: "night_time" },
      { id: "ratp_mil_instrument", label: "Instrument (no sim)", required: 75, field: "instrument_time_no_sim" },
    ],
  },
  {
    id: "ratp_bachelors",
    name: "R-ATP (Bachelor's Degree)",
    shortName: "R-ATP BS",
    regulation: "14 CFR 61.160",
    group: "atp",
    requirements: [
      { id: "ratp_bs_total", label: "Total Time", required: 1000, field: "total_time" },
      { id: "ratp_bs_xc", label: "Cross-Country", required: 200, field: "xc_time" },
      { id: "ratp_bs_night", label: "Night", required: 100, field: "night_time" },
      { id: "ratp_bs_instrument", label: "Instrument (no sim)", required: 75, field: "instrument_time_no_sim" },
    ],
  },
  {
    id: "ratp_associates",
    name: "R-ATP (Associate's Degree)",
    shortName: "R-ATP AS",
    regulation: "14 CFR 61.160",
    group: "atp",
    requirements: [
      { id: "ratp_as_total", label: "Total Time", required: 1250, field: "total_time" },
      { id: "ratp_as_xc", label: "Cross-Country", required: 200, field: "xc_time" },
      { id: "ratp_as_night", label: "Night", required: 100, field: "night_time" },
      { id: "ratp_as_instrument", label: "Instrument (no sim)", required: 75, field: "instrument_time_no_sim" },
    ],
  },
];
