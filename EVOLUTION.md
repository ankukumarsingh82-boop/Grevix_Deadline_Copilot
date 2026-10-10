The repo opened as a one-line README inside the AfterCode window. The first real commit is the desk itself: a challenge-card catalog, a heuristic ranker, and one board.

Persistence moved off the prep note’s SQLite file. Vercel cannot keep that file, so the board lives in localStorage and still ranks with no server.

The ranker was tuned against a fixed board so a flip is visible: a near-deadline demo task leads Solo AfterCode, a low-energy task leads Exam cram, and a blocked task leads Team unblocker. Weights and flags changed; the components did not.

An optional model overlay landed behind an env key and falls back in the same response when the key is missing. No challenge card arrived mid-build, so the catalog still holds the four starter cards.
