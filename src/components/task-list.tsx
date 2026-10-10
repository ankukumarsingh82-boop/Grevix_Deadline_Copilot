import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/challenge/resolve";
import type { ChallengeCard, Task } from "@/lib/challenge/types";
import { formatDue, formatScore } from "@/lib/format";
import type { RankedTask } from "@/lib/prioritize/heuristic";

export function TaskList({
  card,
  rows,
  now,
  movement,
  onToggle,
  onRemove,
}: {
  card: ChallengeCard;
  rows: RankedTask[];
  now: number;
  movement: Record<string, number>;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const labels = card.persona.labels;
  const peak = rows[0]?.score || 1;

  return (
    <ol className="space-y-3" data-testid="ranked-list">
      {rows.map((row, index) => {
        const delta = movement[row.task.id] ?? 0;
        return (
          <li
            key={row.task.id}
            className="rounded-3xl border border-line bg-cream p-4"
            data-rank={index + 1}
          >
            <div className="flex items-start gap-3">
              <span className="font-display w-10 text-3xl leading-none text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-medium">{row.task.title}</h3>
                  <span className="font-mono text-xs text-muted">{formatScore(row.score)}</span>
                  {delta !== 0 ? (
                    <span
                      className={
                        delta > 0
                          ? "rounded-full bg-moss/10 px-2 py-0.5 text-xs font-medium text-moss"
                          : "rounded-full bg-ember/10 px-2 py-0.5 text-xs font-medium text-ember"
                      }
                    >
                      {delta > 0 ? `Up ${delta}` : `Down ${Math.abs(delta)}`}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {categoryLabel(card, row.task.category)} · {labels.due} {formatDue(row.task.dueAt, now)} ·{" "}
                  {labels.impact} {row.task.impact} · {labels.effort} {row.task.effort}
                  {card.flags.energy ? ` · ${labels.energy} ${row.task.energy}` : ""}
                  {card.flags.teamView
                    ? ` · ${labels.owner} ${row.task.owner.trim() || labels.unassigned}`
                    : ""}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(6, (row.score / peak) * 100)}%`,
                      background: card.accent,
                    }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {row.reasons.slice(0, 2).map((reason) => (
                    <Badge key={reason}>{reason}</Badge>
                  ))}
                  {card.flags.blockers && row.task.blockedBy ? (
                    <Badge variant="ember">
                      {labels.blocked}: {row.task.blockedBy}
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => onToggle(row.task.id)}>
                  {labels.markDone}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => onRemove(row.task.id)}>
                  {labels.remove}
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function DoneList({
  card,
  tasks,
  onToggle,
  onRemove,
}: {
  card: ChallengeCard;
  tasks: Task[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const labels = card.persona.labels;
  if (tasks.length === 0) return null;
  return (
    <details className="rounded-3xl border border-line bg-cream/70 p-4">
      <summary className="cursor-pointer text-sm font-medium">
        {labels.done} · {tasks.length}
      </summary>
      <ul className="mt-3 space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted line-through">{task.title}</span>
            <span className="flex gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => onToggle(task.id)}>
                {labels.reopen}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => onRemove(task.id)}>
                {labels.remove}
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
