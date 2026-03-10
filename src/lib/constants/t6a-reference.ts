/**
 * T-6A Texan II Reference Data for EP Practice
 *
 * Source: T-6A BOLDFACE Emergency Procedures and Operating Limitations, 01 June 2023
 *
 * NOTE: This data is from the student boldface/ops limits study sheet.
 * Always verify against official publications (-1, -1CL).
 */

export interface BoldfaceProcedure {
  name: string;
  trigger: string;
  steps: string[];
}

/**
 * Fill in with T-6A boldface/critical action procedures.
 * Example structure provided — replace with actual data from your -1CL.
 */
export const T6A_BOLDFACE: BoldfaceProcedure[] = [
  {
    name: "Emergency Engine Shutdown on the Ground",
    trigger: "Need to shut down engine on ground in an emergency",
    steps: [
      "PCL - OFF",
      "FIREWALL SHUTOFF HANDLE - PULL",
    ],
  },
  {
    name: "Abort",
    trigger: "Aborting takeoff",
    steps: [
      "PCL - IDLE",
      "BRAKES - AS REQUIRED",
    ],
  },
  {
    name: "Engine Failure Immediately After Takeoff (Sufficient Runway Remaining Straight Ahead)",
    trigger: "Engine failure after takeoff with runway remaining",
    steps: [
      "AIRSPEED - 110 KNOTS (MINIMUM)",
      "PCL - AS REQUIRED",
      "EMER LDG GR HANDLE - PULL (AS REQUIRED)",
    ],
  },
  {
    name: "Engine Failure During Flight",
    trigger: "Engine failure in flight",
    steps: [
      "ZOOM/GLIDE - 125 KNOTS (MINIMUM)",
      "PCL - OFF",
      "INTERCEPT ELP",
    ],
  },
  {
    name: "Immediate Airstart (PMU NORM)",
    trigger: "Attempting engine restart in flight with PMU in NORM",
    steps: [
      "PCL - OFF",
      "STARTER SWITCH - AUTO/RESET",
      "PCL - IDLE, ABOVE 13% N1",
    ],
  },
  {
    name: "Uncommanded Power Changes / Loss of Power / Uncommanded Propeller Feather",
    trigger: "Uncommanded power changes, loss of power, or uncommanded prop feather",
    steps: [
      "PCL - MID RANGE",
      "PMU SWITCH - OFF",
      "PROP SYS CIRCUIT BREAKER (left front console) - PULL, IF Np STABLE BELOW 40%",
    ],
  },
  {
    name: "Inadvertent Departure From Controlled Flight",
    trigger: "Aircraft departs controlled flight (spin, unusual attitude)",
    steps: [
      "PCL - IDLE",
      "CONTROLS - NEUTRAL",
      "ALTITUDE - CHECK",
    ],
  },
  {
    name: "Fire In Flight, If Fire is Confirmed",
    trigger: "Confirmed fire in flight",
    steps: [
      "PCL - OFF",
      "FIREWALL SHUTOFF HANDLE - PULL",
    ],
  },
  {
    name: "Physiological Symptoms",
    trigger: "Crew member experiencing physiological symptoms",
    steps: [
      "BOS PUSH MAN - PRESS ON",
    ],
  },
  {
    name: "OBOGS Failure / Overtemp / Physiological Symptoms / OXY CRIT Annunciator",
    trigger: "OBOGS failure, overtemp, physiological symptoms, or OXY CRIT annunciator",
    steps: [
      "GREEN RING - PULL (AS REQUIRED)",
      "DESCENT BELOW 10,000 FEET MSL - INITIATE",
      "OBOGS SUPPLY LEVER - OFF (BOTH)",
    ],
  },
  {
    name: "Eject",
    trigger: "Decision to eject from aircraft",
    steps: [
      "EJECTION HANDLE - PULL",
    ],
  },
];

export interface OpsLimit {
  name: string;
  value: string;
  unit: string;
}

