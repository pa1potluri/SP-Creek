# Task: softer, calmer wind sound (branch `area/soft-wind`)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch from the tip of the branch you just finished (the first one from **main**). Build fast, child-friendly, light checks (full suite + day/night screenshots before done). Append new presets/shots at the end; never renumber. Never push.

The user finds the wind ambience noisy and disturbing. Make it a soft, gentle breeze:
- Less hiss: lower the high frequencies of the wind noise (narrower, lower band-pass; gentle low-pass), slower and smaller gusts.
- Lower default wind level (e.g. 0.35 → 0.15) and lower the wind in every video preset that sets it; the windy-day weather may be a little stronger but never harsh.
- Same in live play and in rendered videos (`audio.js` render path). Tests must never start sound.

Files: `audio.js`, `ambience.js` (wind only), `presets.js` (wind values only), `index.html` (default slider value). Write `tasks/soft-wind.result.md`.
