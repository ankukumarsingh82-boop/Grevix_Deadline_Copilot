import { generateText, Output, gateway } from "ai";
import { openai } from "@ai-sdk/openai";
import { connection } from "next/server";
import { z } from "zod";
import { resolveChallenge } from "@/lib/challenge/resolve";
import type { Scale, Task } from "@/lib/challenge/types";
import { rankTasks } from "@/lib/prioritize/heuristic";

const DEFAULT_GATEWAY_MODEL = "openai/gpt-5.4-mini";
const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";

const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  dueAt: z.string().min(1),
  impact: z.number().int().min(1).max(5),
  effort: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  category: z.string(),
  blockedBy: z.string().optional(),
  owner: z.string().optional(),
  done: z.boolean().optional(),
  createdAt: z.string().optional(),
  completedAt: z.string().nullable().optional(),
});

const bodySchema = z.object({
  cardId: z.string().min(1),
  tasks: z.array(taskSchema).max(40),
});

const rankingSchema = z.object({
  rankedIds: z.array(z.string()),
  reason: z.string().min(1).max(400),
});

function resolveModel() {
  const requested = process.env.AI_MODEL?.trim();
  if (process.env.AI_GATEWAY_API_KEY) {
    const label = requested || DEFAULT_GATEWAY_MODEL;
    return { model: gateway(label), label };
  }
  if (process.env.OPENAI_API_KEY) {
    const label = (requested || DEFAULT_OPENAI_MODEL).replace(/^openai\//, "");
    return { model: openai(label), label };
  }
  return null;
}

function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown error";
  return message.replace(/sk-[A-Za-z0-9_-]+/g, "[key]").replace(/\s+/g, " ").slice(0, 180);
}

function mergeOrder(heuristicIds: string[], modelIds: string[]): string[] | null {
  const allowed = new Set(heuristicIds);
  const seen = new Set<string>();
  const next: string[] = [];
  for (const id of modelIds) {
    if (!allowed.has(id) || seen.has(id)) continue;
    seen.add(id);
    next.push(id);
  }
  if (next.length === 0) return null;
  for (const id of heuristicIds) {
    if (!seen.has(id)) next.push(id);
  }
  return next;
}

export async function POST(request: Request) {
  await connection();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Tasks could not be read." }, { status: 400 });
  }

  const card = resolveChallenge(parsed.data.cardId);
  const now = new Date();
  const tasks: Task[] = parsed.data.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    dueAt: task.dueAt,
    impact: task.impact as Scale,
    effort: task.effort as Scale,
    energy: task.energy as Scale,
    category: task.category,
    blockedBy: task.blockedBy ?? "",
    owner: task.owner ?? "",
    done: task.done ?? false,
    createdAt: task.createdAt ?? now.toISOString(),
    completedAt: task.completedAt ?? null,
  }));
  const heuristic = rankTasks(tasks, card, now);
  const rankedIds = heuristic.map((row) => row.task.id);

  const fallback = (note: string, model: string | null = null) =>
    Response.json({
      method: "heuristic" as const,
      note,
      model,
      rankedIds,
    });

  if (!card.flags.llmPrioritize) {
    return fallback("This challenge card has model ranking turned off. Heuristic ranking is shown.");
  }
  if (rankedIds.length === 0) {
    return fallback("Nothing is open to rank.");
  }

  const resolved = resolveModel();
  if (!resolved) {
    return fallback(
      "No OPENAI_API_KEY or AI_GATEWAY_API_KEY is set. Heuristic ranking is shown.",
    );
  }

  const lines = heuristic.map((row, index) => {
    const task = row.task;
    return `${index + 1}. ${task.id} | ${task.title} | due ${task.dueAt} | impact ${task.impact} | effort ${task.effort} | energy ${task.energy} | category ${task.category} | blocked ${task.blockedBy || "no"} | owner ${task.owner || "none"} | score ${row.score.toFixed(2)} | ${row.reasons.join(", ")}`;
  });

  try {
    const result = await generateText({
      model: resolved.model,
      output: Output.object({
        schema: rankingSchema,
        name: "board_ranking",
        description: "An ordered list of the given task ids, best first.",
      }),
      prompt: [
        `You reorder an existing deadline board. Do not invent tasks.`,
        `Persona: ${card.persona.name}, ${card.persona.role}. ${card.persona.voice}`,
        `Use case: ${card.useCase.name}. Horizon: ${card.useCase.horizonHours} hours.`,
        `Bias: ${card.persona.biasNote}`,
        `Keep the heuristic order unless the persona voice clearly disagrees.`,
        `Return every id exactly once.`,
        `Open work, already scored:`,
        ...lines,
      ].join("\n"),
    });

    const output = result.output;
    if (!output) {
      return fallback("The model returned no ranking. Heuristic ranking is shown.", resolved.label);
    }
    const merged = mergeOrder(rankedIds, output.rankedIds);
    if (!merged) {
      return fallback("The model ranking did not match this board. Heuristic ranking is shown.", resolved.label);
    }
    return Response.json({
      method: "llm" as const,
      note: output.reason,
      model: resolved.label,
      rankedIds: merged,
    });
  } catch (error) {
    return fallback(
      `The model call failed (${safeError(error)}). Heuristic ranking is shown.`,
      resolved.label,
    );
  }
}
