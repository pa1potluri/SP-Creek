# Task for Codex: more Build-mode pieces (cabin, brick store, blacksmith, fences, hitching posts)

Same project and rules as before (see `CODEX_TASK_BUILD_MODE.md`; Willow Creek in `src/hamlet.js`
must keep working). Backup before your hamlet task: `_backup_before_codex_2026-10-23b/`.

## New ChatGPT-painted wall textures (already in the project)

`world/assets/textures/oil/` and `/clean/`: `log_wall.png` (horizontal logs with chinking) and
`brick_wall.png` (red-brown running-bond brick). 1254² seamless tiles, RGB. Load them like the
other painted textures, with graceful fallback.

## Add to the Build catalogue

1. **Log cabin**: small one-floor cabin, `log_wall` on all walls (no wall-colour tint, or a light
   one), painted window/door, a stone chimney with smoke (reuse the chimney/smoke code).
2. **Brick store**: a shop front whose walls use `brick_wall`, with the sign text option and painted
   windows/door like the other shops (one or two floors).
3. **Blacksmith**: an open-fronted smithy: stone/brick lower walls or posts, a roof on posts over an
   open work area, a glowing forge (reuse the campfire flame/ember/smoke emitters and a light from
   the light pool), an anvil, a water barrel. Sign "BLACKSMITH" by default.
4. **Fence tool** (like *Draw road*): click points on the ground, Enter/double-click to finish, Esc to
   cancel, "Remove last fence". Post-and-rail wooden fence that follows the ground (reuse
   `_fence(points)` in `world.js` if it fits). Fences block the player in play mode.
5. **Hitching post**: a placeable rail with two posts (put it in the Build catalogue or under *Place
   objects*, whichever fits the code better), with a collider.

All of them must: follow every art style (oil / clean / flat textures, plants hide under them,
ground flattens for buildings), save/load with the project and localStorage like the other builds,
be selectable and deletable, have play-mode colliders, and give townsfolk a door destination
(buildings only). Use them in Willow Creek only if it clearly improves it (e.g. swap one house for
a log cabin and add a short fence and a hitching post by the store); keep its existing shots
looking good.

## Check

Extend the test suites with the new pieces (each in all six styles, fence draw/cancel/remove,
colliders, save/load round-trip), run every suite, no console errors, and don't start sound from
tests. Look at them in Oil, Clean 3D and at night (the forge should glow). Write
`world/CODEX_RESULT_MORE_BUILDINGS.md` with test counts, and save
`world/tests/more-buildings-preview.png` (cabin, brick store and blacksmith together, oil, golden hour).
