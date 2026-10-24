# Build pieces - done

Built twelve placeable catalogue models: garden fence, vegetables, flower box, laundry, covered well, wood pile, mailbox, lantern string, garden bench, smiling snowman, pumpkins and little bridge. Reuses Build placement/rotation/selection/save/load/remove. Small terrain pads and colliders, bridge deck walk floor and side rails; shared warm lantern material, no extra lights. Laundry shader uses world time and wind. Added meaningful editor/physics/round-trip/style/cleanup checks to build-mode.

Smoke check passed with no browser errors and audio locked. Six Animated film previews: world/tests/build-pieces-layout-day/night.png (fence, vegetables, flowers, laundry), build-pieces-2-day/night.png (well, logs, mailbox, lanterns), build-pieces-3-day/night.png (bench, snowman, pumpkins, bridge). No new or changed camera shots.

Full suite passed once: area-shots 7, build-mode 493, clouds-water 119, family-mode 44 plus 2 startup reload checks, hamlet-shots 47, hamlet 37, more-buildings 155, names-tour-shots 47, shot-clearance 38. Total 987 checks plus 2 startup checks; no browser errors. All 37 shots / 7,437 clearance samples passed. The 58 added Build checks cover editor placement/rotation, preview physics isolation, compact footprints, colliders, bridge floor, exact layout round trip, all six art styles, individual removal and Remove all built cleanup. Tests used local port 8811.

No known unfinished work. Seasonal pieces are explicitly placeable in any season so saved builds stay stable; they do not disappear when the season switches. No pushes/publication. Next: gentle-weather on a stacked branch. Watercolour stays paused until Thu Oct 29. Claude review remains required before merge.
