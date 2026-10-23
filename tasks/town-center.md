# Area 1: Town center

Read `AGENTS.md` first. Branch: **`area/town-center`** (already created; commit only there).

## The area

Main Street and the square in front of the church (roughly x −8…8, z −60…50 in `world.js`;
buildings are the `LEFT` / `RIGHT` lists), plus the path to the train station east of town.

## The mood

A **cosy, friendly little town** a child would love to walk through: warm lantern light, flowers
everywhere, cheerful colours, people saying hello. Calm and safe, never busy or loud.

## What's needed

1. **Family mode ON by default** for new visitors (a saved choice still wins). The western details
   stay available behind the switch, unchanged.
2. **Friendly shops** (in family mode, through the existing family-mode sign mapping in
   `family.js`): keep CAFÉ, TOY SHOP, BAKERY; MERCANTILE stays the **GENERAL STORE**; SHERIFF
   becomes **TOWN HALL** (friendly, a flag and a clock is nice); BANK becomes **SWEET SHOP**.
   POST OFFICE, DOCTOR, BARBER, HOTEL, LIVERY stay. The bakery gets cakes/bread in its window and the
   sweet shop jars of candy (simple code-made props behind the painted windows or on a window shelf).
3. **Cosy details on the street**: striped pastel awnings over a few shop fronts, flower boxes under
   windows, hanging flower baskets on porch posts, a string of bunting flags across the street,
   barrels turned into flower planters.
4. **Warm lanterns**: lamp posts along both boardwalks and around the square, glowing warmly at dusk
   and night (use the existing light pool carefully: most lamps can be glow sprites + emissive,
   only a few real lights; keep performance).
5. **The square**: in front of the church, a small round **fountain** with gently moving water (or a
   **bandstand gazebo** if that fits better), benches around it (`placeProp('bench', …)` so
   townsfolk sit there), a big shady tree, and a few **market stalls** (fruit, flowers, bread)
   with striped canopies.
6. **Train station path**: a short friendly path with lamp posts and a sign "TRAIN STATION →" from
   the square to the station, so it feels part of the town center (don't move the station or
   railway).
7. **Welcome sign** at the town entrance on the road: "WELCOME TO DUSTY HOLLOW" with flowers.
8. **People**: a couple more Kid characters among the walkers in family mode, and two of them can
   stand at the market stalls as stall keepers.
9. **One new camera shot** "Town Center Stroll" (append at the END of the shot list, new group
   "Town center") and one new video preset **"Cozy town center"** (append at the end of
   `VIDEO_PRESETS`): golden hour → dusk, lanterns coming on.

## Files you may change

- New: `world/src/areas/town-center.js` (all new things for this area live here, exported as one
  `buildTownCenter(world, …)` / update function).
- `world/src/family.js` (sign mapping, default ON).
- Small hooks only: `world/src/main.js` (register the area, call its update in `step`),
  `world/src/camera.js` (append the shot), `world/src/presets.js` (append the preset),
  `world/src/life.js` (only if needed for the extra kids / stall keepers), `world/index.html`
  (only if a control is truly needed).
- New painted images: none needed (ask in the result file if you want ChatGPT art).

Anything else: don't change it; write it as a request in the result file.

## Check (light: build first, Claude reviews later)

- One quick smoke check: the page loads, no console errors, the new things appear, old camera
  shot/preset numbers unchanged, no sound started. No long test suites or frame captures.
- Write `tasks/town-center.result.md` (plain words, short), save one screenshot
  `world/tests/town-center-golden.png`, and commit everything on the branch.