/**
 * Fill in with T-6A operating limitations.
 * Example structure provided — replace with actual values from your -1.
 */
export const T6A_OPS_LIMITS: OpsLimit[] = [
  // Airspeed
  { name: "Max Airspeed Gear and/or Flaps", value: "150", unit: "KIAS" },
  { name: "Max Operating Speed (VNE)", value: "316", unit: "KIAS" },
  { name: "Max Operating Mach", value: "0.67", unit: "Mach" },
  { name: "Full Rudder Deflection Limit", value: "150", unit: "KIAS (above this exceeds rudder control system limits)" },
  // Engine - Torque
  { name: "Max Torque (Takeoff/Max)", value: "100", unit: "%" },
  { name: "Torque Transient", value: "101-107", unit: "% (5 seconds)" },
  { name: "Torque Malfunction Indication", value: ">107", unit: "%" },
  // Engine - ITT
  { name: "Max ITT Idle", value: "750", unit: "\u00B0C" },
  { name: "Max ITT Takeoff/Max", value: "820", unit: "\u00B0C" },
  { name: "ITT Transient", value: "821-870", unit: "\u00B0C (20 seconds)" },
  { name: "Max ITT Do Not Attempt Restart", value: "871-1000", unit: "\u00B0C for 5 sec" },
  // Engine - N1
  { name: "N1 Idle (Ground)", value: "60-61", unit: "%" },
  { name: "N1 Min (Flight)", value: "67", unit: "%" },
  // Engine - Np
  { name: "Np Idle", value: "46-50", unit: "%" },
  { name: "Np Takeoff/Max", value: "100", unit: "% (100% \u00B12% PMU Off)" },
  { name: "Np Avoid Stabilized Ground Ops", value: "62-80", unit: "% Np" },
  // Oil
  { name: "Oil Pressure Takeoff/Max", value: "90-120", unit: "PSI" },
  { name: "Oil Pressure Aerobatics/Spins", value: "40-130", unit: "PSI" },
  { name: "Oil Pressure Aerobatics/Spins (Idle)", value: "15-40", unit: "PSI (5 sec)" },
  { name: "Oil Temp Takeoff/Max", value: "10-105", unit: "\u00B0C" },
  { name: "Oil Temp Transient", value: "106-110", unit: "\u00B0C (10 min)" },
  { name: "Max Oil Pressure", value: "200", unit: "PSI" },
  { name: "Min Oil Temperature", value: "-40", unit: "\u00B0C" },
  // Electrical
  { name: "Min Battery Voltage", value: "23.5", unit: "V" },
  // Fuel
  { name: "Max Fuel Flow", value: "799", unit: "PPH" },
  { name: "Normal Recovery Fuel", value: "200", unit: "lbs" },
  { name: "Minimum Fuel", value: "150", unit: "lbs (200 lbs Solo)" },
  { name: "Emergency Fuel", value: "100", unit: "lbs" },
  { name: "Min Fuel for Aerobatics", value: "150", unit: "lbs per side" },
  // Starting
  { name: "Starter Limit", value: "20", unit: "seconds" },
  { name: "Starter Wait Cycle", value: "30 sec, 2 min, 5 min, 30 min", unit: "after each start/motoring attempt" },
  // Pressurization
  { name: "Normal Pressurization (Above 18,000 ft MSL)", value: "3.6 \u00B1 0.2", unit: "PSI" },
  { name: "Overpressurization Safety Valve", value: "4.0", unit: "PSI" },
  // Runway
  { name: "Min Landing Distance Available", value: "4,000", unit: "ft (or heavy weight flaps UP ground roll + 500 ft)" },
  { name: "Min Runway Width", value: "75", unit: "ft" },
  // Winds
  { name: "Max Crosswind (Dry Runway)", value: "25", unit: "knots" },
  { name: "Max Crosswind (Wet Runway)", value: "10", unit: "knots" },
  { name: "Max Crosswind (Icy Runway)", value: "5", unit: "knots" },
  { name: "Max Crosswind (Touch-and-Go)", value: "20", unit: "knots" },
  { name: "Max Crosswind (Formation Takeoff/Landing)", value: "15", unit: "knots" },
  { name: "Max Tailwind for Takeoff", value: "10", unit: "knots" },
  { name: "Max Wind with Canopy Open", value: "40", unit: "knots" },
  // G-Limits
  { name: "Symmetric Clean", value: "-3.5 to +7.0", unit: "Gs" },
  { name: "Symmetric Gear/Flaps", value: "0 to +2.5", unit: "Gs" },
  { name: "Asymmetric Clean", value: "-1.0 to +4.7", unit: "Gs" },
  { name: "Asymmetric Gear/Flaps", value: "0 to +2.0", unit: "Gs" },
  // Spins
  { name: "Min Altitude for Intentional Spin Entry", value: "13,500", unit: "ft MSL" },
  { name: "Min Cloud Clearance for Spins", value: "7,000", unit: "ft above clouds" },
  { name: "Spins Below", value: "10,000", unit: "ft pressure altitude prohibited" },
  { name: "Spins Above", value: "22,000", unit: "ft pressure altitude prohibited" },
  // Icing
  { name: "Max Icing Band", value: "5,000", unit: "ft" },
  { name: "Max Icing Type", value: "light rime", unit: "" },
  // Temperature
  { name: "Ground Operation Ambient Temp", value: "-23 to 43", unit: "\u00B0C" },
];

