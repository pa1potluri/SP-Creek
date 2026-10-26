# Saved road surface fit — WIP
## Done
- Reproduced saved-road triangles buried beneath rendered terrain on sloped test routes (minimum clearance -0.683m / -2.685m; 74 / 180 buried samples). Save/input alone was not the issue.
- User-road creation, restored/rebuilt roads and live preview now use existing rendered-ground sampling, with across-width/length subdivisions. Built-in paths and serialized road points/width are unchanged.
- Four focused routes now have zero buried samples (103,360 samples total); minimum measured positive clearance 0.00114m. Diagnostic JSON and script in world/tests/road-surface-*.
- Updated legacy Build test to expect rendered-ground vertex height rather than analytic height. Recorded Balloon Hill reference and task; no Balloon Hill implementation claimed.
## Left / stopped
- Full suite rerun in progress after original run exposed the obsolete height assertion. Do not mark done until the complete result is inspected.
- Film high/low day/night diagnostic captures saved as road-surface-fit-{high,low}-{day,night}.png. Initial camera placement was obstructed; capture script corrected and rerun. Inspect all captures before accepting visual evidence.
- Need broader widths/curves, terrain edit/rebuild and save/reload regression plus seven-style visual checks. Dense geometry is restricted to user roads; check long-road cost. Narrow positive sample margin does not prove every terrain crease is clear.
- Current branch area/road-surface-fit. Next: finish verification / any residual clipping, full-suite result, then return to meadow dock and remaining queue. Never push or merge.

## Full-suite checkpoint
Required full rerun completed successfully (31 suites, 2015 + 2 startup checks; Browser errors: []). Road repair remains WIP for the broader angle/style/save-reload checks listed above.
