import type { Task } from "./challenge/types";

export function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDue(iso: string, now: number): string {
  const due = new Date(iso).getTime();
  if (Number.isNaN(due)) return "No due time";
  const diff = due - now;
  const minutes = Math.round(Math.abs(diff) / 60_000);
  if (minutes < 1) return diff >= 0 ? "due now" : "just overdue";
  if (minutes < 60) return diff >= 0 ? `in ${minutes}m` : `${minutes}m overdue`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return diff >= 0 ? `in ${hours}h` : `${hours}h overdue`;
  const days = Math.round(hours / 24);
  return diff >= 0 ? `in ${days}d` : `${days}d overdue`;
}

export function formatClock(now: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
}

export function formatScore(score: number): string {
  return score.toFixed(2);
}

function localDateKey(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Consecutive local days with a completion, ending today or yesterday. */
export function completionStreak(tasks: Task[], now: Date): number {
  const days = new Set(
    tasks
      .filter((task) => task.done && task.completedAt)
      .map((task) => localDateKey(new Date(task.completedAt as string))),
  );
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  if (!days.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
