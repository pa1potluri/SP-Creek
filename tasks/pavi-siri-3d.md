# Task: the real 3D Pavi & Siri, rigged and walking (branch `area/pavi-siri-3d`)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch from the tip of the branch you just finished. Never push.
**These are the user's own characters: never change their look.** Commit the two model files on your branch.

## The models (made by Claude from the user's turnaround art; uncommitted in your working tree)
- `world/assets/characters/pavi.glb` and `siri.glb`: one textured mesh each (~50k triangles, a 2048 px colour texture
  inside the file), **1.2 m tall, feet at y = 0, facing +z**, standing in an **A-pose** (arms slightly out, feet apart).
- No skeleton yet. Do **not** upload them anywhere (no Mixamo or other website): rig them in code.

## What's needed
1. **Loader:** add `GLTFLoader.js` (three 0.160.0, plus anything it imports) to `world/vendor/three/examples/jsm/` like the
   other add-ons, so it still works offline. Load both models once and reuse them.
2. **Rig in code:** build a small `THREE.Skeleton` per character (hips, spine, chest, neck, head, upper/lower arm L/R,
   upper/lower leg L/R) placed from the model's proportions, and skin weights from each vertex's position in the A-pose,
   blended smoothly across joints (2–4 bones per vertex). Pavi's legs split by side below the crotch. **Siri's long skirt:**
   the skirt follows the hips with a gentle sway, the legs move inside it; her braid follows head/spine.
3. **Animation from world time:** walk and idle (and a wave). Pavi bouncy and quick, Siri slow and calm (as in the
   character bible notes in `tasks/pavi-siri.md`). Deterministic.
4. **Replace the block versions** of Pavi & Siri everywhere they appear (their routine, the two Pavi & Siri shots, Sunset
   Cove beach walk and the Episode 1 shots/preset). Townsfolk stay as they are. Same height and paths as now.
5. **Looks in every art style:** keep their texture in all six styles (toy/pixel may tint, never replace it with flat
   colours); they cast and receive shadows; they light up like the townsfolk at dusk/night.
6. **Known texture flaws** (leave them, Claude handles the texture later): a few dark patches on Pavi's arms and cheek,
   and Siri has a second braid hanging at the front. Do not paint over the texture.

## Files you may change
`world/vendor/three/examples/jsm/loaders/` (new, unchanged three files), `world/src/characters.js`, `world/src/life.js`
(their routine only), `world/src/areas/sunset-cove.js` (beach walk only), `world/tests/` (extend the Pavi & Siri test).

## Check
Full suite; day/night screenshots: walking front, walking from behind, and the Episode 1 "Walking into the sunset" shot
(`world/tests/pavi-siri-3d-<view>-day/night.png`). Write `tasks/pavi-siri-3d.result.md`, commit, mark done in `QUEUE.md`,
then continue with the next queued task.
