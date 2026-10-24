# Task: Pavi & Siri, the stars of SP Creek (branch `area/pavi-siri`)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch from the tip of the branch you just finished. Never push.
**Look at the reference pictures first:** `tasks/ref/pavi-siri/pavi.jpg`, `SIRI.jpg`, `pavi_body.webp`, `siri_all.webp`.
These are the user's own characters. **The originals are the law: match them, never redesign or "improve" the faces.**

## Who they are (on screen)
Brother and sister, about 7–9 years old, warm animated-film look: big round brown eyes, rosy cheeks, soft rounded faces, big
ears/heads like the references.
- **Pavi:** messy dark-brown curly hair; cream short-sleeved shirt with a small red collar; a **maroon sash** tied at the waist
  with hanging ends and a thin strap across the chest; loose brown knee-length shorts; brown sandals. Naughty but good, jolly,
  quick and bouncy: big gestures, runs ahead, hops, points at things, waves.
- **Siri:** long dark wavy hair in a **thick side braid** with small orange/white flowers; small bindi; gold drop earrings;
  **mustard-yellow top** with short sleeves; **long full red-pink skirt with gold patterned bands**; red belt; brown shoulder
  bag on a strap; bangles; brown sandals. Very calm: moves slowly, never rushes, gentle rare smile, hands folded in front.
- Brother and sister only. Kind to each other, always.

## What's needed
1. Add `pavi` and `siri` to the cast in `characters.js` (same procedural style as the cast, extended where needed: curly hair,
   side braid with flowers, sash, long patterned skirt, bag). They must read clearly at video distance in every art style.
2. Their walk and idles: Pavi bouncy and fast (sometimes runs ahead, waits, waves back); Siri slow and steady.
3. A gentle little routine around town (driven by world time): they walk down main street together, Pavi runs to the fountain,
   Siri catches up, they visit the Honey Bun Café door, the pond, and the playground if it exists. Townsfolk wave to them.
4. Two camera shots (append): "Pavi & Siri walk" (follows them at kid eye level) and "Pavi & Siri at the pond".
   One ready-made video preset (append): "A day with Pavi & Siri".
5. Family mode and every art style keep working; no other character changes.

## Files you may change
`world/src/characters.js`, `world/src/life.js` (their routine only), `world/src/camera.js` (append shots),
`world/src/presets.js` (append preset), `world/tests/` (one new small test).

## Check
Full suite; day/night screenshots of both new shots plus a close front view of each character next to its reference
(`world/tests/pavi-siri-<view>-day/night.png`). Write `tasks/pavi-siri.result.md`, commit, mark done in `QUEUE.md`, then
continue with the next queued task.
