"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Radar,
  Loader2,
  ArrowRight,
  RefreshCw,
  History,
  BookmarkPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type {
  FR24LivePosition,
  FR24FlightSummary,
  CompactTrackPoint,
} from "@/lib/fr24/types";
import { FR24_PENDING_KEY } from "@/components/flights/fr24-import-bar";
import { TrackMap } from "@/components/flights/track-map";

type Mode = "live" | "historical";
type SearchType = "callsign" | "registration" | "flight";

const MODES: { id: Mode; label: string; icon: typeof Radar; hint: string }[] = [
  {
    id: "live",
    label: "Live",
    icon: Radar,
    hint: "Currently airborne aircraft",
  },
  {
    id: "historical",
    label: "Historical",
    icon: History,
    hint: "Completed flights, last 14 days",
  },
];

const SEARCH_TYPES: { id: SearchType; label: string; placeholder: string }[] =
  [
    {
      id: "callsign",
      label: "Callsign",
      placeholder: "AAL123, REACH71, UAL456",
    },
    {
      id: "registration",
      label: "Registration",
      placeholder: "N123AA",
    },
    {
      id: "flight",
      label: "Flight #",
      placeholder: "AA123",
    },
  ];

interface SelectedFlight {
  fr24Id: string;
  callsign: string;
  origin?: string;
  destination?: string;
}

function fmt(n: number | undefined, suffix = ""): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return `${Math.round(n).toLocaleString()}${suffix}`;
}

