# Task: visual fixes from the user's review

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: `area/visual-fixes`, from the tip of the branch
you just finished. Light checks.

1. **Fog edge**: in foggy scenes (Golden Orbit, River Drift, Station Platform) the horizon shows
   **white jagged cut-out shapes** (the far mountain / backdrop layers meeting the fog). Make the far
   distance a **smooth soft gradient** into the fog/sky: fade the mountain silhouettes and painted
   backdrop with distance-based fog (or a soft vertical gradient at their base), no hard white edges.
2. **Hilltop Vista**: the fog is nearly solid white. Lower the fog density for that view (by distance
   from the town / camera height, or the mood's fog range) so the town is clearly visible.
3. **Water** (river, Willow Creek pond, meadow lake): it reads flat silver-white. Give it a
   **blue-teal body tint**, a clearer sky reflection (not full white), gentle visible ripples and soft
   foam at the edges. Keep it following the mood (golden, night).
4. **Animals**: horses (riders, coach, grazers, the ranch) and other animals look **flat black**.
   Give them coats: bay brown, chestnut, white/grey, and spotted (pinto/appaloosa) variants, with
   simple shading, a lighter muzzle, and a darker **mane and tail** (separate shapes, swaying a little).
   Chickens white/brown, rabbits/ducks/owls warm and soft.
5. **Meadow**: replace the **tiled tan clearing texture** with grass and flowers (the Dreamland meadow
   ground `world/assets/textures/dream/meadow.png` plus scattered flower cut-outs); give the plain
   grey **stone arch / ledge rocks** a real rock texture (reuse `stone`) with moss on top.

## Files you may change

`world/src/atmosphere.js`, `world/src/sky.js`, `world/src/environment.js` (fog/water), the water parts
of `world/src/world.js`, `world/src/life.js` (animal looks only), `world/src/areas/meadow-lake.js`,
`world/src/areas/forest.js` (animals only), `world/src/textures.js` (new textures only).

## Check (light)

Page loads, no console errors, one oil + one Animated-film screenshot of Golden Orbit, Hilltop Vista
and a horse close-up: `world/tests/visual-fixes-*.png`. Write `tasks/visual-fixes.result.md`, commit,
mark done in `QUEUE.md`, start the next task.
