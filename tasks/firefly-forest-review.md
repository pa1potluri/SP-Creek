# Firefly Forest — user screenshot review
Status: queued; no visual fixes claimed.
Reference: codex-clipboard-d167066e-d235-4bb4-91f0-3fc05b90a9ce.png, 26 October 2026.

## Fix order from the review
1. Path readability and lighting: improve usable path width, ground contrast and soft edge definition; lift shadow detail, open sightlines, distribute warm lanterns along the route rather than leaving isolated pools.
2. Tree spacing and hillside balance: reduce heavy overlap, vary spacing/scale/silhouette, and stop the right-hand slope dominating the view. Check rooted placement on steep terrain; preserve earlier task 48 floating-root and blocked deer-at-forest-edge reports.
3. Fireflies and sky: make gently glowing fireflies readable with restrained size/brightness variation; add soft dusk gradients, cloud detail and atmospheric depth. No flashing, harsh light or scary darkness.

## Implementation boundaries / verification
Inspect the current forest camera and world terrain/plant placement before choosing changes. Proposed scope: forest module if present, world.js forest path/lantern/plant placement, atmosphere.js forest particles/sky, related forest shot module; tests, captures and task metadata. Keep changes local to forest where possible; do not change every area's brightness or add many expensive point lights to address one view. Preserve shot/preset IDs, all styles, deterministic world time and current approved characters.
Compare the same view in Film and Oil, then inspect all affected forest/deer views by day and night. Check walkable path and tree grounding. Full suite plus Film day/night screenshots and a result file before done. This review extends task 48/60 visual follow-ups; it does not discard them or change the existing functional queue priority.

Q12 increment complete on area/quick-12-forest: ground-fitted wider trail,7 guide lanterns, nearer/terrain-aware fireflies, obstructing log/seat relocation with matching bounds.601 static route samples clear, full2015+2 and Film Trail/Tour/Deer day/night + Oil saved. Broader tree grounding/overlap, deer composition, hillside and sky still WIP; see quick-12-forest.result.md.
