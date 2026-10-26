# Crystal Mine refresh — WIP visual handoff

## Implemented
- Replaced the short square stone-box lining/roof with a continuous rounded cave vault and closed rounded back wall. Kept a level floor and original safe wall/ceiling collision limits; no shafts/drops.
- Replaced oversized brick-like rock texture with a small locally generated soft stone texture, muted layered rock colours and rounded outer arch shapes. No downloaded images or new libraries.
- Rebuilt crystals with bevelled hexagonal profiles and pastel colours; lowered harsh emissive intensity/pulse. Moved sign forward to keep it readable.
- Moved mine cart 3.6m to the side and updated its collision rectangle/crystal cargo, clearing the central entrance track. Balloon ride and existing shot/preset IDs untouched.

## Checked / current status
- Four Film views (existing 28 and 33, day/night), no browser errors, finite camera positions, sound locked. Current default approved residents still loaded. Evidence crystal-refresh-check.json and crystal-refresh-{28,33}-{day,night}.png.
- Original comparison evidence crystal-refresh-before-{28,33}-{day,night}.png. Do not use old screenshots as the current game review.
- Current look is a first pass, not final visual acceptance. Outer rock shapes remain visibly procedural/rounded; a more organic hillside/entrance blend and atmospheric art pass may still be needed. Keep WIP rather than claim the user's rejection is resolved merely because geometry changed.
- Full suite: 2015 + 2 startup checks passed, all 31 suites, exit 0, Browser errors []. Log crystal-refresh-full.txt. No character version rollback, push, merge or publishing.

## Exact handoff
Suite recorded and all changes saved. Next functional priorities remain top Gameplay/Free Camera + simple side places (68), full actor clearance (64), Kite Day facing (65), Episode 12 coverage (66). Task 63 top style bar is implemented with preference retention, but final all-mode UX acceptance is unfinished. Prior atmosphere/forest/picnic and hero fit/persistence work stays open.


## 27 October timber continuation — WIP
Current branch area/crystal-timber-refresh, stacked from verified Episode12 correction 38b7332. First implementation: three rounded timber support frames inside/at the existing passage, with matching post colliders and overhead braces. Existing bright lining, rock surround, rails/cart and balloon mechanics retained. This is only a first structural increment, not the completed reference target.
Light check: local page and Episode12 diagnostic still load/run. No full suite or mine-specific day/night captures yet for this increment, so NOT done.
Left: inspect current shots28/33 and actual passage clearance; integrate timber entrance/sign/rock surround, group crystals and cart contents, refine warm lantern presentation, assess ascent/platform and coordinate Balloon Hill91. Keep route/ride safety and saved IDs. Full suite plus affected Film day/night required before done. Exact stop: frames added in buildCrystalMine after ceiling registration; no further mine geometry edited.

## 27 October verified timber / route / platform increment — WIP reference polish
- Timber facade with readable inset sign, three interior support frames, muted natural rock surround, stone floor texture; clear center rails and passage. Crystals grouped at the entrance/interior and cart, cyan/teal palette; removed scattered slope crystals, added bounds for larger entrance groups.
- Wider 3.4m winding ascent with locally graded pads and two guiding fences. Route-side lanterns moved out of walking space after diagnostic caught one obstruction. Maximum sampled grade 0.321 (~18 degrees); further slope/landscape refinement remains open.
- Hilltop deck now has an explicit floor, rounded visible rails with matching collision lines and a clear 3m shore-side entrance. Landing ring, existing bench, safely tethered idle basket lowered over the deck, subtle deterministic sway. Basket collision exists only while parked; cinematic ride sampling/IDs/duration retained.
- Runtime checks: 241 ascent points clear at player radius .35; central mine passage clear; three platform edges block and entrance remains open. Audio locked, no page errors, startup ~9s. Evidence crystal-timber.cjs and crystal-timber-check.json. These are route samples, not universal collision proof.
- Final full suite: 31 suites, 2015 + 2 startup checks passed; Browser errors: []. Includes complete balloon ride continuity/clearance tests. Log world/tests/crystal-timber-full.txt.
- Current Film evidence: crystal-timber-{28,29,33}-{day,night}.png; before comparison crystal-timber-before-{28,33}-{day,night}.png. Reviewed entrance and platform day/night; no automatic sound, threatening shapes or dark tunnel added.
- Remaining WIP: hillside vegetation/rock clustering and softer terrain transitions toward the supplied art reference; broader all-style visual acceptance. Task91 boarding prompt/gameplay ride interaction is not implemented: game.js _interact currently handles horses only and is outside task67 files. Scope request recorded in STUCK.md. Preserve this as an unfinished reference-polish task, not a finished whole-game claim.
Exact stop: verified structural increment saved; continue queued isolated corrections, starting terrain72 inspection. No merge/push/publish.
