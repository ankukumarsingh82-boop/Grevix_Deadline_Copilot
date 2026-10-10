import { Badge } from "@/components/ui/badge";
import type { ChallengeCard, FeatureFlags } from "@/lib/challenge/types";
import { scoringProfile } from "@/lib/prioritize/heuristic";

const FLAG_ROWS: { key: keyof FeatureFlags; label: string }[] = [
  { key: "energy", label: "Energy" },
  { key: "blockers", label: "Blockers" },
  { key: "streak", label: "Streak" },
  { key: "timeboxing", label: "Timeboxing" },
  { key: "teamView", label: "Team view" },
  { key: "llmPrioritize", label: "Model rank" },
];

export function ChallengePanel({
  card,
  cards,
  streak,
  onFlip,
}: {
  card: ChallengeCard;
  cards: ChallengeCard[];
  streak: number;
  onFlip: (cardId: string) => void;
}) {
  const labels = card.persona.labels;
  const weights = scoringProfile(card);

  return (
    <aside className="space-y-4">
      <article
        key={card.id}
        className="ticket-in overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_18px_40px_-28px_rgba(28,23,18,0.45)]"
        style={{ borderTop: `8px solid ${card.accent}` }}
        data-testid="challenge-card"
      >
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">{card.code}</p>
            <p className="font-mono text-[11px] text-muted">{card.persona.role}</p>
          </div>
          <div>
            <h2 className="font-display text-3xl leading-none">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{card.summary}</p>
          </div>
          <p className="border-l-2 pl-3 text-sm leading-6" style={{ borderColor: card.accent }}>
            {card.persona.voice}
          </p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[11px] tracking-wide text-muted uppercase">Persona</dt>
              <dd className="font-medium">{card.persona.name}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted uppercase">{labels.horizon}</dt>
              <dd className="font-medium">
                {card.useCase.horizonHours}h · {card.useCase.name}
              </dd>
            </div>
          </dl>
        </div>
      </article>

      <section className="rounded-3xl border border-line bg-cream/80 p-4">
        <h3 className="text-[11px] tracking-[0.16em] text-muted uppercase">{labels.flip}</h3>
        <div className="mt-3 grid gap-2">
          {cards.map((option) => {
            const active = option.id === card.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                data-card-id={option.id}
                onClick={() => onFlip(option.id)}
                className="flex items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                style={
                  active
                    ? { borderColor: option.accent, background: "white" }
                    : { borderColor: "var(--line)", background: "transparent" }
                }
              >
                <span>
                  <span className="block font-medium">{option.title}</span>
                  <span className="block text-xs text-muted">{option.persona.labels.tagline}</span>
                </span>
                <span className="font-mono text-[10px] text-muted">{option.code}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-cream/80 p-4">
        <h3 className="text-[11px] tracking-[0.16em] text-muted uppercase">Features</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {FLAG_ROWS.map((flag) => (
            <Badge key={flag.key} variant={card.flags[flag.key] ? "on" : "off"}>
              {flag.label} {card.flags[flag.key] ? "on" : "off"}
            </Badge>
          ))}
        </div>
        {card.flags.streak ? (
          <p className="mt-4 font-display text-4xl leading-none">
            {streak}
            <span className="ml-2 font-sans text-sm text-muted">{labels.streak}</span>
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-line bg-cream/80 p-4">
        <h3 className="text-[11px] tracking-[0.16em] text-muted uppercase">Ranking weights</h3>
        <p className="mt-1 text-xs text-muted">{card.persona.biasNote}</p>
        <ul className="mt-3 space-y-2">
          {weights.map((row) => (
            <li key={row.key} className="grid grid-cols-[88px_1fr_36px] items-center gap-2 text-xs">
              <span className={row.active ? "text-ink" : "text-muted"}>{row.label}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-ink/10">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (row.weight / 2) * 100)}%`,
                    background: row.active ? card.accent : "transparent",
                  }}
                />
              </span>
              <span className="text-right font-mono text-[11px] text-muted">
                {row.active ? row.weight.toFixed(2) : "off"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
