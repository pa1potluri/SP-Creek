# Terrain shaping — user request
Status: queued, not implemented.
Allow lowering overly high mountains, raising/flattening local ground and laying roads on reshaped terrain. Provide a visible brush radius/strength, undo/reset, saved project persistence, and update terrain meshes, walk heights, foliage/building support and collisions together. Preserve existing world defaults and saved camera/preset IDs. No destructive edit without an undo path.
Scope proposal: world/src/world.js terrain helpers and updates, a separate terrain-edit module, main.js wiring, explore-ui.js Build tools, index.html/style.css controls, focused browser checks and result/captures. Full suite and day/night before done.
First investigate which mountain shapes are actual terrain versus background meshes: only reachable terrain should be editable; label background controls separately. Start with small local lowering/flattening, not a global landscape rebuild.
