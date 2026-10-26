# Character preview loading — WIP verified repair

## Report and diagnosis
- User reported blank/stuck loading. Server returned HTTP 200; isolated Chrome rendered 14 actors. Opened the in-app browser: it initially showed Loading, then rendered without console errors. No permanent blank-page failure was reproduced.
- Found unnecessary startup dependency: characters.js awaited both original GLBs even though the standalone preview exclusively creates code-built bodies. This added ~22.71MB and parsing before the preview could show progress.
- Also observed narrow in-app pane cropping the group and label-induced overflow; these made review harder even once loaded.

## Changes
- Skip original GLB loading ONLY when location pathname ends in /character-pipeline-test.html. Actual game/default/opt-in model loading is untouched; source GLBs unchanged.
- Explicit startup overlay with per-head loading progress, reload control, and messages for module/script/load failures. A WebGL startup exception can surface through the page error handler instead of leaving an unexplained canvas.
- Responsive group camera fits all 14 head centres in the narrow viewport; clip offscreen labels and prevent page overflow.
- Opened the corrected in-app page, verified rendered group and Full source / Resident face controls, and marked that working tab to remain open for user review.

## Verification
- **94 focused preview checks passed** after changes, no browser errors; existing day/night evidence refreshed. Network sample now 47,722,428 bytes with **0 GLB bytes**; readiness 503ms locally, not a guarantee for all browsers/storage.
- **5 new loading/layout checks passed**: loading overlay clears, zero unused GLB requests, all head centres fit 824x1230 pane, no horizontal overflow, simulated aborted module produces explicit reload message. Readiness in that run 635ms.
- During diagnosis actual-game **9 smoke checks passed** (pipeline faces, original Siri, animation, original-URL rollback, sound locked); game captures/JSON saved. No sounds started by tests.
- Evidence: character-preview-loading-{check.json,ready.png,cjs}; updated character-pipeline-test-check.json and screenshots. In-app screenshots also visually confirmed working controls and rendered residents.

## Left / exact handoff
- WIP: full suite not rerun for this loading-specific fix. No completion/merge claim; prior full-suite results apply to their earlier checkpoints.
- User can review at http://localhost:8811/character-pipeline-test.html. If their older tab is still waiting, reload it or use the newly opened working tab. New startup panel exposes useful failure text if another browser-specific issue occurs.
- Larger task 52 integration/rig fit and task 53 all-style/full-suite verification remain open. No extra experiments, model redesign, push, merge or publication. All changes/evidence committed on area/character-preview-loading.
