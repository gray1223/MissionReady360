/**
 * Compact SVG plot of a CompactTrackPoint[] array.
 *
 * Equirectangular projection — adequate for the short-distance airline / GA
 * tracks we typically see, not a real chart. Renders a polyline with green
 * start dot and amber end dot, centered to fit.
 */

import type { CompactTrackPoint } from "@/lib/fr24/types";

interface Props {
  points: CompactTrackPoint[];
  /** Inner SVG viewBox dimensions. Defaults to 600x220 for a wide preview. */
  width?: number;
  height?: number;
  /** Tailwind classes applied to the wrapping <svg>. */
  className?: string;
}

export function TrackPlot({
  points,
  width = 600,
  height = 220,
  className = "h-48 w-full rounded-md border border-slate-800 bg-slate-900/40",
}: Props) {
  if (!points || points.length < 2) {
    return (
      <div
        className={className}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <span className="text-xs text-text-muted">
          {points?.length === 1
            ? "Only one position recorded — no track to plot."
            : "No track points to plot."}
        </span>
      </div>
    );
  }

  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const padLat = (maxLat - minLat) * 0.1 + 0.01;
  const padLon = (maxLon - minLon) * 0.1 + 0.01;

  const projX = (lon: number) =>
    ((lon - (minLon - padLon)) / (maxLon - minLon + 2 * padLon)) * width;
  const projY = (lat: number) =>
    height -
    ((lat - (minLat - padLat)) / (maxLat - minLat + 2 * padLat)) * height;

  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${projX(p.lon).toFixed(2)} ${projY(p.lat).toFixed(2)}`,
    )
    .join(" ");

  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
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
