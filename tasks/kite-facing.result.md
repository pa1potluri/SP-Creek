# Kite Day repair result — WIP checkpoint
Branch area/kite-facing, stacked after verified menu-spacing 3d769ad.

## Reproduced / built
- Runtime baseline: all five actors faced away from assigned kites in 80 samples (shots 86/87/88/93, t=0/20/40/60); minimum facing dot -0.999506. Baseline summary saved.
- Each actor now faces their actual assigned kite position; gentle upward head angle, friends in a separate back row, arms aimed at string grips. Current measured minimum facing dot ~1.0; zero wrong-facing samples.
- Larger 1.35x kite sails/tails, brighter distinct static colours, restrained emissive fill and cream edge trim. Strings raised to the intended hand-grip height. No flashing or global saturation change.
- Reframed existing kite views to keep enlarged sails below the top menu, preserving all IDs. Day view 87 visually inspected; all five sails are visible.

## Checked / stop point
- kite-picnic 33 + episode-presets-3 35 passed; no browser errors. Existing deterministic seeking/all-style checks pass.
- 80 directional samples pass; Film day/night captures of 86/87/88/93 and a Watercolour comparison saved in world/tests/kite-facing-*.png. No test starts sound.
- Full 31-suite regression currently running; record counts when complete. Keep task WIP because the expanded festival review includes more than facing/colour.

## Left
- Platform terrain blending/ground detail, path access, flower density/clear walking corridors, waterfall/pond/bridge connections, distant cabin/tree depth, and full navigability audit remain open.
- Weather finding: ready-made Kite Day already specifies rain=0 and applyVideoPreset resets weather to auto. Direct camera changes intentionally retain manually selected weather. Need reproduce the reported unexpected festival rain before changing atmosphere logic; no global/manual-weather override added.
- Broader actor clearance remains task 64 WIP; standing-row separation is not a universal collision system. No merge/push/publish.

## Verified checkpoint — 27 October
Full 31 suites passed: 2015 + 2 startup reload checks, no browser errors (kite-facing-full.txt). Directional regression passes all 80 samples; 68 targeted legacy checks passed. Four authored views have Film day/night captures and the Watercolour comparison is saved. Task stays WIP for the expanded P2/P3 and weather-reproduction items above. Next implementation step: inspect the raised visual festival platform against walkHeight, then blend its ground/path transitions without adding invisible collision edges. No further code changes after these checks.

Platform/path continuation: visual disc removed in favour of actual meadow ground; feet reduced from 0.98m to walkHeight + 0.04m, two trail links, locally cleared flower corridors. 84 route samples unobstructed; 80 facing samples still correct; full 2015 + 2 passed. See kite-platform.result.md and kite-platform-full.txt. Expanded festival remains WIP for water/depth/material/weather items.
