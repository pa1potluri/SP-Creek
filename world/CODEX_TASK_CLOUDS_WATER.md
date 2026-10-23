# Task for Codex: drifting cloud shadows + more beautiful water

Same project and rules as before (see the earlier `CODEX_TASK_*.md` / `CODEX_RESULT_*.md`).
Backup before this task: `_backup_before_codex_2026-10-23c/`. Goal: the valley should look more
beautiful and alive in calm background videos. Everything must be deterministic per frame
(driven by the world time passed to `step(dt)`), so MP4 renders match the live view.

## 1. Drifting cloud shadows

Large soft cloud shadows slowly crossing the hills, river and village (like on a summer day).
- Drive them from the Atmosphere (`atmosphere.js`): their amount follows the mood's `cloudCover`
  and the existing *Clouds* slider (`atmos.mult.clouds`), direction/speed follow the wind
  (`world.wind`). None at night or in heavy rain (it's already overcast), strongest at golden
  hour / morning. Soft edges, scale ~60–150 m, slow (a shadow takes ~1–2 min to cross the town).
- Apply them to everything lit by the sun: terrain, buildings, plants, characters, water. A good
  approach is modulating the sun's direct light in the shared lighting (e.g. a world-space noise
  texture projected from above, injected via `onBeforeCompile` the way the foliage sway is done,
  or the sun shadow pass) — your choice, but keep it cheap and working in all six art styles.
- A slider "Cloud shadows" (0–1, default ~0.6) under *Atmosphere*.

## 2. Water

The river (`_river` in `world.js`, `waterTexture`, the water material / `waterTint`) and a new pond.
- **River**: sky and bank reflections (a cheap planar or screen-space-ish fake is fine: sky colour
  from the current mood + darker bank reflection near the edges), gentle moving ripples/normal
  detail, soft foam where it meets the bank and around the mill wheel and bridge posts, slightly
  clearer/darker in the middle. Must follow the mood (golden water at golden hour, moonlit at night).
- **Pond at Willow Creek** (`src/hamlet.js`): a small pond near the village with the same water,
  reeds along part of its edge (simple code-made reeds for now; painted ones may come later),
  a few lily pads, and a little wooden dock. Ground around it lowered naturally (terrain pad),
  plants cleared from the water. Townsfolk don't walk into it; play mode can't walk on water (or
  wades only at the edge, like the river).
- Place sounds: the pond can reuse the river's water sound quietly when close (optional).

## Check

Tests: cloud shadows animate deterministically (same frame at same time), amount follows mood
and slider, off at night; water material follows mood; pond exists, has colliders/reserved area,
walkers avoid it. Run all suites (`node world/tests/run-browser.cjs ...`), no console errors, no
sound from tests. Look at it in Oil and Clean 3D at golden hour and night; render frames.
Write `world/CODEX_RESULT_CLOUDS_WATER.md` and save `world/tests/clouds-water-preview.png`
(the river and mill at golden hour with cloud shadows) and `world/tests/pond-preview.png`.
