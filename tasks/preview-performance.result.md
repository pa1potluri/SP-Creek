# Preview performance — complete, awaiting lead review

## What changed
- Fixed the reproduced render-loop freeze in world/src/life.js. Hiding a seated town child cleared its bench but left its sitting state active; showing that child again threw every frame before rendering. leaveSeat() now cancels all four seating states into a short wait. The user explicitly approved this scope extension before the edit.
- Terrain-pad spatial lookup keeps original blending order and refreshes for additions, removals, edits and railway reordering. Full terrain/vegetation buffers matched the old lookup byte-for-byte before the separate root-footprint adjustment.
- Repeated presets reuse unchanged surface material programs. Fit-window preview is bounded to 1600x900; explicit output and video/export sizes remain exact.
- Downhill footprint sampling improves native/added tree anchoring and forest rock placement. Remaining steep-bank silhouettes belong to the open task 48 visual follow-up, not a claim of finished forest artwork.

## Verification
- Full suite: **2015 checks + 2 family startup checks passed across all 31 suites**, exit 0, Browser errors []. Log: world/tests/preview-performance-full.txt.
- Targeted production checks: feedback 113 + area-shots 7 + startup-hang 7 = **127 passed**. New cases cover releasing/reactivating all four seating states and hiding/showing a seated child through the actual Life.update path. Audio locked, no browser errors.
- Before fix: failed on the 47th selection with 95 repeated null-seat errors; stack and sequence preserved in world/tests/preview-switching-before.json.
- After fix: **all 48 presets twice (96 selections) passed**, zero browser errors, zero context losses, audio locked. At a 2560x1440 window / 1600x900 canvas, startup was 8631ms, longest click handler 44.7ms. First-use frame gap reached 1067.5ms; the second full pass peaked at 66.7ms. Thus brief first-use shader pauses still exist, but the reproduced indefinite render-loop failure is repaired. Evidence: world/tests/preview-switching.json; reproducible driver: preview-switching.cjs.
- GC heap samples after rounds: 52.6MB / 58.6MB. These samples do not establish a memory plateau or prove/exclude a longer-session leak; no speculative resource-disposal change was made.
- Earlier matched startup samples: 21.558s before pad indexing, 8.215s afterwards. These are observations, not guaranteed loading times.
- Twelve refreshed Animated-film screenshots: world/tests/review-feedback-{0,15,26,31,35,46}-{day,night}.png. Town/bench day and night inspected; no new child-safety issues found. All 96 camera paths passed existing clearance tests.
- One full attempt initially hit a test precondition: the integration regression assumed family mode was on after prior suites. Corrected the test to set/restore it, confirmed targeted checks, then reran the complete suite successfully. No app edits after the successful full run.

## Remaining / handoff
- Task 48: some tree-card/root silhouettes on steep Forest Trail banks remain visually unconvincing. Already logged in STUCK.md after several approaches; do not keep burying trees or redesign terrain speculatively.
- Older open items: task 40 cove night band and review 47 wide static picnic readability remain in STUCK.md. No new content task is queued after 50.
- Auto-start is verified after a real Windows restart; see preview-autostart.result.md. Local review portal updated with current counts and screenshots.
- No merge, push, upload or publication. Save all evidence on area/preview-performance; leave the preview available for review.
