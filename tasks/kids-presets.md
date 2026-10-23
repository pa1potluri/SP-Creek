# Task: kid-friendly video presets

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: `area/kids-presets`, from the tip of the
branch you just finished. Light checks.

## What's needed

The "Ready-made videos" list is the first thing on the panel, and the channel is for children.

1. **Friendly names in Family mode**: show kid-friendly labels and descriptions when Family mode is
   on (keep the preset KEYS and their order unchanged; saved projects use them). For example
   "Rainy night at the Honey Bun Café" → "Rainy night at the Honey Bun Café Café", "Cozy café (animated
   film look)" → "Cozy café (animated film look)"; make every description talk about the café,
   cakes, music, lanterns rather than a café. Family mode off: the old labels.
2. **Order for kids**: in Family mode, show the new area presets first (Cozy town center, Friendly
   ghost town, Firefly forest, Dreamy meadow, Magic crystal hill, Village at dusk), then the rest.
   Only the display order changes, not the keys.
3. **Section title**: "Ready-made videos" stays; add a one-line hint under it in Family mode:
   "Calm, friendly videos. Pick one, then render it under Video."

## Files you may change

`world/src/presets.js` (labels/descriptions data), the preset-button code in `world/src/main.js`,
`world/index.html` only for the hint line. Nothing else.

## Check (light)

Page loads, no console errors, labels switch with Family mode, presets still play. Write
`tasks/kids-presets.result.md`, commit, mark done in `QUEUE.md`, start the next task.
