import { CARDS } from "./cards";
import { DEFAULT_CARD_ID, type ChallengeCard, type Task } from "./types";

export function listCards(): ChallengeCard[] {
  return CARDS;
}

export function resolveChallenge(cardId: string | null | undefined): ChallengeCard {
  return CARDS.find((card) => card.id === cardId) ?? CARDS[0];
}

export function defaultCard(): ChallengeCard {
  return resolveChallenge(DEFAULT_CARD_ID);
}

export function categoryLabel(card: ChallengeCard, categoryId: string): string {
  return (
    card.useCase.categories.find((category) => category.id === categoryId)
      ?.label ?? categoryId
  );
}

export function tasksFromSamples(card: ChallengeCard, now: Date): Task[] {
  return card.samples.map((sample) => ({
    id: crypto.randomUUID(),
    title: sample.title,
    dueAt: new Date(now.getTime() + sample.hoursFromNow * 3_600_000).toISOString(),
    impact: sample.impact,
    effort: sample.effort,
    energy: sample.energy,
    category: sample.category,
    blockedBy: sample.blockedBy,
    owner: sample.owner,
    done: false,
    createdAt: now.toISOString(),
    completedAt: null,
  }));
}
