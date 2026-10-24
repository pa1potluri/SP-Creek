# Task: Smooth frame rate (branch `area/performance`)

Read `AGENTS.md`, `tasks/QUEUE.md` and `tasks/BLUEPRINT.md` first. Branch from the tip of the branch you just finished. Child-safe, calm, light checks while building; full suite + day/night screenshots + result file before done. Append shots/presets, never renumber. Never push, merge or publish.

Measure the frame rate with all areas loaded at 1080p (Animated film style) over the Grand tour and the Episode presets, and make
it smooth: instancing and simple distance LOD for trees/plants/props, skip far areas' animation updates, merge static meshes. Do not change
how anything looks up close. Report before/after numbers in the result file.
Files: `world.js`, `areas/*.js`, `life.js`, `main.js` (frame loop only).
