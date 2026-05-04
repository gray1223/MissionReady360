"use server";

import { createClient } from "@/lib/supabase/server";
import { getBoldfaceById } from "@/lib/boldface/t6a-boldface";
import { gradeBoldface } from "@/lib/boldface/grading";
import {
  nextBoxAfterAttempt,
  nextDueAt,
  type ProgressRow,
} from "@/lib/boldface/scheduling";

const AIRFRAME = "t6a";

export interface AttemptResult {
  error: string | null;
  correct: boolean;
  perStepCorrect: boolean[];
  expectedSteps: string[];
  feedback: string;
  newBox: number;
  nextDueAt: string; // ISO
}

export async function loadBoldfaceProgress(): Promise<{
  error: string | null;
  rows: ProgressRow[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", rows: [] };

  const { data, error } = await supabase
    .from("boldface_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("airframe", AIRFRAME);

  if (error) return { error: error.message, rows: [] };
  return { error: null, rows: (data ?? []) as ProgressRow[] };
}

export async function submitBoldfaceAttempt(
  itemId: string,
  submission: string,
): Promise<AttemptResult> {
  const empty: AttemptResult = {
    error: "Not authenticated",
    correct: false,
    perStepCorrect: [],
    expectedSteps: [],
    feedback: "",
    newBox: 1,
    nextDueAt: new Date().toISOString(),
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const item = getBoldfaceById(itemId);
  if (!item) {
    return { ...empty, error: "Unknown boldface item" };
  }

  const grade = gradeBoldface(item, submission);

  // Load current progress row (if any)
  const { data: existing } = await supabase
    .from("boldface_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("airframe", AIRFRAME)
    .eq("item_id", itemId)
    .maybeSingle();

  const currentBox = (existing?.box as number | undefined) ?? 1;
  const currentTotal = (existing?.total_attempts as number | undefined) ?? 0;
  const currentCorrect =
    (existing?.correct_attempts as number | undefined) ?? 0;

  const newBox = nextBoxAfterAttempt(currentBox, grade.correct);
  const due = nextDueAt(newBox);

  const { error: upsertErr } = await supabase
    .from("boldface_progress")
    .upsert(
      {
        user_id: user.id,
        airframe: AIRFRAME,
        item_id: itemId,
        box: newBox,
        next_due_at: due.toISOString(),
        total_attempts: currentTotal + 1,
        correct_attempts: currentCorrect + (grade.correct ? 1 : 0),
        last_attempted_at: new Date().toISOString(),
        last_response_text: submission,
      },
      { onConflict: "user_id,airframe,item_id" },
    );

  if (upsertErr) {
    return {
      error: upsertErr.message,
      correct: grade.correct,
      perStepCorrect: grade.perStepCorrect,
      expectedSteps: grade.expectedSteps,
      feedback: grade.feedback,
      newBox: currentBox,
      nextDueAt: new Date().toISOString(),
    };
  }

  return {
    error: null,
    correct: grade.correct,
    perStepCorrect: grade.perStepCorrect,
    expectedSteps: grade.expectedSteps,
    feedback: grade.feedback,
    newBox,
    nextDueAt: due.toISOString(),
  };
}

export async function resetBoldfaceProgress(itemId?: string): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  let q = supabase
    .from("boldface_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("airframe", AIRFRAME);

  if (itemId) q = q.eq("item_id", itemId);

  const { error } = await q;
  if (error) return { error: error.message };
  return { error: null };
}
