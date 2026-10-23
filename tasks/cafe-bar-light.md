# Task: light up the café bar

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: `area/cafe-bar-light`, from the tip of the
branch you just finished. Light checks.

## Problem

The camera shot "At the Counter" (shot 18) is ~80% near-black: the two room lamps hang over the middle
of the café, far from the bar and back bar. (Claude already made the two lamps brighter on its
`lead/tuning` work; don't change those two.)

## What's needed

Make the bar and back-bar warm and readable **without adding a new point light** (every point light
costs every shader in the world): e.g. warm emissive light strips under the back-bar shelves and
behind the jars/bottles, a glowing lamp shade over the counter that lights it through an emissive
pool/decal, lighter varnish on the counter top, a soft additive glow sprite above the bar. Keep it
cosy, not glaring. Check the shot in Family mode (café) and with Family mode off.

## Files you may change

`world/src/interior.js` only.

## Check (light)

Page loads, no console errors, "At the Counter" clearly readable at golden hour and night, one
screenshot `world/tests/cafe-bar-light.png`. Write `tasks/cafe-bar-light.result.md`, commit, mark
done in `QUEUE.md`, start the next task.
