import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  searchFlightSummary,
  FR24NotConfiguredError,
  FR24RequestError,
} from "@/lib/fr24/client";

const requestSchema = z.object({
  callsign: z.string().trim().min(2).max(20).optional(),
  registration: z.string().trim().min(2).max(20).optional(),
  flight: z.string().trim().min(2).max(20).optional(),
  fromIso: z.string().datetime({ offset: true }).optional(),
  toIso: z.string().datetime({ offset: true }).optional(),
  full: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide callsign, registration, or flight number" },
      { status: 400 },
    );
  }

  const { callsign, registration, flight, fromIso, toIso, full, limit } =
    parsed.data;
  if (!callsign && !registration && !flight) {
    return NextResponse.json(
      { error: "Provide callsign, registration, or flight number" },
      { status: 400 },
    );
  }

  try {
    const flights = await searchFlightSummary({
      callsigns: callsign ? [callsign.toUpperCase()] : undefined,
      registrations: registration ? [registration.toUpperCase()] : undefined,
      flights: flight ? [flight.toUpperCase()] : undefined,
      fromIso,
      toIso,
      full,
      limit,
    });
    return NextResponse.json({ flights });
  } catch (err) {
    if (err instanceof FR24NotConfiguredError) {
      return NextResponse.json(
        { error: "FR24 API key not configured" },
        { status: 503 },
      );
    }
    if (err instanceof FR24RequestError) {
      return NextResponse.json(
        { error: `FR24 ${err.status}: ${err.body.slice(0, 200)}` },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
