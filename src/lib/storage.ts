import { DEFAULT_CARD_ID, type Task } from "./challenge/types";

export const STORAGE_KEY = "pivot.deadline-copilot.v1";

export type RankerMethod = "heuristic" | "llm";

export type PersistedState = {
  version: 1;
  activeCardId: string;
  tasks: Task[];
  ranker: {
    method: RankerMethod;
    note: string;
    model: string | null;
    order: string[] | null;
  };
};

export function defaultState(): PersistedState {
  return {
    version: 1,
    activeCardId: DEFAULT_CARD_ID,
    tasks: [],
    ranker: {
      method: "heuristic",
      note: "Heuristic ranking. It runs in the browser and does not need a key.",
      model: null,
      order: null,
    },
  };
}

export type LoadResult = {
  state: PersistedState;
  error: string | null;
};

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;
  const task = value as Partial<Task>;
  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.dueAt === "string" &&
    typeof task.category === "string" &&
    typeof task.impact === "number" &&
    typeof task.effort === "number" &&
    typeof task.energy === "number"
  );
}

export function loadState(): LoadResult {
  const fallback = defaultState();
  if (typeof window === "undefined") return { state: fallback, error: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: fallback, error: null };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (parsed.version !== 1 || !Array.isArray(parsed.tasks) || !parsed.tasks.every(isTask)) {
      return {
        state: fallback,
        error: "A saved board could not be read, so this one starts empty.",
      };
    }
    return {
      state: {
        version: 1,
        activeCardId:
          typeof parsed.activeCardId === "string" ? parsed.activeCardId : DEFAULT_CARD_ID,
        tasks: parsed.tasks.map((task) => ({
          ...task,
          blockedBy: typeof task.blockedBy === "string" ? task.blockedBy : "",
          owner: typeof task.owner === "string" ? task.owner : "",
          done: Boolean(task.done),
          createdAt: typeof task.createdAt === "string" ? task.createdAt : new Date().toISOString(),
          completedAt: typeof task.completedAt === "string" ? task.completedAt : null,
        })),
        ranker: {
          method: parsed.ranker?.method === "llm" ? "llm" : "heuristic",
          note:
            typeof parsed.ranker?.note === "string"
              ? parsed.ranker.note
              : fallback.ranker.note,
          model: typeof parsed.ranker?.model === "string" ? parsed.ranker.model : null,
          order: Array.isArray(parsed.ranker?.order)
            ? parsed.ranker.order.filter((id): id is string => typeof id === "string")
            : null,
        },
      },
      error: null,
    };
  } catch {
    return {
      state: fallback,
      error: "This browser blocked local storage. The board stays in memory until you refresh.",
    };
  }
}

export function saveState(state: PersistedState): { ok: true } | { ok: false; error: string } {
  if (typeof window === "undefined") return { ok: true };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "This browser blocked local storage. The board stays in memory until you refresh.",
    };
  }
}
