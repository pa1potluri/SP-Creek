# SP Creek code audit: `world/src/`

Date: 2026-10-29. Read-only audit; no app code was changed. Scope: things that can throw or freeze,
GPU memory leaks, per-frame allocations in the `step(dt)` path, breaks in determinism, and
accessibility of the kids menu (`kids-ui.js`, `index.html`, `style.css`). `world/src/showroom/`
was not reviewed (another project).

Findings are ordered most severe first. Each has: **where**, **why it matters**, **small fix**.
Line numbers are from the current branch head.

---

## High

### 1. A bad saved layout stops the whole app from starting
- **Where:** `world/src/main.js:171` (`world.loadLayout(LS.get('dh.layout') || [])` at module top
  level), `world/src/world.js:1983` (`makeBuilding` throws `Unknown building type`),
  `world/src/world.js:1856` (`layout.map(...)`).
- **Why:** if `localStorage['dh.layout']` holds a building type that no longer exists (renamed or
  removed piece, a layout saved by another branch) or anything that is not an array, the throw
  happens while `main.js` is still being evaluated. Nothing after line 171 runs: no frame loop, no
  UI, and the loading screen stays forever. The only way out is clearing site data by hand. The
  same throw during `loadProject` (`main.js:825`) leaves a half-loaded world, because the old
  layout has already been cleared.
- **Fix:** in `loadLayout`, use `Array.isArray(layout) ? layout : []` and wrap each
  `placeBuilding` / `addRoad` / `addFence` / `placeProp` call in `try { … } catch (err) {
  console.warn('Skipped layout item', e, err); }`. That keeps every good item and drops only the
  broken one. Also wrap the startup call at `main.js:171` so a failure falls back to an empty
  layout.

### 2. Animation uses `Math.random`, so renders are not repeatable
AGENTS.md says to "keep renders deterministic (everything driven by the world time in `step(dt)`)".
These calls run inside `step(dt)` and change what is on screen:
- **Where (during `step`):**
  - `world/src/life.js:323, 332, 345` (horses choose wander targets), `434, 447–448` (walkers choose
    targets), `489, 503, 510` (wait and sit times), `786, 791` (who starts chatting),
    `1164–1165, 1180, 1195–1210` (chickens, tumbleweeds, shoppers). All use `R = Math.random`
    (`life.js:22`).
  - `world/src/atmosphere.js:356–361` (`_emit`: every chimney smoke and campfire ember puff).
- **Where (at build or load time, so they differ between page loads):**
  - `world/src/world.js:1709, 1712`: a placed `tree` gets a random shape and scale, and a placed
    `rock` gets a random size. `layout()` (`world.js:1844`) saves only `type, x, z, yaw`, so after a
    reload the user's own tree or rock **looks different** from what they placed.
  - `world/src/world.js:1699` (campfire flicker phase), `world/src/characters.js:13` (outfits,
    blink timing), `world/src/interior.js:232`, `world/src/atmosphere.js:109–110, 129, 230–231`
    (dust, fireflies, rain, birds).
- **Why:** the same timeline rendered twice gives two different videos (townsfolk walk elsewhere,
  smoke puffs differ), which breaks re-renders and side-by-side comparison screenshots in tests.
  Placed props also do not survive a reload exactly as placed.
- **Fix:** add one tiny seeded PRNG module (for example `world/src/rng.js` exporting
  `random()` from mulberry32 plus `reseed(n)`). Replace `Math.random` with it in the files above,
  and call `reseed(…)` at startup and at the start of `renderVideo` (`main.js:875`). For trees and
  rocks, derive the variant from a hash of `(x, z)` so it is stable without changing the saved
  layout format. Note: the town simulation also integrates `dt` from whatever state the live view
  left it in, so a fully repeatable export also needs a "reset life to its start state" step
  before rendering. That can be a separate task.
- **Lower priority, same cause:** `world/src/ambience.js:30, 48–49, 121, 168–185, 255–354` (bird
  calls, owl, splashes, music notes) make each exported soundtrack different. Use the same PRNG.

### 3. Pressing Space on a kids-menu button freezes the world instead of pressing the button
- **Where:** `world/src/main.js:997–1011` (global `keydown`). Only `input, select, textarea` are
  skipped (`main.js:998`).
- **Why:** keyboard users press Space to activate a focused button. Here `keydown` Space calls
  `preventDefault()` and `toggleFreeze()`, which also cancels the button's click, so the kids menu
  cannot be used with Space. With a button focused, `G` also starts gameplay, `H` hides all menus,
  `Delete` deletes the selected building and digits jump between shots.
