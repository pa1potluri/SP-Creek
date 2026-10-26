# Character pipeline test — direct user request, 26 October 2026

Create one isolated scene using the supplied Character-Pipeline-Setup heads on existing cartoon bodies: 12 saved residents plus Pavi and Siri. Preserve the default world and original character implementation. Hero head must use the frozen supplied data, not regenerated colors. Siri has no dedicated supplied profile: use an explicitly labelled provisional resident profile in the test only. Compare appearance and measured load/frame/memory cost before any wider rollout. Budget-conscious, no new libraries or publication.

Scope: world/character-pipeline-test.html; world/src/experiments/{character-pipeline-test.js,point-data.mjs}; copied runtime data/profiles under world/assets/characters/pipeline-test/; world/tests test/capture artifacts; task/result/QUEUE metadata. Do not edit main.js, characters.js, default shots, presets, showroom or the source package outside this repository.

Checks: baseline/current heads versus pipeline on identical bodies/camera; all 14 actors present; exact packed asset counts, deterministic decimation, all parts retained, world depth occlusion, day/night, hero/resident views, point/draw/frame/heap measurements. Full existing suite once and saved day/night previews before done. No tests start sound; no push/merge/upload.
