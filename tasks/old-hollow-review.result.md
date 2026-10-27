# Old Hollow review — WIP: ghosts, street and restrained decoration implemented
Branch area/old-hollow-review from saved Balloon Hill tip0b95c27. Latest user reference saved unchanged as tasks/ref/old-hollow-review-latest.png.

## Built
- Six friendly ghosts now use opaque rounded cube bodies, white skin, dark expressive eyes, rosy cheeks and smiles. This fixes the translucent body/floating-face appearance. Gentle hover and deterministic blink; click gives a small rise and wave, no sound, flash or chasing. Swing ghost retained.
- Matching ghost collision circles follow their horizontal positions. Street bends around the covered well; all six storefront/landmark approaches connect to the cobblestone spine. Rendered-ground fit and world-space texture coordinates keep tile scale continuous at joins.
- Local existing Oil/Clean cobblestone textures loaded directly: ghost area builds before Cove loads those maps, so simply calling paintedMaterial initially returned the flat fallback. Caught in screenshot, fixed before final checks. Flat styles retain their existing texture-switch behavior.
- Added four small flower planters and two benches outside routes; pumpkin collisions now match their visible bodies. Windows use warm amber rather than alternating mint light. Existing signs, porches, roofs and friendly pumpkins preserved.
- Actual far landmark is GENTLE BELLS cabin/bell tower, not a separately named Town Hall. Connected its approach without inventing or renaming a building.
- Main pointer hook runs only without a placement tool and outside gameplay, preserves existing drag threshold and respects opaque occluders. Fog sprites do not swallow the click.

## Verified
-707 centreline samples across seven connected routes: no static blockers. Six opaque depth-writing bodies; reaction seeking repeats exactly; page errors empty and audio stays locked.
- Synthetic pointer target reaches the ghost; the same click while Draw Road is active leaves ghost reaction untouched. No test-triggered audio.
- Film/Clean/Oil Old Hollow Stroll day/night captures: world/tests/old-hollow-{film,clean,oil}-{day,night}.png. Clean day and Film night visually inspected; Film Old Hollow Tour day/night also saved as old-hollow-tour-film-{day,night}.png. No global style/UI/shot changes.
- Full31 suites passed:2015 checks +2 startup reload checks, exit0, Browser errors []. Log: old-hollow-full.txt. Focused evidence: old-hollow-check.json and old-hollow-check.cjs.

## Remaining / exact stop
Broader building/façade/roof detail, more deliberate autumn-tree placement and street-edge landscaping toward the art target remain WIP. Existing layout preserved; no claim of pixel-identical target or universal actor-collision completion. Global actor routing remains task64. No new libraries, asset generation, lights, push or merge. Click reaction currently belongs to exploration/preview; active gameplay and Build retain their input ownership.
