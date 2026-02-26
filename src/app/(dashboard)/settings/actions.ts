"use server";

import { createClient } from "@/lib/supabase/server";
import type { FlightLogPreferences } from "@/lib/types/database";

export async function updateFlightLogPreferences(
  userId: string,
  preferences: FlightLogPreferences
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ flight_log_preferences: preferences })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
