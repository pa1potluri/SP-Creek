# Stuck / later

Things that didn't get solved in a few tries. Fix them later, in a batch.

- **Café bar close-up is dark** (shot "At the Bar", ~80% near-black pixels even after the two
  interior lamps were made brighter, 2026-10-23). The lamps hang over the middle of the room, far
  from the bar. Options: a lamp right above the bar (costs one more point light for every shader in
  the world), emissive warm light strips under the back-bar shelf, or a lighter back-bar texture.
  Claude, lead/tuning.

## Task 22 - Episode 1 hard cuts need preset-file scope

- Built the side-lane townsfolk clearance and smaller warm pebbles in area/cove-polish.
- Checked the complete 180-second Episode 1 timeline at 10 Hz (1,800 simulated samples, no encoding/audio). Four explicit cuts jump the camera by 100.936m, 49.027m, 45.350m and 92.835m at the clip boundaries. See world/tests/cove-polish-playback.json.
- The flags are in world/src/presets.js (VIDEO_PRESETS.episode1Welcome). Task 22 only allows sunset-cove.js, cove shots in camera.js and cove townsfolk in life.js. AGENTS.md says: "If something outside them must change, stop and write it in the result file as a request instead of changing it."
- Request: allow presets.js for Episode 1 transition flags, then check any resulting fly/staging transitions for actor pops. Avoid disguising a preset edit through camera/area side effects. Remaining continuity work is not marked done. Continue task 23 on the saved tip.

## Task 25 - branch train spatial audio follow-up

- Main-station departure reuses the existing gentle whistle and soft steam. Visual trains and passengers follow the new branch.
- main.js listener() still sends `{x: RAIL_X, z: t.s}` to ambience. Branch sounds therefore retain the original line's horizontal audio position; the new trip keeps the sound level calm but cannot correct its pan from the allowed train files.
- Request main.js listener scope to use the locomotive's actual world x/z for the train snapshot. Not changed in this task, which only permits life.js (train), world.js (track extension), camera.js, presets.js and BLUEPRINT.md.

## Task 26 - camping startup registration scope (user deferred)

- Camping module, views 59-60, 20-minute preset, ambience and four day/night previews are built. Manual factory smoke: 14 passed, no browser errors, audio locked.
- main.js is not allowed by tasks/camping-night.md. Required integration is import buildCamping, construct the area alongside the others, and call its update in step(dt). No hidden registration or production debug-global dependency was added.
- Asked for those three wiring changes; user explicitly chose "Leave camping WIP and continue" on 2026-10-24. Keep WIP, do not add the main.js wiring without later authorization.
- Before done: wire at startup, full suite once with camping-night, verify the four previews and update result/queue. Shots 59-60 remain reserved; later tasks append from 61.
