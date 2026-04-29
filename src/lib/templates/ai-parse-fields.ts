/**
 * Field whitelist for AI flight-entry parsing. Broader than template fields:
 * the parser is allowed to fill date / mission number / remarks since those
 * naturally appear in a free-form description ("yesterday I flew...", "in
 * remarks: red air").
 */

import { TEMPLATE_FIELDS } from "./flight-template-fields";
import type { FlightFormData } from "@/lib/flights/validation";

export const AI_PARSE_FIELDS = [
  ...TEMPLATE_FIELDS,
  "flight_date",
  "mission_number",
  "remarks",
] as const satisfies readonly (keyof FlightFormData)[];

export type AiParseField = (typeof AI_PARSE_FIELDS)[number];

export type AiParsePayload = Partial<Pick<FlightFormData, AiParseField>>;

const FIELD_SET: Set<string> = new Set(AI_PARSE_FIELDS);

export function isAiParseField(key: string): key is AiParseField {
  return FIELD_SET.has(key);
}
