import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  AI_PARSE_FIELDS,
  isAiParseField,
  type AiParsePayload,
} from "@/lib/templates/ai-parse-fields";
import { SORTIE_TYPES, FLIGHT_CONDITIONS, CREW_POSITIONS, FORMATION_POSITIONS } from "@/lib/constants/mission-symbols";

const requestSchema = z.object({
  description: z.string().min(3).max(2000),
});

const SYSTEM_PROMPT = `You extract structured flight-log data from a pilot's free-text description and return JSON only.

Hard rules:
- Output ONLY a single JSON object. No prose, no markdown, no code fences.
- Include a key only if the description states or strongly implies a value. Omit unknown fields entirely.
- Never invent specific values (e.g. don't guess tail numbers, ICAO codes, or hour totals).
- Times are decimal hours (1.5, not 1:30).
- ICAO codes are 4 uppercase letters.
- Dates are ISO YYYY-MM-DD. "today" → today's date, "yesterday" → yesterday's date.

Field reference (only emit keys from this list):
${AI_PARSE_FIELDS.join(", ")}

Enums:
- sortie_type: ${SORTIE_TYPES.map((s) => s.value).join(", ")}
- flight_condition: ${FLIGHT_CONDITIONS.map((s) => s.value).join(", ")}
- crew_position: ${CREW_POSITIONS.map((s) => s.value).join(", ")}
- formation_position: ${FORMATION_POSITIONS.map((s) => s.value).join(", ")}

For aircraft_type_id, use the UUID from the aircraft catalog block in this conversation. Match the description's airframe (e.g. "T-6", "T-6A", "Texan") to the closest catalog entry's designation. If no aircraft is mentioned, omit the field.`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Description must be 3-2000 chars" },
      { status: 400 },
    );
  }
  const { description } = parsed.data;

  // Load aircraft catalog and the user's logbook mode for grounding
  const [{ data: aircraftRows }, { data: profile }] = await Promise.all([
    supabase
      .from("aircraft_types")
      .select("id, designation, name, is_military"),
    supabase
      .from("profiles")
      .select("logbook_mode, primary_aircraft_id")
      .eq("id", user.id)
      .single(),
  ]);

  const aircraftCatalog = (aircraftRows ?? [])
    .map(
      (a) =>
        `- ${a.id}: ${a.designation} (${a.name}) ${a.is_military ? "[mil]" : "[civ]"}`,
    )
    .join("\n");

  const todayIso = new Date().toISOString().slice(0, 10);
  const yesterdayIso = new Date(Date.now() - 86400_000)
    .toISOString()
    .slice(0, 10);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 503 },
    );
  }
  const client = new Anthropic({ apiKey });

  let raw = "";
  try {
    const result = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: `Aircraft catalog:\n${aircraftCatalog}`,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: `Context for relative dates: today=${todayIso}, yesterday=${yesterdayIso}. User logbook mode: ${profile?.logbook_mode ?? "military"}.`,
        },
      ],
      messages: [
        {
          role: "user",
          content: `Extract structured flight data from this description and return ONLY a JSON object:\n\n${description}`,
        },
      ],
    });

    const textBlock = result.content.find((b) => b.type === "text");
    raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "AI request failed",
      },
      { status: 502 },
    );
  }

  // Strip code fences if the model adds them despite instructions
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "AI returned invalid JSON", raw: cleaned.slice(0, 400) },
      { status: 502 },
    );
  }

  if (!parsedJson || typeof parsedJson !== "object" || Array.isArray(parsedJson)) {
    return NextResponse.json(
      { error: "AI returned non-object" },
      { status: 502 },
    );
  }

  // Filter to whitelist + sanitize types lightly
  const payload: AiParsePayload = {};
  for (const [key, value] of Object.entries(parsedJson as Record<string, unknown>)) {
    if (!isAiParseField(key)) continue;
    if (value === null || value === undefined) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload as any)[key] = value;
  }

  return NextResponse.json({ payload });
}
