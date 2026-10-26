# Actor clearance result
Status: WIP on area/actor-clearance, stacked from 459a136. No claim of global collision completion.

## Done
- Grazing horses now check movement against solids and visible actors and yield when blocked.
- Swept substeps catch narrow obstacles between endpoints; road riders/coach check intermediate curve samples and overlapping footprint samples.
- Ambient queries now include visible market shoppers, outing/snow friends, playground/farm people, coach and grazing horses; world positions and inherited visibility are checked.

## Checks / exact stop
- Six focused checks passed: thin obstacle, clear path, actual grazing-horse yield, visible/hidden actor blocking, locked sound; no page errors.
- Film market day/night: world/tests/actor-clearance-day.png / -night.png. Focused JSON and driver saved alongside them.
- Full 31 suites passed: 2015 + 2 startup checks, no browser errors; actor-clearance-full.txt. Still WIP for the reasons below.

## Left
- Scripted actors still assign absolute scene positions (market, garden, moments, beach, farm) and can move into ambient actors after their checks. Need a scene-aware deterministic movement/clearance solution, respecting seeking, camera focus and seated/transport ownership; do not patch by arbitrary teleporting.
- Player/ride collision against moving actors, small animals, boat/duck full audit and staged character spacing require further checks. Existing boat/duck exclusion from task 60 is retained, not universal physics.
- Latest screenshot feedback/new requests tracked 72–77. Do not mark task 64 done on these six tests alone.


## Resume checkpoint after menu
Runtime reproduction: market shopper pair 0/5 reached 0.079929m separation over 0–238s (2s samples), both assigned the first stall. Changed sixth shopper to the opposite side and sample walkHeight at the actual moving position. The same running-app diagnostic now reports minimum shopper-pair separation 4.981526m. Inactive market shoppers are hidden explicitly and restored when active.
This is WIP: the diagnostic is not yet an asserting regression, no full suite for this latest life.js change, and broad scripted/player/animal collision work remains open. Driver world/tests/market-spacing.cjs. User supplied UI artwork during this work; save collision change before integrating artwork separately.

Low-usage handoff: latest full regressions on descendant branches (including kids-ui-icons-full.txt) cover these saved life.js changes and passed 2015 + 2. Dedicated market-spacing test still needs assertions; broad clearance remains WIP. User requests only small corrections now with 10% remaining. See tasks/SESSION-HANDOFF.md for the exact stop.
