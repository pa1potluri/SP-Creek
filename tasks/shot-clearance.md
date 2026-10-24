# Task: no camera inside or behind things (all shots)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: `area/shot-clearance`, from the tip of the branch
you just finished. Light build, but this one is mostly a test.

## Problems seen in Claude's batch 4 review (your own screenshots)

- **Shot 19 "Board Game Table"**: the frame is only dark wood: the orbit camera passes inside a chair
  or the table. It is used in the Grand tour (0:42 café chapter), so it must look good.
- **Shot 7 "Hilltop Vista"**: a red barn wall fills the frame (camera behind or inside a building).

## What's needed

1. Fix both shots' keyframes (same indices and names).
2. Add `world/tests/shot-clearance.js`: for **every** shot (0 … last), sample the camera along the whole
   shot (e.g. 200 samples) and fail if it is inside a building collider/interior wall, inside a prop,
   within ~0.6 m of furniture, below ground + 1 m, or if the first visible hit straight ahead is
   closer than ~1 m for more than a few samples. Report the worst shots. Fix any others it finds;
   if one can't be fixed in a few tries, note it in `tasks/STUCK.md`.

## Files you may change

`world/src/camera.js` (keyframes only), `world/tests/shot-clearance.js`.

## Check

Full suite including the new test; day/night screenshots of shots 7 and 19 (`world/tests/shot-clearance-<shot>-day/night.png`).
Write `tasks/shot-clearance.result.md`, commit, mark done in `QUEUE.md`, start the next task.
