"use client";

/**
 * Training area map for Vance AFB EP practice.
 * VFR sectional chart background with SVG overlay for
 * airfield labels, MOA outlines, aircraft position, and DME line.
 *
 * Airfield coordinates (AirNav):
 *   KEND  36.3398 -97.9172   (Vance AFB)
 *   KCKA  36.7357 -98.1237   (Kegelman / Dogface)
 *   KWDG  36.3760 -97.7895   (Woodring)
 *   KPNC  36.7320 -97.0997   (Ponca City)
 *   KANY  37.1583 -98.0794   (Anthony)
 */

import type { AircraftPosition } from "@/lib/types/ep-practice";

interface EpAreaMapProps {
  runway: string; // "17L" or "35R"
  aircraft?: AircraftPosition | null;
  compact?: boolean;
}

// Real-world coordinates
const FIELDS = [
  { id: "KEND", name: "Vance AFB", lat: 36.3398, lon: -97.9172, home: true },
  { id: "KCKA", name: "Dogface", lat: 36.7357, lon: -98.1237 },
  { id: "KWDG", name: "Woodring", lat: 36.376, lon: -97.7895 },
  { id: "KPNC", name: "Ponca City", lat: 36.732, lon: -97.0997 },
  { id: "KANY", name: "Anthony", lat: 37.1583, lon: -98.0794 },
] as const;

// Bounding box matching the sectional chart crop
const LAT_MIN = 36.2;
const LAT_MAX = 37.3;
const LON_MIN = -98.3;
const LON_MAX = -96.9;

function project(
  lat: number,
  lon: number,
  width: number,
  height: number
): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * width;
  // lat is inverted (higher lat = higher on screen = lower y)
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * height;
  return [x, y];
}

/** Haversine distance in nautical miles */
function distanceNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3440.065; // Earth radius in NM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Approximate MOA polygon coordinates (simplified)
const NORTH_MOA = [
  { lat: 36.55, lon: -98.28 },
  { lat: 36.55, lon: -97.85 },
  { lat: 36.95, lon: -97.85 },
  { lat: 36.95, lon: -98.28 },
];

const EAST_MOA = [
  { lat: 36.25, lon: -97.65 },
  { lat: 36.25, lon: -97.1 },
  { lat: 36.75, lon: -97.1 },
  { lat: 36.75, lon: -97.65 },
];

