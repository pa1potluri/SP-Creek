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
