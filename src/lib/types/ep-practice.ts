export const EP_PHASES = [
  "setup",
  "gather_info",
  "maintain_aircraft_control",
  "analyze",
  "take_action",
  "land",
  "complete",
] as const;

export type EpPhase = (typeof EP_PHASES)[number];

export const EP_PHASE_LABELS: Record<EpPhase, string> = {
  setup: "Setup",
  gather_info: "Gather Info",
  maintain_aircraft_control: "MAC",
  analyze: "Analyze",
  take_action: "Take Action",
  land: "Land",
  complete: "Complete",
};

export type EpMessageRole = "ip" | "student";

export interface EpMessage {
  role: EpMessageRole;
  content: string;
  phase?: EpPhase;
  timestamp: string;
}

export type ScenarioCategory =
  | "engine"
  | "fire"
  | "flight_controls"
  | "landing_gear"
  | "electrical"
  | "fuel"
  | "hydraulic"
  | "pressurization"
  | "other"
  | "random";

export const SCENARIO_CATEGORIES: { value: ScenarioCategory; label: string }[] = [
  { value: "random", label: "Random (surprise me)" },
  { value: "engine", label: "Engine" },
  { value: "fire", label: "Fire / Smoke" },
  { value: "flight_controls", label: "Flight Controls" },
  { value: "landing_gear", label: "Landing Gear" },
  { value: "electrical", label: "Electrical" },
  { value: "fuel", label: "Fuel System" },
  { value: "hydraulic", label: "Hydraulic" },
  { value: "pressurization", label: "Pressurization" },
  { value: "other", label: "Other / Misc" },
];

export interface EpSetupData {
  callsign: string;
  isSolo: boolean;
  abosStatus: "equipped" | "not_equipped";
  runway: string;
  weather: "vmc" | "imc";
  scenarioCategory: ScenarioCategory;
}

export interface EpEvaluation {
  overallScore: number; // 1-5
  boldfaceAccuracy: string;
  aircraftControlAssessment: string;
  analysisQuality: string;
  decisionMaking: string;
  communicationAssessment: string;
  areasForImprovement: string[];
  strengths: string[];
  summary: string;
}

export interface EpPracticeSession {
  id: string;
  user_id: string;
  title: string;
  scenario_type: string | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  setup_data: EpSetupData;
  messages: EpMessage[];
  current_phase: EpPhase;
  phases_completed: EpPhase[];
  evaluation: EpEvaluation | null;
  created_at: string;
  updated_at: string;
}
