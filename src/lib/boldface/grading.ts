import type { BoldfaceItem } from "./t6a-boldface";

export interface GradeResult {
  correct: boolean;
  perStepCorrect: boolean[];
  expectedSteps: string[];
  submittedSteps: string[];
  score: number; // 0..1
  feedback: string;
}

/**
 * Normalize text for comparison: collapse whitespace, lowercase, strip
 * leading numbering ("1.", "2)") and a few punctuation variants. Boldface
 * grading is technically strict, but typed input has casing and punctuation
 * noise we want to forgive.
 */
function normalizeStep(s: string): string {
  return s
    .replace(/^\s*\d+[\.\)]\s*/, "") // strip leading "1." / "1)"
    .replace(/[—–]/g, "-") // unify dashes
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?]/g, "");
}

function splitSubmission(input: string): string[] {
  return input
    .split(/\r?\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function gradeBoldface(
  item: BoldfaceItem,
  submission: string,
): GradeResult {
  const expectedSteps = item.steps;
  const submittedRaw = splitSubmission(submission);

  const expectedNorm = expectedSteps.map(normalizeStep);
  const submittedNorm = submittedRaw.map(normalizeStep);

  const perStepCorrect: boolean[] = expectedNorm.map(
    (exp, i) => submittedNorm[i] === exp,
  );

  const correctCount = perStepCorrect.filter(Boolean).length;
  const score = expectedSteps.length
    ? correctCount / expectedSteps.length
    : 0;

  // Strict grading: must be exact step count and every step right.
  const strictCorrect =
    submittedNorm.length === expectedNorm.length &&
    perStepCorrect.every(Boolean);

  let feedback: string;
  if (strictCorrect) {
    feedback = "Correct — all steps match.";
  } else if (submittedNorm.length !== expectedNorm.length) {
    feedback = `Wrong step count. Expected ${expectedNorm.length} step${
      expectedNorm.length === 1 ? "" : "s"
    }, got ${submittedNorm.length}.`;
  } else {
    const wrongIdx = perStepCorrect.findIndex((c) => !c);
    feedback = `Step ${wrongIdx + 1} is wrong.`;
  }

  return {
    correct: strictCorrect,
    perStepCorrect,
    expectedSteps,
    submittedSteps: submittedRaw,
    score,
    feedback,
  };
}