- **Fix:** at the top of the handler, return when the event comes from a control:
  `if (e.target.closest?.('button, a, [role="button"], dialog, #kidsUI')) return;` (or skip only
  Space, Enter and Delete for buttons, if the single-letter shortcuts should keep working).

---

## Medium

### 4. Kids menu tab labels are too low in contrast
- **Where:** `world/style.css:183–190` (white text on the tab gradients).
- **Why:** measured WCAG contrast of white text: Home 1.72 (top) / 2.82 (bottom), Play 1.64 / 2.77,
  Watch 1.88 / 3.76, Settings 1.54 / 2.89, Help 1.79 / 3.13. The labels are 19px bold (large
  text, needs 3:1), and drop to 16px under 1100px wide (normal text, needs 4.5:1). The text shadow
  helps a little but does not count. Young readers and anyone on a bright tablet screen will find
  these hard to read. The Create tab (dark brown text) passes at 5.1–7.8.
- **Fix:** use the Create tab's approach: dark text (for example `#2f3b2a` or `#3b2a4a`) on the
  light gradients, or darken the gradients' top colours enough to get white text to 3:1 at 19px
  (4.5:1 under 1100px).
- **Also:** the focus ring `#355f8b` is only 2.36:1 against the green Home tab, and the active-tab
  outline `#ffe08a` is 1.34:1 against `#a0d477`. Use a two-colour ring, for example
  `outline: 4px solid #fff; box-shadow: 0 0 0 7px #355f8b`.

### 5. Removed props never free their GPU memory
- **Where:** `world/src/world.js:1817–1836` (`_remove`), reached from `undo()`, `clearPlaced()`
  and `loadLayout()` (so on every project load and at startup).
- **Why:** `makeProp` builds new geometries per prop (for example `new
  THREE.DodecahedronGeometry` for rocks at `world.js:1712`, barrel cylinders and tori,
  `world.js:1642–1644`). `placeCutout` (`world.js:1798–1815`) makes a new `PlaneGeometry`,
  `MeshLambertMaterial` and `MeshDepthMaterial`. `_remove` only takes the object out of the scene.
  The GPU buffers and compiled material stay until the tab closes, so repeated place/undo or
  project loads slowly fill GPU memory (which matters during long video exports).
- **Fix:** at the end of `_remove`, traverse `entry.obj` and dispose each mesh's geometry
  **unless it is shared** (`this.treeGeos.includes(geo)`). For cutouts, also dispose `obj.material`
  and `obj.customDepthMaterial`. Leave shared `this.mat.*` materials alone.

### 6. Town life allocates and does O(n²) work every frame
- **Where:** `world/src/life.js:1105–1123`.
- **Why:** every frame it spreads `walkers` and `people` into new arrays, wraps every person in a
  new `{owner, p}` object and builds a new `ambientBlocked` closure. Each call to
  `ambientBlocked` (made per walker per step, several times per step at `life.js:459–462`, and per
  sub-step for riders at `life.js:614`) loops over **all** people, calls
  `p.g.updateWorldMatrix(true, false)` (which walks up the parent chain) and spreads
  `this.riders` into a fresh array again (`life.js:1116`). With family mode and the hamlet on,
  this is the largest avoidable CPU cost per frame and makes garbage-collection stutter more
  likely in the live view.
- **Fix:** build the `people` list and the closure once (rebuild only when the cast changes).
  Once per frame, before the walkers move, copy each visible person's world x/y/z into a reused
  array. Then make `ambientBlocked` read that cache. Loop over `this.riders` and `this.coach`
  directly instead of spreading them.

### 7. Seasons walks big parts of the scene every frame
- **Where:** `world/src/seasons.js:58–65`.
- **Why:** `update` traverses every foliage group, plant instance, forest variant and the whole
  meadow-lake root, and checks every `world.surfaces` material, on **every frame**, only to call
  `hook()`. `hook()` returns at once for materials it has seen before. The work only matters when
  new materials appear.
- **Fix:** run the hooking pass only when something changed, for example when
  `world.root.children.length` or `world.terrainRevision` differs from the last pass (the same
  check `atmosphere.js:430` already uses), or once after setup plus after building and placing.

### 8. Small objects created every frame in the render path
None of these is large on its own; together they add steady garbage at 60 fps and during export.
- `world/src/atmosphere.js:437`: new `Matrix4` and `Vector3` every frame, plus **a new `Vector3`
  per light pool** (up to 256) at `atmosphere.js:441`. The pool matrices are also recomputed (with
  `walkHeight`) every frame, although they only change when scenery changes. Reuse module-level
  temporaries, and recompute pools only when `poolSources` is rebuilt or the terrain changes.
