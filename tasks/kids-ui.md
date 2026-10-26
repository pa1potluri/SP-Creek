# Task: kid-friendly menu ("Create Your World") (branch `area/kids-ui`)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch from the tip of the branch you just finished. Never push, merge or publish.

**Reference:** `tasks/ref/kids-ui.webp` (the user's design). Build this look as the new main menu, over the 3D world.

## Layout (match the reference)
- **Top bar:** wooden "SP Creek" sign (logo, top-left) and big rounded candy buttons with an icon + word:
  **Home, Create, Play, Watch, Settings, Help**, and a round avatar on the right. The active button is highlighted (glow).
- **Create panel** (soft cream card with rounded corners): title "Create Your World ✨" and "Build, decorate, and bring SP Creek to life!".
  - Left: category pills **Buildings, Nature, Characters, Props, Roads, Style**.
  - Middle: a grid of big picture cards for the pieces in that category (Town Hall, House, Shop, Farm, Train Station, Church...).
    These are the existing **Build mode** pieces, grouped into the six categories.
  - Right: a live preview of the 3D world (the real canvas view) with ‹ › arrows to change view, and three big buttons:
    **+ Place** (green), **Rotate** (blue), **Delete** (red). They call the existing Build mode place / rotate / remove.
- **Other tabs** reuse what exists: **Play** = Play mode, **Watch** = the ready-made videos (episodes as big picture cards),
  **Settings** = art style, mood, season, weather, sound volumes, family mode, **Help** = a friendly picture guide, **Home** = a calm
  start screen with the world behind.
- The old developer panel stays available behind a small "Studio" button in Settings (for Claude and the user), so nothing is lost.

## Style
Bright, soft, rounded, child-friendly (big touch targets, at least 64 px); warm cream cards, candy colours, soft shadows, a playful
rounded font that is already on the computer or bundled locally (works offline, no CDN). Icons: use the PNGs in
`world/assets/ui/` if the user has added them (names below); otherwise simple drawn placeholders. Works at 1280×720 and on a
tablet (touch). Hide all menus with H for recording (as now).

Icon names (transparent PNG): `logo.png, home.png, create.png, play.png, watch.png, settings.png, help.png, avatar.png,
cat_buildings.png, cat_nature.png, cat_characters.png, cat_props.png, cat_roads.png, cat_style.png`, and piece cards
`piece_<build-piece-name>.png` (fallback: render a small 3D snapshot of the piece automatically).

## Files you may change
`world/index.html`, `world/style.css`, new `world/src/kids-ui.js`, `world/src/main.js` (wiring only), `world/assets/ui/`,
`world/tests/` (one new test: every tab opens, Place/Rotate/Delete work, the studio panel is still reachable, no console errors).

## Check
Full suite; screenshots of each tab (`world/tests/kids-ui-<tab>.png`); result file `tasks/kids-ui.result.md`; then continue the queue.
