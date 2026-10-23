# Task: fix the Forest Trail and Meadow camera shots

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: `area/shots-polish`, from the tip of the
branch you just finished. Light checks. (From Claude's review of batch 2.)

## Problems seen

- **Forest Trail (shot 26)**: it starts right behind the FOREST TRAIL sign and a lantern (they fill
  the frame), a tree trunk blocks the middle, and around 35–50 s it stares up a steep grassy mound
  where the path climbs straight up (y 24 → 39 m). It should glide gently along the trail at eye
  height, looking ahead into the trees and the clearing (mushrooms, fairy-door stump, log), never
  inside or right behind props, never looking up a slope.
- **Meadow and Waterfall (shot 27)**: the camera is **inside a hydrangea bush** (giant blooms fill the
  frame) and the waterfall and lake are not in view. It should show the colour zones, the lake and
  the waterfall with its rainbow, from a clear spot above the flowers.

## What's needed

1. Re-path both shots (keep their indices, names and groups; only change their keyframes). Keep the
   camera at least ~1.5 m from trees, bushes, props and signs and ~1.2 m above the ground/plants
   along the whole path (sample it), like the Willow Creek shot fix did.
2. If the forest trail itself climbs too steeply, soften it (flatten the trail's pad/slope), but
   don't move the forest.
3. Optionally reuse the Willow Creek shot-clearance test approach for these two shots.

## Files you may change

`world/src/camera.js` (only these two shots' keyframes), `world/src/areas/forest.js`,
`world/src/areas/meadow-lake.js`, and a test file under `world/tests/`.

## Check (light)

Page loads, no console errors; one oil screenshot each at golden hour at the shot's middle:
`world/tests/forest-shot-fixed.png`, `world/tests/meadow-shot-fixed.png`. Write
`tasks/shots-polish.result.md`, commit, mark done in `QUEUE.md`, start the next task.