export function EpAreaMap({ runway, aircraft, compact }: EpAreaMapProps) {
  const w = compact ? 400 : 510;
  const h = compact ? 392 : 500;
  const fontSize = compact ? 9 : 11;
  const markerR = compact ? 3.5 : 5;
  const homeR = compact ? 5 : 7;

  function proj(lat: number, lon: number) {
    return project(lat, lon, w, h);
  }

  function moaPath(coords: { lat: number; lon: number }[]) {
    return coords
      .map((c, i) => {
        const [x, y] = proj(c.lat, c.lon);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .concat("Z")
      .join(" ");
  }

  // Runway direction indicator at KEND
  const [hx, hy] = proj(FIELDS[0].lat, FIELDS[0].lon);
  const rwyLen = compact ? 16 : 22;
  const headingDeg = runway === "17L" ? 170 : 350;
  const headingRad = ((headingDeg - 90) * Math.PI) / 180;
  const rwyDx = Math.cos(headingRad) * rwyLen;
  const rwyDy = Math.sin(headingRad) * rwyLen;

  // Scale bar: ~48 NM per degree of longitude at this latitude
  const nmPerDegLon = 48;
  const pixelsPerDeg = w / (LON_MAX - LON_MIN);
  const twentyNmPx = (20 / nmPerDegLon) * pixelsPerDeg;

  // Aircraft position & nearest field
  let acX = 0,
    acY = 0,
    nearestField: (typeof FIELDS)[number] | null = null,
    nearestDist = Infinity,
    nfX = 0,
    nfY = 0;

  if (aircraft) {
    [acX, acY] = proj(aircraft.lat, aircraft.lon);
    for (const f of FIELDS) {
      const d = distanceNm(aircraft.lat, aircraft.lon, f.lat, f.lon);
      if (d < nearestDist) {
        nearestDist = d;
        nearestField = f;
        [nfX, nfY] = proj(f.lat, f.lon);
      }
    }
  }

  // DME label position (midpoint of the line)
  const dmeMidX = aircraft ? (acX + nfX) / 2 : 0;
  const dmeMidY = aircraft ? (acY + nfY) / 2 : 0;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full rounded-lg border border-slate-700"
      style={{ maxWidth: w }}
    >
      {/* Sectional chart background */}
      <image
        href="/maps/vance-sectional.jpg"
        x={0}
        y={0}
        width={w}
        height={h}
        preserveAspectRatio="none"
      />

      {/* Darken overlay for readability */}
      <rect x={0} y={0} width={w} height={h} fill="black" opacity={0.25} />

      {/* North MOA */}
      <path
        d={moaPath(NORTH_MOA)}
        fill="#10b981"
        fillOpacity={0.12}
        stroke="#10b981"
        strokeWidth={1.5}
        strokeDasharray="6 3"
        strokeOpacity={0.7}
      />
      {(() => {
        const [cx, cy] = proj(36.75, -98.065);
        return (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            fill="#10b981"
            fontSize={fontSize}
            fontWeight="bold"
            opacity={0.9}
          >
            NORTH MOA
          </text>
        );
      })()}

      {/* East MOA */}
      <path
        d={moaPath(EAST_MOA)}
        fill="#3b82f6"
        fillOpacity={0.12}
        stroke="#3b82f6"
        strokeWidth={1.5}
        strokeDasharray="6 3"
        strokeOpacity={0.7}
      />
      {(() => {
        const [cx, cy] = proj(36.5, -97.375);
        return (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            fill="#3b82f6"
            fontSize={fontSize}
            fontWeight="bold"
            opacity={0.9}
          >
            EAST MOA
          </text>
        );
      })()}

      {/* DME line from aircraft to nearest field */}
      {aircraft && nearestField && (
        <g>
          <line
            x1={acX}
            y1={acY}
            x2={nfX}
            y2={nfY}
            stroke="#fbbf24"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            strokeOpacity={0.9}
          />
          {/* DME distance label */}
          <rect
            x={dmeMidX - 22}
            y={dmeMidY - 7}
            width={44}
            height={14}
            rx={3}
            fill="#000"
            fillOpacity={0.7}
          />
          <text
            x={dmeMidX}
            y={dmeMidY + 4}
            textAnchor="middle"
            fill="#fbbf24"
            fontSize={fontSize - 1}
            fontWeight="bold"
          >
            {nearestDist.toFixed(1)} NM
          </text>
        </g>
      )}

      {/* Runway direction indicator at KEND */}
      <line
        x1={hx - rwyDx}
        y1={hy - rwyDy}
        x2={hx + rwyDx}
        y2={hy + rwyDy}
        stroke="#10b981"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <polygon
        points={`${hx + rwyDx},${hy + rwyDy} ${hx + rwyDx - 4 * Math.cos(headingRad - 0.5)},${hy + rwyDy - 4 * Math.sin(headingRad - 0.5)} ${hx + rwyDx - 4 * Math.cos(headingRad + 0.5)},${hy + rwyDy - 4 * Math.sin(headingRad + 0.5)}`}
        fill="#10b981"
      />

      {/* Airfield markers */}
      {FIELDS.map((f) => {
        const [x, y] = proj(f.lat, f.lon);
        const isHome = "home" in f && f.home;
        const isNearest =
          aircraft && nearestField && f.id === nearestField.id;
        return (
          <g key={f.id}>
            {/* Highlight ring for nearest field */}
            {isNearest && (
              <circle
                cx={x}
                cy={y}
                r={homeR + 5}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={1.5}
                strokeDasharray="3 2"
                opacity={0.8}
              />
            )}
            {/* Outer ring for home field */}
            {isHome && (
              <circle
                cx={x}
                cy={y}
                r={homeR + 3}
                fill="none"
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="3 2"
                opacity={0.6}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={isHome ? homeR : markerR}
              fill={isHome ? "#10b981" : "#e2e8f0"}
              fillOpacity={0.95}
              stroke="#000"
              strokeWidth={0.5}
              strokeOpacity={0.5}
            />
            {/* Label background for readability */}
            <text
              x={x}
              y={y - (isHome ? homeR + 5 : markerR + 4)}
              textAnchor="middle"
              fill="#000"
              fontSize={fontSize}
              fontWeight="bold"
              stroke="#000"
              strokeWidth={3}
              strokeOpacity={0.6}
              paintOrder="stroke"
            >
              {f.id}
            </text>
            <text
              x={x}
              y={y - (isHome ? homeR + 5 : markerR + 4)}
              textAnchor="middle"
              fill={isHome ? "#10b981" : "#f1f5f9"}
              fontSize={fontSize}
              fontWeight="bold"
            >
              {f.id}
            </text>
            <text
              x={x}
              y={y + (isHome ? homeR + fontSize + 2 : markerR + fontSize + 1)}
              textAnchor="middle"
              fill="#000"
              fontSize={fontSize - 1}
              stroke="#000"
              strokeWidth={3}
              strokeOpacity={0.5}
              paintOrder="stroke"
            >
              {f.name}
            </text>
            <text
              x={x}
              y={y + (isHome ? homeR + fontSize + 2 : markerR + fontSize + 1)}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={fontSize - 1}
            >
              {f.name}
            </text>
          </g>
        );
      })}

      {/* Aircraft marker */}
      {aircraft && (
        <g
          transform={`translate(${acX},${acY}) rotate(${aircraft.heading})`}
        >
          {/* Triangle pointing up (nose), rotated to heading */}
          <polygon
            points="0,-10 -5,6 5,6"
            fill="#ef4444"
            stroke="#fff"
            strokeWidth={1}
            strokeOpacity={0.8}
          />
          {/* Small dot at center */}
          <circle cx={0} cy={0} r={1.5} fill="#fff" />
        </g>
      )}

      {/* Aircraft altitude label */}
      {aircraft && (
        <g>
          <rect
            x={acX + 10}
            y={acY - 16}
            width={52}
            height={14}
            rx={3}
            fill="#000"
            fillOpacity={0.7}
          />
          <text
            x={acX + 36}
            y={acY - 5}
            textAnchor="middle"
            fill="#ef4444"
            fontSize={fontSize - 1}
            fontWeight="bold"
          >
            {(aircraft.altitude / 1000).toFixed(1)}K ft
          </text>
        </g>
      )}

      {/* North arrow */}
      <g>
        <rect
          x={w - 22}
          y={4}
          width={18}
          height={34}
          rx={4}
          fill="#000"
          fillOpacity={0.5}
        />
        <line
          x1={w - 13}
          y1={32}
          x2={w - 13}
          y2={12}
          stroke="#e2e8f0"
          strokeWidth={1.5}
        />
        <polygon
          points={`${w - 13},${8} ${w - 17},${16} ${w - 9},${16}`}
          fill="#e2e8f0"
        />
        <text
          x={w - 13}
          y={28}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize={8}
          fontWeight="bold"
          opacity={0.8}
        >
          N
        </text>
      </g>

      {/* Scale bar — 20 NM */}
      <g>
        <rect
          x={6}
          y={h - 22}
          width={twentyNmPx + 14}
          height={18}
          rx={4}
          fill="#000"
          fillOpacity={0.5}
        />
        <line
          x1={13}
          y1={h - 8}
          x2={13 + twentyNmPx}
          y2={h - 8}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
        <line
          x1={13}
          y1={h - 11}
          x2={13}
          y2={h - 5}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
        <line
          x1={13 + twentyNmPx}
          y1={h - 11}
          x2={13 + twentyNmPx}
          y2={h - 5}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
        <text
          x={13 + twentyNmPx / 2}
          y={h - 12}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize={fontSize - 2}
        >
          ~20 NM
        </text>
      </g>

      {/* Runway label */}
      <text
        x={hx + (runway === "17L" ? 14 : -14)}
        y={hy + 3}
        textAnchor={runway === "17L" ? "start" : "end"}
        fill="#10b981"
        fontSize={fontSize - 1}
        fontWeight="bold"
        stroke="#000"
        strokeWidth={2.5}
        strokeOpacity={0.6}
        paintOrder="stroke"
      >
        RWY {runway}
      </text>
    </svg>
  );
}
