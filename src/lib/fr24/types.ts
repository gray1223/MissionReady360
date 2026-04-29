// Defensive type definitions for the Flightradar24 REST API.
// Field names mirror what FR24 documents publicly; everything is optional
// because field availability varies by tier and we want to fail open.

export interface FR24FlightSummary {
  fr24_id?: string;
  flight?: string;             // flight number, e.g. "AA123"
  callsign?: string;           // ATC callsign, e.g. "AAL123"
  operated_as?: string;        // airline ICAO, e.g. "AAL"
  painted_as?: string;         // brand operating, may differ from operated_as
  type?: string;               // aircraft ICAO type, e.g. "B738"
  reg?: string;                // tail / registration, e.g. "N123AA"
  orig_icao?: string;
  dest_icao?: string;
  orig_iata?: string;
  dest_iata?: string;
  datetime_takeoff?: string;   // ISO 8601
  datetime_landed?: string;    // ISO 8601 — FR24 uses past tense
  dest_icao_actual?: string;   // diversion / actual landing
  duration?: number;           // seconds (in /full responses)
  hex?: string;                // ICAO mode-S hex
  first_seen?: string;
  last_seen?: string;
  flight_ended?: boolean;
  // Optional convenience fields
  flight_time?: number;        // seconds
  // Anything FR24 returns we don't care about lands here:
  [key: string]: unknown;
}

// Live position fields — verified against /live/flight-positions/full.
// FR24 uses `alt`, `gspeed`, `vspeed`, `track` here (same as flight-tracks).
export interface FR24LivePosition {
  fr24_id?: string;
  flight?: string | null;
  callsign?: string | null;
  reg?: string | null;
  type?: string | null;
  hex?: string | null;
  lat?: number;
  lon?: number;
  alt?: number;                // feet MSL
  gspeed?: number;             // ground speed, knots
  vspeed?: number;             // vertical speed, ft/min
  track?: number;              // heading / track, degrees true
  squawk?: string;
  timestamp?: string;          // ISO 8601
  source?: string;
  painted_as?: string | null;
  operating_as?: string | null;
  orig_iata?: string | null;
  dest_iata?: string | null;
  orig_icao?: string | null;
  dest_icao?: string | null;
  eta?: string | null;
  [key: string]: unknown;
}

// Field names in /flight-tracks responses (verified against the live API):
//   alt, gspeed, vspeed, track (heading)  — NOT altitude/ground_speed/etc.
export interface FR24TrackPoint {
  timestamp?: string;          // ISO 8601
  lat?: number;
  lon?: number;
  alt?: number;                // feet MSL
  gspeed?: number;             // ground speed, knots
  vspeed?: number;             // vertical speed, ft/min
  track?: number;              // heading / track, degrees true
  squawk?: string;
  callsign?: string;
  source?: string;
  [key: string]: unknown;
}

// Shape of one element in the /flight-tracks response array
export interface FR24FlightTrackEnvelope {
  fr24_id?: string;
  tracks?: FR24TrackPoint[];
}

// Compact track-point format we store in flights.track_log JSONB
export interface CompactTrackPoint {
  t: string;   // ISO timestamp
  lat: number;
  lon: number;
  alt?: number;
  gs?: number;
  hdg?: number;
  vs?: number;
}

export function compactTrackPoint(p: FR24TrackPoint): CompactTrackPoint | null {
  if (
    typeof p.lat !== "number" ||
    typeof p.lon !== "number" ||
    !p.timestamp
  ) {
    return null;
  }
  const out: CompactTrackPoint = {
    t: p.timestamp,
    lat: p.lat,
    lon: p.lon,
  };
  if (typeof p.alt === "number") out.alt = p.alt;
  if (typeof p.gspeed === "number") out.gs = p.gspeed;
  if (typeof p.track === "number") out.hdg = p.track;
  if (typeof p.vspeed === "number") out.vs = p.vspeed;
  return out;
}
