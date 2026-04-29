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
  datetime_landing?: string;   // ISO 8601
  hex?: string;                // ICAO mode-S hex
  first_seen?: string;
  last_seen?: string;
  flight_ended?: boolean;
  // Optional convenience fields
  flight_time?: number;        // seconds
  // Anything FR24 returns we don't care about lands here:
  [key: string]: unknown;
}

export interface FR24LivePosition {
  fr24_id?: string;
  flight?: string;
  callsign?: string;
  reg?: string;
  type?: string;
  lat?: number;
  lon?: number;
  altitude?: number;           // feet MSL
  ground_speed?: number;       // knots
  vertical_speed?: number;     // ft/min
  heading?: number;            // degrees true
  squawk?: string;
  timestamp?: string;          // ISO 8601
  orig_iata?: string;
  dest_iata?: string;
  orig_icao?: string;
  dest_icao?: string;
  [key: string]: unknown;
}

export interface FR24TrackPoint {
  timestamp?: string;          // ISO 8601
  lat?: number;
  lon?: number;
  altitude?: number;           // feet MSL
  ground_speed?: number;       // knots
  vertical_speed?: number;     // ft/min
  heading?: number;            // degrees true
  squawk?: string;
  source?: string;
  [key: string]: unknown;
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
  if (typeof p.altitude === "number") out.alt = p.altitude;
  if (typeof p.ground_speed === "number") out.gs = p.ground_speed;
  if (typeof p.heading === "number") out.hdg = p.heading;
  if (typeof p.vertical_speed === "number") out.vs = p.vertical_speed;
  return out;
}
