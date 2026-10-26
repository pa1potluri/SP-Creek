# Solid residents — verification in progress

User correction applied: pedestrians use simple opaque mesh faces and closed hair volumes, not point samples. Saved profile proportions, colours, eye/nose/ear/mouth sizes and rough short/curly/bob/long hair variations drive the meshes. Pavi's detailed point face is unchanged; original Siri remains in the actual game.

Implemented one shared-material, vertex-coloured mesh per resident, cached per profile and cloned at original head joints. Removed resident .bin downloads from both preview and opt-in game. Runtime manifest is 27,451 bytes; the only requested head binary is Pavi (5,176,320 bytes). Earlier resident .bin files remain on disk solely for rollback/provenance and are not fetched.

Focused checks: 44 passed, zero browser errors. All 13 solid test slots (12 residents plus provisional Siri test slot) have no Points objects, opaque materials, and face/hair coverage from 24 directions. Actual-game test uses all twelve resident IDs, walks a pedestrian over one metre, keeps head attachment/audio lock, and requests zero resident point binaries. All seven styles render without errors. Pavi hero binary checksum still equals the frozen source.

Saved six preview day/night views (group, Pavi, town-202), three side/back rotations (90/180/270), and Film gameplay day/night frames under world/tests/solid-residents-*.png. Close-up mode temporarily hides other test actors so neighboring heads cannot obstruct the turning inspection; Everyone restores all 14.

Final full suite is running in solid-residents-full.txt after mesh batching. Do not mark done until final exit/counts are saved. Earlier full pass preceded batching and is not claimed as the final run. No source package, hero records, GLB files, main.js, camera IDs or showroom changed.

Next: confirm final full-suite result, update user-facing links/results, commit everything. No further resident detail or point-density experiments; target rough walking background characters for the user's YouTube review. Broader Pavi body/rig work, resident persistence and other task 52 work remain separate. Never push/merge/publish.
