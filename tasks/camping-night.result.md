# Camping night - WIP, integration scope pending

## Built and previewed
- Clearing at (-200, 58): two softly glowing rounded tents; small stone-ring fire with a 1.65m approach barrier; supplied Pavi/Siri models seated on a log under a blanket; two nearby grown-ups; friendly round owl; 48 deterministic fireflies; a soft scheduled shooting star.
- Appended views 59-60, twenty-minute preset and quiet campfire/owl ambience (only enabled after factory creation; no automatic sound start).
- Module factory is idempotent; all movement comes from update(t, camera, cur). Blueprint includes the clearing and walking path.
- Manual harness smoke: 14 passed, browser errors empty, audio locked. Final day/night previews saved for shots 59 and 60 (four images), refresh completed without browser errors. No full suite claimed yet.

## Exact stop / requested scope
- User chose "Leave camping WIP and continue" on 2026-10-24. Normal startup is NOT wired. Task 26 allows camping.js, camera.js, presets.js, ambience.js and BLUEPRINT.md; main.js is absent. AGENTS.md rule 3 says: "If something outside them must change, stop and write it in the result file as a request instead of changing it."
- Request only the normal main.js registration: import buildCamping, construct `const camping=buildCamping(world)` beside the other area builders, and call `camping.update(time,camera,atmos.cur)` in step(dt).
- Previews use a temporary test harness that calls the public factory; production does not depend on window.__app or a hidden registration side effect. The camping smoke suite also calls the factory explicitly.
- After registration: smoke startup, full suite once including camping-night, refresh/verify all four screenshots, record counts and mark done. Keep shots 59-60 reserved; next task appends from 61.
- No merge, push or publication.
