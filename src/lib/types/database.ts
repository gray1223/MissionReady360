export type MilitaryBranch =
  | "USAF"
  | "USN"
  | "USA"
  | "USMC"
  | "USCG";
export type CrewPositionCategory =
  | "pilot"
  | "copilot"
  | "aircraft_commander"
  | "instructor"
  | "evaluator"
  | "flight_engineer"
  | "loadmaster"
  | "boom_operator"
  | "sensor_operator"
  | "observer"
  | "other";
export type SortieType =
  | "local"
  | "cross_country"
  | "deployment"
  | "combat"
  | "training"
  | "evaluation"
  | "check_ride"
  | "instrument"
  | "formation"
  | "air_refueling"
  | "airdrop"
  | "low_level"
  | "tactical"
  | "ferry"
  | "test"
  | "other";
export type QualificationLevel =
  | "initial_qual"
  | "basic"
  | "senior"
  | "instructor"
  | "evaluator"
  | "flight_lead"
  | "mission_commander";
export type FlightCondition = "day" | "night" | "nvg" | "mixed";
export type PeriodUnit = "days" | "calendar_months" | "calendar_years";
export type LogbookMode = "military" | "civilian";
export type CertificateType =
  | "none"
  | "student"
  | "sport"
  | "recreational"
  | "private"
  | "commercial"
  | "atp";
export type EngineType = "piston" | "turboprop" | "turboshaft" | "turbojet" | "turbofan";

export type UptProgressionGrade = "WB" | "BA" | "SB" | "AV" | "SA" | "AA" | "WA";
export type UptOverallGrade = "Unsat" | "Fair" | "Good" | "Excellent";

export interface UptGrades {
  progression_grade: UptProgressionGrade | null;
  overall_grade: UptOverallGrade | null;
  upgrades: number;
  downgrades: number;
  mif_notes: string;
}

export interface PriorHoursInput {
  total_time?: number;
  pic_time?: number;
  xc_time?: number;
  night_time?: number;
  instrument_actual?: number;
  instrument_sim?: number;
  solo_time?: number;
  dual_received_time?: number;
  solo_xc_time?: number;
  pic_xc_time?: number;
}

export interface FlightLogPreferences {
  hiddenSections?: string[];
  trackedRatings?: string[];
  showRatingProgress?: boolean;
  showFaaCurrencies?: boolean;
  priorHours?: PriorHoursInput;
  uptEnabled?: boolean;
}

export interface Profile {
  id: string;
  logbook_mode: LogbookMode;
  branch: MilitaryBranch | null;
  rank: string | null;
  duty_status:
    | "active"
    | "reserve"
    | "guard"
    | "retired"
    | "separated"
    | null;
  unit: string | null;
  callsign: string | null;
  first_name: string | null;
  last_name: string | null;
  home_airport: string | null;
  certificate_type: CertificateType | null;
  primary_aircraft_id: string | null;
  qualification_level: QualificationLevel | null;
  faa_certificate_number: string | null;
  faa_medical_class: "first" | "second" | "third" | "basicmed" | null;
  faa_medical_expiry: string | null;
  notification_preferences: {
    email_expiring: boolean;
    push_expiring: boolean;
    warning_days: number;
  };
  flight_log_preferences: FlightLogPreferences;
  created_at: string;
  updated_at: string;
}

export interface AircraftType {
  id: string;
  designation: string;
  name: string;
  mds: string | null;
  branch: MilitaryBranch | null;
  faa_category: string | null;
  faa_class: string | null;
  faa_type_rating: string | null;
  is_military: boolean;
  has_nvg: boolean;
  has_air_refueling: boolean;
  has_weapons: boolean;
  has_formation: boolean;
  has_airdrop: boolean;
  has_carrier: boolean;
  has_tactical: boolean;
  has_low_level: boolean;
  engine_count: number;
  engine_type: EngineType | null;
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
}

export interface UserAircraft {
  id: string;
  user_id: string;
  aircraft_type_id: string;
  qualification_level: QualificationLevel;
  is_primary: boolean;
  qualified_date: string | null;
  created_at: string;
}

export interface DebriefItem {
  category: string;
  item: string;
  resolution: string;
}

export interface Approach {
  type: string;
  runway: string;
  airport: string;
}

export interface WeaponsEvent {
  type: string;
  rounds: number;
  result: string;
}

export interface AirdropEvent {
  type: string;
  load: string;
  result: string;
}

export interface CrewMember {
  name: string;
  position: CrewPositionCategory;
  callsign?: string;
}

export interface Flight {
  id: string;
  user_id: string;
  flight_date: string;
  aircraft_type_id: string | null;
  tail_number: string | null;
  departure_icao: string | null;
  arrival_icao: string | null;
  route: string | null;
  remarks: string | null;
  sortie_type: SortieType | null;
  mission_number: string | null;
  mission_symbol: string | null;
  crew_position: CrewPositionCategory | null;
  flight_condition: FlightCondition;
  crew_members: CrewMember[];
  total_time: number;
  pilot_time: number;
  copilot_time: number;
  instructor_time: number;
  evaluator_time: number;
  night_time: number;
  nvg_time: number;
  instrument_time: number;
  sim_instrument_time: number;
  pic_time: number;
  sic_time: number;
  xc_time: number;
  solo_time: number;
  dual_received_time: number;
  day_landings: number;
  night_landings: number;
  nvg_landings: number;
  full_stop_landings: number;
  touch_and_go_landings: number;
  carrier_traps: number;
  carrier_bolters: number;
  approaches: Approach[];
  formation_position: string | null;
  formation_type: string | null;
  weapons_events: WeaponsEvent[];
  air_refueling_type: string | null;
  air_refueling_contacts: number;
  airdrop_events: AirdropEvent[];
  low_level_time: number;
  low_level_type: string | null;
  combat_time: number;
  combat_sorties: number;
  debrief_items: DebriefItem[];
  upt_grades: UptGrades | null;
  is_military_flight: boolean;
  is_simulator: boolean;
  simulator_type: string | null;
  is_synced: boolean;
  local_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CurrencyRule {
  id: string;
  name: string;
  description: string | null;
  branch: MilitaryBranch | null;
  aircraft_type_id: string | null;
  is_faa: boolean;
  required_event: string;
  required_count: number;
  period_value: number;
  period_unit: PeriodUnit;
  additional_conditions: Record<string, unknown>;
  warning_threshold_days: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface UserCurrencyOverride {
  id: string;
  user_id: string;
  currency_rule_id: string;
  is_disabled: boolean;
  waiver_expiry: string | null;
  custom_required_count: number | null;
  custom_period_value: number | null;
  custom_period_unit: PeriodUnit | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserQualification {
  id: string;
  user_id: string;
  name: string;
  type:
    | "military"
    | "faa_certificate"
    | "faa_rating"
    | "faa_endorsement"
    | "medical"
    | "other";
  issuing_authority: string | null;
  certificate_number: string | null;
  issued_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CurrencyStatus = "current" | "expiring_soon" | "expired";

export interface ComputedCurrency {
  rule_id: string;
  rule_name: string;
  required_event: string;
  required_count: number;
  achieved_count: number;
  period_start: string;
  period_end: string;
  status: CurrencyStatus;
  days_remaining: number;
  is_faa: boolean;
  branch: MilitaryBranch | null;
}
