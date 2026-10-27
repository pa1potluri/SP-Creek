# Pond duck interaction — WIP handoff, investigation only
Branch area/pond-duck-interaction from Old Hollow tip7db6f9f. User requested immediate save before usage runs out. No pond code changed and no tests run for this task yet.
Latest reference preserved unchanged as tasks/ref/pond-duck-review-latest.png.

## Confirmed source diagnosis
- The Willow Creek ducks in this screenshot are owned by world/src/areas/pavi-siri-moments.js buildMomentProps(), not the separate meadow/lake ducks.
- Existing three birds are fixed near x-70..-68.2,z88.3..89.3 with only small drift. Pond centre is(-69,94), radii8.5/6.5. Existing dock spans local x+-1.25 and local z-7.8 to about-1.14 (world86.2..92.86), so the bird positions can intersect the dock.
- Their update is called through life.updateMoments; preserve the moment scene/crumbs and existing shot IDs.
- AudioEngine has ensure(), master and ambience buses; tests must never start audio. Main pointerup handler already has placement/gameplay guards and the new Old Hollow hook, which must stay intact.

## Next implementation
1. Add a small pond-duck helper under world/src/areas/ and use it from pavi-siri-moments.js (existing owner). Replace static dock-overlapping coordinates with deterministic water-only loops behind/beside dock, mutually separated, with bobbing.
2. Add visible wings, click-to-turn/flap, world-time ripples and smooth return to swim. Keep response timestamps/viewer target for deterministic seeking. Proposed safe loop centre(-69,95.5), radii5/2, three evenly spaced birds: validate actual full body extents against pond and dock before accepting.
3. Add main.js pointer hook beside ghost selection, protected from Build/road/fence/gameplay; real-click-only gentle quack via audio.js. Never unlock sound from synthetic tests or automatic camera changes.
4. Test full idle/reaction cycles, pond boundary, duck spacing, dock clearance, pointer ownership and silent synthetic events. Full suite + Film day/night affected pond views + result before done. Broader bank/water art remains part of reference, not implemented yet.

## Exact stop
Only investigation/reference saved; no runtime module edits for this task. Existing running preview still has the previously committed Old Hollow and Balloon Hill changes. Do not claim duck correction complete.