- `world/src/atmosphere.js:464`: `new THREE.Color('#f2f5e9')` **parses a colour string** every
  frame. Hoist it to a constant. Same pattern: `world/src/areas/meadow-lake.js:157`
  (`'#cce4df'`), `world/src/areas/town-center.js:249` (`'#314c6e'`), `world/src/seasons.js:68`
  (two colours, every winter frame).
- `world/src/atmosphere.js:405`: `scene.children.find(...)` every frame to find the backdrop. The
  same search runs in `world/src/areas/sunset-cove.js:129–130`. Cache the result, or have
  `placeBackdrop` (`main.js:616`) register the backdrop.
- `world/src/world.js:2255`: `new THREE.Sphere` in `areaAnimationVisible` (3 calls per frame).
  Keep a sphere in the existing `_areaView` cache.
- `world/src/camera.js:362, 370` (three `Vector3` in free-camera mode) and
  `world/src/game.js:374` (`want`): use reused temporaries like `this._look` / `this._target`.

### 9. Kids menu re-runs the full renderer resize on every scroll and class change
- **Where:** `world/src/kids-ui.js:59–60` (`panel` scroll → `resize`, `ResizeObserver`,
  `MutationObserver` on `body` class), which dispatches `window` `resize` and so calls
  `main.js:139` `resize()`.
- **Why:** `renderer.setSize` always assigns `canvas.width/height`, which clears and reallocates
  the drawing buffer even when the size is unchanged. Scrolling the Create panel fires this many
  times per second, which costs frame time and can flicker the preview.
- **Fix:** coalesce with one `requestAnimationFrame`, and in `main.js` `resize()` skip
  `renderer/sceneRT/composer.setSize` when `w` and `h` are unchanged (still update the canvas CSS
  position for the preview window).

### 10. Loading a layout with many fences or roads can freeze the page
- **Where:** `world/src/world.js:2129` (`addFence` → `updateTerrain()`), `world.js:2136`
  (`removeFence` → `updateTerrain()`), `world.js:2139–2149` (`addRoad` → `setTextureSet`), used in a
  loop by `loadLayout` (`world.js:1858–1868`) and `#clearBuilt` (`main.js:545`).
- **Why:** each `updateTerrain` re-runs every terrain vertex and every plant instance, and
  **rebuilds every road and fence** (`world.js:2222–2231`). Loading N fences is O(N²) rebuilds.
  A large saved town can lock the tab for seconds at startup.
- **Fix:** give `addFence` / `removeFence` an `update = true` parameter like `placeBuilding`
  already has, pass `false` inside `loadLayout` and `#clearBuilt`, and call `updateTerrain()` (and
  `setTextureSet`) once at the end.

---

## Low

### 11. An error in `step` leaves the loading screen up and repeats 60 times a second
- **Where:** `world/src/main.js:1123–1139` (`frame`).
- **Why:** `#loading` is hidden only after the second successful `step`. If an area's `update`
  throws (for example after a bad project load), the user sees an endless loading screen and the
  console fills with the same error every frame.
- **Fix:** wrap `step(...)` in `try/catch`. Log the first error once, still increment `frames` and
  hide `#loading`, and show `flash('Something went wrong; try reloading')`.

### 12. Unchecked `indexOf` in `splice` can remove the wrong item
- **Where:** `world/src/world.js:1832` (`this.flames.splice(this.flames.indexOf(entry.flame), 1)`).
- **Why:** if the flame was already removed, `indexOf` returns -1 and `splice(-1, 1)` removes the
  **last** flame in the world, and some other campfire stops flickering.
- **Fix:** `const i = this.flames.indexOf(entry.flame); if (i >= 0) this.flames.splice(i, 1);` (the
  pattern already used for `billboards` two lines later).

