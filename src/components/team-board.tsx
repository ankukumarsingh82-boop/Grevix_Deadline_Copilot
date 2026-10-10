import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "@/lib/challenge/resolve";
import type { ChallengeCard } from "@/lib/challenge/types";
import { formatDue } from "@/lib/format";
import type { RankedTask } from "@/lib/prioritize/heuristic";

export function TeamBoard({
  card,
  rows,
  now,
}: {
  card: ChallengeCard;
  rows: RankedTask[];
  now: number;
}) {
  const labels = card.persona.labels;
  const groups = new Map<string, { row: RankedTask; rank: number }[]>();
  rows.forEach((row, index) => {
    const owner = row.task.owner.trim() || labels.unassigned;
    const list = groups.get(owner) ?? [];
    list.push({ row, rank: index + 1 });
    groups.set(owner, list);
  });

  return (
    <section className="rounded-3xl border border-line bg-cream/80 p-4" data-testid="team-view">
      <h2 className="font-display text-3xl">{labels.teamHeading}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[...groups.entries()].map(([owner, items]) => (
          <article key={owner} className="rounded-2xl border border-line bg-cream p-3">
            <h3 className="text-sm font-medium">{owner}</h3>
            <ul className="mt-2 space-y-2">
              {items.map(({ row, rank }) => (
                <li key={row.task.id} className="text-sm">
                  <p className="font-medium">
                    <span className="mr-2 font-mono text-xs text-muted">{String(rank).padStart(2, "0")}</span>
                    {row.task.title}
                  </p>
                  <p className="text-xs text-muted">
                    {categoryLabel(card, row.task.category)} · {formatDue(row.task.dueAt, now)}
                  </p>
                  {card.flags.blockers && row.task.blockedBy ? (
                    <Badge variant="ember" className="mt-1">
                      {labels.blocked}: {row.task.blockedBy}
                    </Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
