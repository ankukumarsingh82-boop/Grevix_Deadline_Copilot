"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ChallengePanel } from "@/components/challenge-panel";
import { TaskForm } from "@/components/task-form";
import { DoneList, TaskList } from "@/components/task-list";
import { TeamBoard } from "@/components/team-board";
import { Button } from "@/components/ui/button";
import { WhatNext } from "@/components/what-next";
import { getBoardServerSnapshot, getBoardSnapshot, subscribeBoard, updateBoard } from "@/lib/board-store";
import { listCards, resolveChallenge, tasksFromSamples } from "@/lib/challenge/resolve";
import type { Task } from "@/lib/challenge/types";
import { getClock, getServerClock, subscribeClock } from "@/lib/clock";
import { completionStreak, formatClock } from "@/lib/format";
import { orderByIds, rankTasks } from "@/lib/prioritize/heuristic";
import { requestModelRank } from "@/lib/prioritize/request";

const cards = listCards();

export function Board() {
  const snapshot = useSyncExternalStore(subscribeBoard, getBoardSnapshot, getBoardServerSnapshot);
  const now = useSyncExternalStore(subscribeClock, getClock, getServerClock);
  const [movement, setMovement] = useState<Record<string, number>>({});
  const [llmBusy, setLlmBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const { state } = snapshot;

  const card = resolveChallenge(state.activeCardId);
  const labels = card.persona.labels;
  const ranked = useMemo(
    () => (now ? rankTasks(state.tasks, card, new Date(now)) : []),
    [card, now, state.tasks],
  );
  const shown = useMemo(() => {
    if (state.ranker.method === "llm" && state.ranker.order?.length) {
      return orderByIds(ranked, state.ranker.order);
    }
    return ranked;
  }, [ranked, state.ranker.method, state.ranker.order]);
  const done = state.tasks.filter((task) => task.done);
  const streak = now ? completionStreak(state.tasks, new Date(now)) : 0;
  const moved = shown
    .map((row) => ({ title: row.task.title, delta: movement[row.task.id] ?? 0 }))
    .filter((row) => row.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const movementLine =
    moved.length === 0
      ? null
      : moved
          .slice(0, 2)
          .map((row) => `${row.title} moved ${row.delta > 0 ? "up" : "down"} ${Math.abs(row.delta)}`)
          .join(". ") + ".";

  function replaceTasks(tasks: Task[], note: string) {
    setMovement({});
    setBanner(null);
    updateBoard((current) => ({
      ...current,
      tasks,
      ranker: { method: "heuristic", note, model: null, order: null },
    }));
  }

  function toggle(id: string) {
    const tasks = state.tasks.map((task) => {
      if (task.id !== id) return task;
      const nextDone = !task.done;
      return {
        ...task,
        done: nextDone,
        completedAt: nextDone ? new Date().toISOString() : null,
      };
    });
    replaceTasks(tasks, "Heuristic ranking updated from the board.");
  }

  function remove(id: string) {
    replaceTasks(
      state.tasks.filter((task) => task.id !== id),
      "Heuristic ranking updated from the board.",
    );
  }

  function create(task: Task) {
    replaceTasks([task, ...state.tasks], "Heuristic ranking includes the new work.");
  }

  function flipTo(nextId: string) {
    if (!now || nextId === state.activeCardId) return;
    const before = new Map(ranked.map((row, index) => [row.task.id, index]));
    const nextCard = resolveChallenge(nextId);
    const after = rankTasks(state.tasks, nextCard, new Date(now));
    const nextMovement: Record<string, number> = {};
    after.forEach((row, index) => {
      const previous = before.get(row.task.id);
      if (previous !== undefined) nextMovement[row.task.id] = previous - index;
    });
    setMovement(nextMovement);
    setBanner(null);
    updateBoard((current) => ({
      ...current,
      activeCardId: nextCard.id,
      ranker: {
        method: "heuristic",
        note: `Re-ranked for ${nextCard.useCase.name}. Labels, features, and weights come from the ${nextCard.title} card.`,
        model: null,
        order: null,
      },
    }));
  }

  function seed() {
    const stamp = new Date(now ?? Date.now());
    const existing = new Set(state.tasks.map((task) => task.title));
    const added = tasksFromSamples(card, stamp).filter((task) => !existing.has(task.title));
    replaceTasks(
      [...state.tasks, ...added],
      added.length
        ? "Sample board loaded. Ranked with the heuristic."
        : "Those samples are already on the board.",
    );
  }

  async function askModel() {
    if (!card.flags.llmPrioritize || llmBusy) return;
    setLlmBusy(true);
    setBanner(null);
    try {
      const result = await requestModelRank(
        card.id,
        ranked.map((row) => row.task),
      );
      updateBoard((current) => ({
        ...current,
        ranker: {
          method: result.method,
          note: result.note,
          model: result.model,
          order: result.method === "llm" ? result.rankedIds : null,
        },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "The model could not be reached.";
      setBanner(`${message} The heuristic order is unchanged.`);
    } finally {
      setLlmBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-6 md:px-6" data-testid="board">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Deadline Copilot</p>
          <h1 className="font-display text-5xl leading-none md:text-6xl">{labels.appName}</h1>
          <p className="mt-2 text-sm text-muted">{labels.tagline}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm">IST {now ? formatClock(now) : "—"}</p>
          <p className="text-sm text-muted">{labels.board}</p>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <ChallengePanel card={card} cards={cards} streak={streak} onFlip={flipTo} />

        <main className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-xl text-sm leading-6 text-muted" aria-live="polite">
              <p>
                {state.ranker.note}
                {state.ranker.model ? ` · ${state.ranker.model}` : ""}
              </p>
              {movementLine ? <p className="text-ink">{movementLine}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={seed}>
                {labels.seed}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  replaceTasks([], "Board cleared. The heuristic is ready for the next task.")
                }
              >
                {labels.clear}
              </Button>
              {card.flags.llmPrioritize ? (
                <Button type="button" size="sm" onClick={askModel} disabled={llmBusy || ranked.length === 0}>
                  {llmBusy ? "Asking…" : labels.llmAction}
                </Button>
              ) : null}
            </div>
          </div>

          {snapshot.error ? (
            <p role="alert" className="rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
              {snapshot.error}
            </p>
          ) : null}
          {banner ? (
            <p role="alert" className="rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
              {banner}
            </p>
          ) : null}

          {now === null && state.tasks.some((task) => !task.done) ? (
            <p className="text-sm text-muted">Ranking the board…</p>
          ) : null}

          {now && shown.length > 0 ? <WhatNext card={card} top={shown[0]} now={now} onToggle={toggle} /> : null}

          {card.flags.teamView && now && shown.length > 0 ? (
            <TeamBoard card={card} rows={shown} now={now} />
          ) : null}

          {shown.length === 0 ? (
            <section
              className="rounded-3xl border border-dashed border-line bg-cream/60 px-5 py-10"
              data-testid="empty-state"
            >
              <h2 className="font-display text-4xl">{done.length > 0 ? labels.allClear : labels.emptyTitle}</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                {done.length > 0 ? labels.tagline : labels.emptyBody}
              </p>
            </section>
          ) : null}

          {now && shown.length > 0 ? (
            <TaskList
              card={card}
              rows={shown}
              now={now}
              movement={movement}
              onToggle={toggle}
              onRemove={remove}
            />
          ) : null}

          <DoneList card={card} tasks={done} onToggle={toggle} onRemove={remove} />
          <TaskForm card={card} now={now} onCreate={create} />
        </main>
      </div>

      <footer className="mt-8 border-t border-line pt-4 text-xs text-muted">
        A new challenge card is a catalog entry. The board is not rewritten to absorb it.
      </footer>
    </div>
  );
}
