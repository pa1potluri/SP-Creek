# Terrain shaping — WIP foundation
Branch area/terrain-shaping, from verified mine increment. No gameplay terrain tool is available yet.
## Done
- Inspected terrainHeight: reachable ground is generated in world.js with railway/river masks, authored pads and ponds; distant mountain meshes are a separate background. The tool must distinguish them.
- Added isolated terrain-edit.js brush-history foundation: lower/raise/flatten with soft circular falloff, finite bounded inputs, chronological stroke order, spatial buckets, 128-stroke cap, reversible undo/reset and sanitized versioned serialization.
- 206 standalone checks pass (terrain-edit-unit.cjs/json): center/outside/falloff, order, undo/reset, save roundtrip/aliasing, invalid data and bounds. No app libraries added.
## Left / exact stop
The module is intentionally not imported into the running world yet. Next wire it into reachable terrain with protection for existing structures, rail grades, river and pads; then update meshes, walk heights, foliage/props and saved roads consistently. Add visible radius/strength/mode/undo/reset controls and project/local persistence; verify conflicts with building/road/freecam pointer input. Do not expose unfinished terrain edits to users before those supports exist.
Need runtime protected-area/road/undo/reload tests, full suite and Film day/night before done. No new full suite run for this isolated unreferenced foundation; existing game remains at the mine branch's passing 2015 + 2.
Mine67 remains WIP for landscape/reference polish and task91 gameplay boarding scope (STUCK.md), despite verified structural increment. All previous corrections retained. Never push/merge/publish.
