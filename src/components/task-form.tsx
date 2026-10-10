"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChallengeCard, Scale, Task } from "@/lib/challenge/types";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/format";

const SCALES: Scale[] = [1, 2, 3, 4, 5];

function ScalePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Scale;
  onChange: (value: Scale) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-medium tracking-wide text-muted uppercase">{label}</legend>
      <div className="mt-2 flex gap-1">
        {SCALES.map((scale) => {
          const selected = scale === value;
          return (
            <button
              key={scale}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(scale)}
              className="h-9 flex-1 rounded-xl border text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              style={
                selected
                  ? { background: "var(--ink)", color: "var(--cream)", borderColor: "var(--ink)" }
                  : { background: "var(--cream)", borderColor: "var(--line)" }
              }
            >
              {scale}
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-[11px] text-muted">1 low · 5 high</p>
    </fieldset>
  );
}

export function TaskForm({
  card,
  now,
  onCreate,
}: {
  card: ChallengeCard;
  now: number | null;
  onCreate: (task: Task) => void;
}) {
  const labels = card.persona.labels;
  const [title, setTitle] = useState("");
  const [dueOverride, setDueOverride] = useState<string | null>(null);
  const [impact, setImpact] = useState<Scale>(5);
  const [effort, setEffort] = useState<Scale>(2);
  const [energy, setEnergy] = useState<Scale>(3);
  const [categoryChoice, setCategoryChoice] = useState<string | null>(null);
  const [blockedBy, setBlockedBy] = useState("");
  const [owner, setOwner] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [seedNow, setSeedNow] = useState<number | null>(null);
  if (seedNow === null && now !== null) {
    setSeedNow(now);
  }
  const due = dueOverride ?? (seedNow ? toDatetimeLocalValue(new Date(seedNow + 45 * 60_000)) : "");
  const category =
    categoryChoice && card.useCase.categories.some((item) => item.id === categoryChoice)
      ? categoryChoice
      : (card.useCase.categories[0]?.id ?? "");

  function shiftDue(minutes: number) {
    const base = now ?? Date.now();
    setDueOverride(toDatetimeLocalValue(new Date(base + minutes * 60_000)));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError(labels.errorTitle);
      return;
    }
    const parsed = fromDatetimeLocalValue(due);
    if (!parsed) {
      setError(labels.errorDue);
      return;
    }
    onCreate({
      id: crypto.randomUUID(),
      title: title.trim(),
      dueAt: parsed.toISOString(),
      impact,
      effort,
      energy,
      category,
      blockedBy: card.flags.blockers ? blockedBy.trim() : "",
      owner: card.flags.teamView ? owner.trim() : "",
      done: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    setTitle("");
    setBlockedBy("");
    setOwner("");
    setError(null);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-line bg-cream p-5"
      data-testid="task-form"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-3xl">{labels.createAction}</h2>
        <p className="text-xs text-muted">1 low · 5 high</p>
      </div>
      <div className="mt-4 grid gap-4">
        <div>
          <Label htmlFor="task-title">{labels.taskNoun}</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={140}
            className="mt-2"
            placeholder={labels.taskNoun}
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="task-due">{labels.due}</Label>
          <Input
            id="task-due"
            type="datetime-local"
            value={due}
            onChange={(event) => setDueOverride(event.target.value)}
            className="mt-2"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => shiftDue(45)}>
              45 min
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => shiftDue(180)}>
              3 hours
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => shiftDue(60 * 24)}>
              Tomorrow
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ScalePicker label={labels.impact} value={impact} onChange={setImpact} />
          <ScalePicker label={labels.effort} value={effort} onChange={setEffort} />
          {card.flags.energy ? (
            <ScalePicker label={labels.energy} value={energy} onChange={setEnergy} />
          ) : null}
          <div>
            <Label htmlFor="task-category">{labels.category}</Label>
            <select
              id="task-category"
              value={category}
              onChange={(event) => setCategoryChoice(event.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-line bg-cream px-3 text-sm"
            >
              {card.useCase.categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {card.flags.blockers ? (
          <div>
            <Label htmlFor="task-blocked">{labels.blockedBy}</Label>
            <Input
              id="task-blocked"
              value={blockedBy}
              onChange={(event) => setBlockedBy(event.target.value)}
              maxLength={160}
              className="mt-2"
              autoComplete="off"
            />
          </div>
        ) : null}
        {card.flags.teamView ? (
          <div>
            <Label htmlFor="task-owner">{labels.owner}</Label>
            <Input
              id="task-owner"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              maxLength={60}
              className="mt-2"
              autoComplete="off"
            />
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="rounded-2xl bg-ember/10 px-3 py-2 text-sm text-ember">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="ember">
          {labels.createAction}
        </Button>
      </div>
    </form>
  );
}
