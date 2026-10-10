import type { RankerMethod } from "../storage";
import type { Task } from "../challenge/types";

export type RankResponse = {
  method: RankerMethod;
  note: string;
  model: string | null;
  rankedIds: string[];
};

export async function requestModelRank(cardId: string, tasks: Task[]): Promise<RankResponse> {
  const response = await fetch("/api/rank", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      cardId,
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        dueAt: task.dueAt,
        impact: task.impact,
        effort: task.effort,
        energy: task.energy,
        category: task.category,
        blockedBy: task.blockedBy,
        owner: task.owner,
        done: task.done,
      })),
    }),
  });
  const body = (await response.json()) as Partial<RankResponse> & { error?: string };
  if (!response.ok) {
    throw new Error(body.error || "The rank request failed.");
  }
  if (!body.method || !Array.isArray(body.rankedIds) || typeof body.note !== "string") {
    throw new Error("The rank response was incomplete.");
  }
  return {
    method: body.method,
    note: body.note,
    model: typeof body.model === "string" ? body.model : null,
    rankedIds: body.rankedIds.filter((id): id is string => typeof id === "string"),
  };
}
