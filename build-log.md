# Build log

Rewritten during the official window. Not a copy of the prep notes.

## Window

- Kickoff: 11 Oct 2026 00:00 IST
- Hard stop: 12 Oct 2026 02:00 IST
- Official GitHub: https://github.com/ankukumarsingh82-boop/Grevix_Deadline_Copilot
- Live demo: http://edvera.me/Grevix_Deadline_Copilot/ (GitHub Pages, gh-pages branch)

## AI did

- Scaffolded a Next.js 16 App Router app with TypeScript, Tailwind, and shadcn-style Button, Input, Label, and Badge primitives.
- Wrote a four-card catalog (Solo AfterCode, Exam cram, Team unblocker, Job hunt sprint) where labels, flags, categories, weights, bias, and samples are data.
- Implemented a heuristic ranker (urgency, impact, effort-fit, energy, unblock, persona bias) that always runs in the browser, plus `scripts/check-rank.ts` to lock the demo order.
- Built one desk UI: create form, ranked What next list, card flip with movement arrows, empty and validation states, streak, timebox, and team view. Visibility comes from flags.
- Stored the board in `localStorage` so a public deploy does not depend on a serverless disk.
- Added `POST /api/rank` with the Vercel AI SDK (`generateText` + `Output.object`). Missing key or model error returns the heuristic and says so.
- Wrote README, ARCHITECTURE, this log, and EVOLUTION from the code that landed in the window.

## I decided

- I decided on Next.js, keeping tasks in browser localStorage so it deploys with no database, and four starter Challenge Cards stored as data plus feature flags, so a card flip changes behaviour without a rewrite.

## I rejected

- I rejected a separate board per persona, card-specific `if` checks in the UI, making an AI key mandatory, SQLite on Vercel, and user accounts, because each one would slow down pivoting when a Challenge Card arrives.

## Challenge Cards received

| Time (IST) | Card | What I changed | What I refused to rewrite |
|---|---|---|---|
| — | None received during this build | Catalog already holds the four starter cards | The board, form, and ranker |

## Demo script actually recorded

1. Solo AfterCode, empty board. Load sample board. Add “Pitch the demo” due in about 45 minutes. What next becomes Pitch the demo, with a 45 min timebox.
2. Flip to Exam cram. Header becomes Cram Desk, the form says Add topic, the blocker field hides, the streak shows, What next becomes Quiet copy pass, and rows show Up/Down chips.
3. Flip to Team unblocker. Header becomes Standup Desk, What next becomes Ship the ranker, the waiting badge shows, and Team view groups owners.
4. The demo video `docs/demo/card-flip.mp4` shows the same board re-ranking as the card flips from Solo AfterCode to Exam cram to Team unblocker.
