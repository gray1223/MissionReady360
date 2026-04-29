"use client";

import { useState } from "react";
import { Radar, Loader2, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { FR24FlightSummary } from "@/lib/fr24/types";
import type { CompactTrackPoint } from "@/lib/fr24/types";
import type { AiParsePayload } from "@/lib/templates/ai-parse-fields";

interface Props {
  /** Apply pre-filled fields back to the flight form. */
  onApply: (payload: AiParsePayload) => void;
  /** Save the FR24 flight ID + compact track log on the form for submit. */
  onTrackImported: (info: {
    fr24FlightId: string | null;
    track: CompactTrackPoint[];
  }) => void;
}

function fmtIso(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function deriveFlightFields(f: FR24FlightSummary): AiParsePayload {
  const out: AiParsePayload = {};

  // Date — takeoff date
  if (f.datetime_takeoff) {
    out.flight_date = new Date(f.datetime_takeoff).toISOString().slice(0, 10);
  }

  if (typeof f.reg === "string" && f.reg) out.tail_number = f.reg.toUpperCase();
  if (typeof f.orig_icao === "string" && f.orig_icao)
    out.departure_icao = f.orig_icao.toUpperCase();
  // Prefer dest_icao_actual (diversion) over scheduled dest_icao
  const arrivalIcao =
    (typeof f.dest_icao_actual === "string" && f.dest_icao_actual) ||
    (typeof f.dest_icao === "string" && f.dest_icao) ||
    null;
  if (arrivalIcao) out.arrival_icao = arrivalIcao.toUpperCase();
  if (typeof f.orig_iata === "string" && typeof f.dest_iata === "string") {
    out.route = `${f.orig_iata}-${f.dest_iata}`.toUpperCase();
  } else if (
    typeof f.orig_icao === "string" &&
    typeof (f.dest_icao_actual ?? f.dest_icao) === "string"
  ) {
    out.route = `${f.orig_icao}-${f.dest_icao_actual ?? f.dest_icao}`.toUpperCase();
  }

  // Total time = (landed - takeoff) in decimal hours
  // FR24 uses `datetime_landed` (past tense), not `datetime_landing`.
  if (f.datetime_takeoff && f.datetime_landed) {
    const t1 = new Date(f.datetime_takeoff).getTime();
    const t2 = new Date(f.datetime_landed).getTime();
    if (Number.isFinite(t1) && Number.isFinite(t2) && t2 > t1) {
      const hours = (t2 - t1) / 3600_000;
      out.total_time = Math.round(hours * 10) / 10;
    }
  } else if (typeof f.duration === "number" && f.duration > 0) {
    out.total_time = Math.round((f.duration / 3600) * 10) / 10;
  } else if (typeof f.flight_time === "number" && f.flight_time > 0) {
    out.total_time = Math.round((f.flight_time / 3600) * 10) / 10;
  }

  // Mission number — use callsign if not already a flight number
  if (typeof f.callsign === "string" && f.callsign) {
    out.mission_number = f.callsign.toUpperCase();
  }

  // Likely a single landing for an airline-style point-to-point segment.
  out.day_landings = 1;
  out.full_stop_landings = 1;

  return out;
}

export function Fr24ImportBar({ onApply, onTrackImported }: Props) {
  const [open, setOpen] = useState(false);
  const [callsign, setCallsign] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FR24FlightSummary[]>([]);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  async function handleSearch() {
    if (!callsign.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResults([]);
    setAppliedId(null);

    try {
      const res = await fetch("/api/fr24/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callsign: callsign.trim(),
          full: true,
          limit: 10,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Search failed");
        return;
      }
      setResults((data.flights as FR24FlightSummary[]) ?? []);
      if (!data.flights || data.flights.length === 0) {
        setError("No flights found in the past 14 days for that callsign.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function handlePick(f: FR24FlightSummary) {
    if (busy) return;
    setBusy(true);
    setError(null);

    // Apply fields first so the user gets feedback even if track fetch fails
    const payload = deriveFlightFields(f);
    onApply(payload);

    let trackPoints: CompactTrackPoint[] = [];
    if (typeof f.fr24_id === "string" && f.fr24_id) {
      try {
        const res = await fetch(
          `/api/fr24/track?flight_id=${encodeURIComponent(f.fr24_id)}`,
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.points)) {
          trackPoints = data.points as CompactTrackPoint[];
        }
      } catch {
        // Non-fatal — apply fields anyway
      }
    }

    onTrackImported({
      fr24FlightId: f.fr24_id ?? null,
      track: trackPoints,
    });

    setAppliedId(f.fr24_id ?? `${f.callsign}-${f.datetime_takeoff}`);
    setBusy(false);
  }

  return (
    <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400 hover:text-sky-300"
        >
          <Radar className="h-3.5 w-3.5" />
          Import from Flightradar24
          <span className="text-[10px] font-normal text-text-muted">
            {open ? "(hide)" : "(callsign search + autofill + track log)"}
          </span>
        </button>
        {appliedId && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <Check className="h-3 w-3" />
            Applied
          </span>
        )}
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Callsign (e.g. AAL123, UAL456, REACH71)"
              maxLength={20}
              disabled={busy}
              className="flex-1 min-w-[200px] rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm uppercase text-slate-200 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-60"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSearch}
              disabled={!callsign.trim() || busy}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Radar className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {error && (
            <p className="rounded-md bg-red-500/10 px-2 py-1.5 text-xs text-red-300">
              {error}
            </p>
          )}

          {results.length > 0 && (
            <ul className="divide-y divide-slate-800 rounded-md border border-slate-800 bg-slate-900/40">
              {results.map((f, idx) => {
                const id = f.fr24_id ?? `${idx}`;
                const isApplied = appliedId === id;
                return (
                  <li
                    key={id}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2",
                      isApplied && "bg-emerald-500/5",
                    )}
                  >
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-medium text-slate-200">
                        {f.callsign ?? f.flight ?? "—"}{" "}
                        {f.reg && (
                          <span className="text-slate-500">· {f.reg}</span>
                        )}{" "}
                        {f.type && (
                          <span className="text-slate-500">· {f.type}</span>
                        )}
                      </p>
                      <p className="text-text-muted">
                        {f.orig_icao ?? f.orig_iata ?? "?"}
                        <ArrowRight className="inline h-3 w-3 mx-1" />
                        {f.dest_icao ?? f.dest_iata ?? "?"}
                        <span className="ml-2 text-slate-500">
                          {fmtIso(f.datetime_takeoff)}
                        </span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={isApplied ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => handlePick(f)}
                      disabled={busy}
                    >
                      {isApplied ? "Re-apply" : "Use this"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="text-[11px] text-text-muted">
            Pulls flight summary from FR24 by callsign over the last 14 days.
            Picking a result fills aircraft / route / time / date and saves the
            track log on submit. Always review before saving.
          </p>
        </div>
      )}
    </div>
  );
}
