# Approved profiles — first actual-game integration

User approved the supplied characters/pipeline phases on 26 October 2026. Generated locally with `node world/tests/build-game-profiles.cjs` from the unchanged pipeline-test source assets. 12 resident files retain every fourth source record; Pavi retains every original hero record/color. No image rebake, shape regeneration or source-package edit.

Runtime manifest records source/output counts, stride, skin color and SHA-256. Total binary download: 12,425,340 bytes versus 34,171,980 bytes in the full isolated source set. Runtime reuses geometry/materials across matching profiles. These are 3D GPU points, not a CPU-only or facial-rig solution.

Enable only at `/?characterFaces=pipeline`; ordinary URL preserves old characters and does not fetch this data. Siri remains her original model. Pavi uses the existing code-built star body/rig for this first pass; original GLB files remain untouched. Full default rollout is WIP pending all-style, rig-fit, persistence and full-suite validation.

## v01 refresh
Re-exported from updated package 1.1 resident sources; new binary total is 15,419,020 bytes. Full hero remains unchanged; residents still retain every fourth source record. The 12,425,340-byte figure above describes the earlier checkpoint, not this version. Current rollout/verification remains WIP; see tasks/character-pipeline-v01.result.md.

## Current solid-pedestrian export
The active manifest now embeds twelve compact solid-head parameter profiles, not resident point records. It is 27,451 bytes; only the unchanged Pavi .bin (5,176,320 bytes) is requested. Older town-*.bin files remain for rollback, unused by the runtime. Build command is unchanged. See tasks/solid-residents.result.md; no default/main rollout or publication is implied.
