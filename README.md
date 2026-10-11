# Pivot-proof Deadline Copilot

A personal deadline desk for the Grevix AfterCode hackathon. You add work (title, due time, impact, effort, energy, category, blocked-by), get a ranked **What next** list, and flip a Challenge Card when the brief changes.

Flipping a card swaps persona labels, toggles features, and changes categories plus ranking weights. The board component does not change. Cards are catalog data.

## Live demo

http://edvera.me/Grevix_Deadline_Copilot/

A static export served by GitHub Pages, rebuilt on every push to `main` (`.github/workflows/pages.yml`). No login, no database: tasks stay in your browser. The static build has no `/api/rank` route, so the optional LLM re-rank falls back to the heuristic ranker there; run locally or on a server host with a key to use the model overlay.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The board starts on the Solo AfterCode card.

```bash
npm run lint
npm run build
npm start
```

Optional model ranking: copy `.env.example` to `.env.local` and set `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY`. With no key, **Ask the model** explains the miss and keeps the heuristic order.

## Persistence

Tasks and the active card live in `localStorage` (`pivot.deadline-copilot.v1`). A SQLite file would disappear on Vercel’s serverless filesystem, and this desk is personal, so the browser is the database. Ranking math also runs in the browser, so the demo works with no account and no hosted database. Clearing site data clears the board.

## Judge demo script

1. Open the app. The ticket is **Solo AfterCode**. The header reads AfterCode Desk, the form says “Add task”, and categories are Demo, Core, Polish, Docs, Stretch. Energy, blockers, and timeboxing are on. Streak and team view are off.
2. Choose **Load sample board**. Then add a task titled something like “Pitch the demo”, click **45 min**, leave impact at 5, and submit. It should sit at the top of **What next**.
3. Read the score breakdown on the dark panel and the weight bars on the ticket (urgency leads; unblock is small).
4. Flip to **Exam cram**. No code edit. The header becomes Cram Desk, the form says “Add topic”, categories become Weak topic / Formula / Past paper / Review / Rest, the blocker field disappears, and the study streak appears. **Quiet copy pass** (low drain) climbs and the arrows on the list show the move. Weights now favor energy.
5. Flip to **Team unblocker**. The blocked item **Ship the ranker** jumps to **Unblock next**, the waiting-on line is visible, and **Team view** groups You, Sam, and Mina. Energy is off.
6. Optional: **Ask the model**. With a key, the note switches to the model’s sentence. Without a key, the note says the heuristic is still in charge.
7. Submit the form with an empty title to see the error. **Clear board** shows the empty state.

Screenshots and a screen recording of steps 2–5 are in [docs/demo/](docs/demo/).

## Card catalog

| Card | Persona | Use case | Flags on |
|---|---|---|---|
| Solo AfterCode | Solo hacker | 24h build | Energy, blockers, timeboxing, model rank |
| Exam cram | Student | 12h exam | Energy, streak, timeboxing, model rank |
| Team unblocker | Team lead | Standup | Blockers, timeboxing, team view, model rank |
| Job hunt sprint | Job seeker | 72h pipeline | Streak, model rank |

Add another card in `src/lib/challenge/cards.ts`. See [ARCHITECTURE.md](ARCHITECTURE.md).

## Ranker check

```bash
npx tsx scripts/check-rank.ts
```

That script locks the demo order: a near-deadline demo task leads on Solo AfterCode, the low-energy task leads on Exam cram, and the blocked task leads on Team unblocker.