### 13. Kids menu focus and screen-reader details
- **Where / fix:**
  - `world/src/kids-ui.js:13` (`closeForWorld`): hiding the panel removes the focused button, so
    keyboard focus falls back to `<body>`. Move focus to the active `.kidsTab`.
  - `world/src/kids-ui.js:52` (`open`): when the tab changes, focus stays on the tab and screen
    readers hear nothing new. Give the panel `h1` `tabindex="-1"` and focus it after a tab change.
  - `world/src/kids-ui.js:5, 6, 56`: emoji icons in `.kidsIcon` are read aloud ("house Home",
    "video game Play"). Set `aria-hidden="true"` on `.kidsIcon`.
  - `world/src/kids-ui.js:41`: the view arrows `‹` / `›` have no accessible name. Add
    `aria-label="Previous place"` / `"Next place"`.
  - `world/src/kids-ui.js:3`: `aria-label` on the plain `<span class="kidsAvatar">` is ignored by
    most screen readers. Use `role="img"`, or `aria-hidden="true"` if it is only decoration.
  - `world/src/kids-ui.js:51`: settings `<select>` / checkbox clones copy their value once and do
    not follow later changes (for example after a project load). Re-read `src.value/checked` each
    time `settings()` opens. It already rebuilds, so this only matters if the Settings tab is left
    open during a load.

### 14. Small touch targets still visible in kids mode
- **Where:** `world/style.css:25` (`#uiToggle` 34×34), `style.css:29` (`.viewBtn` freeze and
  full-screen buttons, 34×34), `style.css:144` (`#styleBar` art-style chips, 36px tall). All three
  are moved into the kids layout by `style.css:175–178`.
- **Why:** everything else in the kids menu is 48–64px, but these are not. The ☰ button hides
  **all** menus, so a small, easily mistapped button that hides the UI is confusing for children.
- **Fix:** under `body.kids-ui:not(.kids-studio)`, set these to at least 48×48 (ideally 64 to
  match the tabs). Give `#uiToggle` and the `.viewBtn`s an `aria-label`, because a `title` alone is
  not shown on touch screens.

### 15. Rotate and Delete buttons can show the wrong enabled state
- **Where:** `world/src/kids-ui.js:40` (`actions.children[1].disabled = …`,
  `children[2].disabled = …`).
- **Why:** the state is read once when the Create page is built and never updated, so Rotate and
  Delete can stay greyed out after a building is selected, or stay enabled after it is deleted.
  Delete also acts immediately with no undo, which is harsh for a child's misclick.
- **Fix:** refresh both from `#applyBuildTransform` / `#deleteBuilding` whenever selection changes
  (for example from the same place `selectBuilding` updates those buttons, or with a
  `MutationObserver` on their `disabled` attribute). Consider a friendly "Are you sure?" step or an
  Undo toast for Delete.

### 16. Empty places list makes the preview arrows throw
- **Where:** `world/src/kids-ui.js:41`.
- **Why:** if `#placeList` has no buttons yet, `places.length` is 0, `view` becomes `NaN` and
  `places[NaN].click()` throws.
- **Fix:** `if (!places.length) return;` at the top of the handler.

### 17. The thumbnail renderer keeps a second WebGL context alive
- **Where:** `world/src/kids-ui.js:21` (`thumbRenderer ??= new THREE.WebGLRenderer(...)`).
- **Why:** it is never disposed, so the page holds two WebGL contexts, and every building material
  and texture is uploaded and compiled a second time in it. On low-memory tablets this adds GPU
  memory pressure and raises the chance of a context loss.
- **Fix:** after the queued thumbnails finish (none pending for a frame), call
  `thumbRenderer.dispose(); thumbRenderer.forceContextLoss(); thumbRenderer = null;`. The
  thumbnails are already cached as data URLs in `thumbs`.

### 18. IndexedDB connections are opened per call and never closed
- **Where:** `world/src/store.js:13–20` (`run`).
- **Why:** each `putFile` / `getFile` opens a new connection and leaves it open. This is harmless
  until a future `DB` version bump, which would then block on the open connections.
- **Fix:** `tx.oncomplete = () => { db.close(); resolve(req.result); };` (and `db.close()` in
  `onerror`), or cache one connection.

---

## Checked and fine

- `frame()` re-arms `requestAnimationFrame` before `step`, so one exception does not stop the
  loop. The live `dt` is clamped to 0.1 s, so the `while (e.acc >= 1)` emitter loop
  (`atmosphere.js:491`) cannot spin long.
- `renderVideo` restores state in `finally` (`main.js:925–936`).
- `disposeBuilding` frees building geometries, ghost materials and the per-building window
  textures. Roads, fences, the backdrop and the selection box are disposed when replaced.
- Merged and batched geometries in the area modules dispose their source pieces.
- Kids menu text inside the panel passes contrast (5.0–8.5:1). Panel buttons are at least 64px,
  the asset dialog uses a native `<dialog>` (Escape closes it), and `:focus-visible` rings exist
  for the panel and header buttons.
- No test starts sound (it only starts from a real click), and none of the findings above touches
  `world/src/showroom/`.
