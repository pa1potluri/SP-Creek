# Watercolour preview resume - WIP / saved at user usage stop

## Done

- Current branch area/watercolor-resume, from area/self-review-2 tip b046535. User lifted Thursday wait and requested Sunset Cove at golden hour first. No merge or push.
- Resumed only scoped app files: styles.js, painterly.js, main.js style uniforms, index.html controls. Optional **Watercolour (preview)** choice; clean textures and painted plants; pastel washes, pigment rims, static paper tooth/blooms; three style-only sliders with project save/load. Fresh-start default remains Animated film. No camera or preset changes.
- Reduced the saved WIP's doubled character edges using a smaller, non-wobbling base brush and colour/depth-aware wash weights. Latest app code is in 02674e3.
- Six old style definitions and all five old Look modes passed fixed-buffer byte comparisons in the initial **25-check focused smoke**, before the final silhouette refinement. Final full verification must rerun these checks on current code.
- Final-code captures confirm default film, identical world time across style comparisons, sound locked, browser errors [], and byte-identical frozen Watercolour screenshots 400ms apart. Proof: world/tests/watercolor-resume-check.json.
- **12 raw matched-pose film/oil/watercolour day/night previews** for existing Cove shots 39 and 40, plus comparison sheets watercolor-resume-39-comparison.png and -40-comparison.png. All saved under world/tests/ and inspected. Golden-hour preview is soft and readable; original models/assets unchanged. Inherited navy night-waterline strip remains as already recorded in STUCK.md.

## Full-suite status / exactly where stopped

- First full attempt passed area-shots 7, balloon-ride 20, boat-trip 22, then printed Build progress through 400 and failed `watercolor/shop: placed through canvas`. No completed Build count and no passing full suite.
- Cause: Build test assumed Pixel art was the final style and retained its seven buildings before appended Watercolour. **70bd17d** fixes only test fixture cleanup to retain the actual final style's buildings. App placement code unchanged. Searched other suites for the same order assumption; none found.
- A fresh full 26-suite rerun was launched after that correction, then **stopped immediately at the user's usage-stop request, before any new suite output**. No tests remain running. TEMP/sp-watercolor-resume-full.log may still contain the FIRST failure because the replacement run had not emitted output; do not treat that stale log as a failure of 70bd17d.

## Left after reset

1. Re-read rules, queue and this handoff. Keep working on area/watercolor-resume; no new branch/merge.
2. Start/reuse local test server (8813 used here). Run every .js suite explicitly with run-browser.cjs; no-argument runner runs none. Verify the Build fixture correction and final Watercolour 25 checks, including old-mode pixel equivalence. Record actual final counts only after a complete passing run.
3. App code and final previews are already saved. If code changes, refresh affected previews and repeat relevant/full checks. Write final result/count JSON, mark task 31 and superseded task 8 done in QUEUE, commit, then STOP. Never push.

No finished full-suite result is claimed. Current source/test checkpoint: 70bd17d; this handoff is committed separately as WIP.
