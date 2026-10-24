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
| 17b | `tasks/sunset-cove.md` | `area/sunset-cove` | done |
| 18 | `tasks/lets-build-replay.md` | `area/lets-build-replay` | queued |
| 19 | `tasks/playground.md` | `area/playground` | queued |
| 20 | `tasks/lantern-evening.md` | `area/lantern-evening` | queued |
| — | `tasks/kids-presets.md` | — | dropped: the renames are part of kid-cleanup |
| — | `tasks/cafe-bar-light.md` | — | dropped: the café counter is part of kid-cleanup |

Shot and preset slots, in this order (append at the end, never renumber): ghost town, forest,
meadow & lake, crystal mine & balloon.
