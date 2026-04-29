import type { FlightLogPreferences } from "@/lib/types/database";

export type SquadronPresetCategory =
  | "trainer"
  | "fighter"
  | "tanker_airlift"
  | "rotary"
  | "isr"
  | "naval_jet"
  | "naval_other"
  | "civ_trainer"
  | "civ_complex";

export type PresetMode = "military" | "civilian";

export interface SquadronPreset {
  id: string;
  mode: PresetMode;
  branch: "USAF" | "USN" | "USA" | "USMC" | "USCG" | "CIVILIAN";
  airframe: string;
  label: string;
  category: SquadronPresetCategory;
  description: string;
  preferences: Pick<
    FlightLogPreferences,
    | "hiddenSections"
    | "uptEnabled"
    | "showRatingProgress"
    | "showFaaCurrencies"
    | "trackedRatings"
  >;
}

const SQUADRON_PRESETS: SquadronPreset[] = [
  // USAF — UPT trainers
  {
    id: "usaf-t6a-upt",
    mode: "military",
    branch: "USAF",
    airframe: "T-6A",
    label: "USAF T-6A — UPT student",
    category: "trainer",
    description:
      "Primary jet trainer. Hides FAA Time and tactical mission-specific fields. Enables UPT grading.",
    preferences: {
      hiddenSections: ["faa_time", "mission_specific"],
      uptEnabled: true,
      showRatingProgress: false,
      showFaaCurrencies: false,
    },
  },
  {
    id: "usaf-t1-upt",
    mode: "military",
    branch: "USAF",
    airframe: "T-1A",
    label: "USAF T-1A — UPT (tanker / airlift track)",
    category: "trainer",
    description:
      "Advanced trainer for tanker / airlift track. Keeps Mission Specific (air refueling) visible. Enables UPT grading.",
    preferences: {
      hiddenSections: ["faa_time"],
      uptEnabled: true,
      showRatingProgress: false,
      showFaaCurrencies: false,
    },
  },
  {
    id: "usaf-t38-upt",
    mode: "military",
    branch: "USAF",
    airframe: "T-38C",
    label: "USAF T-38C — UPT (fighter / bomber track)",
    category: "trainer",
    description:
      "Advanced jet trainer for fighter / bomber track. Keeps Mission Specific (formation) visible.",
    preferences: {
      hiddenSections: ["faa_time"],
      uptEnabled: true,
      showRatingProgress: false,
      showFaaCurrencies: false,
    },
  },

  // USAF — operational
  {
    id: "usaf-f16",
    mode: "military",
    branch: "USAF",
    airframe: "F-16C",
    label: "USAF F-16C — operational fighter",
    category: "fighter",
    description:
      "Operational fighter. Hides FAA Time and UPT grading. Tracks FAA rating progress on the side.",
    preferences: {
      hiddenSections: ["faa_time"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: false,
    },
  },
  {
    id: "usaf-f35",
    mode: "military",
    branch: "USAF",
    airframe: "F-35A",
    label: "USAF F-35A — operational fighter",
    category: "fighter",
    description:
      "Operational fighter. Hides FAA Time and UPT grading. Tracks FAA rating progress.",
    preferences: {
      hiddenSections: ["faa_time"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: false,
    },
  },
  {
    id: "usaf-kc135",
    mode: "military",
    branch: "USAF",
    airframe: "KC-135R",
    label: "USAF KC-135R — operational tanker",
    category: "tanker_airlift",
    description:
      "Operational tanker. Keeps Mission Specific (air refueling) visible.",
    preferences: {
      hiddenSections: ["faa_time"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: false,
    },
  },
  {
    id: "usaf-c17",
    mode: "military",
    branch: "USAF",
    airframe: "C-17A",
    label: "USAF C-17A — operational airlift",
    category: "tanker_airlift",
    description:
      "Operational airlift. Mission Specific visible for airdrop / air refueling tracking.",
    preferences: {
      hiddenSections: ["faa_time"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: false,
    },
  },

  // USN — trainers and operational
  {
    id: "usn-t6b-api",
    mode: "military",
    branch: "USN",
    airframe: "T-6B",
    label: "USN T-6B — primary trainer",
    category: "trainer",
    description:
      "Naval primary trainer. Hides FAA Time and tactical fields. Enables UPT grading.",
    preferences: {
      hiddenSections: ["faa_time", "mission_specific"],
      uptEnabled: true,
      showRatingProgress: false,
      showFaaCurrencies: false,
    },
  },
  {
    id: "usn-t45",
    mode: "military",
    branch: "USN",
    airframe: "T-45C",
    label: "USN T-45C — advanced jet trainer",
    category: "trainer",
    description:
      "Naval advanced jet trainer. Mission Specific visible for formation / carrier ops.",
    preferences: {
      hiddenSections: ["faa_time"],
      uptEnabled: true,
      showRatingProgress: false,
      showFaaCurrencies: false,
    },
  },
  {
    id: "usn-fa18",
    mode: "military",
    branch: "USN",
    airframe: "FA-18E",
    label: "USN FA-18E/F — operational fighter",
    category: "naval_jet",
    description:
      "Operational naval fighter. Mission Specific visible. Tracks FAA rating progress.",
    preferences: {
      hiddenSections: ["faa_time"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: false,
    },
  },
  {
    id: "usn-p8",
    mode: "military",
    branch: "USN",
    airframe: "P-8A",
    label: "USN P-8A — maritime patrol",
    category: "isr",
    description:
      "Maritime patrol. Hides UPT grading. Tracks FAA rating progress.",
    preferences: {
      hiddenSections: ["faa_time", "mission_specific"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: false,
    },
  },

  // USA — Army rotary
  {
    id: "usa-uh60",
    mode: "military",
    branch: "USA",
    airframe: "UH-60M",
    label: "Army UH-60M — utility rotary",
    category: "rotary",
    description:
      "Army utility helicopter. Hides FAA Time, mission-specific, and UPT grading.",
    preferences: {
      hiddenSections: ["faa_time", "mission_specific"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: false,
    },
  },
  {
    id: "usa-ah64",
    mode: "military",
    branch: "USA",
    airframe: "AH-64E",
    label: "Army AH-64E — attack rotary",
    category: "rotary",
    description: "Army attack helicopter. Mission Specific visible for tactical events.",
    preferences: {
      hiddenSections: ["faa_time"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: false,
    },
  },

  // USMC — naval rotary / VTOL
  {
    id: "usmc-mv22",
    mode: "military",
    branch: "USMC",
    airframe: "MV-22B",
    label: "USMC MV-22B — tiltrotor",
    category: "naval_other",
    description: "Marine tiltrotor. Mission Specific visible for tactical events.",
    preferences: {
      hiddenSections: ["faa_time"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: false,
    },
  },

  // Civilian
  {
    id: "civ-c172-student",
    mode: "civilian",
    branch: "CIVILIAN",
    airframe: "C172",
    label: "Civilian C172 — student / private pilot",
    category: "civ_trainer",
    description:
      "Single-engine trainer. Hides Mission Details and Mission Specific. Tracks PPL & Instrument progress.",
    preferences: {
      hiddenSections: ["mission_details", "mission_specific"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: true,
      trackedRatings: ["PPL", "Instrument"],
    },
  },
  {
    id: "civ-pa28-student",
    mode: "civilian",
    branch: "CIVILIAN",
    airframe: "PA-28",
    label: "Civilian PA-28 — student / private pilot",
    category: "civ_trainer",
    description:
      "Single-engine trainer. Hides Mission Details and Mission Specific. Tracks PPL & Instrument progress.",
    preferences: {
      hiddenSections: ["mission_details", "mission_specific"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: true,
      trackedRatings: ["PPL", "Instrument"],
    },
  },
  {
    id: "civ-bec90-commercial",
    mode: "civilian",
    branch: "CIVILIAN",
    airframe: "BE-C90",
    label: "Civilian King Air C90 — commercial / multi",
    category: "civ_complex",
    description:
      "Multi-engine turboprop. Hides Mission Details and Mission Specific. Tracks Commercial & ATP progress.",
    preferences: {
      hiddenSections: ["mission_details", "mission_specific"],
      uptEnabled: false,
      showRatingProgress: true,
      showFaaCurrencies: true,
      trackedRatings: ["Commercial", "ATP"],
    },
  },
];

export function getAllPresets(): SquadronPreset[] {
  return SQUADRON_PRESETS;
}

export function getPresetById(id: string): SquadronPreset | undefined {
  return SQUADRON_PRESETS.find((p) => p.id === id);
}

export function getPresetsForMode(mode: PresetMode): SquadronPreset[] {
  return SQUADRON_PRESETS.filter((p) => p.mode === mode);
}

export function getPresetsForBranch(
  branch: SquadronPreset["branch"],
): SquadronPreset[] {
  return SQUADRON_PRESETS.filter((p) => p.branch === branch);
}

export function getRecommendedPreset(
  branch: SquadronPreset["branch"] | null | undefined,
  airframe: string | null | undefined,
): SquadronPreset | undefined {
  if (!branch || !airframe) return undefined;
  return SQUADRON_PRESETS.find(
    (p) =>
      p.branch === branch &&
      p.airframe.toLowerCase() === airframe.toLowerCase(),
  );
}

export function applyPresetToPreferences(
  preset: SquadronPreset,
  existing: FlightLogPreferences,
): FlightLogPreferences {
  return {
    ...existing,
    ...preset.preferences,
    presetId: preset.id,
  };
}
