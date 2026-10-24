# Shot clearance

Branch: area/shot-clearance, directly from area/crystal-polish (2194941). The Watercolour preview stays separately on area/watercolor as WIP b0f369b.

Fixed camera paths without renumbering or renaming shots:
- 7 Hilltop Vista now flies above the Willow Creek barn instead of framing its wall.
- 19 Board Game Table uses a steady raised glide with the board and friendly players in view. The old orbit helper's vertical rise could hit the ceiling, so this is now a keyed path of the same 60-second duration.
- 6 Golden Orbit is six metres higher to clear the hillside throughout its loop.
- 17 Into the Honey Bun Cafe stays centered through the door passage and has more headroom inside.
- 25 Old Hollow Stroll passes beside the well instead of through its roof.

Added world/tests/shot-clearance.js. It samples every shot 201 times: 35 shots / 7,035 samples. It checks explicit building/wall collider volumes, solid prop containment, 0.6 m furniture clearance, ground/walkable clearance of at least 1 m, and straight-ahead hits within 1 m lasting over five consecutive samples. Merged props are split into connected pieces; a ray/face-normal check distinguishes actual containment from an empty bounding box. Painted foliage is excluded as a solid rectangle, but its opaque pixels are included in forward-hit tests using the texture alpha mask; translucent glows are excluded. The audit logs failing/worst shots and the lowest ground/furniture margins, and verifies that sound stays locked.

Focused audit: 36 checks passed, zero failing shots, no browser errors. It covered 32 building/wall volumes, about 9,540 solid pieces and 13,312 painted cutouts. Lowest ground margins: shots 8 and 12 at 1.40 m, then shot 20 at 1.45 m. Lowest furniture margin: shot 19 at 0.626 m (required 0.60 m), followed by shot 18 at 0.821 m. Full suite passed: area-shots 7, build-mode 435, clouds-water 119, family-mode 44 plus 2 startup checks, hamlet-shots 47 (27,009 samples), hamlet 37, more-buildings 155, names-tour-shots 48, shot-clearance 36. Total 928 checks plus 2 startup checks. Browser errors: none. The final run collected 9,451 solid pieces (visibility follows restored scene settings), 32 building/wall volumes and 13,312 painted cutouts; zero failing shots.

Animated-film day/night screenshots: world/tests/shot-clearance-<shot>-day.png and -night.png for 6, 7, 17, 19 and 25 (10 images). No implementation blockers or STUCK entries.

After this task: stop and wait per the user's priority change. No new experiments or Watercolour work until resumed. No merge to main; Claude review remains required.
