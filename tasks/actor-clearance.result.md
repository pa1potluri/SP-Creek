# Actor clearance result
Status: WIP on area/actor-clearance, stacked from 459a136. No claim of global collision completion.

## Done
- Grazing horses now check movement against solids and visible actors and yield when blocked.
- Swept substeps catch narrow obstacles between endpoints; road riders/coach check intermediate curve samples and overlapping footprint samples.
- Ambient queries now include visible market shoppers, outing/snow friends, playground/farm people, coach and grazing horses; world positions and inherited visibility are checked.

## Checks / exact stop
- Six focused checks passed: thin obstacle, clear path, actual grazing-horse yield, visible/hidden actor blocking, locked sound; no page errors.
- Film market day/night: world/tests/actor-clearance-day.png / -night.png. Focused JSON and driver saved alongside them.
- Full 31-suite regression running; record final counts before any completion claim.

## Left
- Scripted actors still assign absolute scene positions (market, garden, moments, beach, farm) and can move into ambient actors after their checks. Need a scene-aware deterministic movement/clearance solution, respecting seeking, camera focus and seated/transport ownership; do not patch by arbitrary teleporting.
- Player/ride collision against moving actors, small animals, boat/duck full audit and staged character spacing require further checks. Existing boat/duck exclusion from task 60 is retained, not universal physics.
- Latest screenshot feedback/new requests tracked 72–77. Do not mark task 64 done on these six tests alone.
