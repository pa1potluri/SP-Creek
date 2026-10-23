# Area 4: Flower meadow and waterfall lake

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: **`area/meadow-lake`**, made from the tip of
`area/forest`.

## The area

A wide open valley slope and a small lake fed by a **waterfall** coming down a gentle rocky hill.
Pick a spot with a view, away from the town, villages, rails and river channel (e.g. south of the
river or on the western hills; check `_reserved`, `PADS`, `riverZ`, `RAIL_X`).

## The mood

**Bright, calm and beautiful**: a dreamy flower meadow a child would love to run through, a sparkly
lake, a soft rainbow in the waterfall's spray on sunny moods.

## What's needed

1. **Flower meadow in colour zones**: big soft areas each of one colour, using the ChatGPT
   Dreamland art in `world/assets/foliage/dream/` (`flowers_blue`, `flowers_purple`, `flowers_pink`,
   `flowers_yellow`, `bush`, `grass`, `tree_blossom`, `tree_wisteria`) and the plush ground
   `world/assets/textures/dream/meadow.png` blended in under the meadow. Dense, swaying in the wind,
   instanced. A few blossom and wisteria trees around the edges.
2. **The lake**: reuse the new water material (reflections, ripples, soft foam) from the river/pond;
   lily pads, a little wooden jetty, stepping stones along one edge. Deep water blocked in play mode
   like the pond (wading only at the edge).
3. **The waterfall**: a gentle multi-step waterfall down a rocky ledge into the lake (animated
   scrolling water texture + white spray/mist particles + soft foam ring at the bottom), with a
   **rainbow** in the spray in sunny moods (golden/morning). Cute rounded rocks, moss.
4. **Life**: butterflies and a few birds over the meadow, ducks on the lake, dragonflies by the
   water, sparkles floating over the flowers.
5. **Sound** (only here): the waterfall's soft rush (positioned), gentle birdsong, ducks quacking
   now and then (quiet).
6. **One camera shot** "Meadow and Waterfall" (append at the END, group "Meadow") and one video
   preset **"Dreamy meadow"** (append at the end): morning → golden hour.

## Files you may change

New `world/src/areas/meadow-lake.js`; small hooks in `main.js`, `camera.js` (append), `presets.js`
(append), `ambience.js` (area sounds); `world.js` only for pads/reserved areas and reusing the water
material and plant builders through helpers. Anything else: a request in the result file.

## Check (light)

Page loads, no console errors, the area appears, deep water blocked, old shot/preset numbers
unchanged, no sound started. Write `tasks/meadow-lake.result.md`, save
`world/tests/meadow-lake-golden.png`, commit, mark done in `QUEUE.md`, start the next task.
