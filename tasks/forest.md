# Area 3: Forest

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: **`area/forest`**, made from the tip of
`area/ghost-town`.

## The area

The woods around the existing forest camp (`CAMP` in `world.js`, north-west) and a little
further: a gentle forest path from the camp into the trees, a small clearing with a fallen log and
mushrooms, and the edge of the forest towards the valley.

## The mood

**Soft, calm and enchanted.** Sunbeams through the leaves by day; at dusk and night, fireflies,
soft glowing mushrooms and the sound of owls. Peaceful, never dark or scary: shapes always readable.

## What's needed

1. **A denser, lovelier forest** around the camp: more trees (reuse the painted pine/cottonwood and
   low-poly sets per art style), soft undergrowth (bushes, ferns), mossy rocks.
2. **Forest path**: a soft winding dirt path from the camp into the woods, with a few small lantern
   posts and a little wooden signpost ("FOREST TRAIL").
3. **The clearing**: a fallen mossy log to sit on, rings of cute glowing mushrooms (soft cyan /
   pink / yellow glow at dusk and night), a tree stump with a tiny fairy door, a little bridge over
   a small stream if it fits.
4. **Light**: soft sunbeams / light shafts through the canopy by day (cheap: additive sprites or
   cones that fade with the angle), warm lanterns at night; keep night readable (a lifted ambient or
   a soft glow under the trees).
5. **Life**: plenty of **fireflies** in the forest at dusk/night (more than elsewhere), two or three
   **owls** sitting on branches at night that blink and turn their heads (cute, round, big eyes),
   a squirrel or rabbit hopping now and then by day, butterflies in the clearing by day.
6. **Sound** (only here, quiet): rustling leaves, a gentle stream if there is one, soft owl hoots
   from the owls' positions at night (reuse the owl sound in `ambience.js`, positioned).
7. **One camera shot** "Forest Trail" (append at the END, group "Forest") and one video preset
   **"Firefly forest"** (append at the end): dusk into a soft night with fireflies and owls.

## Never (child-safe)

No wolves, bears, spiders, bats, skulls, dark tangled spots, sudden sounds. Animals are cute and calm.

## Files you may change

New `world/src/areas/forest.js` (everything for the area); small hooks only in `main.js`,
`camera.js` (append), `presets.js` (append), `ambience.js` (area sounds); `world.js` only to
register a pad/reserved area or reuse plant builders through existing helpers. Anything else: write
it as a request in the result file.

## Check (light)

Page loads, no console errors, the area appears, old shot/preset numbers unchanged, no sound started.
Write `tasks/forest.result.md` (short), save `world/tests/forest-dusk.png`, commit on the branch,
mark it done in `QUEUE.md`, then start the next task.
