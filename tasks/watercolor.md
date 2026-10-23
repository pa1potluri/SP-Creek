# Task: "Watercolour" art style

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: `area/watercolor`, from the tip of the branch
you just finished. Light checks.

## The mood

A soft **children's picture-book watercolour**: light, airy, pastel washes on textured paper.
Gentle and dreamy, never muddy or dark.

## What's needed

A new art style **"Watercolour"** in `STYLES` (`world/src/styles.js`) with its look in the
post-processing (`world/src/painterly.js`, the Look/Final shaders):
- **Colour washes**: soft flattened colour areas (a light Kuwahara/posterise like the oil style but
  wider and softer), slightly lifted and desaturated pastel palette, gentle bleeding at colour edges.
- **Pigment edges**: darker pigment pooling along shape edges (edge-darkening from depth/colour
  edges), thin and soft, like dried watercolour rims.
- **Paper**: a cold-press paper texture (procedural noise is fine) that shows through in light areas
  and lightly granulates colour; white paper peeking through at bright spots.
- **Wet blooms**: occasional soft blotchy variation inside large flat areas (static per pixel, not
  flickering: renders must stay perfectly still on a still camera, like the oil style).
- Textures: use the `clean` texture set and the painted plants (or Dreamland plants if that style
  exists). Light, readable at dusk and night too.
- Sliders under *Art style* only for this style: "Wash softness", "Edge pigment", "Paper texture".

## Files you may change

`world/src/styles.js`, `world/src/painterly.js`, the style wiring in `world/src/main.js`, and
`world/index.html` for its three sliders. Nothing else.

**Preview first:** add the style as one more choice, but do NOT make it the default or change any
preset to use it. The user looks at it on one area (the Town center) before it is used anywhere else.

## Check (light)

Page loads, no console errors, the style appears and works, a still camera gives a still image,
other styles unchanged. Save `world/tests/watercolor-golden.png`, write `tasks/watercolor.result.md`,
commit, mark done in `QUEUE.md`, start the next task.
