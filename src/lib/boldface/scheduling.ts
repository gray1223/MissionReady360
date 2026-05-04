/**
 * Leitner-box spaced repetition for boldface drilling.
 *
 * Box → next-due interval:
 *   1: due now (every session)
 *   2: 1 day
 *   3: 3 days
 *   4: 7 days
 *   5: 14 days
 *
 * Correct answer → bump up one box (cap at 5).
 * Incorrect answer → reset to box 1.
 */

export const MIN_BOX = 1;
export const MAX_BOX = 5;

export const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
};

export function intervalForBox(box: number): number {
  if (box <= 1) return 0;
  if (box >= MAX_BOX) return BOX_INTERVAL_DAYS[MAX_BOX];
  return BOX_INTERVAL_DAYS[box] ?? 0;
}

export function nextDueAt(box: number, from: Date = new Date()): Date {
  const days = intervalForBox(box);
  const due = new Date(from);
  due.setUTCDate(due.getUTCDate() + days);
  return due;
}

export function nextBoxAfterAttempt(
  currentBox: number | null | undefined,
  correct: boolean,
): number {
  const cur = currentBox ?? MIN_BOX;
  if (!correct) return MIN_BOX;
  return Math.min(MAX_BOX, cur + 1);
}

export interface ProgressRow {
  user_id: string;
  airframe: string;
  item_id: string;
  box: number;
  next_due_at: string; // ISO
  total_attempts: number;
  correct_attempts: number;
  last_attempted_at: string | null;
  last_response_text: string | null;
}

export interface ItemDueState {
  itemId: string;
  box: number;
  nextDueAt: Date;
  totalAttempts: number;
  correctAttempts: number;
  isDue: boolean;
  isNew: boolean; // never attempted
}

/** Combine all known items with progress rows so the caller can show due/new. */
export function computeDueStates(
  itemIds: string[],
  rows: ProgressRow[],
  now: Date = new Date(),
): ItemDueState[] {
  const byId = new Map(rows.map((r) => [r.item_id, r]));
  return itemIds.map((id) => {
    const row = byId.get(id);
    if (!row) {
      return {
        itemId: id,
        box: MIN_BOX,
        nextDueAt: now,
        totalAttempts: 0,
        correctAttempts: 0,
        isDue: true,
        isNew: true,
      };
    }
    const dueAt = new Date(row.next_due_at);
    return {
      itemId: id,
      box: row.box,
      nextDueAt: dueAt,
      totalAttempts: row.total_attempts,
      correctAttempts: row.correct_attempts,
      isDue: dueAt.getTime() <= now.getTime(),
      isNew: false,
    };
  });
}

/** Pick the next item to drill. Prioritizes: new → due lowest-box → soonest-due. */
export function pickNextItem(states: ItemDueState[]): ItemDueState | null {
  const due = states.filter((s) => s.isDue);
  if (due.length === 0) {
    // nothing due — pick the soonest one
    const sorted = [...states].sort(
      (a, b) => a.nextDueAt.getTime() - b.nextDueAt.getTime(),
    );
    return sorted[0] ?? null;
  }
  // prefer new items first
  const fresh = due.filter((s) => s.isNew);
  if (fresh.length > 0) {
    return fresh[Math.floor(Math.random() * fresh.length)];
  }
  // then prefer lowest box (struggling items)
  const minBox = Math.min(...due.map((s) => s.box));
  const lowest = due.filter((s) => s.box === minBox);
  return lowest[Math.floor(Math.random() * lowest.length)];
}
