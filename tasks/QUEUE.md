# Codex task queue

Work top to bottom. When a task is done (result file written, committed), mark it `done` here,
commit, then start the next one at once on a new branch from the tip of the branch you just
finished. Re-read this file each time; Claude may change it.

| # | Task file | Branch | Status |
|---|---|---|---|
| 1 | `tasks/ghost-town.md` | `area/ghost-town` (from `main`) | done |
| 2 | `tasks/forest.md` | `area/forest` | done |
| 3 | `tasks/meadow-lake.md` | `area/meadow-lake` | done |
| 4 | `tasks/crystal-mine.md` | `area/crystal-mine` | done |
| 5 | `tasks/pond-polish.md` | `area/pond-polish` | done |
| 6 | `tasks/shots-polish.md` | `area/shots-polish` | done |
| 7 | `tasks/kid-cleanup.md` | `area/kid-cleanup` | done |
| 7a | `tasks/names-tour-shots.md` | `area/names-tour-shots` | done |
| 7b | `tasks/visual-fixes.md` | `area/visual-fixes` | done |
| 7c | `tasks/crystal-polish.md` | `area/crystal-polish` | done |
| 7d | `tasks/shot-clearance.md` | `area/shot-clearance` | done (from crystal-polish) |
| 8 | `tasks/watercolor.md` | `area/watercolor` | WIP saved as b0f369b; paused until Thu Oct 29 (do 9–12 first) |
| 9 | `tasks/atmo-light.md` | `area/atmo-light` | done |
| 10 | `tasks/atmo-mist-life.md` | `area/atmo-mist-life` | done |
| 11 | `tasks/village-details.md` | `area/village-details` | done |
| 12 | `tasks/seasons.md` | `area/seasons` | done |
| 13 | `tasks/season-presets.md` | `area/season-presets` | done |
| 14 | `tasks/build-pieces.md` | `area/build-pieces` | done |
| 15 | `tasks/gentle-weather.md` | `area/gentle-weather` | done |
| 16 | `tasks/sky-edge.md` | `area/sky-edge` | done (from main) |
| 17 | `tasks/soft-wind.md` | `area/soft-wind` | done (from main) |
| 17a | `tasks/pavi-siri.md` | `area/pavi-siri` | done |
| 17b | `tasks/sunset-cove.md` | `area/sunset-cove` | done; preview fixes + Episode 1; full 1172 + 2 passed, day/night previews saved |
| 18 | `tasks/lets-build-replay.md` | `area/lets-build-replay` | done; full 1202 + 2 passed; final replay checks 32; day/night previews saved |
| 19 | `tasks/playground.md` | `area/playground` | done; full 1240 + 2 passed; day/night and oil previews saved |
| 20 | `tasks/lantern-evening.md` | `area/lantern-evening` | done; full 1266 + 2 passed; day/night, dusk and oil previews saved; stopped after 20 |
| 21 | `tasks/pavi-siri-3d.md` | `area/pavi-siri-3d` | queued: branch from **main** (batch 6 merged) |
| 22 | `tasks/cove-polish.md` | `area/cove-polish` | queued |
| 23 | `tasks/pavi-siri-moments.md` | `area/pavi-siri-moments` | queued |
| 24 | `tasks/balloon-ride.md` | `area/balloon-ride` | queued |
| 25 | `tasks/train-trip.md` | `area/train-trip` | queued |
| 26 | `tasks/camping-night.md` | `area/camping-night` | queued |
| 27 | `tasks/pony-farm.md` | `area/pony-farm` | queued |
| 28 | `tasks/episode-presets.md` | `area/episode-presets` | queued |
| 29 | `tasks/cafe-bar-light.md` | `area/cafe-bar-light` | queued |
| 30 | `tasks/performance.md` | `area/performance` | queued |
| 31 | `tasks/watercolor-resume.md` | `area/watercolor-resume` | queued (not before Thu Oct 29) |
| — | `tasks/kids-presets.md` | — | dropped: the renames are part of kid-cleanup |
| — | `tasks/cafe-bar-light.md` | — | dropped: the café counter is part of kid-cleanup |

Shot and preset slots, in this order (append at the end, never renumber): ghost town, forest,
meadow & lake, crystal mine & balloon.

> **User's decision (2026-10-24): long queue for 3–4 days.** Claude may be offline or out of credit, so keep
> building through tasks 21–31 on stacked branches even though more than 2–3 finished tasks will wait for review.
> Never merge, push or publish; Claude reviews them in batches later. Save/commit before every usage limit.
> If a task gets stuck, write it in STUCK.md and go to the next one. Stop after task 31.
