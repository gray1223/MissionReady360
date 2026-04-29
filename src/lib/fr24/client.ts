/**
 * Server-side Flightradar24 API client.
 *
 * Reads the API key from process.env.FLIGHTRADAR24_API_KEY. Never exposes it
 * to the browser. Throws FR24NotConfiguredError if the key is missing so
 * route handlers can return a clean 503.
 *
 * API base + auth scheme per fr24api.flightradar24.com:
 *   - Base:  https://fr24api.flightradar24.com/api
 *   - Headers: Accept: application/json
 *              Accept-Version: v1
 *              Authorization: Bearer <key>
 */

import type {
  FR24FlightSummary,
  FR24FlightTrackEnvelope,
  FR24LivePosition,
  FR24TrackPoint,
} from "./types";

const FR24_BASE = "https://fr24api.flightradar24.com/api";

export class FR24NotConfiguredError extends Error {
  constructor() {
    super("FR24 API key not configured");
    this.name = "FR24NotConfiguredError";
  }
}

export class FR24RequestError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string, message?: string) {
    super(message ?? `FR24 ${status}: ${body.slice(0, 200)}`);
    this.name = "FR24RequestError";
    this.status = status;
    this.body = body;
  }
}

function getApiKey(): string {
  const key = process.env.FLIGHTRADAR24_API_KEY;
  if (!key) throw new FR24NotConfiguredError();
  return key;
}

async function fr24Get<T>(
  path: string,
  query: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const key = getApiKey();
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  const url = `${FR24_BASE}${path}${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Version": "v1",
      Authorization: `Bearer ${key}`,
    },
    // FR24 data refreshes constantly; do not cache through Next.
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new FR24RequestError(res.status, text);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new FR24RequestError(
      res.status,
      text,
      "FR24 returned non-JSON response",
    );
  }
}

interface FR24EnvelopeArray<T> {
  data?: T[];
}

interface FR24EnvelopeObject<T> {
  data?: T;
}

function unwrapArray<T>(env: FR24EnvelopeArray<T> | T[]): T[] {
  if (Array.isArray(env)) return env;
  return env.data ?? [];
}

/**
 * Search for flights by callsign within a datetime window.
 * Default window: previous 14 days through now.
 */
export async function searchFlightSummary(opts: {
  callsigns?: string[];
  registrations?: string[];
  flights?: string[];
  fromIso?: string;
  toIso?: string;
  limit?: number;
  full?: boolean;
}): Promise<FR24FlightSummary[]> {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400_000);
  const from =
    opts.fromIso ?? fourteenDaysAgo.toISOString().replace(/\.\d{3}Z$/, "Z");
  const to = opts.toIso ?? now.toISOString().replace(/\.\d{3}Z$/, "Z");

  const path = opts.full ? "/flight-summary/full" : "/flight-summary/light";
  const env = await fr24Get<FR24EnvelopeArray<FR24FlightSummary>>(path, {
    flight_datetime_from: from,
    flight_datetime_to: to,
    callsigns: opts.callsigns?.join(","),
    registrations: opts.registrations?.join(","),
    flights: opts.flights?.join(","),
    limit: opts.limit ?? 25,
    sort: "desc",
  });
  return unwrapArray(env);
}

/**
 * Get the position track for a single flight by FR24 ID (hex).
 *
 * The /flight-tracks endpoint returns an array of envelopes, each with a
 * nested `tracks` array. We flatten that to a single FR24TrackPoint[] for
 * the caller.
 */
export async function getFlightTracks(
  flightId: string,
): Promise<FR24TrackPoint[]> {
  const raw = await fr24Get<
    FR24FlightTrackEnvelope[] | FR24EnvelopeArray<FR24FlightTrackEnvelope>
  >("/flight-tracks", { flight_id: flightId });
  const envelopes = unwrapArray(raw);
  const out: FR24TrackPoint[] = [];
  for (const env of envelopes) {
    if (Array.isArray(env.tracks)) out.push(...env.tracks);
  }
  return out;
}

/** Live flight positions (for the tracking page). */
export async function getLivePositions(opts: {
  callsigns?: string[];
  registrations?: string[];
  flights?: string[];
  bounds?: string; // "north,south,west,east"
  limit?: number;
  full?: boolean;
}): Promise<FR24LivePosition[]> {
  const path = opts.full
    ? "/live/flight-positions/full"
    : "/live/flight-positions/light";
  const env = await fr24Get<FR24EnvelopeArray<FR24LivePosition>>(path, {
    callsigns: opts.callsigns?.join(","),
    registrations: opts.registrations?.join(","),
    flights: opts.flights?.join(","),
    bounds: opts.bounds,
    limit: opts.limit ?? 25,
  });
  return unwrapArray(env);
}

/** Static airport metadata (used for ICAO -> name lookup). */
export async function getAirportLight(code: string): Promise<{
  icao?: string;
  iata?: string;
  name?: string;
  city?: string;
  country?: { code?: string; name?: string };
  [key: string]: unknown;
}> {
  const env = await fr24Get<FR24EnvelopeObject<Record<string, unknown>>>(
    `/static/airports/${encodeURIComponent(code)}/light`,
    {},
  );
  return (env.data ?? env) as Record<string, unknown>;
}
