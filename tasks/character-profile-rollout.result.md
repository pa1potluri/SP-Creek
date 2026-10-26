# Approved game profiles — WIP, first increment saved

## Authorisation and scope
User approved the characters and pipeline phases on 26 October 2026, and asked for two/three small implementation steps within 13% remaining usage. Work on area/character-profile-rollout; do not push/merge. Rough planning estimate communicated: 2–4 focused working days for fuller rig fit, facial animation, lighter assets and review; not a claim that this first increment completes those stages.

## Done
1. Offline runtime exports: twelve resident files retain every fourth source record; Pavi keeps the exact full frozen hero. 13 files total **12,425,340 bytes** plus manifest, down from 34,171,980 bytes (~64% less). Exporter, source counts, stride and checksums saved. No source package edits or reference re-bake.
2. Actual game integration at **http://localhost:8811/?characterFaces=pipeline**. New character-profiles.js loads/caches approved geometry, assigns profile IDs once per created character, matches body skin tone and replaces only head children. Existing walking/head joints remain active. Matching profile instances share geometry/materials; no per-frame identity generation. Point colors participate in main renderer fog and post-processing; a simple fog-based tint keeps night faces readable.
3. Original URL is the rollback: no experimental head files are downloaded there. Siri preserves her supplied original GLB. Pavi currently uses the existing code-built star fallback body/rig so the approved frozen head can attach without cutting the original GLB. Both original GLBs are untouched. All twelve resident profile IDs were present in the sampled live resident/child population.

## Checked
- **9 smoke/integration checks passed**, zero browser errors, sound locked. Tested actual Pavi face, preserved Siri, resident/child attachments, 120 world steps (2 seconds), finite camera, original URL rollback, and zero pipeline-game resource fetches on the ordinary URL.
- Actual-game readiness sample 8678ms at 960x600; this is one local sample, not a performance guarantee.
- Four Animated Film captures: world/tests/character-profile-rollout-{20,46}-{day,night}.png. Bench view confirms Pavi face replacement alongside untouched Siri; body proportions, seated pose and gaze alignment still need deliberate visual review before default rollout.
- Evidence: world/tests/character-profile-rollout-check.json; repeatable driver character-profile-rollout.cjs.
- Exported profiles contain **621,267 unique points**, about **14.91 MB of shared position/color GPU attribute data**, plus CPU copies and normal game-body/texture costs. This is not total scene VRAM. Additional matching actors reuse the same geometry, though their draw/render cost still grows.
- Full suite was **not run for this increment** to respect the user's limited usage and instruction to save partial progress. Prior 2015 + 2 result applies to the previous isolated-test checkpoint, not this new integration. Keep WIP; do not merge or mark done.

## Exactly where stopped / left
- Opt-in real-game wiring + smaller runtime assets are implemented and smoke-tested. Original game URL remains the default until complete verification.
- Next: review Pavi fallback body/head fit, sitting/gaze/hand interactions; decide whether to fit the head onto the original GLB body without damaging its torso/rig. Siri has no dedicated pipeline source; keep her original until one is supplied/explicitly selected.
- Add explicit saved per-person profile-ID mapping for reload/project persistence rather than relying on current actor-creation order. Current identity stays fixed for an actor's lifetime, but new/recreated actors cycle the twelve saved profiles.
- Check all art styles, weather, head/camera distances and all actor appearances (boat/balloon/camping/etc.); add distance LOD/streaming and expression/blink/gaze controls. Current frozen heads do not blink; original hidden-head animation does not animate point facial regions.
- Run the complete suite on default and relevant opt-in paths; refresh all affected day/night evidence before default rollout. No shot IDs/presets changed. Current head-face acceptance is approved; runtime fit/performance validation remains outstanding.
- End here to save usage. No new experiments started. Earlier forest WIP remains separate. Everything on this branch must be committed, never pushed.

## v01 resident source update
On area/character-pipeline-v01 the updated package 1.1 residents replaced the earlier data in the preview and game exports. Runtime binary total is now 15,419,020 bytes; full Pavi and original Siri are preserved. Preview 94 and game smoke 9 checks pass, with updated day/night evidence. This does not complete the broader integration or its pending full suite; current quick-review handoff is tasks/character-pipeline-v01.result.md.

## Solid resident increment (task 55)
User clarified that pedestrians require rough opaque surfaces, not detailed points. Actual opt-in game now uses twelve parameter-driven cached solid heads/hair; zero resident point .bin downloads. Pavi remains detailed; Siri remains original. Full default suite 2015 + 2, focused solid/walking/all-style 44 and loading/layout 5 checks pass; Film walking day/night evidence saved. Task 52 still retains Pavi GLB/body fit, profile persistence, expressions and broader rollout work; use tasks/solid-residents.result.md for current pedestrian representation/cost.
