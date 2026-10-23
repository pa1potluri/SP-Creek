# Polish: Willow Creek pond and houses (later, not a blocker)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: `area/pond-polish`, made from the tip of
`area/crystal-mine`. Light checks only; when done, mark it in `QUEUE.md`.

## The area

The Willow Creek pond (`world.hamlet.pond`, built in `world.js` / `src/hamlet.js`) and the houses
next to it.

## The mood

A calm, pretty village pond a child would like to sit beside. Soft, friendly, lived in.

## What's needed (from the user's review)

1. **Dock**: it reads as a flat dark blob. Lighter warm wood, visible plank edges and gaps, two or
   three posts, maybe a little lantern or a fishing-free rope post.
2. **Reeds**: they stand in an even ring around the edge, which looks artificial. Scatter them in
   clusters of different sizes and heights, mostly on one or two sides, leaving open water edges.
3. **Shoreline**: it looks cut out. Add a soft muddy/sandy rim, a few pebbles, and softer, more
   visible foam along the edge.
4. **Houses by the pond**: they're plain grey boxes. Give them doors, windows, shutters and flower
   boxes like the other buildings (reuse the painted window/door art and the Town-center flower
   boxes).

## Files you may change

`world/src/hamlet.js`, the pond/hamlet parts of `world/src/world.js` (only the pond and hamlet
builders), and a new helper module under `world/src/areas/` if that keeps it tidy.

## Check (light)

Page loads, no console errors, the pond still blocks deep water, one oil screenshot at golden hour
and one at night saved as `world/tests/pond-polish-golden.png` / `-night.png`. Write
`tasks/pond-polish.result.md` and commit on the branch.
