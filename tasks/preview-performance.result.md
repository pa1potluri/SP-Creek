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
