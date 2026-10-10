import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/challenge/resolve";
import type { ChallengeCard } from "@/lib/challenge/types";
import { formatDue, formatScore } from "@/lib/format";
import { timeboxMinutes, type RankedTask } from "@/lib/prioritize/heuristic";

export function WhatNext({
  card,
  top,
  now,
  onToggle,
}: {
  card: ChallengeCard;
  top: RankedTask | undefined;
  now: number;
  onToggle: (id: string) => void;
}) {
  const labels = card.persona.labels;
  if (!top) return null;
  const minutes = timeboxMinutes(top.task.effort);

  return (
    <section
      className="rounded-3xl border border-line bg-ink text-cream"
      data-testid="what-next"
      aria-labelledby="what-next-heading"
    >
      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_220px] md:p-6">
        <div>
          <p id="what-next-heading" className="text-[11px] tracking-[0.18em] text-cream/60 uppercase">
            {labels.whatNext}
          </p>
          <h2 className="font-display mt-2 text-4xl leading-[1.05] md:text-5xl">{top.task.title}</h2>
          <p className="mt-3 text-sm text-cream/75">
            {labels.due} {formatDue(top.task.dueAt, now)} · {categoryLabel(card, top.task.category)} ·{" "}
            {labels.score} {formatScore(top.score)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {top.reasons.slice(0, 3).map((reason) => (
              <Badge key={reason} variant="ink" className="border-cream/20 bg-cream/10 text-cream">
                {reason}
              </Badge>
            ))}
            {card.flags.blockers && top.task.blockedBy ? (
              <Badge variant="ember">
                {labels.blocked}: {top.task.blockedBy}
              </Badge>
            ) : null}
          </div>
          {card.flags.timeboxing ? (
            <p className="mt-4 font-mono text-sm text-cream/80">
              {labels.timebox} {minutes} min
            </p>
          ) : null}
          <Button
            type="button"
            variant="ember"
            className="mt-5"
            onClick={() => onToggle(top.task.id)}
          >
            {labels.markDone}
          </Button>
        </div>
        <dl className="space-y-2 rounded-2xl bg-white/10 p-3">
          {top.parts.map((part) => (
            <div key={part.key} className="grid grid-cols-[72px_1fr_42px] items-center gap-2 text-xs">
              <dt className={part.active ? "text-cream" : "text-cream/40"}>{part.label}</dt>
              <span className="h-1 overflow-hidden rounded-full bg-cream/15">
                <span
                  className="block h-full rounded-full bg-cream"
                  style={{ width: part.active ? `${Math.min(100, Math.abs(part.points) * 40)}%` : "0%" }}
                />
              </span>
              <dd className="text-right font-mono text-[11px] text-cream/70">
                {part.active ? part.points.toFixed(2) : "off"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
