# Codex task queue

Work top to bottom. When a task is done (result file written, committed), mark it `done` here,
commit, then start the next one at once on a new branch from the tip of the branch you just
finished. Re-read this file each time; Claude may change it.

| # | Task file | Branch | Status |
|---|---|---|---|
| 1 | `tasks/ghost-town.md` | `area/ghost-town` (from `main`) | in progress |
| 2 | `tasks/forest.md` | `area/forest` | queued |
| 3 | `tasks/meadow-lake.md` | `area/meadow-lake` | queued |
| 4 | `tasks/crystal-mine.md` | `area/crystal-mine` | queued |
| 5 | `tasks/pond-polish.md` | `area/pond-polish` | queued |

Shot and preset slots, in this order (append at the end, never renumber): ghost town, forest,
meadow & lake, crystal mine & balloon.