function fmtTime(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function TrackingClient() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("live");
  const [searchType, setSearchType] = useState<SearchType>("callsign");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [livePositions, setLivePositions] = useState<FR24LivePosition[]>([]);
  const [historicalSummaries, setHistoricalSummaries] = useState<
    FR24FlightSummary[]
  >([]);
  const [lastSearched, setLastSearched] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedFlight | null>(null);
  const [trackBusy, setTrackBusy] = useState(false);
  const [track, setTrack] = useState<CompactTrackPoint[] | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  function clearResults() {
    setLivePositions([]);
    setHistoricalSummaries([]);
    setSelected(null);
    setTrack(null);
    setTrackError(null);
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setError(null);
    clearResults();
  }

  async function runSearch() {
    if (!query.trim() || busy) return;
    setBusy(true);
    setError(null);
    clearResults();
    const q = query.trim().toUpperCase();
    setLastSearched(q);

    try {
      if (mode === "live") {
        const sp = new URLSearchParams();
        sp.set(searchType, q);
        sp.set("limit", "25");
        const res = await fetch(`/api/fr24/live?${sp.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Search failed");
          return;
        }
        const positions = (data.positions as FR24LivePosition[]) ?? [];
        setLivePositions(positions);
        if (positions.length === 0) {
          setError("No live aircraft matched. Try Historical mode.");
        }
      } else {
        const body: Record<string, unknown> = { full: true, limit: 25 };
        body[searchType] = q;
        const res = await fetch("/api/fr24/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Search failed");
          return;
        }
        const flights = (data.flights as FR24FlightSummary[]) ?? [];
        setHistoricalSummaries(flights);
        if (flights.length === 0) {
          setError("No completed flights in the last 14 days.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function loadTrack(sel: SelectedFlight) {
    setSelected(sel);
    setTrack(null);
    setTrackError(null);
    setTrackBusy(true);
    try {
      const res = await fetch(
        `/api/fr24/track?flight_id=${encodeURIComponent(sel.fr24Id)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setTrackError(data.error ?? "Track fetch failed");
        return;
      }
      setTrack((data.points as CompactTrackPoint[]) ?? []);
    } catch (err) {
      setTrackError(err instanceof Error ? err.message : "Network error");
    } finally {
      setTrackBusy(false);
    }
  }

  function handleSelectLive(p: FR24LivePosition) {
    if (!p.fr24_id) {
      setTrackError("No FR24 ID on this position; cannot fetch track.");
      return;
    }
    loadTrack({
      fr24Id: p.fr24_id,
      callsign: p.callsign ?? p.flight ?? "—",
      origin: p.orig_icao ?? p.orig_iata ?? undefined,
      destination: p.dest_icao ?? p.dest_iata ?? undefined,
    });
  }

  function handleSelectHistorical(f: FR24FlightSummary) {
    if (!f.fr24_id) {
      setTrackError("No FR24 ID on this summary; cannot fetch track.");
      return;
    }
    loadTrack({
      fr24Id: f.fr24_id,
      callsign: f.callsign ?? f.flight ?? "—",
      origin: f.orig_icao ?? f.orig_iata ?? undefined,
      destination:
        f.dest_icao_actual ?? f.dest_icao ?? f.dest_iata ?? undefined,
    });
  }

  function handleLog(f: FR24FlightSummary) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(FR24_PENDING_KEY, JSON.stringify(f));
    router.push("/flights/new");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              Search aircraft
            </span>
          </CardTitle>
          <CardDescription>
            {MODES.find((m) => m.id === mode)?.hint}
            {mode === "historical" && " — pick a flight to view its track or save it as a logbook entry."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mode tabs */}
          <div className="mb-3 inline-flex rounded-md border border-slate-700 bg-slate-900 p-0.5">
            {MODES.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchMode(m.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-colors",
                    mode === m.id
                      ? "bg-primary/20 text-primary"
                      : "text-slate-400 hover:text-slate-200",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Search row */}
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-md border border-slate-700 bg-slate-900 p-0.5">
              {SEARCH_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSearchType(t.id)}
                  className={cn(
                    "rounded px-3 py-1 text-xs font-medium transition-colors",
                    searchType === t.id
                      ? "bg-primary/20 text-primary"
                      : "text-slate-400 hover:text-slate-200",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runSearch();
                }
              }}
              placeholder={
                SEARCH_TYPES.find((t) => t.id === searchType)?.placeholder ?? ""
              }
              maxLength={20}
              disabled={busy}
              className="flex-1 min-w-[200px] rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm uppercase text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={runSearch}
              disabled={!query.trim() || busy}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching
                </>
              ) : (
                <>
                  <Radar className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
            {lastSearched && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={runSearch}
                disabled={busy}
              >
                <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
                Refresh
              </Button>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-md bg-red-500/10 px-2 py-1.5 text-xs text-red-300">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Live results */}
      {mode === "live" && livePositions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {livePositions.length} live match
              {livePositions.length === 1 ? "" : "es"} for{" "}
              <span className="font-mono text-primary">{lastSearched}</span>
            </CardTitle>
            <CardDescription>
              Click a row to fetch the current track.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-800">
              {livePositions.map((p, idx) => {
                const id = p.fr24_id ?? `${idx}`;
                const isSelected =
                  selected?.fr24Id === p.fr24_id && !!p.fr24_id;
                return (
                  <li
                    key={id}
                    onClick={() => handleSelectLive(p)}
                    className={cn(
                      "cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-slate-800/40",
                      isSelected && "bg-primary/10",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-200">
                          {p.callsign ?? p.flight ?? "—"}{" "}
                          {p.reg && (
                            <span className="text-slate-500">· {p.reg}</span>
                          )}{" "}
                          {p.type && (
                            <span className="text-slate-500">· {p.type}</span>
                          )}
                        </p>
                        <p className="text-xs text-text-muted">
                          {p.orig_icao ?? p.orig_iata ?? "?"}
                          <ArrowRight className="inline h-3 w-3 mx-1" />
                          {p.dest_icao ?? p.dest_iata ?? "?"}
                          <span className="ml-2 text-slate-500">
                            {fmtTime(p.timestamp)}
                          </span>
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-x-3 text-right text-[11px] text-slate-400">
                        <span>{fmt(p.alt, " ft")}</span>
                        <span>{fmt(p.gspeed, " kt")}</span>
                        <span>{fmt(p.track, "°")}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Historical results */}
      {mode === "historical" && historicalSummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {historicalSummaries.length} completed flight
              {historicalSummaries.length === 1 ? "" : "s"} for{" "}
              <span className="font-mono text-primary">{lastSearched}</span>
            </CardTitle>
            <CardDescription>
              Click a row to view the track. Use &ldquo;Log this flight&rdquo;
              to start a logbook entry pre-filled from FR24.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-800">
              {historicalSummaries.map((f, idx) => {
                const id = f.fr24_id ?? `${idx}`;
                const isSelected =
                  selected?.fr24Id === f.fr24_id && !!f.fr24_id;
                const dest = f.dest_icao_actual ?? f.dest_icao ?? f.dest_iata;
                return (
                  <li
                    key={id}
                    className={cn(
                      "px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10"
                        : "hover:bg-slate-800/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectHistorical(f)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="font-medium text-slate-200">
                          {f.callsign ?? f.flight ?? "—"}{" "}
                          {f.reg && (
                            <span className="text-slate-500">· {f.reg}</span>
                          )}{" "}
                          {f.type && (
                            <span className="text-slate-500">· {f.type}</span>
                          )}
                        </p>
                        <p className="text-xs text-text-muted">
                          {f.orig_icao ?? f.orig_iata ?? "?"}
                          <ArrowRight className="inline h-3 w-3 mx-1" />
                          {dest ?? "?"}
                          <span className="ml-2 text-slate-500">
                            {fmtDateTime(f.datetime_takeoff)}
                          </span>
                        </p>
                      </button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleLog(f)}
                        disabled={!f.fr24_id}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                        Log this flight
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Track panel — works for both modes */}
      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>
              Track —{" "}
              <span className="font-mono">{selected.callsign}</span>
              {selected.origin && selected.destination && (
                <span className="ml-2 text-sm text-text-muted">
                  ({selected.origin} → {selected.destination})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {trackBusy
                ? "Loading positions..."
                : track
                ? `${track.length} position${track.length === 1 ? "" : "s"} from FR24.`
                : trackError ?? "Pick a flight to load its track."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trackError && !trackBusy && (
              <p className="rounded-md bg-red-500/10 px-2 py-1.5 text-xs text-red-300">
                {trackError}
              </p>
            )}
            {track && track.length > 0 && (
              <>
                <TrackMap
                  points={track}
                  originLabel={selected.origin}
                  destinationLabel={selected.destination}
                />
                <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-slate-800 bg-slate-900/40">
                  <table className="w-full text-[11px]">
                    <thead className="sticky top-0 bg-slate-900/95 text-text-muted">
                      <tr>
                        <th className="px-2 py-1.5 text-left">Time</th>
                        <th className="px-2 py-1.5 text-right">Lat</th>
                        <th className="px-2 py-1.5 text-right">Lon</th>
                        <th className="px-2 py-1.5 text-right">Alt</th>
                        <th className="px-2 py-1.5 text-right">Speed</th>
                        <th className="px-2 py-1.5 text-right">Hdg</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                      {track.map((p, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1">{fmtTime(p.t)}</td>
                          <td className="px-2 py-1 text-right">
                            {p.lat.toFixed(3)}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {p.lon.toFixed(3)}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {fmt(p.alt, " ft")}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {fmt(p.gs, " kt")}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {fmt(p.hdg, "°")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

