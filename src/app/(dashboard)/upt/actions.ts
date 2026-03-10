"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type {
  EpMessage,
  EpPhase,
  EpSetupData,
  EpEvaluation,
} from "@/lib/types/ep-practice";

export async function createEpSession(data: {
  title: string;
  scenarioType: string;
  setupData: EpSetupData;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session, error } = await supabase
    .from("ep_practice_sessions")
    .insert({
      user_id: user.id,
      title: data.title,
      scenario_type: data.scenarioType,
      setup_data: data.setupData,
      messages: [],
      current_phase: "gather_info",
      phases_completed: [],
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return session.id;
}

export async function updateEpSession(
  sessionId: string,
  data: {
    messages?: EpMessage[];
    currentPhase?: EpPhase;
    phasesCompleted?: EpPhase[];
    evaluation?: EpEvaluation;
    completedAt?: string;
    durationSeconds?: number;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.messages !== undefined) updateData.messages = data.messages;
  if (data.currentPhase !== undefined) updateData.current_phase = data.currentPhase;
  if (data.phasesCompleted !== undefined) updateData.phases_completed = data.phasesCompleted;
  if (data.evaluation !== undefined) updateData.evaluation = data.evaluation;
  if (data.completedAt !== undefined) updateData.completed_at = data.completedAt;
  if (data.durationSeconds !== undefined) updateData.duration_seconds = data.durationSeconds;

  const { error } = await supabase
    .from("ep_practice_sessions")
    .update(updateData)
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

export async function deleteEpSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("ep_practice_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
