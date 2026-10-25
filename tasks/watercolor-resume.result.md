# Watercolour preview resume — complete

- Branch: `area/watercolor-resume`, stacked from `area/self-review-2` at b046535. User explicitly lifted the Thursday wait. No merge, push or publication. Stopped after task 31.

## Built

- Optional **Watercolour (preview)** art style, demonstrated first at Sunset Cove in golden-hour light. Animated film remains the fresh-start default; no video preset selects Watercolour.
- Clean textures, painted plants, pastel washes, pigment edges, static paper tooth and blooms. Three style-only sliders (wash softness, edge pigment, paper texture) use existing project save/load.
- Smaller non-wobbling base brush and colour/depth-aware wash weights preserve character silhouettes. Original character models/assets, camera IDs and preset IDs are unchanged.
- App changes stay in styles.js, painterly.js, main.js style uniforms and index.html controls. Existing six style definitions and five old Look shader paths remain unchanged.

## Checked

- **Full suite: 1773 passed + 2 startup reload checks, all 26 suites, exit 0, browser errors []**, on localhost:8811. Per-suite counts: `world/tests/watercolor-resume-full.json`.
- Includes **25 final Watercolour checks**: original style definitions, byte-identical fixed-buffer output from all five existing Look modes, optional preview label, controls, project round-trip, golden/night rendering and sound still locked.
- Final capture proof in `world/tests/watercolor-resume-check.json`: fresh default film; same world time/pose for each comparison; sound locked; no browser errors; frozen Watercolour screenshots byte-identical 400 ms apart.
- Appending a seventh style exposed two Build test fixture assumptions: Pixel was last, and six iterations accumulated pi rotation. Fixture cleanup now uses the actual final style; rotation expectation uses the actual style count. App placement/rotation code unchanged. Final Build suite: **583 passed**.

## Preview screenshots

- Existing Cove shots **39 and 40**: `world/tests/watercolor-resume-<shot>-day.png` and `-night.png` in Animated film; `-oil-day.png` / `-oil-night.png`; `-watercolor-day.png` / `-watercolor-night.png`. **12 raw captures**, all inspected.
- Matched-pose comparison sheets: `world/tests/watercolor-resume-39-comparison.png` and `watercolor-resume-40-comparison.png`. Soft golden-hour washes; original faces readable; night remains visible and calm.

## Remaining / review notes

- No unfinished task 31 implementation or verification. Historical task 8 WIP is superseded by this completed preview.
- Inherited navy strip along the Cove night waterline appears in Film, Oil and Watercolour; already recorded in STUCK.md during task 39. No global renderer changes made for it.
- Claude review remains required. Queue updated; no further task started.
