# Stuck / later

Things that did not get solved after a few tries go here.

Task 32 resolved Cove continuity, camping startup, Episode 4 and branch-train sound location. Historical scope requests and measurements are preserved in the task result files. The current inherited visual follow-up is recorded below.

## Inherited cove night waterline - visual follow-up from self-review 2

- What/where: a broad solid navy strip appears beside the waterline in night Play views at Sunset Cove; strong palm shadows can also dominate shore-facing frames. New boat riders remain visible and walking boundaries stay dry.
- Evidence: world/tests/self-review-2-walk-cove-shore-night.png. The same strip already appears in world/tests/self-review-1-walk-cove-night.png, before tasks 34-38.
- Tried: compared the earlier review capture, tested several establishing-camera angles, then framed appended view 80 over open water so the new episode ending excludes the strip and dark hillside. The underlying Play view is unchanged.
- Request: Claude should scope a cove shoreline/sea/night-rendering cleanup. Exact cause is not yet diagnosed; task 36 allowed boat changes only, so this review does not alter the existing sea/shoreline renderer. This is a visual follow-up, not a blocked path or new threatening content.

## Task 40 diagnosis (area/cove-night-strip)

- Reproduced the navy band in Film shot 40 at night. Browser-only mesh hiding and a bright shoreline material isolate its screen region, but ray intersections and visible coverage need further investigation.
- Tried sea/sand geometry overlap (+8m) and a brighter sea-only near-field reflection; neither removed the band. Both app probes reverted; no speculative renderer changes retained.
- Next check: map screen points using the actual canvas rectangle and inspect shoreline/ground shader discard and depth coverage together. Keep the original follow-up open. Moving on after several attempts per AGENTS.md.

## Review 47: public wide picnic prop readability

- In self-review-3-41-fallback-day.png (plain static copy, no GLBs, wide view 94), the fallback cast renders, but the low blanket/basket are not clearly visible. Closer view 90 on the normal world shows them. No JavaScript errors, broken footing or water access was found.
- Tried a level picnic pad and a level-footprint check; the wide image did not improve. Measured blanket centre y=23.22594, terrain y=23.14594 and decorative meadow y=23.19094, with all parent groups and layers visible. Thus burial was not established; the speculative leveling change and its test were reverted.
- Next: compare actual rendered prop pixels and visibility between views 90/94 on the static fallback copy. Keep this as a visual follow-up; do not claim the wide public preview is polished.

## Task 48 follow-up: steep forest roots / intermittent hang
- Centre-height correction and downhill root-footprint samples improve grounding; forest rocks and deer clearance improved. However, Film Forest Trail 26 still has tree-card/root silhouettes that appear detached along steep banks (review-feedback-26-day.png).
- Tried analytic-to-rendered terrain sampling, native/added instance revision updates, and downhill-footprint burial. Avoid progressively burying whole trees or speculative terrain redesign. Needs deliberate trunk/card geometry or local slope placement review next.
- Menu freeze: 720p repeat switching stayed responsive; at 2560x1440 a first meadow entry produced a 1.8s frame gap, repeat entry smooth. Program reuse and preview pixel cap address measured pressure, but indefinite user-reported hanging remains unconfirmed. Next inspect actual Chrome GPU/context state if it persists after reload.

## Resolved: reproduced preset-switching render freeze (task 50)
- Captured Walker.update life.js:505 reading a null seat after an inactive town child was shown again. User approved life.js scope extension; leaveSeat now cancels seating states.
- Full 2015 + 2 checks and all 48 presets twice (96 selections) passed, no browser errors or WebGL context losses. Before/after sequence in preview-switching-before.json / preview-switching.json. This supersedes the earlier unconfirmed-hang note for this specific failure.
- First-use shader pauses still occur; second warm pass max frame gap was 66.7ms. Forest steep-bank root silhouettes, cove night band and wide public picnic readability remain open visuals above.

## Resolved in task 59: Cove night band
Whole-scene raycast identified the 360m procedural mountain ring crossing the beach at x~-359/y~0.9, ahead of sand/water. Cove views now hide procedural mountain layers and restore them on exit. Final train-shore-fixes-40-night.png has no band; full 2015 + 2 passed. Historical failed material/geometry probes above retained for context.


## Actor-clearance continuation boundary (27 October)
Partial swept traffic, visible crowd and market-spacing repairs are saved and included in passing descendant full-suite runs. Global clearance is still unfinished: player/ride movement lives in game.js, outside tasks/actor-clearance.md scope; many scripted scenes overwrite absolute poses and require scene-aware routing that preserves seeking. Do not retrofit a frame-history clamp or teleport characters to arbitrary free spots: it can lose deterministic poses and camera focus. Need lead scope covering shared actor routing and game.js integration for the global guarantee. Continue isolated queued fixes meanwhile; task 64 stays WIP, not done.
