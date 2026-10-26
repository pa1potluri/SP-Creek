# Updated resident package v01 — WIP quick-review refresh

## Updated
- Read-only source: E:\claude pa1\SP Creek art\Character-Pipeline-Setup_ v01, package version 1.1. Copied its twelve resident binaries, saved profiles and manifest into the existing preview asset set; regenerated the actual-game resident exports.
- Same preview URL: http://localhost:8811/character-pipeline-test.html (heading now identifies v01 / package 1.1). Select Full source for the densest resident view. The earlier version is preserved in Git at 9e991f7 and in the original source folder.
- Actual game URL: http://localhost:8811/?characterFaces=pipeline. Ordinary URL remains the original-face rollback.
- New shared round-point footprint map for residents: opaque interior with alpha-tested circular edge, rather than square point blocks. Resident point diameters adjusted to the denser source. Hero geometry, color records and point rendering stay separate/unchanged; SHA-256 matches the earlier hero source exactly. Original Siri GLB is unchanged in the game; isolated Siri slot continues its explicitly provisional town-202 face.
- No changes to main.js, characters.js, original GLBs, camera IDs, showroom or source package. No source-document instructions treated as extra permission.

## Counts / limits
- Twelve full resident sources: **2,048,527 points**, individual range **146,830–188,860**. Unique preview source including Pavi: **2,307,343 points / 46,146,860 binary bytes**. Displayed full group includes the repeated provisional Siri profile: **2,496,203 points**; quarter mode **624,054 points**.
- Actual-game files preserve full Pavi and quarter residents: **15,419,020 bytes**, up from 12,425,340 because of denser resident sources. Shared head attributes are about 18.50MB GPU data plus CPU copies; not total game VRAM.
- Package coverage claims concern its Canvas renderer. They do not prove the new Three.js world preview is gap-free at every angle. Close-up hair/point texture remains visible; this update targets rough background pedestrians, with visual acceptance left to the user.

## Checked and saved
- Existing focused preview test: **94 checks passed**, zero browser errors; validates all 14 slots, point budgets, all semantic regions, hero checksum, attachment, reversible old heads and actual foreground occlusion.
- Actual-game smoke test: **9 checks passed**, zero browser errors, sound locked. All twelve resident profile IDs used; Pavi attached; original Siri retained; 120 world steps finite; ordinary-URL rollback and zero profile downloads there verified. Readiness sample 8556ms at 960x600.
- Updated eight preview day/night images plus two Pavi original/pipeline comparisons under world/tests/character-pipeline-test-*.png. Updated four Film actual-game frames: character-profile-rollout-{20,46}-{day,night}.png. Focused JSON evidence under the existing test basenames reflects this version.
- Full suite NOT rerun for this quick refresh; no current-version completion/merge claim. The earlier 2015 + 2 result applies to its previous checkpoint. Broader rollout stays WIP.

## Exact handoff
- Ready for user's quick resident review at the two URLs above; reload the tab to fetch new files. No wider default rollout or new experiments started.
- After feedback/usage reset: run full suite and all-style/rig-fit checks for current assets; continue task 52's profile persistence, Pavi GLB/body fit, distance LOD and facial controls. Do not spend hero-level authoring time redesigning resident faces without a new request.
- Save all changes on area/character-pipeline-v01. Never merge, push, upload or publish. Source folders remain untouched.
