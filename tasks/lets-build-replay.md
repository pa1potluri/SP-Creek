# Task: "Let's build" replay (branch `area/lets-build-replay`)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch from the tip of the branch you just finished (the first one from **main**). Build fast, child-friendly, light checks (full suite + day/night screenshots before done). Append new presets/shots at the end; never renumber. Never push.

For "let's build" videos: Build mode keeps the placed pieces in the order they were placed (if it does not yet, record that order and save it with the build). Add **Replay build**:
the town is cleared of built pieces, then they appear again one by one in the same order, each with a soft "pop and settle"
(scale up with a little bounce, a puff of dust or sparkles), while the camera slowly orbits the build area. Speed control
(e.g. 1 to 5 pieces per second). Usable as a video preset clip so it can be rendered. Deterministic from world time.
Remove all / Undo keep working.

Files: `world.js` (Build mode section), `main.js` / `index.html` (Replay button and speed only), `timeline.js` / `presets.js` (append a replay clip type),
`world/tests/` (extend build-mode). Write `tasks/lets-build-replay.result.md`.
