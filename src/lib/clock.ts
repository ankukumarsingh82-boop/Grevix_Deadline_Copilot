let clock: number | null = null;
let intervalId: number | null = null;
const listeners = new Set<() => void>();

function tick() {
  clock = Date.now();
  for (const listener of listeners) listener();
}

export function subscribeClock(listener: () => void) {
  listeners.add(listener);
  if (clock === null) clock = Date.now();
  if (intervalId === null) {
    intervalId = window.setInterval(tick, 30_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };
}

export function getClock(): number | null {
  if (clock === null && typeof window !== "undefined") clock = Date.now();
  return clock;
}

export function getServerClock(): number | null {
  return null;
}
