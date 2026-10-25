# Self-review 1: tasks 21-32

Reviewed the stack on area/self-review-1 after 7c9019c and visibility fix 50be96d. These judgments describe the corrected stack, not each historical branch in isolation. No merge or push. Final full-suite counts pending.

Page loaded without JavaScript errors. Rendered 272 camera poses (34 relevant views, four positions in day and night). Made 26 short Play-mode passes at town, pond, ranch, forest, meadow, mine, hilltop, cove beach/village, camp, farm, station and cafe: every player position finite, moving and on dry footing. Inspected film day/night, oil-paint and Play-mode contact sheets. Sound stayed locked; audio quality was not auditioned automatically. Details: world/tests/self-review-1-check.json.

Each screenshot basename below has -day.png, -night.png and -oil.png versions in world/tests/. Contact sheets: self-review-1-film-contact.png, -oil-contact.png, -walk-contact.png. Extra Play images: self-review-1-walk-{cafe,camp,cove,farm,forest,station}-{day,night}.png.

- **21 Original Pavi/Siri 3D - PASS after handoff fix.** Branch 9ca912b. Supplied GLBs/textures remain unchanged from 279d2c7; curls, cream/red outfit and Siri's red/gold dress, braid and bag retained. References inspected. Known source texture patches remain; no redesign. Original full 1293 + 2. Pictures: self-review-1-21. The review found the walking view could lose both models after staged scenes; fixed below.

- **22 Cove polish - PASS, finished in 32.** Branch a5584d2, completed by 7c9019c. Warm small pebbles; visible townsfolk kept away; sea boundary/pier protections retained. Episode 1 now a continuous dry-beach take from behind, not five staging cuts. Whole 180s checked at 10Hz, max camera step 0.10817m and actor 0.02177m. Final full 1460 + 2 in task 32. Pictures: self-review-1-22 and finish-wip-65-day/night.

- **23 Pavi/Siri moments - PASS.** Branch 87d117b. All seven moment views sampled; original characters, gentle poses, bench/duck/castle props and collar gesture retained. Dry beach/pond-bank footing; no threatening shapes. Original full 1335 + 2; focused recheck 35 passed after review fix. Pictures: self-review-1-23 (collar), plus original pavi-siri-moments-46 through -52 day/night.

- **24 Balloon ride - PASS after handoff fix.** Branch 2d48a57. Pastel balloon, closed basket floor and protective rim; both original riders visible, soft route endpoints and tethers restored. Flight poses sampled day/night, no ground plunge. Original full 1358 + 2; focused balloon 20 passed. Pictures: self-review-1-24. Outgoing balloon visibility ownership fixed in this review.

- **25 Train trip - PASS after handoff fix.** Branch 34becdf. Both passengers readable through coach windows; sheltered halts, moving-door/step rules and graded rail route retained. Station walking pass stays dry; actual sound source now follows the branch (task 32), without unlocking audio. Original full 1389 + 2. Focused train suite now 32 passed, including four new scene-handoff checks. Pictures: self-review-1-25.

- **26 Camping - PASS, finished in 32.** Branch faea577, completed by 7c9019c. Two rounded tents glow in the clearing, guarded small fire, two nearby grown-ups, seated siblings, round owl and gentle fireflies. Night paths remain readable; approach barrier retained. Normal startup/frame-loop wiring verified, no preview-only factory needed. Camping 14 and integration 13 passed; full 1460 + 2 in 32. Pictures: self-review-1-26 and finish-wip-59/60 day/night.

- **27 Pony farm - PASS.** Branch 7f6409f. Rounded ponies/baby animals, protected nursery, light fences and duck-pond boundary retained. Siri's gentle lamb interaction visible, Pavi feeds from outside the paddock. Play pass outside rails finite/dry. Original full 1440 + 2; farm suite 32 in latest completed full run. Pictures: self-review-1-27.

- **28 Episodes 2-5 - PASS, finished in 32.** Branch a7746e5, completed by 7c9019c. Each lasts 180 seconds with natural pacing and wide starts/ends. Episode 4 now uses the wired camp, night mood and quiet sky view; no empty-clearing button. Full 1460 + 2 in 32; integration 13. Pictures: self-review-1-28 and prior episode-presets day/night evidence.

- **28a Startup repair - PASS.** Branch 2bbec71. Page/server available on local port 8813, startup completes without errors; station/town Play passes work. Launcher remains offline/local. Original startup 50.154 -> 27.167s and full 1446 + 2 per its result; this review did not repeat that timing benchmark. Pictures: self-review-1-28a.

- **29 Cafe light - PASS.** Branch fa1d96e. Counter stays bright cream/honey in day and night, tea/cake/lemonade sign clear, friendly host; no dark counter corner. Play pass inside cafe dry and finite. Original full 1446 + 2; prior pixel data recorded 0% near-black over ten counter poses. Pictures: self-review-1-29.

- **30 Performance - PASS with measured limits.** Branch 08beea1. Close-up shapes, fences and original textures intact; distant small-plant LOD does not remove trees or physics. No visible update-freeze on returning to sampled areas. Controlled 1080p render time 8.249 -> 7.450ms (9.7% less); average displayed-FPS gain was not established, and locked 60fps is not promised. Original full 1446 + 2, targeted 29. Pictures: self-review-1-30.

- **31 Watercolour - DEFERRED.** Not started or reviewed; not before Thu Oct 29. No watercolour experiment on this branch.

- **32 Finish WIP - PASS.** Branch 7c9019c. Production camp, Episode 4, one-take Episode 1 view 65 and actual locomotive listener coordinates all present. Earlier view numbers retained; no face close-ups or new unsafe theme. Full 1460 + 2; integration 13. Pictures: self-review-1-32; finish-wip-59/60/65 day/night.

## Fix made in this review

- Reproduced balloon -> train -> walking-view handoff leaving both protagonists hidden. Playground had captured the balloon's temporary false visibility and the train inherited it.
- life.js now releases outgoing balloon/train visibility before another scene snapshots it, and repairs the playground's saved baseline on restoration. Its existing direct-call cleanup remains supported.
- Added four regressions in world/tests/train-trip.js: both protagonists restored and hidden snapshots/passengers cleared after handoffs from normal town and playground. Focused train 32 + balloon 20 + moments 35 = 87 passed, errors []. Refreshed evidence explicitly asserts protagonist visibility after all 272 probes.
- No remaining child-safety problem found in the inspected samples. Full stack suite pending before marking review done. No other application fixes made here.
