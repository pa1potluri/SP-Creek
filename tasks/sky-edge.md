# Task: hide the grey sky edge (branch `area/sky-edge`)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch from **main** (Claude merged batch 5 into main). Light build. Never push.

## Problem seen in Claude's batch 5 review
When the camera looks up, a **grey curved band** (the edge of a sky/cloud layer or dome) shows across the top of
the frame: `world/tests/gentle-weather-rainbow-day.png` (top of the frame) and `world/tests/atmo-light-moon-night.png`
(a hard line across the night sky above the moon). It must never be visible, in any mood, season or art style.

## What's needed
1. Find which mesh makes the band (sky dome, cloud layer, fog plane or the moon halo) and fix it so the sky is one
   smooth gradient (for example a bigger radius or a full sphere, fading its edge, or drawing it behind everything).
2. Add a check to an existing test: for a few upward-looking camera views (moon, rainbow, balloon) the top rows of
   the frame have no sharp brightness step.

## Files you may change
`world/src/sky.js`, `world/src/atmosphere.js`, `world/src/environment.js`, one existing test in `world/tests/`.

## Check
Full suite; day/night screenshots of the rainbow view and the moon view (`world/tests/sky-edge-<view>-day/night.png`).
Write `tasks/sky-edge.result.md`, commit, mark done in `QUEUE.md`, then stop and wait (queue empty).