export interface ElpParameters {
  highKeyAltitudeAgl: string;
  lowKeyAltitudeAgl: string;
  baseKeyAltitudeAgl: string;
  descentRate: string;
  finalApproachSpeed: string;
  gearExtensionPoint: string;
}

/**
 * Fill in with ELP (Emergency Landing Pattern) parameters.
 */
export const T6A_ELP: ElpParameters = {
  highKeyAltitudeAgl: "", // e.g., "3000-5000 ft AGL"
  lowKeyAltitudeAgl: "",
  baseKeyAltitudeAgl: "",
  descentRate: "",
  finalApproachSpeed: "",
  gearExtensionPoint: "",
};

/**
 * Standard mnemonics — these are general aviation / USAF training knowledge,
 * not CUI content.
 */
export const MNEMONICS = {
  BPWANTFACTS: {
    name: "BPWANTFACTS",
    description: "Initial information gathering / setup for standup EP",
    items: [
      { letter: "B", meaning: "Briefed — what was briefed for EPs, abort plan (abort for any light/tone/annunciation; sick/dead engine w/ runway = land straight ahead; dead engine w/o runway = zoom to eject; sick engine w/o runway = TCCC to low key; else high pattern weather permitting or radar vectors for checklists)" },
      { letter: "P", meaning: "Profile — mission profile (North Low + Dogface, East High + KWDG, Pattern Delay, etc.)" },
      { letter: "W", meaning: "Weather/Writeups — Vance METAR, MOA cloud layers (e.g., SCT 080-120), any aircraft writeups (TAD inop, etc.) or no writeups" },
      { letter: "A", meaning: "Airspeed/Altitude/Heading/Attitude, ABOS equipped?" },
      { letter: "N", meaning: "NOTAMs — any active NOTAMs affecting the mission" },
      { letter: "T", meaning: "TOLD — takeoff distance, abort speeds, landing distances" },
      { letter: "F", meaning: "Fuel — total fuel state, each side, balanced? (e.g., 800 total, 400 each side, balanced)" },
      { letter: "A", meaning: "Airspace/positioning — location relative to emergency fields (Vance, Dogface, Woodring), which is closest" },
      { letter: "C", meaning: "Clearing/Comms — current frequency (Vance Apr/Dep, Approach North, Approach East, Vance Tower/RSU, Vance Ground, discrete freq in MOA)" },
      { letter: "T", meaning: "Traffic — any conflicts, SA on traffic in nearby areas" },
      { letter: "S", meaning: "Situation/SA/Self — physiological state, orientation in MOA, anything else relevant" },
    ],
  },
  MATSLACAP: {
    name: "MATSLACAP",
    description: "Maintain Aircraft Control considerations",
    items: [
      { letter: "M", meaning: "Maintain aircraft control" },
      { letter: "A", meaning: "Altitude (sufficient for recovery?)" },
      { letter: "T", meaning: "Trim (set for current config)" },
      { letter: "S", meaning: "Speed (maintain safe airspeed)" },
      { letter: "L", meaning: "Levelness (wings level, coordinated)" },
      { letter: "A", meaning: "Attitude (appropriate pitch)" },
      { letter: "C", meaning: "Configuration (gear, flaps, PCL)" },
      { letter: "A", meaning: "Airmanship (don't chase indicators)" },
      { letter: "P", meaning: "Power (set appropriately)" },
    ],
  },
  BEAN: {
    name: "BEAN",
    description: "Take Proper Action decision options",
    items: [
      { letter: "B", meaning: "Boldface (execute critical action)" },
      { letter: "E", meaning: "Eject" },
      { letter: "A", meaning: "Attempt restart (if applicable)" },
      { letter: "N", meaning: "Navigate to nearest suitable" },
    ],
  },
  LASAP: {
    name: "LASAP",
    description: "Land As Soon As Possible decision framework",
    items: [
      { letter: "L", meaning: "Land as soon as possible" },
      { letter: "A", meaning: "As soon as possible" },
      { letter: "S", meaning: "Straight-in/overhead" },
      { letter: "A", meaning: "As soon as practical" },
      { letter: "P", meaning: "Precautionary / when desired" },
    ],
  },
};

