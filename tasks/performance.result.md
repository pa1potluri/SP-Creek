# Performance - final verification in progress

## Built
- Rigid animal parts and benches share a material batch while all moving joints, original textures, normals and close-up geometry stay intact. Fixed farm rails use one instanced mesh; their 18 collider transforms remain unchanged. Removed a redundant whole-farm matrix traversal before Siri arm targeting.
- Existing painted grass/flower instances keep their full size within 100m, then shrink smoothly over 100-180m. Tree silhouettes, collisions and Build instances are retained; no near-camera LOD change.
- Meadow sparkle heights are cached until world.terrainRevision changes, including Build placement/removal. Animated positions still use absolute world time.
- Distant off-frustum forest, meadow and farm animation updates can sleep. Broad area bounds and a 120m near-camera margin retain nearby updates and shadow casters. On return, absolute-time animation updates immediately. Walkers, train and other stateful life continue stepping.
- Files: world.js (shared batching, plant LOD, terrain revision, visibility helper), life.js (animal batching and farm update gate), areas/pony-farm.js (rails/matrix traversal), areas/meadow-lake.js (sparkle cache), main.js (only two conditions inside step).

## Measurements at 1920x1080 Animated film
- NVIDIA RTX 5060 Ti, ANGLE D3D11, Chrome headless, same settings. All areas loaded; camping is instantiated and updated only inside the benchmark harness. Production camping registration and Episode 4 remain deferred by the user's choice.
- Live benchmark: all 28 clips in Grand tour and available Episodes 1/2/3/5; 0.9s warm-up and 2.5s sample at each clip start. Overall before 59.37 fps, final after 57.60 fps. Display pacing varied between runs; these numbers do not demonstrate an average displayed-FPS gain. Minimum clip mean improved from 50.36 to 53.43 fps. Original data retained in performance-before.json / performance-after.json.
- Mean displayed FPS by preset (before -> after): Grand tour 59.15 -> 56.99; Episode 1 59.95 -> 58.11; Episode 2 59.95 -> 58.17; Episode 3 58.25 -> 57.92; Episode 5 59.95 -> 58.04. No claim of locked 60fps or full-video playback timing.
- Controlled completed-render comparison removes display-refresh pacing: live RAF disabled, manual 1/30s world steps, five positions (0/25/50/75/90%) in each clip; six warm-up frames then ten timed frames with gl.finish per position. Baseline sources read from fa1d96e in a transient browser route; no source checkout/revert. 140 positions, 1400 timed frames per version, same GPU/settings.
- Completed-frame mean: **8.249ms -> 7.450ms (9.7% less render time)**. By preset: Grand tour 10.639 -> 9.452ms; Episode 1 4.864 -> 4.536; Episode 2 3.564 -> 3.276; Episode 3 9.394 -> 8.879; Episode 5 7.679 -> 6.786. Raw: world/tests/performance-render-cost.json.
- Mean profiled meadow update 0.2813 -> 0.0209ms/frame; farm 0.0774 -> 0.0180ms/frame (skipped calls counted as zero). Scene mesh objects 2700 -> 2477; farm 238 -> 144. These are scene objects, not measured draw calls.
- Both benchmark versions reported no browser errors and sound stayed locked. A diagnostic harness readiness timeout was fixed by timed polling because that harness intentionally disables RAF; no application fix was needed.

## Checks / remaining
- Targeted checks: **29 passed**, errors []; off-screen/near/visible bounds, immediate absolute-time farm return, sparkle equality and invalidation after placing/removing a cabin, all 18 fixed rail transforms, sound locked. Raw: world/tests/performance-check.json.
- Animated film previews saved and inspected: performance-{26,27,61,62,63}-{day,night}.png. No camera shot definitions or preset numbers changed.
- Full suite running on final code: every .js suite in world/tests (19), DH_URL=http://127.0.0.1:8813, command node world/tests/run-browser.cjs with all suite names. Not done until final counts and image inspection are recorded.
- No new child-safety theme or behaviour; original Pavi/Siri models retained. No new libraries, point lights, sound startup or production debug-global dependency.
- Prior scope-deferred tasks 22/26/28 remain WIP in STUCK.md. main.js listener audio pan is also still out of scope. Nothing merged to main, pushed or published.
- Stop after task 30 as requested. Task 31 stays paused until Thu Oct 29 (today is earlier).

## Preview inspection / current full-run checkpoint
- Ten day/night images saved for forest 26, meadow 27 and farm 61-63; original siblings, soft rounded animals, fences and close-up shapes retained. First forest image replaced after the loading-overlay fade. No camera definitions changed.
- Full suite session 83498 is running, Build 200 passed so far after area-shots 7 and balloon-ride 20. Do not count this as full completion yet.
