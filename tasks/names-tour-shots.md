# Task: café names, a friendly Mayor, and tour shots for the new areas

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: `area/names-tour-shots`, from the tip of the
branch you just finished. Light checks.

1. **Shot names** (names only, same indices): "Saloon → Sheriff" → **"Café to Town Hall"**,
   "Through the Doors" → **"Into the Honey Bun Café"**, "At the Bar" → **"At the Counter"** (if
   kid-cleanup didn't already), "Card Game" → **"Board Game Table"**.
2. **The Sheriff becomes the Mayor**: the cast role and its label (`characters.js` CAST, the cast
   line-up, any walker using it) → **Mayor** (a friendly top hat or bowler, a sash or a flower in the
   buttonhole, no badge needed). Check every outfit and prop again: **no character carries a gun, holster
   or weapon** (add a test that walks all outfits and fails if any part is named like a weapon).
3. **Tour shots** (append at the END, keep all old indices): one calm 10–15 s "tour" shot each for
   **Old Hollow ghost town, Firefly forest, Meadow and lake, Crystal mine, Willow Creek pond**, in a new
   group **"Grand tour"**, each with a clear view of its area from a pleasant angle (camera ≥ 1.5 m from
   props/plants, never inside bushes or behind signs). Claude will put them into a ~2:30 tour preset.
4. In the result file list the new shot indices, names and lengths.

## Files you may change

`world/src/camera.js`, `world/src/characters.js`, `world/src/life.js` (cast use only),
`world/index.html`/`world/src/main.js` (labels only), `world/tests/*`.

## Check (light)

Page loads, no console errors, names show in the panel, new shots appear after the old ones. Write
`tasks/names-tour-shots.result.md`, commit, mark done in `QUEUE.md`, start the next task.
