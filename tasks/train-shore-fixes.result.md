# Train / shoreline repair result

## Built
- Station porch and platform previously overlapped along a 5cm strip at exactly y=0.35. Platform now meets the porch at x=63.25, retaining the outer edge, deck height and matching walking floor.
- Separated the branch railway bed from the original gravel ribbon (4cm), and branch rail/tie surfaces from the original junction (3cm). Removes coplanar/depth competition at the shared station junction without changing the train route or camera IDs. This targets the diagnosed flicker sources, not every possible graphics-driver shimmer.
- Root cause of the long-standing Cove night band found by raycasting the WHOLE scene: the nearest valley mountain ring (radius 360m) intersects the beach near x=-359, y~0.9, in front of the actual sand and water. At night the main scene shows these mountain silhouettes. This was not missing sand texture.
- Cove update hides the three procedural valley mountain layers only while the camera is west of -280, preserving and restoring each layer's visibility on leaving. The sea panorama and live night sky remain. No sand-height/water-shader probes retained.

## Checked
- Localhost 8811 game and watercolour showcase returned HTTP 200 when the user reported downtime. No outage was reproduced; server left running.
- Twelve Film views: shots 11,12,56,57,58,40 in day/night, saved as world/tests/train-shore-fixes-<shot>-day.png / -night.png. Station, train boarding and beach-night images inspected; the navy strip is absent in the final beach image.
- Focused test: 600 motion steps across five train views, finite camera positions, zero browser errors; Cove mountain hiding and restoration verified (3 layers); sound locked. Evidence train-shore-fixes-check.json. This is not a quantitative temporal-flicker measurement.
- Before-band evidence: world/tests/train-shore-before.png.
- Full suite: 2015 + 2 startup checks passed, all 31 suites, exit 0, browser errors []. No new camera definitions, assets, dependencies, push or merge.

## Remaining
- Both requested repairs saved; awaiting lead/user visual review. Character fit/default rollout, forest roots and picnic composition are separate existing work.

