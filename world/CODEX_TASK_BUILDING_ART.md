# Task for Codex: painted walls, windows and doors for Build-mode buildings

Follow-up to `CODEX_TASK_BUILD_MODE.md` / `CODEX_RESULT_BUILD_MODE.md` (your Build mode). Same
project, same rules (run with `python serve_world.py 8810`, no build step, match the code style,
don't touch `world/src/showroom/`, don't renumber shots or presets, don't change the existing town).

## New ChatGPT-painted images (already in the project)

In both `world/assets/textures/oil/` and `world/assets/textures/clean/`:

| File | What | Notes |
|---|---|---|
| `barn_boards.png` | red board-and-batten barn wood | 1254² seamless tile, RGB |
| `chapel_boards.png` | whitewashed clapboard | 1254² seamless tile, RGB |
| `house_boards.png` | pale neutral warm-grey clapboard | 1254² seamless tile, RGB, made light so it can be tinted |
| `window.png` | one window, white frame, warm glow, curtain | 1024×1536, transparent background |
| `door.png` | one plank door with frame, knob, top pane | 1024×1536, transparent background |

## What to do

1. Load them with the other painted textures (`TEXTURE_NAMES` and the loader in `main.js`, into
   `painted.oil` / `painted.clean`). Missing files must fall back gracefully like the others.
2. Build-mode buildings use them on their fronts and walls:
   - **Barn** → `barn_boards` (keep it barn red: no wall-colour tint, or only a light one).
   - **Chapel** → `chapel_boards`.
   - **House** → `house_boards`, tinted by the chosen wall colour (like `tintFor` does for the shops).
   - **Shop front / Two-storey hotel** keep `wall_boards` as now.
   - Windows and doors on all five facade types: draw the painted `window.png` / `door.png` into
     the facade canvas (`facadeTextures` in `textures.js` / `_frontMaterial` in `world.js`)
     instead of the code-drawn ones, scaled to the same window/door rectangles. The doorway of
     buildings with a real opening must stay open.
   - Keep the night-time window glow working (windows light up at dusk/night today; the painted
     windows must still glow, e.g. through the emissive map, without the walls glowing).
3. Every art style must still work: `oil` set → oil images, `clean` → clean images, `flat` →
   flat average colours as today (no painted detail), and Pixel / Paper / Toy looks must not break.
   Changing style must update already-placed buildings.
4. Don't change how the existing Main Street buildings look (they keep their current fronts).
   If it is trivial, add a checkbox under *Build* "Painted windows & doors on Main Street" that
   is OFF by default; otherwise skip it and say so.

## Check

Extend your `world/tests/build-mode.js` with checks for the new textures (each building type uses
the right wall image per set, painted windows/doors present, flat set has no painted maps, night
glow still on), run the whole suite in the browser, and look at the buildings yourself in Oil,
Clean 3D and at night. No console errors. Write a short result to
`world/CODEX_RESULT_BUILDING_ART.md`, with one screenshot of a small village (house, barn, chapel,
shop) in the oil style at golden hour saved as `world/tests/building-art-preview.png`.
