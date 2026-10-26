# Showcase user review — repair handoff

## User observations
- Pavi/Siri morning: shadows and horses too fast; actors pass through one another/props.
- Scene 4 Cove above: intermittent plants flicker near houses.
- Scene 5 onward: prominent black edges; insufficient watercolour blending/depth.
- Scene 6 beach: purple untextured strip. Scene 8 pond: harsh water/prop edges.
- Scene 25 market: horse through fountain/cast; scene 26 boat through ducks.
- Uneven saturation/atmospheric depth; top-angle beach edge; scene 30 snow inside cafe.

## Implemented first repair pass
- Task 59 already fixes purple/night beach band: procedural mountain ring occluded the beach, not missing sand. Cove mountain visibility restored outside the area.
- Showcase clips now use natural camera speed for 20 seconds instead of compressing a full long shot into 20 seconds. Showcase ambient world time/motion runs at 40%; timeline duration remains 12 real minutes. Normal gameplay speed unchanged.
- Removed Watercolour dark contour/pigment-rim and poster boundaries; increased continuous wash strength, kept pigment variation in broad washes. Other six style definitions/shader branches unchanged. Preview filter exists; final authored-reference quality is not claimed.
- Camera-facing palm/flower cutouts no longer cast changing billboard shadows. Flower cards use a small depth bias to reduce surface competition. No new plants/assets.
- Seasonal snow/leaves excluded below the cafe roof using world-to-cafe bounds. Snow still exists outside.
- Ambient traffic uses nearby solid footprint checks (spatially indexed circles, walls, fences), walkers try clear turns, riders/coach yield instead of advancing through blockers. Horse/coach front/centre/rear footprints tested. Road loop turns before fountain. Dynamic walkers and visible main/cove stars included in avoidance.
- Rowing water friends select water-safe positions outside 3.1m hull/oar clearance; meadow ambient ducks use the same boat exclusion.

## Checked / status
- Focused 13 checks passed; actual horse stops for injected solid obstruction; two rowing loops (240 samples) minimum duck/boat distance 3.16765m; natural camera pace, motion/timeline ratio, cafe roof uniforms, palm shadow settings and removed rim checked; zero browser errors.
- Sixteen watercolour day/night images: world/tests/showcase-review-{37,39,42,34,69,73,80,85}-{day,night}.png. Inspected town characters, Cove above, pond and cafe interior. These are existing views, no camera definitions changed.
- Initial full 2015 + 2 passed. Final full suite running after extending horse/coach front/rear clearance; final counts pending before completion.
- Watercolour appearance/colour and intermittent plant flicker need user/lead visual acceptance. No quantitative proof of every flicker case or every scripted-cast pair. Generic ambient avoidance is not a complete choreography/path-planning engine: preauthored star animations, farm animals and all staged crowd combinations are not exhaustively collision-tested. Keep broader collision acceptance WIP rather than claiming every actor can never overlap.
- Next: finish final verification and record counts; review collisions in the complete real-time 12-minute loop and any new user observations. Forest root/picnic visual issues and Pavi original-body fit remain separate.
- No pushes, merges or publishing. Working scope saved on area/showcase-review-fixes.
