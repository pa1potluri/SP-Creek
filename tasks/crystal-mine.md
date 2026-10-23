# Area 5: Crystal mine and hilltop with a hot air balloon

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: **`area/crystal-mine`**, made from the tip of
`area/meadow-lake`.

## The area

A rocky hill with an old friendly **crystal mine** entrance at its foot, and on its top a grassy
lookout where a colourful **hot air balloon** is tethered (pick a hill with a great view over the
valley, away from other areas; check `_reserved`, `PADS`, `riverZ`, `RAIL_X`).

## The mood

**Magical and glowing.** The mine sparkles with soft coloured crystals; the hilltop is breezy and
bright, with the balloon gently bobbing. Wonder, not danger.

## What's needed

1. **Mine entrance**: a wooden-framed tunnel mouth into the hill with a little rail track and a cute
   mine cart full of glowing crystals, lanterns, a sign "CRYSTAL MINE". Inside only a few metres:
   a short bright cave room you can walk into, walls studded with glowing crystals (pink, blue,
   purple, mint), a soft pulsing glow, sparkles. Bright enough, never dark; no deep shafts or drops.
2. **Crystals outside too**: clusters of crystals poking out of the rocks around the entrance and up
   the hill path, glowing softly at dusk/night.
3. **Hill path**: a winding path up to the top with a little fence and lantern posts.
4. **Hot air balloon**: a big striped balloon (pastel rainbow stripes), a wicker basket, tethered
   by ropes to stakes, bobbing and swaying gently with the wind; a small wooden platform and a
   bench, flags. The balloon's burner glows warmly now and then. (Optional, if easy: it slowly
   rises a little and comes back.)
5. **The view**: a camera spot from the hilltop over the whole valley.
6. **Life and light**: sparkles drifting from the mine, fireflies at night, a soft light inside the
   balloon at dusk.
7. **Sound** (only here, quiet): soft crystal chimes near the mine, wind on the hilltop, the
   balloon burner's gentle whoosh now and then.
8. **Camera shots** "Crystal Mine" and "Balloon Hilltop" (append at the END, group "Crystal hill")
   and one video preset **"Magic crystal hill"** (append at the end): golden hour into dusk.

## Never (child-safe)

No cave-ins, deep holes, darkness, falling, scary sounds, bats, or anything trapped.

## Files you may change

New `world/src/areas/crystal-mine.js`; small hooks in `main.js`, `camera.js` (append), `presets.js`
(append), `ambience.js` (area sounds); `world.js` only for pads/reserved areas through helpers.
Anything else: a request in the result file.

## Check (light)

Page loads, no console errors, the area appears, old shot/preset numbers unchanged, no sound started.
Write `tasks/crystal-mine.result.md`, save `world/tests/crystal-mine-dusk.png`, commit, mark done in
`QUEUE.md`, start the next task.
