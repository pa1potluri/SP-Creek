# Supplied kids UI artwork integration
WIP follow-up to task 31a; branch area/kids-ui-art.
All 13 supplied PNGs registered in world/assets/ui/index.json: logo, six main-tab icons and six categories. No avatar or piece PNGs supplied; friendly avatar and generated 3D piece snapshots remain fallbacks. User originals preserved unchanged.
Checks: kids-ui.cjs rerun, 21 passed with no page/console/resource errors and sound locked; tab/tablet/Film day-night screenshots refreshed. Full suite not rerun for this artwork-only integration; inherited market-spacing WIP also needs its full regression before completion.
Known artwork issue: PNG headers all use RGB colour type 2. System.Drawing confirms Home is Format24bppRgb, background pixels opaque A=255 with white/grey checkerboard baked in (1254x1254). The checkerboard will show, not act as transparency. Final icons need RGBA transparent exports; no background-removal/repainting performed. Do not call final artwork visually accepted yet.
Next: replace supplied files with true transparent PNGs when available, verify all 13 image elements loaded and compare the menu to the design. Preserve all game/tool functionality. No merge/push/publish.
