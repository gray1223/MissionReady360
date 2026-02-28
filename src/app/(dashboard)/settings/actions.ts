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

export async function toggleCurrencyDisabled(
  ruleId: string,
  disabled: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (disabled) {
    // Upsert an override row with is_disabled = true
    const { error } = await supabase
      .from("user_currency_overrides")
      .upsert(
        {
          user_id: user.id,
          currency_rule_id: ruleId,
          is_disabled: true,
        },
        { onConflict: "user_id,currency_rule_id" }
      );
    if (error) return { error: error.message };
  } else {
    // Delete the override to re-enable
    const { error } = await supabase
      .from("user_currency_overrides")
      .delete()
      .eq("user_id", user.id)
      .eq("currency_rule_id", ruleId);
    if (error) return { error: error.message };
  }

  return { error: null };
}
