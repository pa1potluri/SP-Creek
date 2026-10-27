# Q14 UI review — WIP, baseline only
Branch area/quick-14-ui from playground2191b1f. No application source changed for this task yet.
Read task77 and its earlier result. Old readability-ui.cjs assumes the pre-kids menu, so do not treat its hidden gameplay button assertion as a current defect: friendly mode uses the Play tab; Studio exposes original controls.

## Baseline completed
- Current friendly world and Studio at1600x900,1024x768,768x1024: six layouts captured in quick-14-baseline-{world,studio}-{width}.png.
-0 horizontal page overflow in all six cases. Style buttons36px high. Friendly world shows all6 main tabs plus Free camera; Studio exposes Gameplay/Auto/Free/Pause/Brush/Build and hides the friendly header intentionally.
- No page errors; audio context remains locked. Script/report quick-14-ui-baseline.cjs / quick-14-baseline.json.
- No new full-suite run for this investigation-only WIP. Parent2191b1f app state passed2015+2; source unchanged here.

## Exact stop / remaining
Verify style-strip horizontal keyboard/focus access, Create/Build dock/category scroll and popover overlap at these viewports, Studio side-panel hierarchy, all control transitions and saved style selection. Modify only reproduced issues, using task77 permitted files; do not invent a competing navigation layer. Current six-tab layout supersedes historical screenshots.
Sky/bridge/character composition portions of task77 remain separate scene work, not fixed by this UI baseline. Write final full-suite/day-night evidence and result before ticking Q14. No push/merge/publish.
