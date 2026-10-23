# Building art result

Implemented the ten new oil/clean images through the existing optional texture loader.

- Build-mode barns use untinted red barn boards; chapels use whitewashed chapel boards; houses use house boards tinted by the selected wall colour. Shops and hotels use wall_boards.
- All five facade types composite the painted window and door artwork. Barns also receive side windows. Existing real doorway geometry remains open.
- Window emission is restricted to pane regions, retaining painted detail while keeping frames and walls dark. Flat looks retain the procedural facade and use average wall colours without painted detail.
- Existing buildings and placement previews update when styles or texture overrides change. Missing art falls back to existing textures/procedural drawing.
- Main Street fronts remain unchanged. The optional Main Street checkbox was skipped to keep this change scoped to Build-mode artwork.

Validation: extended `tests/build-mode.js` with wall-image selection, per-style maps, loaded opening artwork, and nonempty window-only emission checks. The final full browser suite passed all 360 assertions after the pane-mask and fallback refinements. JavaScript syntax checks passed, and the browser reported no console errors.

Visually inspected the four-building village in Oil at golden hour, Clean 3D, and at night. Painted windows glow at night while the surrounding walls remain dark. Saved the requested Oil preview to `tests/building-art-preview.png`.

Camera code, preset numbering, and the showroom were not changed. All required work is complete; only the explicitly optional Main Street toggle was omitted.

