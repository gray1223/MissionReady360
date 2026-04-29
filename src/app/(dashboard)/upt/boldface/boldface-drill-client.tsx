"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
  pickNextItem,
  type ItemDueState,
  MAX_BOX,
} from "@/lib/boldface/scheduling";
import { submitBoldfaceAttempt } from "./actions";

interface BoldfaceItemMeta {
  id: string;
  title: string;
  stepCount: number;
}

interface SerializedState {
  itemId: string;
  box: number;
  nextDueAt: string;
  totalAttempts: number;
  correctAttempts: number;
  isDue: boolean;
  isNew: boolean;
}

interface Props {
  items: BoldfaceItemMeta[];
  initialStates: SerializedState[];
}

interface AttemptFeedback {
  itemId: string;
  correct: boolean;
  perStepCorrect: boolean[];
  expectedSteps: string[];
  feedback: string;
  newBox: number;
  nextDueAt: string;
}

function deserialize(states: SerializedState[]): ItemDueState[] {
  return states.map((s) => ({
    itemId: s.itemId,
    box: s.box,
    nextDueAt: new Date(s.nextDueAt),
    totalAttempts: s.totalAttempts,
    correctAttempts: s.correctAttempts,
    isDue: s.isDue,
    isNew: s.isNew,
  }));
}

