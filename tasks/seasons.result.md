# WORK IN PROGRESS - Seasons switch

Implemented the Summer/Autumn/Winter control, project and preference persistence, and season-aware preset application. Added seasons.js for foliage tint hooks across art styles, ground/roof snow blending, deterministic drifting leaves and snowfall, pumpkins, a friendly snowman, and frosty winter morning/cosy window lighting. Summer is the default. Water and its safety colliders are unchanged.

Smoke check passed with no browser errors. 20 focused checks passed: Summer default; Autumn and Winter in all six art styles; project round-trip; correct decorations; Summer restores neutral uniforms and removes seasonal colliders; audio locked; frozen Winter frame byte-identical after 400 ms. Full suite running. Remaining: finish all suites, record counts, mark done and commit.

Review images: world/tests/seasons-autumn-23-day/night.png, seasons-winter-24-day/night.png, seasons-winter-4-day/night.png (Morning/night), and seasons-winter-snowman-day/night.png.

Task files 13-15 were committed on this branch as ea743b8. Next after this task: season-presets, build-pieces, gentle-weather on stacked branches. Watercolour stays paused until Thu Oct 29. No merge to main.
