import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getLivePositions,
  FR24NotConfiguredError,
  FR24RequestError,
} from "@/lib/fr24/client";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const callsign = sp.get("callsign")?.trim().toUpperCase();
  const registration = sp.get("registration")?.trim().toUpperCase();
  const flight = sp.get("flight")?.trim().toUpperCase();
  const bounds = sp.get("bounds")?.trim();
  const limitParam = sp.get("limit");
  const limit = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam, 10) || 25)) : 25;

  if (!callsign && !registration && !flight && !bounds) {
    return NextResponse.json(
      { error: "Provide callsign, registration, flight, or bounds" },
      { status: 400 },
    );
  }

  try {
    const positions = await getLivePositions({
      callsigns: callsign ? [callsign] : undefined,
      registrations: registration ? [registration] : undefined,
      flights: flight ? [flight] : undefined,
      bounds: bounds || undefined,
      limit,
      full: true,
    });
    return NextResponse.json({ positions });
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
