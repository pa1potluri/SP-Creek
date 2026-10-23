# Area 2: Ghost town district

Read `AGENTS.md` first. Branch: **`area/ghost-town`** (already created from `main`; commit only there).

## The area

A small old district of its own, **east of the railway** (somewhere around x 100–140, z −50…20;
pick a calm, fairly flat spot with a nice view, away from the river, rails, station, town, Willow
Creek, ranch and camp; check `_reserved`, `PADS`, `riverZ`, `RAIL_X`). Joined to the station by a
short dirt path with a little wooden sign "OLD HOLLOW →".

## The mood

**Mysterious but safe and friendly**, like a cosy picture book about a sleepy old town where
gentle ghosts live. Curious, a bit magical, never frightening. A child should want to visit and
wave at the ghosts.

## What's needed

1. **A few old buildings** (5–7): an old general store, a little schoolhouse, a hotel, a bell
   tower, a cottage. Faded pastel colours, slightly crooked roofs, a few loose boards, cobwebs only
   as soft silver threads in corners. Reuse the Build-mode builders and painted window/door art;
   windows glow softly (pale blue-green and warm yellow), never pitch black.
2. **Creaky signs**: hanging signs that sway and creak gently in the wind (reuse the blade-sign
   swing from `life.js`), with friendly names ("OLD HOLLOW HOTEL", "SCHOOL", "LEMONADE").
3. **Soft fog**: low, light, milky fog drifting between the buildings (local to this district,
   lighter than the valley fog; sprites or a soft fog volume), thicker at dusk/night, but shapes
   always readable.
4. **Friendly ghosts** (4–6): small, round, sheet-like cartoon ghosts in soft white with a gentle
   glow, **big friendly eyes and a smile**, floating up and down slowly. They wave, peek out of a
   window or from behind a corner and giggle, play peek-a-boo with each other, and one rides a
   swing. They never chase, rush at the camera, shout or startle. They wave at the player when the
   player comes close (play mode) and float back. They look a little see-through.
5. **Small magical touches**: floating soft lights (like gentle will-o'-wisps but cute), a few
   pumpkin lanterns with smiling faces, a well with a little glowing light, wind chimes.
6. **Sound** (only here, quiet): gentle creaks, soft wind chimes, a tiny "ooo" hum and giggles from
   the ghosts now and then (synthesized like the other place sounds in `ambience.js`; follow the
   listener position like the river does). Nothing loud or sudden.
7. **One camera shot** "Old Hollow Stroll" (append at the END of the shot list, new group
   "Ghost town") and one video preset **"Friendly ghost town"** (append at the end of
   `VIDEO_PRESETS`): misty dusk into a soft moonlit night.

## Never (child-safe)

No graves, skulls, bones, coffins, blood, spiders, bats swooping, dark corners, jump scares,
creepy faces or sudden noises. If something might be scary, make it cute instead or leave it out.

## Files you may change

- New: `world/src/areas/ghost-town.js` (everything for this area: buildings, ghosts, fog, props,
  update function), registered like `areas/town-center.js`.
- Small hooks only: `world/src/main.js` (register + update), `world/src/camera.js` (append shot),
  `world/src/presets.js` (append preset), `world/src/ambience.js` (the area's quiet sounds),
  `world/src/world.js` only for registering a terrain pad / reserved area through existing helpers.
- New painted images: none needed; if you want ChatGPT art (e.g. ghost faces), ask in the result.

Anything else: don't change it; write it as a request in the result file.

## Check (light: build first, Claude reviews later)

One quick smoke check: page loads, no console errors, the district appears, old shot/preset numbers
unchanged, no sound started by the check. Write `tasks/ghost-town.result.md` (short, plain words),
save one screenshot `world/tests/ghost-town-dusk.png`, and commit everything on the branch.
