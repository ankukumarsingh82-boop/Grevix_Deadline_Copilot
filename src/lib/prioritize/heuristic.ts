import type { ChallengeCard, FeatureFlags, RankWeights, Scale, Task } from "../challenge/types";

const EFFORT_HOURS: Record<Scale, number> = {
  1: 0.4,
  2: 0.85,
  3: 2,
  4: 4,
  5: 8,
};

export type ScoreKey = keyof RankWeights | "bias";

export type ScorePart = {
  key: ScoreKey;
  label: string;
  /** Signal before weighting. Bias is already in points. */
  signal: number;
  weight: number;
  points: number;
  active: boolean;
};

export type RankedTask = {
  task: Task;
  score: number;
  parts: ScorePart[];
  reasons: string[];
};

export type WeightRow = {
  key: keyof RankWeights;
  label: string;
  weight: number;
  active: boolean;
};

const WEIGHT_LABELS: { key: keyof RankWeights; label: string; flag: keyof FeatureFlags | null }[] =
  [
    { key: "urgency", label: "Urgency", flag: null },
    { key: "impact", label: "Impact", flag: null },
    { key: "effortFit", label: "Effort fit", flag: null },
    { key: "energy", label: "Energy", flag: "energy" },
    { key: "unblock", label: "Unblock", flag: "blockers" },
  ];

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function hoursUntil(dueAt: string, now: Date): number {
  const due = new Date(dueAt).getTime();
  if (Number.isNaN(due)) return Number.POSITIVE_INFINITY;
  return (due - now.getTime()) / 3_600_000;
}

function urgencySignal(hoursLeft: number, horizonHours: number): number {
  if (hoursLeft <= 0) return 1;
  const span = Math.max(horizonHours, 1) * 2;
  return clamp01(1 - hoursLeft / span);
}

function effortFitSignal(hoursLeft: number, effort: Scale): number {
  const need = EFFORT_HOURS[effort];
  if (hoursLeft <= 0) {
    return effort <= 2 ? 1 : clamp01(1 - (effort - 2) / 3);
  }
  const ratio = need / hoursLeft;
  if (ratio > 1.15) return clamp01(1 / ratio);
  return clamp01(1 - Math.abs(ratio - 0.5) * 0.7);
}

export function timeboxMinutes(effort: Scale): number {
  const minutes: Record<Scale, number> = { 1: 25, 2: 45, 3: 60, 4: 90, 5: 120 };
  return minutes[effort];
}

export function scoringProfile(card: ChallengeCard): WeightRow[] {
  return WEIGHT_LABELS.map((row) => {
    const active = row.flag ? card.flags[row.flag] : true;
    return {
      key: row.key,
      label: row.label,
      weight: active ? card.useCase.weights[row.key] : 0,
      active,
    };
  });
}

function scoreTask(task: Task, card: ChallengeCard, now: Date): RankedTask {
  const hoursLeft = hoursUntil(task.dueAt, now);
  const blocked = task.blockedBy.trim().length > 0;
  const profile = scoringProfile(card);
  const urgency = urgencySignal(hoursLeft, card.useCase.horizonHours);
  const impact = (task.impact - 1) / 4;
  const effortFit = effortFitSignal(hoursLeft, task.effort);
  const energy = card.flags.energy ? (6 - task.energy) / 5 : 0;
  const unblock = !card.flags.blockers ? 0 : blocked ? 1 : 0.12;
  const categoryBoost = card.persona.bias.categoryBoosts[task.category] ?? 0;
  const blockedBoost = card.flags.blockers && blocked ? card.persona.bias.blockedBoost : 0;
  const bias = categoryBoost + blockedBoost;

  const signals: Record<ScoreKey, number> = {
    urgency,
    impact,
    effortFit,
    energy,
    unblock,
    bias,
  };

  const parts: ScorePart[] = profile.map((row) => ({
    key: row.key,
    label: row.label,
    signal: signals[row.key],
    weight: row.weight,
    points: signals[row.key] * row.weight,
    active: row.active,
  }));
  parts.push({
    key: "bias",
    label: "Persona",
    signal: bias,
    weight: bias === 0 ? 0 : 1,
    points: bias,
    active: bias !== 0,
  });

  const score = parts.reduce((sum, part) => sum + part.points, 0);
  const reasons: string[] = [];
  if (hoursLeft <= 0) reasons.push("Overdue");
  else if (hoursLeft <= 2) reasons.push("Due very soon");
  else if (urgency >= 0.55) reasons.push("Inside the horizon");
  if (impact >= 0.75) reasons.push("High impact");
  if (effortFit >= 0.8) reasons.push("Fits the time left");
  if (card.flags.energy && task.energy <= 2) reasons.push("Low energy to start");
  if (card.flags.blockers && blocked) reasons.push("Blocked — clear it first");
  if (bias > 0) reasons.push(card.persona.biasNote);

  return { task, score, parts, reasons };
}

export function rankTasks(tasks: Task[], card: ChallengeCard, now: Date): RankedTask[] {
  return tasks
    .filter((task) => !task.done)
    .map((task) => scoreTask(task, card, now))
    .sort((a, b) => {
      const delta = b.score - a.score;
      if (Math.abs(delta) > 1e-9) return delta;
      return a.task.dueAt.localeCompare(b.task.dueAt);
    });
}

export function orderByIds(ranked: RankedTask[], ids: string[]): RankedTask[] {
  const position = new Map(ids.map((id, index) => [id, index]));
  return [...ranked].sort((a, b) => {
    const ai = position.get(a.task.id);
    const bi = position.get(b.task.id);
    if (ai === undefined && bi === undefined) return 0;
    if (ai === undefined) return 1;
    if (bi === undefined) return -1;
    return ai - bi;
  });
}
