"use client";

import { useState } from "react";
import { Radar, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { FR24LivePosition, CompactTrackPoint } from "@/lib/fr24/types";

type SearchType = "callsign" | "registration" | "flight";

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

export function TrackingClient() {
  const [searchType, setSearchType] = useState<SearchType>("callsign");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FR24LivePosition[]>([]);
  const [lastSearched, setLastSearched] = useState<string | null>(null);
  const [selected, setSelected] = useState<FR24LivePosition | null>(null);
  const [trackBusy, setTrackBusy] = useState(false);
  const [track, setTrack] = useState<CompactTrackPoint[] | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  async function runSearch() {
    if (!query.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResults([]);
    setSelected(null);
    setTrack(null);
    setLastSearched(query.trim().toUpperCase());

    try {
      const sp = new URLSearchParams();
      sp.set(searchType, query.trim().toUpperCase());
      sp.set("limit", "25");
      const res = await fetch(`/api/fr24/live?${sp.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Search failed");
        return;
      }
      const positions = (data.positions as FR24LivePosition[]) ?? [];
      setResults(positions);
      if (positions.length === 0) {
        setError("No live aircraft matched. Try a different identifier.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function handleSelect(pos: FR24LivePosition) {
    setSelected(pos);
    setTrack(null);
    setTrackError(null);
    if (!pos.fr24_id) {
      setTrackError("No FR24 ID on this position; cannot fetch track.");
      return;
    }
    setTrackBusy(true);
    try {
      const res = await fetch(
        `/api/fr24/track?flight_id=${encodeURIComponent(pos.fr24_id)}`,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              Search live aircraft
            </span>
          </CardTitle>
          <CardDescription>
            Returns up to 25 currently-airborne matches.
          </CardDescription>
        </CardHeader>
        <CardContent>
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

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {results.length} live match{results.length === 1 ? "" : "es"} for{" "}
              <span className="font-mono text-primary">{lastSearched}</span>
            </CardTitle>
            <CardDescription>
              Click a row to fetch the current track.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-800">
              {results.map((p, idx) => {
                const id = p.fr24_id ?? `${idx}`;
                const isSelected = selected?.fr24_id === p.fr24_id && p.fr24_id;
                return (
                  <li
                    key={id}
                    onClick={() => handleSelect(p)}
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
                        <span>{fmt(p.altitude, " ft")}</span>
                        <span>{fmt(p.ground_speed, " kt")}</span>
                        <span>{fmt(p.heading, "°")}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>
              Track —{" "}
              <span className="font-mono">
                {selected.callsign ?? selected.flight ?? "—"}
              </span>
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
                <SimpleTrackPlot points={track} />
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

/**
 * Compact SVG plot of the track. Equirectangular projection — adequate for
 * the short-distance airline / GA tracks we typically see, not a real chart.
 */
function SimpleTrackPlot({ points }: { points: CompactTrackPoint[] }) {
  if (points.length < 2) return null;

  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const padLat = (maxLat - minLat) * 0.1 + 0.01;
  const padLon = (maxLon - minLon) * 0.1 + 0.01;

  const W = 600;
  const H = 220;
  const projX = (lon: number) =>
    ((lon - (minLon - padLon)) / (maxLon - minLon + 2 * padLon)) * W;
  const projY = (lat: number) =>
    H - ((lat - (minLat - padLat)) / (maxLat - minLat + 2 * padLat)) * H;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${projX(p.lon).toFixed(2)} ${projY(p.lat).toFixed(2)}`)
    .join(" ");

  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-48 w-full rounded-md border border-slate-800 bg-slate-900/40"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
      <circle
        cx={projX(points[0].lon)}
        cy={projY(points[0].lat)}
        r={4}
        fill="#10b981"
      />
      <circle
        cx={projX(last.lon)}
        cy={projY(last.lat)}
        r={4}
        fill="#f59e0b"
      />
    </svg>
  );
}
