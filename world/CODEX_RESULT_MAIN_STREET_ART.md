# Main Street painted openings

Implemented always-on painted windows and ordinary doors for the LEFT and RIGHT Main Street buildings. Oil and Clean use their corresponding images; flat styles retain the original procedural facade. Existing wall colours, signs, balconies, and geometry remain intact.

The saloon's `painted` flag selects painted board materials, not a complete facade image. Kept those boards and added painted windows. Its real doorway and batwing doors remain open, with the lit interior visible. Interior and batwing entrances never receive a painted door overlay. The livery's large cross-braced barn doors remain procedural; its existing windowless facade is unchanged. Special barn doors are also protected in Build mode.

Painted windows reuse the existing pane-only emissive mask. Walls, frames, and painted doors do not emit; lanterns and interior lights retain their existing lighting.

Validation:

- Added 75 checks to `tests/build-mode.js`, comparing actual Oil/Clean/flat facade canvases for all 11 Main Street buildings, preserving barn doors, and checking non-emitting wall and door pixels.
- Full browser suite passed **435 assertions**, including the existing six-style Build-mode regression checks.
- JavaScript syntax checks passed. No browser console errors.
- Visually checked Town Square in Oil at golden hour, Clean 3D, and night; also inspected the saloon entrance and balcony at night.
- Saved `tests/main-street-art-preview.png`: Town Square view, Oil, golden hour.

No checkbox was added. No camera or preset code changed.
