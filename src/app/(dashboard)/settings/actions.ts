"use server";

import { createClient } from "@/lib/supabase/server";
import type { FlightLogPreferences } from "@/lib/types/database";
import {
  applyPresetToPreferences,
  getPresetById,
} from "@/lib/presets/squadron-presets";

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

export async function applySquadronPreset(userId: string, presetId: string) {
  const preset = getPresetById(presetId);
  if (!preset) return { error: "Unknown preset" };

  const supabase = await createClient();
  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("flight_log_preferences")
    .eq("id", userId)
    .single();

  if (loadError) return { error: loadError.message };

  const existing = (profile?.flight_log_preferences ||
    {}) as FlightLogPreferences;
  const merged = applyPresetToPreferences(preset, existing);

  const { error } = await supabase
    .from("profiles")
    .update({ flight_log_preferences: merged })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { error: null, preferences: merged };
}

export async function clearSquadronPreset(userId: string) {
  const supabase = await createClient();
  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("flight_log_preferences")
    .eq("id", userId)
    .single();

  if (loadError) return { error: loadError.message };

  const existing = (profile?.flight_log_preferences ||
    {}) as FlightLogPreferences;
  const { presetId: _omit, ...rest } = existing;
  void _omit;

  const { error } = await supabase
    .from("profiles")
    .update({ flight_log_preferences: rest })
    .eq("id", userId);

  if (error) return { error: error.message };
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
