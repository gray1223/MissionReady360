"use client";

/**
 * T-6A CWS (Central Warning System) panel components.
 * Split into two separate cockpit mockups:
 *   - EpEyebrowPanel: Glareshield eyebrow lights (MASTER WARN, FIRE, MASTER CAUTION)
 *   - EpCwsPanel: CWS annunciator grid (red/amber/green lights)
 *
 * Source: Milviz T-6A User Guide (public, non-CUI).
 */

import type { EyebrowLightId } from "@/lib/types/ep-practice";

export type CwsLightId =
  // Red (warning)
  | "BAT_BUS"
  | "GEN_BUS"
  | "PMU_FAIL"
  | "GEN"
  | "CKPT_PX"
  | "CANOPY"
  | "FUEL_PX"
  | "OIL_PX_RED"
  | "OBOGS_FAIL"
  | "CHIP"
  // Amber (caution)
  | "CKPT_ALT"
  | "DUCT_TEMP"
  | "HYDR_FL_LO"
  | "BUS_TIE"
  | "FUEL_BAL"
  | "EHYD_PX_LO"
  | "OBOGS_TEMP"
  | "TAD_FAIL"
  | "L_FUEL_LO"
  | "R_FUEL_LO"
  | "PMU_STATUS"
  | "OIL_PX_AMBER"
  // Green (advisory)
  | "IGN_SEL"
  | "M_FUEL_BAL"
  | "ST_READY"
  | "BOOST_PUMP"
  | "ANTI_ICE"
  | "TAD_OFF"
  | "TRIM_OFF";

interface LightDef {
  id: string;
  label: string;
  color: "red" | "amber" | "green";
}

// Glareshield eyebrow lights
const EYEBROW_LIGHTS: (LightDef & { id: EyebrowLightId })[] = [
  { id: "MASTER_WARN", label: "MASTER\nWARN", color: "red" },
  { id: "FIRE", label: "FIRE", color: "red" },
  { id: "MASTER_CAUTION", label: "MASTER\nCAUTION", color: "amber" },
];

// CWS panel lights in grid order (4 columns)
const CWS_GRID: (LightDef & { id: CwsLightId })[][] = [
  // Row 1 — Red warnings
  [
    { id: "BAT_BUS", label: "BAT\nBUS", color: "red" },
    { id: "GEN_BUS", label: "GEN\nBUS", color: "red" },
    { id: "PMU_FAIL", label: "PMU\nFAIL", color: "red" },
    { id: "GEN", label: "GEN", color: "red" },
  ],
  // Row 2
  [
    { id: "CKPT_PX", label: "CKPT\nPX", color: "red" },
    { id: "CANOPY", label: "CANOPY", color: "red" },
    { id: "FUEL_PX", label: "FUEL\nPX", color: "red" },
    { id: "OIL_PX_RED", label: "OIL\nPX", color: "red" },
  ],
  // Row 3
  [
    { id: "OBOGS_FAIL", label: "OBOGS\nFAIL", color: "red" },
    { id: "CHIP", label: "CHIP", color: "red" },
    { id: "CKPT_ALT", label: "CKPT\nALT", color: "amber" },
    { id: "DUCT_TEMP", label: "DUCT\nTEMP", color: "amber" },
  ],
  // Row 4 — Amber cautions
  [
    { id: "HYDR_FL_LO", label: "HYDR\nFL LO", color: "amber" },
    { id: "BUS_TIE", label: "BUS\nTIE", color: "amber" },
    { id: "FUEL_BAL", label: "FUEL\nBAL", color: "amber" },
    { id: "EHYD_PX_LO", label: "EHYD\nPX LO", color: "amber" },
  ],
  // Row 5
  [
    { id: "OBOGS_TEMP", label: "OBOGS\nTEMP", color: "amber" },
    { id: "TAD_FAIL", label: "TAD\nFAIL", color: "amber" },
    { id: "L_FUEL_LO", label: "L FUEL\nLO", color: "amber" },
    { id: "R_FUEL_LO", label: "R FUEL\nLO", color: "amber" },
  ],
  // Row 6
  [
    { id: "PMU_STATUS", label: "PMU\nSTATUS", color: "amber" },
    { id: "OIL_PX_AMBER", label: "OIL\nPX", color: "amber" },
    { id: "IGN_SEL", label: "IGN\nSEL", color: "green" },
    { id: "M_FUEL_BAL", label: "M FUEL\nBAL", color: "green" },
  ],
  // Row 7 — Green advisory
  [
    { id: "ST_READY", label: "ST\nREADY", color: "green" },
    { id: "BOOST_PUMP", label: "BOOST\nPUMP", color: "green" },
    { id: "ANTI_ICE", label: "ANTI\nICE", color: "green" },
    { id: "TAD_OFF", label: "TAD\nOFF", color: "green" },
  ],
  // Row 8
  [
    { id: "TRIM_OFF", label: "TRIM\nOFF", color: "green" },
  ],
];

