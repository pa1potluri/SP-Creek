# Task for Codex: "Dreamland" nature style + richer ground and flower meadows

Same project and rules as before. Backup: `_backup_before_codex_2026-10-23c/` (before the clouds/
water task). Deterministic per frame (world time), every art style must keep working.

The user makes videos for a **children's channel**. Their words: the nature should feel like a
**dream place** where a child is happy: lots of colour, **one area one colour** (a blue flower
area, a purple flower garden, a pink area, …), cute colours, **soft like a teddy bear** (they
want to touch it), **everything in blossom**, **everything glowing**. Only the NATURE changes;
buildings stay as they are.

## New ChatGPT-painted art (already in the project)

`world/assets/textures/dream/meadow.png`: plush sparkly mint-green meadow ground with tiny pastel
flowers (1254² seamless, RGB).
`world/assets/foliage/dream/` (transparent PNGs, side view, touching the bottom edge):
`flowers_blue.png`, `flowers_purple.png`, `flowers_pink.png`, `flowers_yellow.png` (wide patches,
1774×887), `bush.png` (pastel hydrangea, 1536×1024), `grass.png` (plush tuft, 2048×768),
`tree_blossom.png` (pink cherry blossom) and `tree_wisteria.png` (lilac wisteria) (1024×1536).
For the normal looks: `world/assets/textures/oil/dry_grass.png` and `lush_grass.png` (1254²
seamless ground) and `world/assets/foliage/oil/lupine.png` (lupine meadow patch).

## 1. New art style "Dreamland (kids)"

Add it to `STYLES` (`styles.js`) and the style buttons, with a new texture/plant set `dream`:
- **Ground**: `dream/meadow` instead of the meadow texture (roads and the town square stay dirt;
  keep them soft and warm-coloured).
- **Colour zones**: large soft-edged areas of the valley each get one dominant flower colour
  (blue forget-me-not fields, a purple garden, a pink valley, sunny yellow slopes), using the
  four patches plus `bush`, densely, with the plush `grass` tufts between. A few mixed areas
  near the town and Willow Creek. Use a deterministic low-frequency noise so zones are big
  (40–120 m) and readable from the shots. Avoid roads, buildings, water, rails.
- **Trees**: the painted cottonwoods/pines become `tree_blossom` and `tree_wisteria` (mixed,
  more blossom trees near the villages), with a few falling petals drifting (reuse the particle
  emitters or a light instanced effect).
- **Look**: soft and glowing: gentle bloom/glow on the flowers and sky, slightly lifted pastel
  colours, soft shadows, no harsh contrast (use the existing Look/Final shader controls; a light
  `film`-like DOF/bloom is fine). Buildings keep the clean textures in this style.
- **Sparkles**: a few tiny glowing motes/sparkles floating over the flower zones (by day too),
  fireflies at dusk.
- Family mode stays independent, but if Family mode is switched ON while the style is the default,
  it's fine to suggest Dreamland (don't force it).

## 2. Richer ground in the normal looks (oil / clean)

Blend the ground instead of one meadow everywhere: `lush_grass` near the river and in hollows,
`dry_grass` on hilltops and steeper slopes, the existing meadow in between, dirt around paths
(use height, slope and distance to river/roads, soft blends, in the terrain shader). Use the
oil images for the clean set too if no clean versions exist (they will be added later).

## 3. Flower meadows in the normal looks

Add lupine meadow patches (`oil/lupine.png`) in a few large drifts on the valley slopes (wave in
the wind like the grass), not on roads/buildings/water.

## Check

Tests for: Dreamland style loads its textures/plants, zones are deterministic and avoid
roads/buildings/water, other styles unchanged, ground blend present in oil/clean, lupine patches
present. Run all suites, no console errors, no sound from tests. Look at it at golden hour,
morning and dusk from several shots (Hilltop Vista, Valley Journey, Willow Creek, Town Square).
Keep performance reasonable (instancing; report draw calls / fps before and after).
Write `world/CODEX_RESULT_DREAMLAND.md` and save `world/tests/dreamland-preview.png` (a wide valley
view in Dreamland at golden hour) and `world/tests/ground-blend-preview.png` (oil style).
