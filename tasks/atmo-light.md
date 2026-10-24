# Task: light and sky (branch `area/atmo-light`)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch from the tip of the branch you just finished. Build fast, child-friendly, light checks (full suite + day/night screenshots before done, as AGENTS.md says).

- **Golden-hour god rays**: soft sunbeams through trees and between buildings, a gentle glow around the sun (cheap: screen-space light shafts in the post chain or additive sprites/cones).
- **Better night sky**: a painted round moon with a soft halo, a faint Milky Way band, twinkling stars; moonlight rim on rooftops. Night stays readable (keep the brightness floor).
- **Warm light pools**: lanterns and lit windows cast soft warm pools on the ground at dusk/night (decals or emissive ground blobs, no new point lights).

Files: `atmosphere.js`, `sky.js`, `painterly.js`, `environment.js`, `world.js` (lamp pools only). Write `tasks/atmo-light.result.md`.
