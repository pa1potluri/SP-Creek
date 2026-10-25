# Big queue: task 31 now, then tasks 40-47 (Claude, 2026-10-25)

Read `AGENTS.md`, `tasks/QUEUE.md` and `tasks/BLUEPRINT.md` first. First add rows 40-47 below to `tasks/QUEUE.md`
and commit this file. For every task: one branch `area/<name>` from the tip of the branch you just finished; child-safe and
calm; full suite + day/night screenshots + result file `tasks/<name>.result.md` before done; append shots/presets, never
renumber; save/commit before every usage limit; STUCK.md if stuck, then go on; only one chat in this folder;
**never push, merge or publish**. Claude merged 21-39 into main (fab9fc4).

**31 watercolour (now):** the user lifted the Thursday wait. Follow `tasks/watercolor-resume.md`: preview-only style,
Sunset Cove at golden hour first, oil vs watercolour comparison screenshots.

**40 cove-night-strip:** fix the broad solid navy strip at the Sunset Cove waterline at night
(self-review-1-walk-cove-night.png). Soft readable shore in every mood/season/style; remove it from STUCK.md.
Files: `areas/sunset-cove.js`, `world.js` (water/shore only).

**41 public-ready:** the public GitHub copy has no `world/assets/characters/*.glb` (Pavi & Siri stay private). The world must
start cleanly without them (fall back to the code-built Pavi & Siri, no errors) and work as plain static files (GitHub Pages,
no Python server): features needing `/save` show a friendly "only in the local studio" note. Test with a copy without the
.glb files on any static server. Files: `characters.js`, `main.js` (feature checks only), one new test.

**42 showcase-media:** 6 short looping clips for the README (GIF/WebP, 3-5 s, 640 px, under 3 MB each): Sunset Cove,
balloon ride, market day, rainy day with rainbow, garden time-lapse, lantern evening. **No Pavi & Siri in them.** Save to
`docs/media/` plus a capture script in `world/tests/`.

**43 contributing:** `CONTRIBUTING.md` (how to run, child-safe rules, how to suggest ideas, how changes are reviewed) and
`docs/good-first-issues.md` with 10 small, well-described ideas. Drafts only, nothing posted.

**44 snow-day:** Pavi & Siri build a snowman, make snow angels, ride a gentle sled on a small soft slope with grown-ups nearby,
cocoa by a window. Shots + preset "A snow day in SP Creek" (~4 min). Files: `life.js`, `areas/town-center.js` (snow props),
`camera.js`, `presets.js`.

**45 kite-picnic:** a breezy kite festival on the meadow hill and a picnic by the waterfall lake (blanket, fruit, ducks).
Shots + presets "Kite day" and "Picnic by the waterfall" (~4 min each). Files: `areas/meadow-lake.js`, `life.js`,
`camera.js`, `presets.js`.

**46 episode-presets-3:** Episodes 10 "Snow day", 11 "Kite day", 12 "Picnic by the waterfall", 13 "Night at the cove"
(~3 min, wide start and end). Files: `presets.js`, `camera.js` (append only).

**47 self-review-3:** like self-review-1, for tasks 31 and 40-46; write `tasks/SELF-REVIEW-3.md`. Then **stop**.
