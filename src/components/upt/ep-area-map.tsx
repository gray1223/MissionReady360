"use client";

/**
 * Training area map for Vance AFB EP practice.
 * Pure SVG — zero external dependencies.
 *
 * Airfield coordinates (AirNav):
 *   KEND  36.3398 -97.9172   (Vance AFB)
 *   KCKA  36.7357 -98.1237   (Kegelman / Dogface)
 *   KWDG  36.3760 -97.7895   (Woodring)
 *   KPNC  36.7320 -97.0997   (Ponca City)
 *   KANY  37.1583 -98.0794   (Anthony)
 */

interface EpAreaMapProps {
  runway: string; // "17L" or "35R"
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

// Bounding box for projection (with padding)
const LAT_MIN = 36.2;
const LAT_MAX = 37.3;
const LON_MIN = -98.3;
const LON_MAX = -96.9;

function project(
  lat: number,
  lon: number,
  width: number,
  height: number,
  pad: number
): [number, number] {
  const x = pad + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (width - 2 * pad);
  // lat is inverted (higher lat = higher on screen = lower y)
  const y =
    pad + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (height - 2 * pad);
  return [x, y];
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

export function EpAreaMap({ runway, compact }: EpAreaMapProps) {
  const w = compact ? 320 : 480;
  const h = compact ? 260 : 380;
  const pad = compact ? 28 : 40;
  const fontSize = compact ? 9 : 11;
  const markerR = compact ? 3 : 4;
  const homeR = compact ? 5 : 7;

  function proj(lat: number, lon: number) {
    return project(lat, lon, w, h, pad);
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
  // 17L heading ≈ 170°, 35R heading ≈ 350°
  const headingDeg = runway === "17L" ? 170 : 350;
  const headingRad = ((headingDeg - 90) * Math.PI) / 180;
  const rwyDx = Math.cos(headingRad) * rwyLen;
  const rwyDy = Math.sin(headingRad) * rwyLen;

  // Scale bar: approximate NM for 1 degree of longitude at this latitude
  // At ~36.5° lat, 1° lon ≈ 48 NM. Our lon range is 1.4°, so total ≈ 67 NM.
  // Pixel range = w - 2*pad. 20 NM in pixels:
  const nmPerDegLon = 48;
  const pixelsPerDeg = (w - 2 * pad) / (LON_MAX - LON_MIN);
  const twentyNmPx = (20 / nmPerDegLon) * pixelsPerDeg;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full rounded-lg border border-slate-700 bg-slate-950"
      style={{ maxWidth: w }}
    >
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <g key={f} opacity={0.15}>
          <line
            x1={pad}
            y1={pad + f * (h - 2 * pad)}
            x2={w - pad}
            y2={pad + f * (h - 2 * pad)}
            stroke="#94a3b8"
            strokeWidth={0.5}
          />
          <line
            x1={pad + f * (w - 2 * pad)}
            y1={pad}
            x2={pad + f * (w - 2 * pad)}
            y2={h - pad}
            stroke="#94a3b8"
            strokeWidth={0.5}
          />
        </g>
      ))}

      {/* North MOA */}
      <path
        d={moaPath(NORTH_MOA)}
        fill="#10b981"
        fillOpacity={0.08}
        stroke="#10b981"
        strokeWidth={1}
        strokeDasharray="6 3"
        strokeOpacity={0.5}
      />
      {/* North MOA label */}
      {(() => {
        const [cx, cy] = proj(36.75, -98.065);
        return (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            fill="#10b981"
            fontSize={fontSize}
            opacity={0.7}
          >
            NORTH MOA
          </text>
        );
      })()}

      {/* East MOA */}
      <path
        d={moaPath(EAST_MOA)}
        fill="#3b82f6"
        fillOpacity={0.08}
        stroke="#3b82f6"
        strokeWidth={1}
        strokeDasharray="6 3"
        strokeOpacity={0.5}
      />
      {/* East MOA label */}
      {(() => {
        const [cx, cy] = proj(36.5, -97.375);
        return (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            fill="#3b82f6"
            fontSize={fontSize}
            opacity={0.7}
          >
            EAST MOA
          </text>
        );
      })()}

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
      {/* Arrow tip showing active runway direction */}
      <polygon
        points={`${hx + rwyDx},${hy + rwyDy} ${hx + rwyDx - 4 * Math.cos(headingRad - 0.5)},${hy + rwyDy - 4 * Math.sin(headingRad - 0.5)} ${hx + rwyDx - 4 * Math.cos(headingRad + 0.5)},${hy + rwyDy - 4 * Math.sin(headingRad + 0.5)}`}
        fill="#10b981"
      />

      {/* Airfield markers */}
      {FIELDS.map((f) => {
        const [x, y] = proj(f.lat, f.lon);
        const isHome = "home" in f && f.home;
        return (
          <g key={f.id}>
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
                opacity={0.5}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={isHome ? homeR : markerR}
              fill={isHome ? "#10b981" : "#94a3b8"}
              fillOpacity={isHome ? 0.9 : 0.7}
            />
            {/* Label */}
            <text
              x={x}
              y={y - (isHome ? homeR + 5 : markerR + 4)}
              textAnchor="middle"
              fill={isHome ? "#10b981" : "#cbd5e1"}
              fontSize={fontSize}
              fontWeight={isHome ? "bold" : "normal"}
            >
              {f.id}
            </text>
            <text
              x={x}
              y={y + (isHome ? homeR + fontSize + 2 : markerR + fontSize + 1)}
              textAnchor="middle"
              fill="#64748b"
              fontSize={fontSize - 1}
            >
              {f.name}
            </text>
          </g>
        );
      })}

      {/* North arrow */}
      <g>
        <line
          x1={w - pad + 10}
          y1={pad + 30}
          x2={w - pad + 10}
          y2={pad + 6}
          stroke="#94a3b8"
          strokeWidth={1.5}
        />
        <polygon
          points={`${w - pad + 10},${pad + 2} ${w - pad + 6},${pad + 10} ${w - pad + 14},${pad + 10}`}
          fill="#94a3b8"
        />
        <text
          x={w - pad + 10}
          y={pad + 42}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={fontSize - 1}
          fontWeight="bold"
        >
          N
        </text>
      </g>

      {/* Scale bar — 20 NM */}
      <g>
        <line
          x1={pad}
          y1={h - 10}
          x2={pad + twentyNmPx}
          y2={h - 10}
          stroke="#64748b"
          strokeWidth={1}
        />
        <line
          x1={pad}
          y1={h - 13}
          x2={pad}
          y2={h - 7}
          stroke="#64748b"
          strokeWidth={1}
        />
        <line
          x1={pad + twentyNmPx}
          y1={h - 13}
          x2={pad + twentyNmPx}
          y2={h - 7}
          stroke="#64748b"
          strokeWidth={1}
        />
        <text
          x={pad + twentyNmPx / 2}
          y={h - 14}
          textAnchor="middle"
          fill="#64748b"
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
        opacity={0.8}
      >
        RWY {runway}
      </text>
    </svg>
  );
}
