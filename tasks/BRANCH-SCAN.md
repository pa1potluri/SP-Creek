# Branch scan for Claude

- Read-only source scan; no builds, test runs, merges or pushes. Only this report is written and committed on `area/season-presets`.
- For each branch ran `git diff main...<branch> -- world/src world/index.html`. Matched added lines only, case-insensitive literal substring search for: saloon, sheriff, jail, gunsmith, undertaker, bartender, gambler, wanted, gun, holster, whiskey, beer, poker, Dusty Hollow. Locations refer to that branch tip.
- Shared changed files are the intersection of all repository files changed on each side since `git merge-base main <branch>` (base `2194941d` for all five). These are potential merge conflicts, not proven conflicts; stacked inherited changes are included.
- Main rename checklist supplied by the user: saloon -> cafe; interiors.saloon -> interiors.cafe; SaloonInterior -> CafeInterior; __app.saloon -> __app.cafe; bartender -> cafeHost; gambler -> neighbour. Preserve main signs TOWN HALL / BAKERY / TOY SHOP / HONEY BUN CAFÉ and project name SP Creek during review. Three-dot branch diffs do not include main-only edits.

- **area/atmo-light (`69eb1bd`)**
  - Added matching lines: none.
  - Files also changed on main: `world/src/camera.js`.
- **area/atmo-mist-life (`5321851`)**
  - Added matching lines: none.
  - Files also changed on main: `world/src/camera.js`.
- **area/village-details (`cb5d932`)**
  - Added matching lines: none.
  - Files also changed on main: `world/src/areas/town-center.js`, `world/src/camera.js`.
- **area/seasons (`0057b07`)**
  - Added match `world/src/main.js:858`: `window.__app = { seasons, setSeason, world, camera, life, saloon, townCenter, ghostTown, forest, meadowLake, crystalMine, setFamilyMode, projectData, loadProject, applyStyle, timeline, director, renderClips, game, audio, listener, atmos, step: (dt) => step(dt) };`
  - Files also changed on main: `world/index.html`, `world/src/areas/town-center.js`, `world/src/camera.js`, `world/src/main.js`.
- **area/season-presets (`ec294ab`)**
  - Added match `world/src/camera.js:148`: `return [...town, ...places, ...saloon, ...cast, ...hamlet, ...townCenter, ...ghostTown, ...forest, ...meadow, ...crystalHill, ...grandTour, ...seasonalViews];`
  - Added match `world/src/main.js:858`: `window.__app = { seasons, setSeason, world, camera, life, saloon, townCenter, ghostTown, forest, meadowLake, crystalMine, setFamilyMode, projectData, loadProject, applyStyle, timeline, director, renderClips, game, audio, listener, atmos, step: (dt) => step(dt) };`
  - Files also changed on main: `world/index.html`, `world/src/areas/town-center.js`, `world/src/camera.js`, `world/src/main.js`, `world/src/presets.js`.

- Total: 3 matching added lines across the five diffs (2 unique line texts); every match contains the legacy identifier `saloon`. These are existing identifiers on modified lines, not newly added child-facing themes. No added lines matched any other requested term. The seasons main.js match is inherited by season-presets.
- First review: reconcile main.js app export with `cafe`, preserve main camera naming when combining the appended seasonal views, and preserve main naming/preset edits in the overlapping files. No source fixes attempted. Task 13 remains WIP as recorded in its result and QUEUE; tasks 14-15 remain queued.
