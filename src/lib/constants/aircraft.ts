import type { EngineType } from "@/lib/types/database";

export const FAA_CATEGORIES = [
  { value: "airplane", label: "Airplane" },
  { value: "rotorcraft", label: "Rotorcraft" },
  { value: "glider", label: "Glider" },
  { value: "lighter_than_air", label: "Lighter-than-Air" },
  { value: "powered_lift", label: "Powered Lift" },
];

export const FAA_CLASSES = [
  { value: "single_engine_land", label: "Single Engine Land" },
  { value: "multi_engine_land", label: "Multi Engine Land" },
  { value: "single_engine_sea", label: "Single Engine Sea" },
  { value: "multi_engine_sea", label: "Multi Engine Sea" },
];

export const ENGINE_TYPES: { value: EngineType; label: string }[] = [
  { value: "piston", label: "Piston" },
  { value: "turboprop", label: "Turboprop" },
  { value: "turboshaft", label: "Turboshaft" },
  { value: "turbojet", label: "Turbojet" },
  { value: "turbofan", label: "Turbofan" },
];
