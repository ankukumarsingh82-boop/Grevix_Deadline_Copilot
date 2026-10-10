import { CARDS } from "../src/lib/challenge/cards.ts";
import { resolveChallenge, tasksFromSamples } from "../src/lib/challenge/resolve.ts";
import { rankTasks } from "../src/lib/prioritize/heuristic.ts";
import type { Scale, Task } from "../src/lib/challenge/types.ts";

const NOW = new Date("2026-10-11T12:00:00+05:30");
const solo = resolveChallenge("solo-aftercode");
const exam = resolveChallenge("exam-cram");
const team = resolveChallenge("team-unblocker");

function task(partial: {
  title: string;
  hours: number;
  impact: Scale;
  effort: Scale;
  energy: Scale;
  category: string;
  blockedBy?: string;
  owner?: string;
}): Task {
  return {
    id: partial.title,
    title: partial.title,
    dueAt: new Date(NOW.getTime() + partial.hours * 3_600_000).toISOString(),
    impact: partial.impact,
    effort: partial.effort,
    energy: partial.energy,
    category: partial.category,
    blockedBy: partial.blockedBy ?? "",
    owner: partial.owner ?? "",
    done: false,
    createdAt: NOW.toISOString(),
    completedAt: null,
  };
}

const board = [
  ...tasksFromSamples(solo, NOW).map((item) => ({ ...item, id: item.title })),
  task({
    title: "Pitch the demo",
    hours: 0.75,
    impact: 5,
    effort: 2,
    energy: 3,
    category: "demo",
  }),
];

function titles(cardId: string) {
  const card = resolveChallenge(cardId);
  return rankTasks(board, card, NOW).map((row) => `${row.task.title} (${row.score.toFixed(2)})`);
}

function indexOf(cardId: string, title: string) {
  return rankTasks(board, resolveChallenge(cardId), NOW).findIndex((row) => row.task.title === title);
}

const failures: string[] = [];
function expect(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

for (const card of CARDS) {
  const ranked = rankTasks(tasksFromSamples(card, NOW), card, NOW);
  expect(ranked.length === card.samples.length, `${card.id} ranks every sample`);
}

const soloOrder = titles("solo-aftercode");
const examOrder = titles("exam-cram");
const teamOrder = titles("team-unblocker");

console.log("\nSolo\n", soloOrder.join("\n "));
console.log("\nExam\n", examOrder.join("\n "));
console.log("\nTeam\n", teamOrder.join("\n "));

expect(indexOf("solo-aftercode", "Pitch the demo") === 0, "Solo puts the near-deadline demo first");
expect(
  indexOf("team-unblocker", "Ship the ranker") === 0,
  "Team unblocker puts the blocked task first",
);
expect(indexOf("exam-cram", "Quiet copy pass") === 0, "Exam cram studies the low-energy task next");
expect(
  indexOf("exam-cram", "Ship the ranker") > 0,
  "Exam cram does not lead with the blocked task",
);
expect(soloOrder.join("|") !== examOrder.join("|"), "Exam order differs from solo");
expect(
  rankTasks(board, exam, NOW).every((row) => row.parts.find((part) => part.key === "unblock")?.points === 0),
  "Exam unblock points stay at zero",
);
expect(team.flags.teamView && !exam.flags.blockers && solo.flags.energy, "Flags match the brief");

if (failures.length) {
  console.error("\nFAILED");
  for (const failure of failures) console.error(" -", failure);
  process.exit(1);
}
console.log("\nRanker checks passed.");
