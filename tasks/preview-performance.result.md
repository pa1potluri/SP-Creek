# Preview performance result — checking

## Built
- Spatially index terrain pads in 32m cells, preserving pad order and original bounds. Refresh on pad count changes and at every terrain rebuild (including same-count edits/railway reorder).
- Hash comparison before footprint changes: complete terrain vertex buffer and all 26 native plant matrix buffers matched the previous unindexed code exactly.
- 1280x720 isolated startup: 21,558ms before, 8,191ms after indexing (~62% faster). Timings are observations, not a guarantee for every machine/state.
- Unchanged maps no longer invalidate material programs on repeated Film/preset selections.
- Fit-window review renders at up to 1600x900 while filling the browser; explicit 720p/1080p choices and video render/export sizes remain exact.
- Tree bases sample the downhill edge of their root footprint; forest rock placement also samples its footprint. Native tree variants keep their retained vertical offsets.

## Checks / remaining
- Initial targeted pass: review-feedback 96 + area-shots 7 + startup-hang 7 = 110 passed, sound locked, browser errors empty. Three additional reuse/output regression checks added afterwards; full suite currently running.
- Eight updated Film day/night frames: world/tests/review-feedback-{15,26,31,35}-{day,night}.png.
- At 2560x1440 BEFORE preview cap: first meadow entry showed a 1,801ms frame gap, repeat entry smooth; preset handlers 1.8–37.7ms. This reproduces a first-use pause, not a permanent hang.
- First-use shader preparation still costs time; persistent browser/GPU state and the user's indefinite hang are not yet proven fixed.
- Forest Trail 26 still has some unconvincing tree-card/root silhouettes on steep banks. Do not call the whole forest visually finished. See STUCK.md.
- User requested Windows shutdown after checks and commits. Verify clean Git status and installed sign-in shortcut before requesting a normal non-forced shutdown. Never push or merge.

## Final verification / shutdown handoff
- Full suite: **2001 passed across all 31 suites, plus 2 family startup checks**, exit 0, Browser errors []. Log: world/tests/preview-performance-full.txt.
- Final large-window test (2560x1440 browser, 1600x900 preview canvas): startup 8,215ms; four preset handlers 2.1–37.2ms; largest sampled frame gap 33.3ms. Earlier uncapped first meadow entry had a 1,801ms gap. Evidence: world/tests/preview-performance-profile.txt. These short isolated samples do not prove every GPU/session free of hangs.
- Eight affected Film day/night images refreshed; targeted initial 110 passed; the final full suite includes all 113 feedback/area/startup checks (99+7+7). Audio stayed locked in the targeted capture; full suite reports no browser errors.
- Task remains **WIP / partial fix** because steep forest tree-card silhouettes remain unconvincing and the indefinite user-session hang is not conclusively resolved. No new content is pending from Claude's completed 41–47 batch; task 40's navy cove band and review 47's wide picnic prop readability remain documented in STUCK.md.
- Exact next steps: inspect remaining root/card geometry on Forest Trail 26; if review still hangs, capture the actual Chrome GPU/context state and longer switching at the user's persisted settings. Avoid repeating speculative changes. Verify login auto-start at next sign-in.
- User explicitly requested save-all and normal Windows shutdown after finishing this pass. Startup shortcut verified present; shutdown will not force-close unsaved applications. No push or merge.

## Reproduced render-loop freeze / scope request
- Longer 48-preset switching exposed repeated `Cannot read properties of null (reading x)` exceptions. Exact stack: Walker.update life.js:505 -> Life.update life.js:1099 -> main.js step/frame. First captured during preset index 24, Pavi & Siri: a little day, after switching through Balloon ride / Lets build.
- Cause: Life.update's inactive walker path calls leaveSeat(), which clears `seat` while preserving a seating state. When activated later, Walker.update dereferences the now-null seat. Scheduled animation frames continue, but step throws before rendering, freezing the picture. No WebGL context loss was observed.
- Concrete proposed fix: cancel `toSeat`, `sitDown`, `sit`, `getUp` to a short `wait` state whenever leaveSeat() clears the seat. Reviewable patch: tasks/preview-seat-reset.patch. No life.js edit has been applied.
- Scope request under AGENTS.md rule 3: add world/src/life.js (leaveSeat state cancellation only) to this task. Current task scope lists main.js/world.js/forest.js and tests, but omits life.js. Need scope approval before applying this patch. Then add regression coverage for inactive/re-activated seated walkers, repeat switching, full suite and affected screenshots before completion.

## Approved fix and verification in progress
- User explicitly approved the life.js scope extension. Applied the four-line cancellation of pending/seated states in Walker.leaveSeat().
- New regression checks exercise toSeat/sitDown/sit/getUp release/reactivation and the real Life.update hidden-town-child -> visible-town-child transition.
- One full attempt reached the integration regression but it assumed family mode was enabled by earlier suites; corrected that test's setup/restore. This was a test precondition, not an additional production edit.
- Production targeted pass: feedback 113 + area-shots 7 + startup-hang 7 = 127 passed; no browser errors; sound locked. Refreshed Film day/night views 0,15,26,31,35,46. Full suite rerun in progress, then repeat all 48 presets twice. Before-fix stack and failed switch sequence preserved in preview-switching-before.json.
