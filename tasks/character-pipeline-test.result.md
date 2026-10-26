# Character pipeline test — complete isolated experiment, awaiting review

## What was built
- Preview: http://localhost:8811/character-pipeline-test.html on area/character-pipeline-test. One small plaza has **12 residents plus Pavi and Siri (14 actors)**, using the game's existing code-built bodies with the old head children hidden and new heads attached to the same head joints.
- Pavi uses the supplied frozen hero data exactly: 258,816 points; SHA-256 matches the source manifest. No hero regeneration, reference rebake or shape stretching.
- All twelve supplied resident identities are loaded from their saved files; no random runtime generation. Siri has no dedicated face in the supplied package, so her test slot explicitly borrows town-202. This is provisional, not a replacement for her approved appearance. Pavi/Siri bodies use the existing code-built fallback outfits, not altered GLB meshes.
- Faces toggle between original game heads and pipeline heads on identical bodies. Full / quarter / eighth detail, day/night, group/Pavi/Siri/resident views, orbit/zoom, and optional gentle head turns. H hides controls. Head turns are driven by step(dt); facial blink/gaze/expression animation is not implemented by the source package.
- Three.js GPU points share real scene depth (no screen overlay). Display RGB is converted once to linear attributes; unlit head colors avoid double-lighting the baked hero. Night uses a simple tint. No new libraries or packages.
- Original world, camera IDs, character definitions, GLBs and all styles are unchanged. Source pipeline folder was read/copied only. Copies/provenance under world/assets/characters/pipeline-test/; no reference images or authoring tools copied.

## Verification
- Full existing-world suite: **2015 checks + 2 startup reload checks passed**, all 31 suites, no browser errors. Evidence: world/tests/character-pipeline-test-full.txt.
- Focused experiment: **94 checks passed**, no browser errors. Counts, unique slots, all nine semantic parts at every point budget, exact hero checksum, reversible original heads, head attachment and actual rendered foreground occlusion verified. No sound system is created by this page; tests never start sound.
- Eight day/night pictures: character-pipeline-test-{group,pavi,siri,town-202}-{day,night}.png. Two same-pose Pavi comparisons: character-pipeline-test-pavi-{original,pipeline}.png, plus the initial smoke image.
- Test views use simple animated-film-like Lambert bodies/ACES lighting; they do not run the main world's Film/oil/watercolour post-processing stack. Full-world post-filter/rig integration is a later task, not claimed here.
- Test driver: node world/tests/character-pipeline-test.cjs. Tests used 1440x900 headless Chrome on NVIDIA GeForce RTX 5060 Ti, synchronized CPU+GPU render latency with gl.finish, 8 warm-up + 45 measured renders per case. These are render latencies, not claimed live FPS or mobile/full-world benchmarks.

| Mode / actors | Displayed head points | Draw calls | Median / p95 ms |
| --- | ---: | ---: | ---: |
| Original heads / 14 | 0 pipeline points | 222 | 0.7 / 1.1 |
| Quarter / 1 | 25,438 | 33 | 0.6 / 0.7 |
| Quarter / 5 | 187,917 | 77 | 0.5 / 0.9 |
| Quarter / 10 | 341,552 | 134 | 0.5 / 0.9 |
| Quarter / 14 | 461,013 | 180 | 0.6 / 1.0 |
| Full / 14 | 1,844,030 | 180 | 0.5 / 0.7 |
| Eighth / 14 | 230,509 | 180 | 0.5 / 0.7 |

Small differences are noisy; this does not establish that full detail is faster than quarter detail. The final focused capture ran after the full suite exited, with no other diagnostic browser running.

## Cost and recommendation
- **Worth continuing as a character design/profile pipeline; not ready for automatic town-wide replacement.** Pavi has recognisable face/jaw/nose structure beyond the old round head; residents visibly vary. Hair and point surfaces still have close-up artifacts, especially reduced-detail or side views, and require visual review.
- Unique head payload: **34.17 MB**, 1,708,599 points. Displayed totals include Siri's reused town-202. Quarter/eighth modes currently reduce GPU point counts, not downloads: all full files are still fetched for A/B testing.
- Decoded head arrays: **27.34 MB**. All three cached geometry levels: **56.38 MB CPU arrays**, plus GPU copies for uploaded geometry. Browser reports ~5.97 MB JavaScript heap and **101.0 MB backing storage** after GC; the small heap value alone is not total memory. Existing GLBs/other buffers are included in backing storage, not just new heads.
- Whole experiment transferred **58.46 MB** locally, including **22.71 MB of existing Pavi/Siri GLBs** loaded by the unchanged character module even though the test uses code-built bodies. Ready in 661ms on local storage/localhost; not a network-download guarantee.
- Before wider rollout: approve silhouettes and a dedicated Siri identity; pre-export smaller runtime LODs instead of fetching all full sources; evaluate a closed mesh/optimized surface alternative for close-up hair/skin; fit the original GLB bodies if desired; add proper eyelid/gaze/expression rigging; test lighting/post-filters and the complete world on target devices. No claim of CPU-only rendering, final art acceptance or full-game crowd performance.

## Handoff
- Isolated test task complete. No default-world face replacement performed. No further experiments started; earlier forest WIP remains separate.
- All work/evidence committed on the task branch. No merge, push, upload or publication. Source package untouched.
