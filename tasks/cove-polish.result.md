# WIP - Cove polish: two fixes built, continuity blocked by file scope

Built on area/cove-polish from original-model task 9ca912b. Four local townsfolk now use two short side lanes at z=-28 and z=-6.5, away from the recording lane, with a six-metre visibility safety guard. Replaced 25 large white rocks with twelve small, rounded warm sand-grey pebbles and smaller matching collision radii. No character/model/texture redesigns.

Day/night captures saved in world/tests/: cove-polish-39-day/night.png, cove-polish-41-day/night.png, cove-polish-42-day/night.png. Captures reported no errors and audio locked. Full Episode 1 timeline was simulated for 180 seconds at 10 Hz: 1,800 samples, minimum visible townsperson distance 26.804m, twelve warm pebbles, no browser errors, no audio startup. Detailed evidence: cove-polish-playback.json. This is a clock/camera simulation, not a newly encoded movie.

Remaining: remove the four hard cuts explicitly configured in presets.js, then validate soft transitions and actor staging; refresh all affected-shot previews and run the full suite before marking task 22 done. Task 22 does not allow presets.js, and AGENTS.md requires a result-file request for an outside-file change. That request is recorded in tasks/STUCK.md. I did not mutate the preset indirectly through camera/area code. No new full suite was run for this partial task; the inherited task 21 full suite passed 1293 + 2. Do not mark this WIP done.

Saved point: scoped geometry/townsfolk fixes and playback report are committed. Continue task 23 from this branch tip while this request waits for review. Never merge, push or publish.