export function BoldfaceDrillClient({ items, initialStates }: Props) {
  const itemsById = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );
  const [states, setStates] = useState<ItemDueState[]>(() =>
    deserialize(initialStates),
  );
  const [current, setCurrent] = useState<ItemDueState | null>(() =>
    pickNextItem(deserialize(initialStates)),
  );
  const [submission, setSubmission] = useState("");
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const dueCount = states.filter((s) => s.isDue).length;
  const newCount = states.filter((s) => s.isNew).length;
  const masteredCount = states.filter((s) => s.box === MAX_BOX).length;

  function focusTextarea() {
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function handleSubmit() {
    if (!current || submitting) return;
    if (!submission.trim()) return;
    setSubmitting(true);

    const result = await submitBoldfaceAttempt(current.itemId, submission);
    setSubmitting(false);

    if (result.error) {
      setFeedback({
        itemId: current.itemId,
        correct: false,
        perStepCorrect: [],
        expectedSteps: [],
        feedback: result.error,
        newBox: current.box,
        nextDueAt: current.nextDueAt.toISOString(),
      });
      return;
    }

    setFeedback({
      itemId: current.itemId,
      correct: result.correct,
      perStepCorrect: result.perStepCorrect,
      expectedSteps: result.expectedSteps,
      feedback: result.feedback,
      newBox: result.newBox,
      nextDueAt: result.nextDueAt,
    });

    // Update state for the answered item
    const now = new Date();
    const updated = states.map((s): ItemDueState => {
      if (s.itemId !== current.itemId) return s;
      const dueAt = new Date(result.nextDueAt);
      return {
        ...s,
        box: result.newBox,
        nextDueAt: dueAt,
        totalAttempts: s.totalAttempts + 1,
        correctAttempts: s.correctAttempts + (result.correct ? 1 : 0),
        isDue: dueAt.getTime() <= now.getTime(),
        isNew: false,
      };
    });
    setStates(updated);
  }

  function handleNext() {
    setFeedback(null);
    setSubmission("");
    const remaining = states.filter((s) => s.itemId !== current?.itemId);
    const next = pickNextItem(states.filter((s) => s.isDue && s.itemId !== current?.itemId));
    if (next) {
      setCurrent(next);
    } else {
      // Nothing left due — pick the soonest non-current item, if any
      const nextSoonest = pickNextItem(remaining);
      setCurrent(nextSoonest);
    }
    focusTextarea();
  }

  const currentMeta = current ? itemsById.get(current.itemId) : null;

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Boldface Drills — T-6A
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Type each emergency procedure exactly. Adaptive scheduling sends
          missed items back to the front of the queue and spaces correct ones
          out (1 → 3 → 7 → 14 days).
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Boldface text changes with TO updates. Verify against your current
          squadron / FTU publication before relying on this for graded
          recitation.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <StatTile label="Items" value={items.length} />
        <StatTile label="Due now" value={dueCount} accent="amber" />
        <StatTile label="New" value={newCount} accent="emerald" />
        <StatTile label="Mastered" value={masteredCount} accent="primary" />
      </div>

      {/* Drill */}
      {current && currentMeta ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{currentMeta.title}</CardTitle>
                <CardDescription>
                  {currentMeta.stepCount} step
                  {currentMeta.stepCount === 1 ? "" : "s"} ·
                  Box {current.box} of {MAX_BOX} ·
                  {current.isNew ? " new" : ` ${current.totalAttempts} prior attempt${current.totalAttempts === 1 ? "" : "s"}`}
                </CardDescription>
              </div>
              {feedback?.itemId === current.itemId && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                    feedback.correct
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-red-500/15 text-red-300",
                  )}
                >
                  {feedback.correct ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Correct
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5" /> Incorrect
                    </>
                  )}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <textarea
                ref={textareaRef}
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                onKeyDown={handleKey}
                disabled={submitting || !!feedback}
                placeholder={`Type each step on its own line, e.g.\n1. PCL — OFF\n2. Battery — OFF`}
                rows={Math.max(4, currentMeta.stepCount + 1)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
              />

              {feedback?.itemId === current.itemId && (
                <div className="space-y-2 rounded-lg bg-slate-800/30 px-4 py-3 text-sm">
                  <p
                    className={cn(
                      feedback.correct
                        ? "text-emerald-300"
                        : "text-red-300",
                      "font-medium",
                    )}
                  >
                    {feedback.feedback}
                  </p>
                  {!feedback.correct && feedback.expectedSteps.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Expected
                      </p>
                      <ol className="mt-1 list-decimal space-y-0.5 pl-5 font-mono text-xs text-slate-300">
                        {feedback.expectedSteps.map((step, i) => (
                          <li
                            key={i}
                            className={cn(
                              !feedback.perStepCorrect[i] &&
                                "text-red-300",
                            )}
                          >
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  <p className="text-xs text-text-muted">
                    Box {current.box} → {feedback.newBox}.{" "}
                    {feedback.newBox === current.box && current.box === 1
                      ? "Stays in box 1 — drill again soon."
                      : feedback.correct
                      ? `Next review: ${new Date(
                          feedback.nextDueAt,
                        ).toLocaleDateString()}`
                      : "Reset to box 1 — drill again soon."}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {!feedback ? (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSubmit}
                      disabled={!submission.trim() || submitting}
                    >
                      Grade
                    </Button>
                    <p className="text-xs text-slate-500">
                      ⌘/Ctrl + Enter to submit
                    </p>
                  </>
                ) : (
                  <Button variant="primary" size="md" onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-3 text-sm text-text-secondary">
              No boldface items configured yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Item list */}
      <Card>
        <CardHeader>
          <CardTitle>All procedures</CardTitle>
          <CardDescription>
            Status across the {items.length} T-6A boldface items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-slate-800">
            {items.map((item) => {
              const state = states.find((s) => s.itemId === item.id);
              if (!state) return null;
              const accuracy =
                state.totalAttempts === 0
                  ? null
                  : Math.round(
                      (state.correctAttempts / state.totalAttempts) * 100,
                    );
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      Box {state.box} ·{" "}
                      {state.isNew
                        ? "new"
                        : state.isDue
                        ? "due now"
                        : `due ${state.nextDueAt.toLocaleDateString()}`}
                      {accuracy !== null && ` · ${accuracy}% accuracy`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrent(state);
                      setFeedback(null);
                      setSubmission("");
                      focusTextarea();
                    }}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    aria-label={`Drill ${item.title}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "amber" | "emerald" | "primary";
}) {
  const accentClass =
    accent === "amber"
      ? "text-amber-300"
      : accent === "emerald"
      ? "text-emerald-300"
      : accent === "primary"
      ? "text-primary"
      : "text-slate-200";
  return (
    <div className="rounded-lg border border-slate-800 bg-bg-surface/60 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-bold", accentClass)}>{value}</p>
    </div>
  );
}