const COLOR_MAP = {
  red: {
    lit: "#ef4444",
    glow: "rgba(239, 68, 68, 0.35)",
    dim: "#2a1215",
    text: "#fca5a5",
    litText: "#1a0000",
  },
  amber: {
    lit: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.35)",
    dim: "#2a1f0a",
    text: "#fcd34d",
    litText: "#1a1000",
  },
  green: {
    lit: "#10b981",
    glow: "rgba(16, 185, 129, 0.35)",
    dim: "#0a2a1a",
    text: "#6ee7b7",
    litText: "#001a0d",
  },
};

/* ---------- Shared SVG light cell ---------- */

function LightCell({
  light,
  isLit,
  x,
  y,
  w,
  h,
  fontSize = 7.5,
}: {
  light: LightDef;
  isLit: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
}) {
  const colors = COLOR_MAP[light.color];
  const fill = isLit ? colors.lit : colors.dim;
  const textColor = isLit ? colors.litText : colors.text;
  const opacity = isLit ? 1 : 0.25;
  const lines = light.label.split("\n");

  return (
    <g opacity={opacity}>
      {/* Outer bevel / inset shadow */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={3}
        fill="#0d0d0d"
        stroke="#333"
        strokeWidth={0.5}
      />
      {/* Inner light face */}
      <rect
        x={x + 1.5}
        y={y + 1.5}
        width={w - 3}
        height={h - 3}
        rx={2}
        fill={fill}
        stroke={isLit ? colors.lit : "#222"}
        strokeWidth={isLit ? 1 : 0.5}
      />
      {/* Glow when lit */}
      {isLit && (
        <rect
          x={x - 2}
          y={y - 2}
          width={w + 4}
          height={h + 4}
          rx={5}
          fill="none"
          stroke={colors.glow}
          strokeWidth={2}
          opacity={0.6}
        />
      )}
      {/* Label */}
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + w / 2}
          y={y + h / 2 + (i - (lines.length - 1) / 2) * (fontSize + 2)}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
          fontSize={fontSize}
          fontWeight={isLit ? "bold" : "normal"}
          fontFamily="monospace"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/* ========================================================
   EpEyebrowPanel — Glareshield eyebrow lights only
   ======================================================== */

interface EpEyebrowPanelProps {
  litLights: EyebrowLightId[];
}

export function EpEyebrowPanel({ litLights }: EpEyebrowPanelProps) {
  const litSet = new Set<string>(litLights);

  // Layout constants
  const cellW = 80;
  const cellH = 32;
  const fireCellW = 64;
  const fireCellH = 38;
  const gapX = 10;
  // Total width: MASTER WARN + gap + FIRE + gap + MASTER CAUTION
  const totalContentW = cellW + gapX + fireCellW + gapX + cellW;
  const padX = 14;
  const padY = 10;
  const svgW = totalContentW + padX * 2;
  const labelH = 14;
  const svgH = padY + labelH + 4 + Math.max(cellH, fireCellH) + padY;

  const bezelColor = "#1a1a1a";

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="w-full rounded-lg"
      style={{ maxWidth: svgW * 1.6, background: bezelColor }}
    >
      {/* Panel frame */}
      <rect
        x={0}
        y={0}
        width={svgW}
        height={svgH}
        rx={6}
        fill={bezelColor}
        stroke="#333"
        strokeWidth={1.5}
      />
      {/* Raised edge highlight */}
      <rect
        x={1}
        y={1}
        width={svgW - 2}
        height={svgH - 2}
        rx={5}
        fill="none"
        stroke="#2a2a2a"
        strokeWidth={0.5}
      />

      {/* Label */}
      <text
        x={svgW / 2}
        y={padY + labelH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#555"
        fontSize={8}
        fontFamily="monospace"
        letterSpacing={2}
      >
        GLARESHIELD
      </text>

      {/* MASTER WARN (left) */}
      {(() => {
        const light = EYEBROW_LIGHTS[0]; // MASTER_WARN
        const yPos = padY + labelH + 4 + (Math.max(cellH, fireCellH) - cellH) / 2;
        return (
          <LightCell
            light={light}
            isLit={litSet.has(light.id)}
            x={padX}
            y={yPos}
            w={cellW}
            h={cellH}
          />
        );
      })()}

      {/* FIRE (center, larger) */}
      {(() => {
        const light = EYEBROW_LIGHTS[1]; // FIRE
        const xPos = padX + cellW + gapX;
        const yPos = padY + labelH + 4 + (Math.max(cellH, fireCellH) - fireCellH) / 2;
        return (
          <LightCell
            light={light}
            isLit={litSet.has(light.id)}
            x={xPos}
            y={yPos}
            w={fireCellW}
            h={fireCellH}
            fontSize={9}
          />
        );
      })()}

      {/* MASTER CAUTION (right) */}
      {(() => {
        const light = EYEBROW_LIGHTS[2]; // MASTER_CAUTION
        const xPos = padX + cellW + gapX + fireCellW + gapX;
        const yPos = padY + labelH + 4 + (Math.max(cellH, fireCellH) - cellH) / 2;
        return (
          <LightCell
            light={light}
            isLit={litSet.has(light.id)}
            x={xPos}
            y={yPos}
            w={cellW}
            h={cellH}
          />
        );
      })()}
    </svg>
  );
}

/* ========================================================
   EpCwsPanel — CWS annunciator grid only (no eyebrow)
   ======================================================== */

interface EpCwsPanelProps {
  litLights: CwsLightId[];
}

export function EpCwsPanel({ litLights }: EpCwsPanelProps) {
  const litSet = new Set<string>(litLights);

  const cellW = 58;
  const cellH = 34;
  const gap = 4;
  const cols = 4;
  const padX = 14;
  const padY = 10;
  const labelH = 16;
  const gridW = cols * cellW + (cols - 1) * gap;
  const svgW = gridW + padX * 2;

  const rows = CWS_GRID.length;
  const gridH = rows * cellH + (rows - 1) * gap;

  const gridStartY = padY + labelH + 8;
  const svgH = gridStartY + gridH + padY;

  const bezelColor = "#1a1a1a";

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="w-full rounded-lg"
      style={{ maxWidth: svgW * 1.4, background: bezelColor }}
    >
      {/* Panel frame */}
      <rect
        x={0}
        y={0}
        width={svgW}
        height={svgH}
        rx={6}
        fill={bezelColor}
        stroke="#333"
        strokeWidth={1.5}
      />
      {/* Raised edge highlight */}
      <rect
        x={1}
        y={1}
        width={svgW - 2}
        height={svgH - 2}
        rx={5}
        fill="none"
        stroke="#2a2a2a"
        strokeWidth={0.5}
      />

      {/* Panel label */}
      <text
        x={svgW / 2}
        y={padY + labelH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#555"
        fontSize={8}
        fontFamily="monospace"
        letterSpacing={2}
      >
        CWS ANNUNCIATOR PANEL
      </text>

      {/* CWS grid */}
      {CWS_GRID.map((row, ri) =>
        row.map((light, ci) => (
          <LightCell
            key={light.id}
            light={light}
            isLit={litSet.has(light.id)}
            x={padX + ci * (cellW + gap)}
            y={gridStartY + ri * (cellH + gap)}
            w={cellW}
            h={cellH}
          />
        ))
      )}
    </svg>
  );
}
