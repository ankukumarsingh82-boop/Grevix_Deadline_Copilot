import { defaultState, loadState, saveState, type PersistedState } from "./storage";

export type BoardSnapshot = {
  state: PersistedState;
  error: string | null;
};

const serverSnapshot: BoardSnapshot = { state: defaultState(), error: null };
let current = serverSnapshot;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeBoard(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBoardSnapshot(): BoardSnapshot {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    const loaded = loadState();
    current = { state: loaded.state, error: loaded.error };
  }
  return current;
}

export function getBoardServerSnapshot(): BoardSnapshot {
  return serverSnapshot;
}

export function updateBoard(recipe: (state: PersistedState) => PersistedState) {
  const next = recipe(getBoardSnapshot().state);
  const saved = saveState(next);
  current = {
    state: next,
    error: saved.ok ? null : saved.error,
  };
  emit();
}
