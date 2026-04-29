"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  FlightTemplate,
  FlightTemplatePayload,
} from "@/lib/templates/flight-template-fields";

export async function listFlightTemplates(): Promise<{
  error: string | null;
  templates: FlightTemplate[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", templates: [] };

  const { data, error } = await supabase
    .from("flight_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, templates: [] };
  return { error: null, templates: (data ?? []) as FlightTemplate[] };
}

export async function createFlightTemplate(
  name: string,
  payload: FlightTemplatePayload,
  description?: string,
): Promise<{ error: string | null; template: FlightTemplate | null }> {
  if (!name.trim()) {
    return { error: "Template name is required", template: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", template: null };

  const { data, error } = await supabase
    .from("flight_templates")
    .insert({
      user_id: user.id,
      name: name.trim().slice(0, 80),
      description: description?.trim().slice(0, 200) || null,
      payload,
    })
    .select("*")
    .single();

  if (error) return { error: error.message, template: null };
  return { error: null, template: data as FlightTemplate };
}

export async function deleteFlightTemplate(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("flight_templates")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function renameFlightTemplate(
  id: string,
  name: string,
  description?: string,
): Promise<{ error: string | null }> {
  if (!name.trim()) return { error: "Template name is required" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("flight_templates")
    .update({
      name: name.trim().slice(0, 80),
      description: description?.trim().slice(0, 200) || null,
    })
    .eq("user_id", user.id)
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}
