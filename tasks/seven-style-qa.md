# Seven-style visual QA — user review board
Queued reference: codex-clipboard-a4a6878f-c0ba-48ea-8c98-cc473ae719f2.png, 26 October 2026. Treat annotations as reported observations to verify at identical scene/time/camera, not confirmed causes.
- Oil: brush distortion of signs/edges; dark foreground detail; retain intentional painterly character.
- Film: excessive depth-of-field blur and bloom reducing signage; keep featured characters/church in focus.
- Blocky: consistent block geometry/scale; ground texture should complement toy forms. Coordinate task 76.
- Clean 3D: repetitive ground, small characters, road/landmark balance.
- Paper: even layered edges/shadows, legible signs/props and consistent cut-paper depth.
- Pixel: consistent pixel grid/scale and palette, readable signage. Do not smooth away intentional pixel shapes.
- Watercolour: wash/blur weakens building definition and local contrast around road/cast; preserve watercolour texture and readable landmarks.
Shared priorities visible on board: camera/readability first, style integrity second. Retain all prior scene corrections. Scope proposal: styles.js/painterly.js style-specific settings, relevant camera/material helpers only after diagnosis; focused same-view comparisons, full suite and Film day/night before done. No global one-filter treatment that makes all styles look the same.

## User implementation order and evidence rule
- P1 — Camera and readability: framing, road proportions and landmark visibility.
- P2 — Style consistency: preserve each style while keeping buildings, characters and signs recognisable.
- P3 — Materials and lighting: textures, shadows, blur, bloom and atmospheric contrast.
- P4 — Regression: compare all seven styles at the same camera position and viewport. Hold world time, scene state and weather constant for meaningful comparisons.
Annotations are visual-review findings, not confirmed code defects. Verify each reported issue in the running application before changing assets or rendering logic. Record reproduced conditions, diagnosis, change and same-view before/after evidence; leave unconfirmed findings explicitly unconfirmed. Do not infer a shader/asset defect merely from a review arrow.
This order governs the visual correction passes; immediate functional failures such as road creation and character clearance remain tracked separately. No visual fix is claimed by this documentation update.
