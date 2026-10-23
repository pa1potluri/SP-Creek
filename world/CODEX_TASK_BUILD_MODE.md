# Task for Codex: "Build" mode for Dusty Hollow

Dusty Hollow is a painted western town in Three.js (r0.160, ES modules from a CDN importmap,
**no build step**). Run it with `python serve_world.py 8810` from `E:\claude pa1\painting_studio`
and open http://localhost:8810. All code is in `world/src/`, the panel is `world/index.html` +
`world/style.css`.

Goal: the user builds a second village (or expands the town) themselves, from the panel, with
no coding. Phase 1 below is the whole task.

## What to build

A new panel section **"Build"** (put it right after "Place objects" in `index.html`) with:

1. **Building catalogue**: buttons for *Shop front*, *Two-storey hotel*, *House*, *Barn*,
   *Chapel*, *Water tower*, *Windmill*. Click a type, then click the ground to place it.
   - Reuse the existing builders in `world.js`: `_building(s)` (driven by spec objects like the
     entries of the `LEFT` / `RIGHT` arrays: `sign`, `w`, `floors`, `wall`, `trim`, `balcony`,
     `barn`, `chimney`, `signBg`, `signInk`...), the church builder, `_waterTower`, `_windmill`.
     Refactor them only as much as needed so they can build at any position and rotation.
   - Placed buildings must use the same texture sets as the rest of the town, so they change
     with every art style (`World.setTextureSet('oil'|'clean'|'flat')`, `_frontMaterial`,
     `this.surfaces`). Check all six art styles still work.
   - Options while placing (sliders/inputs in the Build section): width, floors (1–2), wall colour
     (a few preset swatches), sign text. `R` key or mouse wheel rotates the ghost before placing.
   - Show a semi-transparent ghost of the building under the mouse before the click.
   - Select a placed building (click it) to delete it (button + `Delete` key).
2. **Flat ground under buildings**: the ground is the pure function `terrainHeight(x, z)` in
   `world.js` (it already has flattened pads, see `PADS` / `RANCH` / `CAMP`). Add user pads for
   placed buildings (flatten to the height at the building centre, soft blend around it) and
   rebuild the terrain mesh heights after placing/removing (find where the ground mesh is created
   and add an update function; keep it fast, it is fine to rebuild once per placement).
   `walkHeight`, plants (`_nature`, `_paintedFoliage`, `_blockPlants`) and props should not end up
   floating or buried; at minimum hide plant instances that fall inside a building footprint.
3. **Dirt roads**: a "Draw road" tool: click points on the ground, Enter/double-click to finish,
   Esc to cancel. Draw it with the existing ribbon/road code (`_ribbon(points, width, mat, …)`,
   the road material used by the main street). Width slider.
4. **Life**: townsfolk (`life.js`, class `Walker`, `pointsOfInterest()`) should also stroll to a
   point in front of each placed building's door, so a new village gets people. Add the points
   when a building is placed (and remove on delete).
5. **Play mode**: placed buildings need colliders like the existing ones (`world.colliders`
   rects/circles/segs, see how `_building` adds them) so the player can't walk through them.
6. **Saving**: placed buildings and roads go into the project file like placed props do
   (`world.layout()`, `projectData()` / `loadProject()` in `main.js`, and the localStorage
   layout save `saveLayout`). Loading a project must rebuild them.

## Rules

- Match the existing code style: plain ES modules, short comments only where the why isn't
  obvious, same naming. No new libraries, no build tools, no TypeScript.
- Do not touch `world/src/showroom/` or `world/showroom*` (another project).
- Do not renumber or remove existing camera shots (`camera.js`) or video presets
  (`presets.js`); saved timelines depend on their numbers.
- Do not change the existing town layout (LEFT/RIGHT buildings, river, station, ranch, camp).
- Keep performance reasonable: merge geometry where the existing code does.
- Test in the browser at http://localhost:8810: place each building type in every art style,
  draw a road, play mode (G) walking into a placed building, save + reopen a project, and check
  the console has no errors. A backup of the code before your changes is in
  `_backup_before_codex_2026-10-23/`.
- When done, write a short summary of what you changed and anything unfinished to
  `world/CODEX_RESULT_BUILD_MODE.md`.
