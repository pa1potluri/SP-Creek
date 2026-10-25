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
| 21 | `tasks/pavi-siri-3d.md` | `area/pavi-siri-3d` | done (from main 75a90ab); full 1293 + 2 passed; original-model day/night previews saved |
| 22 | `tasks/cove-polish.md` | `area/cove-polish` | done in task 32; continuous Episode 1 view 65, warm pebbles and route clearance; full 1460 + 2 passed |
| 23 | `tasks/pavi-siri-moments.md` | `area/pavi-siri-moments` | done; full 1335 + 2 passed; day/night previews 46-52 saved |
| 24 | `tasks/balloon-ride.md` | `area/balloon-ride` | done; full 1358 + 2 passed; day/night previews 53-55 saved |
| 25 | `tasks/train-trip.md` | `area/train-trip` | done; full 1389 + 2 passed; day/night 56-58 saved; audio-pan follow-up resolved in task 32 |
| 26 | `tasks/camping-night.md` | `area/camping-night` | done in task 32; normal startup/frame registration authorized and wired; four day/night previews; full 1460 + 2 passed |
| 27 | `tasks/pony-farm.md` | `area/pony-farm` | done; full 1440 + 2 passed; day/night farm 61-63 and camera correction 60 saved |
| 28 | `tasks/episode-presets.md` | `area/episode-presets` | done in task 32; Episodes 2-5 complete, Episode 4 wired; day/night previews; full 1460 + 2 passed |
| 28a | `tasks/startup-hang.md` | `area/startup-hang` | done; server launcher + terrain startup fix; full 1446 + 2 passed; queue chat continues from here |
| 29 | `tasks/cafe-bar-light.md` | `area/cafe-bar-light` | done; full 1446 + 2 passed (19 suites); four day/night previews + counter metrics saved; startup fix 2bbec71 incorporated |
| 30 | `tasks/performance.md` | `area/performance` | done; full 1446 + 2 passed; targeted 29 passed; ten day/night previews; render cost 8.249 to 7.450ms; stopped after 30 per user |
| 31 | `tasks/watercolor-resume.md` | `area/watercolor-resume` | paused until Thu Oct 29; continue tasks 32-39 first |
| 32 | `tasks/finish-wip.md` | `area/finish-wip` | done; camping + Episode 4 + continuous cove take + real train listener; full 1460 + 2 passed; six day/night previews |
| 33 | `tasks/self-review-1.task.md` | `area/self-review-1` | done; SELF-REVIEW-1 report + day/night/oil and Play captures; visibility handoff fixed; full 1464 + 2 passed |
| 34 | `tasks/rainy-day-fun.md` | `area/rainy-day-fun` | done; full 1493 + 2 passed; rainy suite 26; six day/night previews 66-68 |
| 35 | `tasks/market-day.md` | `area/market-day` | done; full 1537 + 2 passed; market suite 41; six day/night previews 69-71; inactive-balloon cleanup fixed |
| 36 | `tasks/boat-trip.md` | `area/boat-trip` | done; full 1561 + 2 passed; boat suite 21; six day/night previews 72-74 |
| 37 | `tasks/garden-time-lapse.md` | `area/garden-time-lapse` | queued |
| 38 | `tasks/episode-presets-2.md` | `area/episode-presets-2` | queued |
| 39 | `tasks/self-review-2.md` | `area/self-review-2` | queued; then stop (31 only from Thu Oct 29) |
| — | `tasks/kids-presets.md` | — | dropped: the renames are part of kid-cleanup |
| — | `tasks/cafe-bar-light.md` | — | dropped: the café counter is part of kid-cleanup |

Shot and preset slots, in this order (append at the end, never renumber): ghost town, forest,
meadow & lake, crystal mine & balloon.

> **User's decision (2026-10-24): long queue for 3–4 days.** Claude may be offline or out of credit, so keep
> building through tasks 21–31 on stacked branches even though more than 2–3 finished tasks will wait for review.
> Never merge, push or publish; Claude reviews them in batches later. Save/commit before every usage limit.
> If a task gets stuck, write it in STUCK.md and go to the next one. Then tasks 32-39 (added 2026-10-25, again a 3-day queue); task 31 only from Thu Oct 29. Stop after 39.
