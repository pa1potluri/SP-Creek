# WIP - Let us build replay

Added saved chronological order across props, buildings/detail pieces, roads and fences, with a stable legacy-layout fallback. Replay hides built objects and their owned physics/lights, then reveals them with a soft scale settle and seeded sparkles, using temporary pivots so world-coordinate roads/fences scale in place. Stop/removal/undo restores original transforms, physics and layout. Camera orbits slowly above the build. Speed is 1-5 pieces per second.

Replay button adds/reuses a replay clip and starts there, preserving other timeline clips. Added the replay clip selector and a ready-made build video preset; normal rendering uses the same timeline-driven animation. Duration follows build count and speed. No new camera numbers.

Not verified. Remaining: focused mixed-order/save-load/seek/removal tests in build-mode, smoke and day/night preview, full suite once, final counts and commit. No pushes. Next playground then lantern-evening; stop after 20.
