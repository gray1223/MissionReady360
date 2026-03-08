/** Convert snake_case enum values to Title Case display labels */
export function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Flight condition labels (special casing for NVG) */
const CONDITION_LABELS: Record<string, string> = {
  day: "Day",
  night: "Night",
  nvg: "NVG",
  mixed: "Mixed",
};

export function formatCondition(value: string): string {
  return CONDITION_LABELS[value] || formatLabel(value);
}
