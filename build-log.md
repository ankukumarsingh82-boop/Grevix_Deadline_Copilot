# Build log

Rewritten during the official window. Not a copy of the prep notes.

## Window

- Kickoff: 11 Oct 2026 00:00 IST
- Hard stop: 12 Oct 2026 02:00 IST
- Official GitHub: https://github.com/ankukumarsingh82-boop/grevix-deadline-copilot-2026
- Live demo: pending

## AI did

- Scaffolded a Next.js 16 App Router app with TypeScript, Tailwind, and shadcn-style Button, Input, Label, and Badge primitives.
- Wrote a four-card catalog (Solo AfterCode, Exam cram, Team unblocker, Job hunt sprint) where labels, flags, categories, weights, bias, and samples are data.
- Implemented a heuristic ranker (urgency, impact, effort-fit, energy, unblock, persona bias) that always runs in the browser, plus `scripts/check-rank.ts` to lock the demo order.
- Built one desk UI: create form, ranked What next list, card flip with movement arrows, empty and validation states, streak, timebox, and team view. Visibility comes from flags.
- Stored the board in `localStorage` so a public deploy does not depend on a serverless disk.
- Added `POST /api/rank` with the Vercel AI SDK (`generateText` + `Output.object`). Missing key or model error returns the heuristic and says so.
- Wrote README, ARCHITECTURE, this log, and EVOLUTION from the code that landed in the window.

## I decided

- TODO for Anku: write the decisions you actually made (whether this stack, localStorage, and the four starter cards are what you want to defend). The agent chose them while implementing; do not treat this file as your voice until you replace this line.

## I rejected

- TODO for Anku: write what you personally refused. The agent refused a per-persona board, `if (cardId === …)` in JSX, a required LLM, SQLite-on-Vercel, and accounts. Confirm or replace that list in your own words.

## Challenge Cards received

| Time (IST) | Card | What I changed | What I refused to rewrite |
|---|---|---|---|
| — | None received during this build | Catalog already holds the four starter cards | The board, form, and ranker |

## Demo script actually recorded

1. TODO for Anku: confirm the recording under `docs/demo/` matches the script you want to submit.
2. Agent pass: load Solo AfterCode, sample board, add a 45-minute task, flip to Exam cram, flip to Team unblocker.
