export type Scale = 1 | 2 | 3 | 4 | 5;

export type Task = {
  id: string;
  title: string;
  dueAt: string;
  impact: Scale;
  effort: Scale;
  energy: Scale;
  category: string;
  blockedBy: string;
  owner: string;
  done: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type TaskSample = {
  title: string;
  hoursFromNow: number;
  impact: Scale;
  effort: Scale;
  energy: Scale;
  category: string;
  blockedBy: string;
  owner: string;
};

export type RankWeights = {
  urgency: number;
  impact: number;
  effortFit: number;
  energy: number;
  unblock: number;
};

export type FeatureFlags = {
  energy: boolean;
  blockers: boolean;
  streak: boolean;
  timeboxing: boolean;
  teamView: boolean;
  llmPrioritize: boolean;
};

export type CategoryOption = {
  id: string;
  label: string;
};

/** Every noun the board speaks. Components read these; they do not branch on card id. */
export type PersonaLabels = {
  appName: string;
  tagline: string;
  board: string;
  whatNext: string;
  taskNoun: string;
  taskNounPlural: string;
  createAction: string;
  due: string;
  impact: string;
  effort: string;
  energy: string;
  category: string;
  blockedBy: string;
  owner: string;
  streak: string;
  timebox: string;
  emptyTitle: string;
  emptyBody: string;
  allClear: string;
  done: string;
  markDone: string;
  reopen: string;
  remove: string;
  rankAction: string;
  llmAction: string;
  flip: string;
  horizon: string;
  score: string;
  blocked: string;
  clear: string;
  seed: string;
  errorTitle: string;
  errorDue: string;
  errorStorage: string;
  unassigned: string;
  teamHeading: string;
};

export type ChallengeCard = {
  id: string;
  code: string;
  title: string;
  summary: string;
  accent: string;
  persona: {
    id: string;
    name: string;
    role: string;
    voice: string;
    biasNote: string;
    labels: PersonaLabels;
    bias: {
      categoryBoosts: Record<string, number>;
      blockedBoost: number;
    };
  };
  flags: FeatureFlags;
  useCase: {
    id: string;
    name: string;
    horizonHours: number;
    categories: CategoryOption[];
    weights: RankWeights;
  };
  samples: TaskSample[];
};

export const DEFAULT_CARD_ID = "solo-aftercode";
