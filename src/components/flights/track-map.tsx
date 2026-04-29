"use client";

import dynamic from "next/dynamic";
import type { TrackMapInnerProps } from "./track-map-inner";

/**
 * Real tile-backed Leaflet map of a track. SSR is disabled because Leaflet
 * touches `window` during init.
 *
 * Tile provider: CartoDB Dark Matter (free, no API key, dark theme).
 */
const TrackMapInner = dynamic(() => import("./track-map-inner"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-md border border-slate-800 bg-slate-900/40"
      style={{ height: "360px" }}
    >
      <span className="text-xs text-text-muted">Loading map…</span>
    </div>
  ),
});

export function TrackMap(props: TrackMapInnerProps) {
  return <TrackMapInner {...props} />;
}
