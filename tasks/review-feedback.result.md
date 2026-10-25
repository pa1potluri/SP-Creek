# Preview feedback - WIP

## Reported by the user
- Right-side menu hangs after several clicks; reload slow or seemingly stuck.
- Firefly Forest trees appear off the ground; deer camera shows an obstructing tree instead of deer.

## Done / current code
- New branch area/review-feedback from 6d64fa5. No merge/push.
- Reproduced added-forest tree base gaps up to 2.606m and an obscured deer view.
- Added World.groundY: direct regular-grid triangle sampling. surfaceY now avoids raycasting the entire terrain for each prop, while retaining raycasts for raised walkables.
- Added forest trees/bushes now use rendered terrain heights and refresh on terrain revisions. A small deer-view clearing removes obstructing trees without renumbering the camera.
- Native world plant batches also now use rendered terrain height, preserving their original buried-root/flower offsets. This latest change still needs its targeted rerun.
- First after-change measurement (before native-plant follow-up): startup 37964 -> 25026ms at 1280x720, about 34% faster; added forest root gaps about -0.1m. No JavaScript errors and sound locked. Deer family visible in after-35 screenshot.
- Baseline timings are saved as an initial-measurement summary in review-feedback-baseline.json; follow-up timings/positions in review-feedback-after.json. Initial before images were overwritten by the diagnostic rerun; the baseline numbers were retained from its output. New regression suite review-feedback.js compares terrain and raised walkable heights against raycasts.

## Not resolved / left
- Actual menu hang not reproduced in the sampled camera clicks (15-37ms); every click starts a 10-second camera flight. Do not claim the reported hang fixed. Needs longer rapid-click/style/preset profiling and perhaps browser-specific feedback.
- Verify native plants after the latest one-line grounding change. Inspect Forest Trail 26, Firefly Forest Tour 31 and Deer at the Forest Edge 35 in day/night; save proper final Film screenshots.
- Full suite has NOT been run on this WIP. Prior 1900 + 2 result applies to the previous app checkpoint only. Keep task 48 WIP until the full suite and affected screenshots pass.
- Next: collect targeted result, inspect remaining tree-foot placement, update exact WIP status, commit everything before usage runs out. Current scope intentionally avoids new content or a renderer rewrite.

## Explicit usage-stop handoff
- User requested stop/save now. Stop new work on area/review-feedback.
- Latest targeted run on current code: review-feedback **96**, area-shots **7**, startup-hang **5** = **108 passed**; no browser errors, audio locked. Evidence review-feedback-check.json and review-feedback-static.json.
- Rendered-terrain interpolation max error against raycasts: 0.00001094m. Native plant height error against retained offsets: 0.00000189m. Added forest tree roots sit about 0.1m below the sampled mesh at their centres.
- Eight Film day/night screenshots saved for shots 15, 26, 31, 35. Deer family is now visible. Some steep-slope tree cards/roots and rocks still look detached in the pictures despite centre-height checks; investigate visible footprint/geometry grounding rather than declaring the whole forest fixed.
- Startup measurement improved from 37.964s to 25.026s before the final native-plant adjustment. No final timing claim for the last adjustment. Actual intermittent menu hang remains unconfirmed; sample clicks were quick but start 10-second flights.
- No abandoned Playwright headless browsers found. Diagnostic browsers have exited; no full suite is running. Keep the preview server running for the user's review.
- FULL SUITE STILL PENDING for this branch. Old 1900 + 2 result belongs to prior app checkpoint, not this WIP. No task completion claim.
- Resume: inspect remaining visible plant-footprint gaps; profile rapid menu/style/preset switching serially; verify raised-walkable equivalence and global vegetation impact; then full suite plus affected screenshots before done. Never push/merge.

## Follow-up loading/menu profile (2026-10-25)
- Isolated silent Chrome, 1280x720: readiness 21,558ms. Two main-thread long tasks measured 9,905ms and 10,103ms. Slowest listed image transfer ~250ms; local file serving is not the dominant delay in this sample.
- Separate startup CPU sample: applyUserPads ~10,202ms self time; withinPad ~2,847ms; Three.js shader onFirstUse ~3,981ms; texture upload ~724ms. These are sampled CPU totals, not an exact wall-clock partition. Terrain pad calculations and first-render shader preparation are confirmed startup hotspots.
- Four synthetic ready-made preset selections (Dreamy meadow, Firefly forest, Golden afternoon, Dreamy meadow): handlers 2.9 / 2.2 / 37.8 / 2.2ms. Each subsequent two-second frame sample produced 121-122 frames; largest frame gap 33.4ms. No actual intermittent freeze reproduced at 720p. Browser closed after each diagnostic run; no audio unlocked.
- User screenshot shows a substantially larger preview. Rendering cost at that size, real user's persisted state, GPU/browser state and longer sequences remain unmeasured. Do not claim the freeze fixed or blame its playback timer.
- No app code changed in this diagnostic pass; no new full-suite run or screenshots. Next: optimise repeated terrain pad work with equivalent-height checks, then measure at the user's viewport and longer preset switching. Remains WIP.

## Performance follow-up saved on area/preview-performance
- Terrain pad indexing cuts the observed readiness time from 21.558s to 8.215s. Terrain/plant buffers matched exactly before separate root-footprint adjustments.
- Reuses unchanged surface material programs; bounds Fit-window review to 1600x900 while keeping explicit output/export dimensions exact.
- Downhill root-footprint sampling improves anchoring; remaining steep-bank tree-card silhouettes logged in STUCK. Actual persistent user-session hang remains unresolved.
- Full suite **2001 + 2 passed**, 31 suites, no browser errors; eight updated Film day/night screenshots. See tasks/preview-performance.result.md and world/tests/preview-performance-full.txt.
- WIP saved; user requested shutdown after this pass. Resume with remaining visual/GPU-session diagnosis and next-sign-in startup verification; do not rerun completed checks without new changes.
