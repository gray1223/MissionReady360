/**
 * T-6A USAF Boldface Emergency Procedures.
 *
 * Source: drafted from publicly published CNATRA / 80th FTW / 71st FTW boldface
 * lists. Boldface text changes with TO updates — the user MUST verify against
 * their current squadron / FTU publication before using these for graded
 * recitation. The drill UI surfaces a verification banner.
 */

export type BoldfaceItem = {
  id: string;
  airframe: "t6a";
  title: string;
  steps: string[]; // each step like "Power Lever — OFF"
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
    id: "engine-failure-airstart-not-possible",
    airframe: "t6a",
    title: "Engine Failure During Flight — When Immediate Airstart Not Possible",
    steps: [
      "Zoom — As Required",
      "PCL — OFF",
      "Set Up for Forced Landing or Ejection",
      "Emergency Engine Shutdown — Complete",
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
    id: "uncommanded-power-changes",
    airframe: "t6a",
    title: "Uncommanded Power Changes / Loss of Thrust / Uncommanded Power Reduction",
    steps: [
      "PCL — As Required",
      "PMU — OFF (As Required)",
    ],
  },
  {
    id: "smoke-fumes-fire-unknown-origin",
    airframe: "t6a",
    title: "Smoke / Fumes / Fire of Unknown Origin",
    steps: [
      "Oxygen — 100%, Emergency",
      "Vent Air — Closed",
      "Defog — Off",
      "Cabin Air — Off",
    ],
  },
  {
    id: "emergency-engine-shutdown-flight",
    airframe: "t6a",
    title: "Emergency Engine Shutdown During Flight",
    steps: [
      "PCL — OFF",
      "FW Shutoff — Pull",
      "Boost Pump — OFF",
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
