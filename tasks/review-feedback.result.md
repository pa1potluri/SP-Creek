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
