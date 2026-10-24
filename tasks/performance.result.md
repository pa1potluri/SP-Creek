# Performance - WIP

## Checkpoint
- Branch area/performance stacked from cafe completion fa1d96e (includes startup fix 2bbec71).
- Read AGENTS.md, QUEUE.md, BLUEPRINT.md and performance scope.
- Measuring unchanged baseline: 1920x1080 Animated film, every clip of Grand tour and Episodes 1/2/3/5, 0.9-second warm-up then 2.5-second live frame samples per clip. Seeded initial randomness, same browser/settings for before/after.
- All areas loaded, including a benchmark-only explicit camping factory and pose callback. This does not wire deferred camping into production. Episode 4 remains deferred.
- Baseline saved in world/tests/performance-before.json: overall 59.37 fps; Grand tour 59.15, Episode 1 59.95, Episode 2 59.95, Episode 3 58.25, Episode 5 59.95. Widest town sample 50.36 fps, train minimum 53.16. GPU: NVIDIA RTX 5060 Ti (ANGLE D3D11).
- Built: rigid animal sibling meshes merged by material without merging moving joints; painted grass/flowers retain exact size within 100m and gently shrink over 100-180m; meadow sparkle terrain heights cached until terrainRevision changes; only distant off-frustum forest/meadow/farm updates skipped, with broad bounds and near-camera override. Positions remain functions of world time on return; walkers/train/stateful life keep updating.
- main.js edits are only two conditions in step(dt). No camping integration or audio-listener change.
- After benchmark running; first sample 59.95 fps, meadow update cost reduced from about 0.28ms/frame to 0.04ms/frame. Farm mesh count 238 to 161. Pending: complete after report, previews and full suite.
- Never merge to main, push or publish. Stop after 30; 31 is not before Oct 29.
