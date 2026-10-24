# Task: Sunset Cove, the seaside village (branch `area/sunset-cove`)

Read `AGENTS.md`, `tasks/QUEUE.md` and **`tasks/BLUEPRINT.md`** (map, coordinates and the Sunset Cove plan) first.
Branch from the tip of the branch you just finished. Never push. Commit this file, `BLUEPRINT.md` and the reference
picture on your branch.

**Reference picture:** `tasks/ref/sunset-cove.webp` (the user's own picture: bay overview, Pavi & Siri on the beach at
sunset, lantern lane down to the sea). Match its mood and layout in our painted style; fine detail doesn't matter.

## Mood
Golden-hour seaside village: warm, bright, calm, magical. Gentle waves and seagull-free quiet; soft sea and breeze sounds.

## What's needed (positions from BLUEPRINT.md, west coast x −330…−430)
1. **Land to sea:** the terrain west of the meadow slopes down to a curved golden beach; the sea fills the west edge of
   the map (reuse the lake/river water, bigger: turquoise shallows, deep blue further out, foam line that rolls in and out,
   a sunset light path). The river turns west and reaches the bay at its south end.
2. **Safety:** shallow water at the shore and a soft invisible wall at the waterline; nobody walks into deep water.
3. **Village** on the slope east of the beach: about 15 white stone cottages with terracotta roofs, pink bougainvillea,
   cobbled lanes with steps, wall lanterns (warm at dusk/night), flower pots, a fountain square. Instance repeated parts.
4. **Pier** with small rowing boats and a sailboat rocking gently; **lighthouse island** at sea with a slow soft beam at night.
5. **Palms** along the beach and lanes (new palm plant in the plant system; all art styles); rocks; footprints on the sand.
6. **Path** from the meadow to the village. Townsfolk stroll in the lanes; Pavi & Siri can walk the waterline.
7. **Shots (append):** "Sunset Cove from above" (high bay view), "Beach walk at sunset" (kid eye level along the waterline),
   "Lantern lane to the sea". **Preset (append):** "Sunset at the cove" (calm 20-minute loop).
8. Works in every mood, season (winter: no snow on the beach sand, frosty roofs are fine) and art style. Add the cove to the
   shot-clearance audit.

## Textures (ready, approved by Claude)
Painted oil + clean sets are already in place (new, uncommitted: commit them on your branch):
`world/assets/textures/{oil,clean}/plaster_wall.png, terracotta_roof.png, cobblestones.png, beach_sand.png` and
`world/assets/foliage/{oil,clean}/palm.png, bougainvillea.png` (transparent, edges cleaned). Use them for the cottage
walls, roofs, lanes, beach, palms and the pink flowers; derive the flat set the same way as the other textures.

Sea backdrop (oil painting, used for every style): `world/assets/backdrop_tiles/sea_horizon_1.png` (sun, light path,
lighthouse island on the right) and `sea_horizon_2.png` (continues to the right, tiny islands). Both 1536×1024, they join
edge to edge, **horizon at 56–57 % of the height** (not the centre): place them as a far curved backdrop seen only
from the cove (west), with their horizon matched to the sea's horizon. Do not change the main valley panorama.

## Files you may change
New `areas/sunset-cove.js` (registered with the other areas), `world.js` (terrain slope to the sea, river mouth, water and
the waterline wall only), plant system (palm only), `camera.js` / `presets.js` (append), `ambience.js` (sea sounds),
`world/tests/` (one new small test + clearance).

## Check
Full suite; day/night screenshots of the three new shots (`world/tests/sunset-cove-<shot>-day/night.png`) plus one oil
painting view. Write `tasks/sunset-cove.result.md`, commit, mark done in `QUEUE.md`, continue with the next queued task.

## Claude's preview notes (fix before marking done)
From your WIP previews `sunset-cove-39/40/41-day.png` and `sunset-cove-sea-horizon-day.png`:
1. **One horizon only:** the painted sea backdrop and the 3D sea show two horizons with a dark band between them. Blend
   the 3D sea into the backdrop at the same height (no band), in every mood.
2. **One lighthouse only:** the 3D lighthouse island duplicates the painted one. Keep the painted one in the far
   backdrop and either remove the 3D one or move it so they never show together.
3. **Foam line:** it shows as zig-zag triangles (lantern-lane view). Make it a soft, smooth, rounded foam edge.
4. **Footprints** look like grey stepping stones. Make them small, soft, sand-coloured dents in pairs, fading out.
5. **From above:** a dark patch in the sky at the top; and the cottages stand in neat rows like a model. Vary their
   rotation, size and spacing a little, add a few lanes, trees and flowers between them so it feels like a real village.

## Extra for the first YouTube episode (this evening)
The first video introduces "SP Creek" (Siri and Pavi's Creek) with Pavi & Siri at the cove, like the reference picture.
Their faces are not final yet, so **no close-ups of their faces**: only from behind or far away.
- Append shots: **"Walking into the sunset"** (low camera behind them, they walk hand in hand along the waterline away
  from the camera toward the sun), **"Two small friends on a big beach"** (very wide, high and slow; they are small figures
  on the waterline), **"Down the lantern lane"** (from behind, they walk down the lane steps toward the sea).
  The existing "Beach walk at sunset" faces them: keep it, but don't use it in this preset.
- Append preset **"Episode 1: Welcome to SP Creek"** (about 3 minutes, golden hour, calm sea and soft breeze): Sunset Cove
  from above → Two small friends on a big beach → Down the lantern lane → Lantern lane to the sea → Walking into the
  sunset (last, long, ending as the sun touches the sea). Gentle slow moves, natural pace.
- Day/night screenshots of the three new shots like the others.
