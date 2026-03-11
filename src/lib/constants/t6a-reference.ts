/**
 * T-6A Texan II Reference Data for EP Practice
 *
 * Boldface: From student boldface/ops limits study sheet.
 * Checklists: Adapted from the Milviz T-6A User Guide (public, non-CUI).
 *
 * DISCLAIMER: This data is NOT official source material and should NOT be used
 * in place of actual USAF publications or documents. For training reference only.
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

/**
 * Emergency procedure checklists (non-boldface).
 * Adapted from Milviz T-6A User Guide — NOT official source material.
 */
export interface ChecklistProcedure {
  name: string;
  category: "ground" | "engine" | "electrical" | "avionics" | "fuel" | "hydraulic" | "landing" | "fire" | "physiological" | "flight_control";
  trigger: string;
  steps: string[];
  notes?: string[];
}

export const T6A_CHECKLISTS: ChecklistProcedure[] = [
  // === GROUND EMERGENCIES ===
  {
    name: "Abort Start Procedure",
    category: "ground",
    trigger: "ITT rising toward 1000°C (hot start), N1 stalls (hung start), or no ITT rise within 10 sec of fuel flow",
    steps: [
      "PCL – OFF; or STARTER switch – AUTO/RESET",
      "Perform Motoring Run Procedure",
    ],
  },
  {
    name: "Motoring Run Procedure",
    category: "ground",
    trigger: "After an abort start or to clear the engine",
    steps: [
      "PCL – OFF",
      "IGNITION switch – NORM",
      "STARTER switch – MANUAL for 20 seconds",
    ],
  },
  {
    name: "Aircraft Departs Prepared Surface",
    category: "ground",
    trigger: "Aircraft likely to leave prepared surface during takeoff/landing",
    steps: [
      "Abort (PCL IDLE, BRAKES AS REQUIRED)",
      "IF TAKEOFF IS CONTINUED:",
      "Gear and flaps position – Do not change",
      "Straight-in approach – Execute",
    ],
    notes: ["If aircraft departs prepared surface, perform Emergency Engine Shutdown on the Ground"],
  },

  // === ENGINE EMERGENCIES ===
  {
    name: "Engine Failure During Flight (Full Checklist)",
    category: "engine",
    trigger: "Engine failure in flight — declining N1, torque, ITT; prop moving toward feather. GEN, FUEL PX, OIL PX annunciators illuminate, then OBOGS FAIL. N1 shows 0% within ~5 sec.",
    steps: [
      "ZOOM/GLIDE – 125 KNOTS (MINIMUM) [BOLDFACE]",
      "PCL – OFF [BOLDFACE]",
      "INTERCEPT ELP [BOLDFACE]",
      "Airstart – Attempt if warranted",
      "IF CONDITIONS DO NOT WARRANT AN AIRSTART:",
      "FIREWALL SHUTOFF handle – Pull",
      "Execute Forced Landing",
    ],
    notes: [
      "Above 150 KIAS: 2G pull zoom climb to ~20° pitch, bunt 0-0.5G to capture 125 KIAS",
      "Below 150 KIAS: Decelerate level to 125 KIAS, then descend",
      "Zoom at 200 KIAS ≈ 600-900 ft altitude gain; 250 KIAS ≈ 1170-1550 ft gain",
      "Expect ~1200 ft altitude loss during airstart attempt at 125 KIAS",
      "Useful power available ~40 sec after engaging starter",
      "If engine spools down, may not have hydraulic pressure for gear/flaps",
    ],
  },
  {
    name: "PMU NORM Airstart",
    category: "engine",
    trigger: "Engine failure not caused by fire or mechanical failure, PMU FAIL not illuminated",
    steps: [
      "PCL – OFF",
      "Confirm: START, IGN, BOOST PUMP, PMU circuit breakers – In; FIREWALL SHUTOFF handle – Down",
      "BLEED AIR INFLOW switch – OFF",
      "BOOST PUMP switch – ON",
      "IGNITION switch – ON",
      "STARTER switch – AUTO/RESET",
      "PCL – IDLE, above 13% N1",
      "Engine instruments – Monitor ITT, N1, and oil pressure",
      "IF AIRSTART UNSUCCESSFUL: PCL OFF, FIREWALL SHUTOFF HANDLE PULL, Execute Forced Landing",
      "IF AIRSTART SUCCESSFUL:",
      "PCL – As required after N1 reaches ~67% (IDLE RPM)",
      "STARTER switch – NORM",
      "GEN switch – Verify ON; reset if necessary",
      "IGNITION switch – NORM",
      "BOOST PUMP switch – ARM",
      "BLEED AIR INFLOW switch – NORM",
      "OBOGS – As required",
      "PEL – Execute",
    ],
  },
  {
    name: "PMU OFF Airstart",
    category: "engine",
    trigger: "Engine failure with PMU FAIL illuminated",
    steps: [
      "PCL – OFF",
      "STARTER SWITCH – AUTO/RESET",
      "PCL – IDLE, ABOVE 13% N1",
      "Engine instruments – Monitor ITT, N1, and oil pressure",
      "IF AIRSTART UNSUCCESSFUL: PCL OFF, FIREWALL SHUTOFF HANDLE PULL, Execute Forced Landing",
      "IF AIRSTART SUCCESSFUL:",
      "PCL – As required after N1 reaches ~67% (IDLE RPM)",
      "Confirm: IGNITION switch ON, BOOST PUMP switch ON",
      "STARTER switch – NORM",
      "BLEED AIR INFLOW switch – NORM",
      "GEN switch – Verify ON; reset if necessary",
      "OBOGS – As required",
      "PEL – Execute",
    ],
    notes: [
      "Starting ITT may be 40°C hotter if BLEED AIR INFLOW not OFF",
      "Prop reaches operating RPM ~20 sec after N1 reaches 45%",
      "Slowly advance PCL — too fast causes high ITT and possible engine damage",
    ],
  },
  {
    name: "Compressor Stalls",
    category: "engine",
    trigger: "Loud bang/misfire, fluctuating torque/ITT/N1/fuel flow, flames/smoke from exhaust",
    steps: [
      "PCL – Slowly retard below stall threshold",
      "DEFOG switch – ON",
      "PCL – Slowly advance (as required)",
      "IF POWER SUFFICIENT: PEL – Execute",
      "IF POWER INSUFFICIENT: PCL OFF, FIREWALL SHUTOFF HANDLE PULL, Execute Forced Landing",
    ],
  },
  {
    name: "Uncommanded Power Changes / Loss of Power / Uncommanded Propeller Feather (Full Checklist)",
    category: "engine",
    trigger: "Uncommanded power changes, loss of power, or propeller feathering uncommanded",
    steps: [
      "PCL – MID RANGE [BOLDFACE]",
      "PMU SWITCH – OFF [BOLDFACE]",
      "PROP SYS CIRCUIT BREAKER – PULL IF Np BELOW 40% [BOLDFACE]",
      "PCL – As required",
      "IF POWER SUFFICIENT: PEL – Execute",
      "IF POWER INSUFFICIENT:",
      "PROP SYS circuit breaker – Reset, as required",
      "PCL – OFF",
      "FIREWALL SHUTOFF handle – Pull",
      "Execute Forced Landing",
    ],
  },
  {
    name: "PMU Failure",
    category: "engine",
    trigger: "PMU FAIL and PMU STATUS both illuminated; sudden power change as fuel management switches to manual",
    steps: [
      "PCL – Minimum practical for flight",
      "PMU switch – OFF",
      "TO RESET PMU:",
      "IGN, START, and PMU circuit breakers – Check and reset if necessary",
      "PMU switch – NORM (attempt second reset if necessary)",
      "IF PMU RESET UNSUCCESSFUL:",
      "PMU switch – OFF",
      "Land as soon as practical",
    ],
    notes: ["With PMU OFF: no auto torque/ITT/N1 control — must meter fuel manually with PCL"],
  },
  {
    name: "PMU Fault",
    category: "engine",
    trigger: "PMU STATUS illuminated, PMU FAIL NOT illuminated — PMU detected fault but remains operational",
    steps: [
      "ON GROUND: PMU switch OFF, then NORM. Verify cause if PMU STATUS stays lit.",
      "INFLIGHT: WOW switch discrepancy detected; reset not an option.",
    ],
  },
  {
    name: "Chip Detector Warning",
    category: "engine",
    trigger: "CHIP annunciator illuminated — metal contamination in engine oil, engine may fail suddenly",
    steps: [
      "PCL – Minimum necessary to intercept ELP; avoid unnecessary PCL movements",
      "PEL – Execute",
    ],
  },
  {
    name: "Oil System Malfunction or Low Oil Pressure",
    category: "engine",
    trigger: "OIL PX annunciator (red or amber)",
    steps: [
      "IF ONLY AMBER OIL PX ILLUMINATES:",
      "Terminate maneuver",
      "Check oil pressure — if normal, continue operations",
      "IF RED OIL PX ILLUMINATES AND/OR AMBER OIL PX REMAINS >5 SECONDS:",
      "PCL – Minimum necessary to intercept ELP; avoid unnecessary PCL movements",
      "PEL – Execute",
    ],
  },

  // === ELECTRICAL ===
  {
    name: "Generator Inoperative",
    category: "electrical",
    trigger: "GEN annunciator illuminated",
    steps: [
      "STARTER switch – NORM (BOTH)",
      "GEN switch – ON (front or back)",
      "GEN RESET switch – Depress and hold ≥1 second",
      "GEN switch – OFF (BOTH)",
      "BUS TIE switch – OPEN (BUS TIE and GEN BUS indicators on)",
      "Land as soon as possible",
    ],
  },
  {
    name: "Generator Bus Inoperative",
    category: "electrical",
    trigger: "GEN BUS annunciator illuminated — loss of generator bus and associated avionics buses",
    steps: [
      "BUS TIE switch – NORM",
      "Land as soon as practical",
    ],
    notes: ["Inop: EHSI, RMU, VHF Comm/Nav/DME, Transponder, A/C, Warning Tones, NWS, Speed Brake, Fire Detector #2, TAD, GPS(RCP), AOA/Pitot Heat, ASI"],
  },
  {
    name: "Battery Bus Inoperative",
    category: "electrical",
    trigger: "BAT BUS annunciator illuminated",
    steps: [
      "IF BAT BUS annunciator only (no other bus failure indications): Investigate CWS circuit breaker — do NOT reset if open",
      "IF accompanied by other battery bus failure indications:",
      "Descent below 18,000 ft MSL – Initiate (as required)",
      "BUS TIE switch – OPEN",
      "AUX BAT switch – ON",
      "Backup UHF – ON",
      "Land as soon as feasible",
    ],
    notes: ["Related CWS lights with actual bus failure: TRIM OFF, OIL PX, HYDR FL LO, PMU STATUS"],
  },
  {
    name: "Bus Tie Inoperative",
    category: "electrical",
    trigger: "BUS TIE annunciator illuminated — battery and generator buses disconnected",
    steps: [
      "BUS TIE switch – NORM",
      "Land as soon as feasible",
    ],
  },
  {
    name: "Battery and Generator Failure",
    category: "electrical",
    trigger: "Generator failure with complete main battery depletion",
    steps: [
      "Descent below 18,000 ft MSL – Initiate (as required)",
      "AUX BAT switch – ON",
      "Land as soon as feasible",
    ],
    notes: [
      "Only operational: standby gauges/lighting, fire detection (FIRE 1 only), backup UHF",
      "Inop: OBOGS, ICS, all electronic displays, PMU, starter, CWS (except FIRE 1), gear/flap indicators, probes anti-ice, interior/exterior lighting (except standby floods), ECS/pressurization, VHF comm/nav/GPS",
    ],
  },

  // === AVIONICS ===
  {
    name: "Total AHRS Failure",
    category: "avionics",
    trigger: "ATTITUDE FAIL on EADI with HDG on EHSI",
    steps: [
      "AHRS circuit breaker and AHRS/TAD circuit breaker – Pull",
      "AHRS circuit breaker and AHRS/TAD circuit breaker – Reset",
    ],
  },
  {
    name: "ATTITUDE FAIL with X over Rate-of-Turn Scale",
    category: "avionics",
    trigger: "ATTITUDE FAIL and X over rate-of-turn scale on EADI",
    steps: [
      "EHSI composite switch – Push if HDG not displayed",
    ],
  },
  {
    name: "HDG on EHSI",
    category: "avionics",
    trigger: "HDG annunciation on EHSI",
    steps: [
      "AHRS mode control switch – Cycle between DG and SLVD",
      "IF HDG REMAINS: EADI composite switch – Push if ATTITUDE FAIL not displayed",
    ],
  },
  {
    name: "EFIS Control Panel Malfunction (CP on EADI/EHSI)",
    category: "avionics",
    trigger: "CP displayed on EADI or EHSI",
    steps: ["EFIS control panel – Verify functions"],
  },
  {
    name: "Display Unit Malfunction (DU on EADI/EHSI)",
    category: "avionics",
    trigger: "DU displayed on EADI or EHSI",
    steps: ["Composite switch on unaffected display – Push"],
  },
  {
    name: "Impending Display Failure (HOT/FAN on EADI/EHSI)",
    category: "avionics",
    trigger: "HOT or FAN displayed on EADI or EHSI",
    steps: [
      "EADI or EHSI circuit breaker – Pull, do not reset",
      "Composite switch on unaffected display – Push",
    ],
  },
  {
    name: "Blank EADI or EHSI",
    category: "avionics",
    trigger: "EADI or EHSI display is blank",
    steps: [
      "EADI or EHSI circuit breaker – Check; reset if open",
      "Composite switch on unaffected display – Push",
    ],
  },
  {
    name: "ADC Failure",
    category: "avionics",
    trigger: "ADC FAIL, ADC A FAIL, or ADC B FAIL on air data displays",
    steps: ["ADC circuit breaker – Check; reset if open"],
  },
  {
    name: "EDM Failure",
    category: "avionics",
    trigger: "EDM FAIL, EDM A FAIL, or EDM B FAIL on engine displays",
    steps: [
      "EDM circuit breakers – Check; reset if open",
      "IF TOTAL EDM FAILURE: Land as soon as practical",
    ],
  },
  {
    name: "RMU Failure",
    category: "avionics",
    trigger: "RMU inoperative",
    steps: [
      "RMU circuit breaker – Check; reset if open",
      "IF RMU REMAINS INOP: Standby UHF radio – ON; tune as necessary",
    ],
  },
  {
    name: "AOA Computer Failure",
    category: "avionics",
    trigger: "AOA system malfunction",
    steps: [
      "AOA circuit breaker – Pull",
      "Land as soon as practical",
    ],
  },

  // === FUEL ===
  {
    name: "Low Fuel Pressure",
    category: "fuel",
    trigger: "FUEL PX annunciator illuminated — fuel pressure below 10 psi and boost pump didn't auto-engage",
    steps: [
      "BOOST PUMP switch – ON",
      "PEL – Execute",
    ],
    notes: ["Causes: fuel line blockage, low pressure pump failure, fuel leak, low pressure switch malfunction, oil scavenge pump failure"],
  },
  {
    name: "Fuel Imbalance",
    category: "fuel",
    trigger: "FUEL BAL annunciator — imbalance >30 lbs for >2 min, or auto balance/fuel probe/EDM failure",
    steps: [
      "Fuel gauges – Verify imbalance and check for fuel leaks",
      "FUEL BAL circuit breaker – Check; reset if open (one attempt only)",
      "FUEL BAL switch – MAN/RESET (M FUEL BAL annunciator illuminates)",
      "MANUAL FUEL BAL switch – To low tank",
      "Fuel gauges – Monitor",
      "MANUAL FUEL BAL switch – OFF when imbalance corrected",
      "FUEL BAL switch – AUTO if desired; monitor for correct operation",
    ],
  },

  // === HYDRAULIC ===
  {
    name: "Hydraulic System Malfunction",
    category: "hydraulic",
    trigger: "HYDR FL LO or EHYD PX LO annunciator, or hydraulic pressure outside normal range",
    steps: [
      "Hydraulic pressure – Check",
      "Airspeed – 150 KIAS or below",
      "Landing gear handle – DOWN",
      "Flaps – Extend (as required)",
      "Land as soon as practical",
    ],
    notes: [
      "Do NOT use gear, flaps, speed brake, or NWS if HYDR FL LO is on and pressure <1800 psi or decreasing to 0",
      "If EHYD PX LO illuminated, do not rely on emergency gear/flap extension",
    ],
  },

  // === LANDING ===
  {
    name: "Landing Gear Malfunction",
    category: "landing",
    trigger: "Gear fails to indicate fully up or fully down",
    steps: [
      "Airspeed – Remain below 150 KIAS",
      "Gear handle – DOWN",
      "LAMP test switch – Check",
      "Hydraulic pressure – Check (if <1800 psi, execute Landing Gear Emergency Extension)",
      "LDG GR CONT, INST, INST LT circuit breakers – Check in/reset",
      "Gear handle – Cycle",
      "Gear and gear door positions – Confirm (another aircraft or RSU/tower flyby)",
      "IF STILL UNSAFE: Landing Gear Emergency Extension – Execute",
    ],
  },
  {
    name: "Landing Gear Emergency Extension",
    category: "landing",
    trigger: "Normal gear extension failed",
    steps: [
      "Airspeed – Reduce to 150 KIAS or below",
      "Gear handle – DOWN",
      "EMER LDG GR handle – Pull",
      "Landing gear down indicators – Check (2 green main, 2 red main doors, 1 green nose, 1 red handle)",
      "Flaps – As required",
    ],
  },
  {
    name: "Forced Landing",
    category: "landing",
    trigger: "No engine power available, must land",
    steps: [
      "Airspeed – 125 KIAS prior to extending landing gear",
      "EMER LDG GR handle – Pull (as required)",
      "Airspeed – 120 KIAS minimum until intercepting final; 110 KIAS minimum on final",
      "Flaps – As required",
    ],
  },
  {
    name: "Precautionary Emergency Landing (PEL)",
    category: "landing",
    trigger: "Engine producing some power, precautionary landing required",
    steps: [
      "Turn to the nearest suitable field",
      "Climb or accelerate to intercept ELP",
      "Gear, flaps, speed brake – UP",
    ],
  },
  {
    name: "Landing with Blown Main Tire",
    category: "landing",
    trigger: "Suspected or known blown main tire",
    steps: [
      "Keep flaps at current position",
      "If known before landing: approach straight, land on side with good tire",
      "If tire blows while braking: use rudder, brakes, and NWS to maintain control",
      "Be prepared for aircraft departing prepared surface",
    ],
  },

  // === FLIGHT CONTROL ===
  {
    name: "Windshear Recovery",
    category: "flight_control",
    trigger: "Windshear encountered at low altitude",
    steps: [
      "Maintain configuration",
      "PCL – MAX",
      "Attitude – Initially set 15 degrees nose high",
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
    description: "Take Proper Action framework — checklists to reference",
    items: [
      { letter: "B", meaning: "Boldface — applicable boldface procedure, recite step by step" },
      { letter: "E", meaning: "Emergency checklist — applicable emergency checklist by name, including notes/warnings/cautions" },
      { letter: "A", meaning: "Abnormal checklists — any related abnormal checklists to reference" },
      { letter: "N", meaning: "Normal checklists — descent checks, before landing checks, any other applicable normal checklists" },
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

  // Checklists (non-boldface)
  if (T6A_CHECKLISTS.length > 0) {
    const checklistText = T6A_CHECKLISTS.map((proc) => {
      let text = `### ${proc.name}\nCategory: ${proc.category}\nTrigger: ${proc.trigger}\nSteps:\n${proc.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
      if (proc.notes && proc.notes.length > 0) {
        text += `\nNotes:\n${proc.notes.map((n) => `- ${n}`).join("\n")}`;
      }
      return text;
    }).join("\n\n");
    sections.push(`## Emergency Procedure Checklists\nNOTE: This data is adapted from public training references and is NOT official source material.\n\n${checklistText}`);
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
