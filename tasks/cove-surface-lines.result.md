# Q15 / task 75 — Cove surface lines: WIP checkpoint

Saved 28 October 2026 on area/quick-15-cove-edges, parent f545a23. NOT done or visually accepted.

## Done so far
- Reproduced thin sea/sand lines in Blocky/Toy at the beach-walk camera; Clean 3D comparison did not show those lines. This differs from the old task59 mountain/night-band defect.
- Sand mesh now copies the smooth underlying ground normals: before min dot .9158054 and172 vertices below .98; after min dot .99999994 and0 mismatches across3294 vertices.
- Local Cove sea now writes opaque surface depth; sand writes depth; sky panorama and reflected-panorama horizontal fade widened. Other river/lake materials were not intentionally changed.
- All source edits preserved unchanged in this handover. These are candidate repairs, not completed acceptance.

## Checks / evidence
- quick-15-cove.cjs before/probe/after completed. After JSON: errors[], audioLocked true, identical camera/time across all7 styles within that run.
- world/tests/quick-15-{before,probe,after}-{film,clean,oil,toy,paper,pixel,watercolor}-beach-day.png plus Film beach/above night; corresponding JSON and diagnostic script saved.
- Probe only disabled sand/shore shadow casting at runtime. Lines remained; source shadow casting was NOT disabled. Do not claim shadow casting is the diagnosed cause.
- No full-suite run on Q15. Last completed parent Q14:31 suites,2015 +2 startup, no browser errors. Parent results do not validate this changed code.

## Left / exact restart
1. Inspect final after screenshots: their final visual review was interrupted by context exhaustion. Compare with baseline, especially sand diagonal near Siri, sea line and right-side sky blend; images are not proof of acceptance by themselves.
2. In areas/sunset-cove.js sand.onBeforeCompile, diffuseColor.a<.01 is currently tested at clipping_planes_fragment BEFORE vertex alpha is applied. Evaluate moving that alpha discard after color_fragment so transparent fade pixels do not write invisible depth. Keep geometric shoreline discard at clipping. This is a known implementation concern, not a verified runtime error.
3. Add/verify focused sea/sand depth flags, all7 styles, dry paths/piers/boat visibility and night views. Recheck cached shader variants as needed.
4. Once stable, run full suite once, save required Film day/night evidence and Oil/style comparisons, update this result and tick Q15 only if acceptance passes. Otherwise record remaining defects in STUCK.md.
5. Then Q16 per QUICK-FIX-ORDER.md. Coastal task89/Q20 roof/window/hillside art is still separate WIP.

No push, merge, upload or publication. No new tests run for the documentation handover.
