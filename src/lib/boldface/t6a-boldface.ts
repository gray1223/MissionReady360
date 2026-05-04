/**
 * T-6A USAF Boldface Emergency Procedures.
 *
 * Conservative starter set. Boldface text changes with TO updates and varies
 * across squadrons / FTUs — the user MUST verify against their current
 * squadron's authoritative publication before relying on these for graded
 * recitation. The drill UI surfaces a verification banner.
 *
 * Items are intentionally limited to procedures that are commonly recognized
 * as boldface across multiple T-6A units. Items the schoolhouse calls
 * "non-bold checklist" or "underlined" steps are intentionally NOT included
 * (e.g. smoke/fumes/fire of unknown origin, engine failure when no immediate
 * airstart is possible). Add unit-specific items by editing this file.
 */

export type BoldfaceItem = {
  id: string;
  airframe: "t6a";
  title: string;
  steps: string[]; // each step like "PCL — OFF"
  notes?: string;
};

export const T6A_BOLDFACE: BoldfaceItem[] = [
  {
    id: "abort-start",
    airframe: "t6a",
    title: "Abort Start",
    steps: [
      "PCL — OFF",
      "Battery — OFF (After Engine Has Stopped)",
    ],
  },
  {
    id: "emergency-engine-shutdown-ground",
    airframe: "t6a",
    title: "Emergency Engine Shutdown on the Ground",
    steps: [
      "PCL — OFF",
      "Boost Pump — OFF (Battery if Required)",
      "FW Shutoff — Pull",
      "Battery — OFF",
    ],
  },
  {
    id: "emergency-ground-egress",
    airframe: "t6a",
    title: "Emergency Ground Egress",
    steps: [
      "PCL — OFF (As Required)",
      "Boost Pump — OFF",
      "FW Shutoff — Pull",
      "Battery — OFF",
      "Egress",
    ],
  },
  {
    id: "engine-failure-immediate-airstart-pmu-norm",
    airframe: "t6a",
    title: "Engine Failure During Flight — Immediate Airstart (PMU NORM)",
    steps: [
      "PCL — As Required",
    ],
  },
  {
    id: "engine-failure-immediate-airstart-pmu-off",
    airframe: "t6a",
    title: "Engine Failure During Flight — Immediate Airstart (PMU OFF)",
    steps: [
      "PCL — OFF, Then IDLE",
      "PMU — OFF",
    ],
  },
  {
    id: "engine-fire-during-flight",
    airframe: "t6a",
    title: "Engine Fire During Flight",
    steps: [
      "PCL — OFF",
      "FW Shutoff — Pull",
      "Boost Pump — OFF",
      "Battery — OFF (After Engine Has Stopped)",
      "If Fire Persists — Eject",
    ],
  },
  {
    id: "inadvertent-departure-controlled-flight",
    airframe: "t6a",
    title: "Inadvertent Departure from Controlled Flight",
    steps: [
      "PCL — IDLE",
      "Controls — Neutral",
      "If Not Recovered by 10,000 Ft AGL — Eject",
    ],
  },
  {
    id: "controlled-ejection",
    airframe: "t6a",
    title: "Controlled Ejection",
    steps: [
      "Airspeed — As Slow As Practical",
      "Altitude — Adequate to Permit Ejection",
      "Eject",
    ],
  },
];

export function getBoldfaceById(id: string): BoldfaceItem | undefined {
  return T6A_BOLDFACE.find((item) => item.id === id);
}

export function getAllBoldface(): BoldfaceItem[] {
  return T6A_BOLDFACE;
}

/** Render an item's canonical answer as a single multi-line string for grading/display. */
export function renderBoldfaceAnswer(item: BoldfaceItem): string {
  return item.steps
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");
}
