"use client";

/**
 * T-6A CWS (Central Warning System) Annunciator Panel mockup.
 * Rendered as SVG to show lit/unlit annunciator lights during EP practice.
 *
 * Source: Milviz T-6A User Guide (public, non-CUI).
 *
 * Glareshield eyebrow lights (MASTER WARN, MASTER CAUTION, FIRE) are
 * shown above the CWS panel as a separate row.
 */

export type CwsLightId =
  // Glareshield eyebrow lights
  | "MASTER_WARN"
  | "MASTER_CAUTION"
  | "FIRE"
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
  id: CwsLightId;
  label: string;
  color: "red" | "amber" | "green";
}

// Glareshield eyebrow lights
const EYEBROW_LIGHTS: LightDef[] = [
  { id: "MASTER_WARN", label: "MASTER\nWARN", color: "red" },
  { id: "FIRE", label: "FIRE", color: "red" },
  { id: "MASTER_CAUTION", label: "MASTER\nCAUTION", color: "amber" },
];

// CWS panel lights in grid order (4 columns)
const CWS_GRID: LightDef[][] = [
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
  red: { lit: "#ef4444", dim: "#451a1a", text: "#fca5a5" },
  amber: { lit: "#f59e0b", dim: "#451a03", text: "#fcd34d" },
  green: { lit: "#10b981", dim: "#052e16", text: "#6ee7b7" },
};

interface EpCwsPanelProps {
  litLights: CwsLightId[];
}

function LightCell({
  light,
  isLit,
  x,
  y,
  w,
  h,
}: {
  light: LightDef;
  isLit: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const colors = COLOR_MAP[light.color];
  const fill = isLit ? colors.lit : colors.dim;
  const textColor = isLit ? "#000" : colors.text;
  const opacity = isLit ? 1 : 0.3;
  const lines = light.label.split("\n");

  return (
    <g opacity={opacity}>
      {/* Light background */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={2}
        fill={fill}
        stroke={isLit ? colors.lit : "#334155"}
        strokeWidth={isLit ? 1.5 : 0.5}
      />
      {/* Glow effect when lit */}
      {isLit && (
        <rect
          x={x - 1}
          y={y - 1}
          width={w + 2}
          height={h + 2}
          rx={3}
          fill="none"
          stroke={colors.lit}
          strokeWidth={1}
          opacity={0.4}
        />
      )}
      {/* Label text */}
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + w / 2}
          y={y + h / 2 + (i - (lines.length - 1) / 2) * 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
          fontSize={7.5}
          fontWeight={isLit ? "bold" : "normal"}
          fontFamily="monospace"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export function EpCwsPanel({ litLights }: EpCwsPanelProps) {
  const litSet = new Set(litLights);

  const cellW = 56;
  const cellH = 30;
  const gap = 4;
  const cols = 4;
  const panelPadX = 12;
  const panelPadY = 8;
  const gridW = cols * cellW + (cols - 1) * gap;
  const svgW = gridW + panelPadX * 2;

  // Eyebrow section height
  const eyebrowH = 36;
  const eyebrowGap = 12;

  // CWS grid rows
  const rows = CWS_GRID.length;
  const gridH = rows * cellH + (rows - 1) * gap;

  const totalH =
    eyebrowH + eyebrowGap + 16 /* label */ + panelPadY * 2 + gridH + 8;

  const eyebrowY = 4;
  const panelLabelY = eyebrowY + eyebrowH + eyebrowGap;
  const gridStartY = panelLabelY + 16 + panelPadY;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${totalH}`}
      className="w-full rounded-lg border border-slate-700 bg-slate-950"
      style={{ maxWidth: svgW * 1.4 }}
    >
      {/* Glareshield eyebrow lights */}
      <text
        x={svgW / 2}
        y={eyebrowY + 6}
        textAnchor="middle"
        fill="#64748b"
        fontSize={7}
        fontFamily="monospace"
      >
        GLARESHIELD
      </text>
      {EYEBROW_LIGHTS.map((light, i) => {
        const totalEyebrowW = 3 * 72 + 2 * 8;
        const startX = (svgW - totalEyebrowW) / 2;
        return (
          <LightCell
            key={light.id}
            light={light}
            isLit={litSet.has(light.id)}
            x={startX + i * (72 + 8)}
            y={eyebrowY + 10}
            w={72}
            h={eyebrowH - 14}
          />
        );
      })}

      {/* CWS Panel border */}
      <rect
        x={panelPadX - 4}
        y={panelLabelY - 2}
        width={gridW + 8}
        height={gridH + panelPadY * 2 + 18}
        rx={4}
        fill="none"
        stroke="#334155"
        strokeWidth={1}
      />
      <text
        x={svgW / 2}
        y={panelLabelY + 10}
        textAnchor="middle"
        fill="#64748b"
        fontSize={8}
        fontFamily="monospace"
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
            x={panelPadX + ci * (cellW + gap)}
            y={gridStartY + ri * (cellH + gap)}
            w={cellW}
            h={cellH}
          />
        ))
      )}
    </svg>
  );
}
