# Task for Codex: a ready-made second village + "Village at dusk" video preset

Same project and rules as your earlier tasks (`CODEX_TASK_BUILD_MODE.md`): no build step, match
the code style, don't touch `world/src/showroom/`, don't change existing camera shot numbers,
existing presets or the existing town. Backup before this task: `_backup_before_codex_2026-10-23b/`.

## What to build

1. **Willow Creek, a small hamlet** built from your Build-mode buildings and roads, placed in the
   world by default (not saved in the user's layout, so the user's own builds stay separate and it
   can't be deleted by accident; but it must not block the user from building elsewhere).
   - Pick a calm open spot in the valley away from the town, river channel, railway, ranch and
     camp (check `_reserved`, `PADS`, `riverZ`, `RAIL_X`), with a nice view, reachable on foot.
   - About 6–8 buildings: a chapel, 3–4 houses in different wall colours, a barn, a shop front
     ("WILLOW CREEK STORE"), maybe a windmill or water tower. Laid out along one curved dirt road
     that joins the existing road network (or at least looks like it does from the shots).
   - Townsfolk there: 5–6 walkers who stroll between the hamlet's doors (their own points of
     interest so they stay in the hamlet), and one or two benches (`placeProp('bench', …)`).
   - A Town-life checkbox "Willow Creek hamlet" (default on) to hide/show all of it.
2. **Camera shots** for it, appended at the END of the shot list in `camera.js` (after
   "Meet the Cast") in a new group "Willow Creek": a slow approach along its road, an orbit of
   the chapel, and a high establishing pan. Use the existing `pathShot` / `orbitShot` / `panShot`.
3. **Video preset** "Village at dusk" appended to `VIDEO_PRESETS` in `presets.js`: dusk mood,
   oil style, gentle wind, place sounds on, the hamlet's shots (and one valley flight from town
   to the hamlet if it looks good), first clip `move: 'cut'`, about 4–5 minutes total. Write the
   `about` line like the other presets.
4. Place sounds (`ambience.js`) need no change unless something sounds wrong there.

## Check

Extend `world/tests/build-mode.js` (or add `world/tests/hamlet.js` with the same pattern):
hamlet present by default, toggle hides/shows it, walkers stay near it, its buildings have
colliders, the new shots exist after the old ones (old indices unchanged), and the preset loads
and plays. Run all suites, no console errors. Look at it yourself in Oil and Clean 3D at dusk and
at night.

Important: the page plays sound after a click. Your tests must not start sound (synthetic
events no longer start it; don't call `audio.ensure()` from tests).

Write `world/CODEX_RESULT_HAMLET.md` with what you did, and save
`world/tests/hamlet-preview.png` (the hamlet at dusk, oil).
