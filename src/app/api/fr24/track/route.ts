import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getFlightTracks,
  FR24NotConfiguredError,
  FR24RequestError,
} from "@/lib/fr24/client";
import { compactTrackPoint } from "@/lib/fr24/types";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flightId = req.nextUrl.searchParams.get("flight_id");
  if (!flightId || flightId.length < 4 || flightId.length > 32) {
    return NextResponse.json(
      { error: "flight_id required" },
      { status: 400 },
    );
  }

  try {
    const points = await getFlightTracks(flightId);
    const compact = points.map(compactTrackPoint).filter((p) => p !== null);
    return NextResponse.json({ points: compact });
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
