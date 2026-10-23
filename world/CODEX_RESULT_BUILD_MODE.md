# Build mode result

Implemented all six Phase 1 parts.

- Added Build immediately after Place objects: all seven catalogue types, actual semi-transparent building previews, width/floors/colour swatches/sign options, R/wheel rotation, click selection, and button/Delete removal.
- Reused the town builders and texture-switching materials. Extracted the chapel builder without changing the original landmarks or town layout. New buildings follow all six art styles and manual texture overrides.
- Added rotated rectangular terrain pads with an 8 m soft blend. Terrain updates cache the original heights. All plant variants and rocks adjust to the new ground; instances inside footprints and their tree colliders disappear and return on deletion. Props/cut-outs follow the updated surface.
- Added previewed dirt roads using the existing ribbon/material code: ground points, width, Enter/double-click finish, Esc cancel, and remove-last-road.
- Added live door destinations for walkers, building colliders, and raised porch floors. Deletion removes their destinations, physics, smoke, animation entries, and owned rendering resources.
- Extended the existing layout array with building/road records, retaining old prop compatibility. Both project files and localStorage rebuild the new content, including saved pad elevations.

Validation: ran at http://localhost:8810. The repeatable browser suite in `tests/build-mode.js` passed 240 assertions: 7 types x 6 styles rendered, rotation, terrain/porches, plant restoration, destinations, road completion/cancellation, G/play collision against a rotated wall, selection and both deletion controls, project save/open handler, exact JSON layout round-trip, localStorage, and cleanup. Three additional focused checks passed for hidden/restored tree colliders and ghost texture overrides; final village destinations and console were also checked. No console errors. The renderer emitted an existing shader sample-bias clamp warning during style switching. All modified JS files passed `node --check`.

Choices: floors/signs apply to the four facade-based buildings; width scales the chapel horizontally and scales towers/windmills as whole models. Walkers retain the existing wandering behavior. Camera shots and video presets are byte-for-byte unchanged from the backup; showroom files were untouched. Temporary browser test layouts were removed after testing. Screenshot: `tests/build-mode-preview.png`.

Unfinished Phase 1 work: none.
