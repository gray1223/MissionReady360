"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import type { CompactTrackPoint } from "@/lib/fr24/types";

export interface TrackMapInnerProps {
  points: CompactTrackPoint[];
  /** CSS height value, defaults to a comfortable preview size. */
  height?: string;
  /** Tailwind classes applied to the wrapping container. */
  className?: string;
  /** Optional human-readable origin/destination labels for end-point tooltips. */
  originLabel?: string;
  destinationLabel?: string;
}

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [bounds, map]);
  return null;
}

export default function TrackMapInner({
  points,
  height = "360px",
  className = "",
  originLabel,
  destinationLabel,
}: TrackMapInnerProps) {
  if (!points || points.length < 1) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border border-slate-800 bg-slate-900/40 ${className}`}
        style={{ height }}
      >
        <span className="text-xs text-text-muted">
          No track points to plot.
        </span>
      </div>
    );
  }

  const latLngs: LatLngTuple[] = points.map((p) => [p.lat, p.lon]);
  const start = latLngs[0];
  const end = latLngs[latLngs.length - 1];
  const bounds: LatLngBoundsExpression = latLngs.length >= 2 ? latLngs : [start];
  const single = latLngs.length < 2;

  return (
    <div
      className={`overflow-hidden rounded-md border border-slate-800 ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={start}
        zoom={single ? 9 : 6}
        style={{
          height: "100%",
          width: "100%",
          background: "#0b1120",
        }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        {!single && (
          <Polyline
            positions={latLngs}
            pathOptions={{
              color: "#38bdf8",
              weight: 3,
              opacity: 0.95,
            }}
          />
        )}
        <CircleMarker
          center={start}
          radius={6}
          pathOptions={{
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
            {originLabel ? `Departure · ${originLabel}` : "Departure"}
          </Tooltip>
        </CircleMarker>
        {!single && (
          <CircleMarker
            center={end}
            radius={6}
            pathOptions={{
              color: "#f59e0b",
              fillColor: "#f59e0b",
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
              {destinationLabel ? `Arrival · ${destinationLabel}` : "Arrival"}
            </Tooltip>
          </CircleMarker>
        )}
        <FitBounds bounds={bounds} />
      </MapContainer>
    </div>
  );
}
