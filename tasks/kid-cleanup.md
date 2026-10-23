# Task: kid-friendly cleanup (top priority)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: `area/kid-cleanup`, from the tip of the
branch you just finished. Light checks.

The channel is for children. **All content must be child-friendly: no weapons, gambling, alcohol or
scary jump-scare themes.** This is no longer only a Family-mode option: the café/bakery version is
now the only version.

## What's needed

1. **Rename everywhere** (preset labels and descriptions, signs, blade signs, UI labels, camera shot
   names, task files' wording):
   - "Rainy night at the Honey Bun Café" → **"Rainy night at the Honey Bun Café"**
   - "Cozy café (animated film look)" → **"Cozy Honey Bun Café (animated film look)"**
   - HONEY BUN CAFÉ / CAFÉ → **HONEY BUN CAFÉ**; any "café" wording in labels → café.
   - Keep every preset KEY and every shot INDEX unchanged (saved timelines use them); only the
     visible names change.
2. **Board games instead of cards**: the card tables become café tables with checkers / board games,
   teapots, cups and cakes. No playing cards and no green-cloth gaming felt (use a cheerful
   tablecloth, e.g. gingham).
3. **No drinking or gambling props anywhere**: bottles, glasses of drink, beer/whisky signs, the bar
   look. Use bakery, tea and lemonade items: cake stands, jars of cookies and candy, teapots,
   lemonade jugs, bread baskets, a menu board ("TEA · CAKES · LEMONADE").
4. **The bar becomes a café counter** with a glass cake display, tea things, a cash-free little bell,
   warm lights (emissive strips / glow, **no new point lights**), so the "At the Counter" shot (rename it
   **"At the Counter"**, same index) is warm and readable (it is ~80% near-black today).
5. **Keep the singer and the piano** (and the café owner, the guests).
6. **No weapons**: check every outfit, prop and sign (GUNSMITH → TOY SHOP, etc. become permanent;
   the sheriff stays a friendly sheriff with a badge only).
7. The Family-mode switch: keep the switch (other kid-friendly swaps may use it later), but the
   café/gunsmith/gambling content must not come back when it is off. Simplest: the kid-friendly
   versions are the only versions; the switch then only affects things that are harmless either way.
8. Update `world/tests/family-mode.js` (and any test that expects the old café content) to the new
   permanent behaviour.

## Files you may change

`world/src/interior.js`, `world/src/family.js`, `world/src/presets.js` (labels/descriptions only),
`world/src/camera.js` (shot names only), `world/src/world.js` (signs/props only), `world/src/main.js`
(labels only), `world/index.html` (labels only), `world/tests/*`, and wording in `tasks/*.md`.

## Check (light)

Page loads, no console errors, no café/gambling/drink content visible inside or outside, the café
counter shot readable. Save `world/tests/kid-cleanup-cafe.png`. Write `tasks/kid-cleanup.result.md`,
commit, mark done in `QUEUE.md`, start the next task.