/**
 * Format reference data for injection into system prompt.
 * Only includes data the user has filled in.
 */
export function formatReferenceData(): string {
  const sections: string[] = [];

  // Boldface
  if (T6A_BOLDFACE.length > 0) {
    const boldfaceText = T6A_BOLDFACE.map(
      (proc) =>
        `### ${proc.name}\nTrigger: ${proc.trigger}\nSteps:\n${proc.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
    ).join("\n\n");
    sections.push(`## Boldface Procedures\n${boldfaceText}`);
  }

  // Ops limits
  if (T6A_OPS_LIMITS.length > 0) {
    const limitsText = T6A_OPS_LIMITS.map(
      (l) => `- ${l.name}: ${l.value} ${l.unit}`
    ).join("\n");
    sections.push(`## Operating Limitations\n${limitsText}`);
  }

  // ELP
  const elpValues = Object.values(T6A_ELP).filter(Boolean);
  if (elpValues.length > 0) {
    const elpText = [
      T6A_ELP.highKeyAltitudeAgl && `- High Key: ${T6A_ELP.highKeyAltitudeAgl}`,
      T6A_ELP.lowKeyAltitudeAgl && `- Low Key: ${T6A_ELP.lowKeyAltitudeAgl}`,
      T6A_ELP.baseKeyAltitudeAgl && `- Base Key: ${T6A_ELP.baseKeyAltitudeAgl}`,
      T6A_ELP.descentRate && `- Descent Rate: ${T6A_ELP.descentRate}`,
      T6A_ELP.finalApproachSpeed && `- Final Approach Speed: ${T6A_ELP.finalApproachSpeed}`,
      T6A_ELP.gearExtensionPoint && `- Gear Extension: ${T6A_ELP.gearExtensionPoint}`,
    ]
      .filter(Boolean)
      .join("\n");
    sections.push(`## ELP Parameters\n${elpText}`);
  }

  // Always include mnemonics (not CUI)
  const mnemonicText = Object.values(MNEMONICS)
    .map(
      (m) =>
        `### ${m.name} — ${m.description}\n${m.items.map((i) => `- **${i.letter}**: ${i.meaning}`).join("\n")}`
    )
    .join("\n\n");
  sections.push(`## Mnemonics\n${mnemonicText}`);

  return sections.join("\n\n");
}
