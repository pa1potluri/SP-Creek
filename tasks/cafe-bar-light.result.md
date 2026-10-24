# Cafe counter light - WIP verification

## Finding / scoped change
- The requested bright counter outcome already exists in the inherited code: shelf/counter self-lit strips, warm emissive wood/ivory, bright painted room lining and the existing two lamps. Source history includes main commit 3d5cde8; the old STUCK entry predates those changes.
- Kept the existing appearance; no duplicate glow geometry, texture replacement or new point lights were added. Removed only the stale dark-counter STUCK item.
- Fixed mid-shot Animated film pixel check at 960x600 (luma below 16/255 counted near black): golden mean 141.88, median 120, 0% near black; night mean 159.99, median 141, 0% near black. Data: world/tests/cafe-bar-light-check.json.
- Counter day/night images inspected: cosy cream/honey surfaces, clear cake/tea sign and friendly cafe host, no dark jump-scare corner in the counter view.

## Left / exact checkpoint
- Saved counter images cafe-bar-light-18-day.png / -night.png and entry images cafe-bar-light-17-day.png / -night.png.
- Full counter path check: five positions in each mood (ten rendered frames), all 0% near black; mean luma 126.07-159.86, median 98-147. Data: world/tests/cafe-bar-light-path-check.json.
- Full suite deliberately interrupted at the user usage-stop request; task 29 remains WIP. See the exact checkpoint below.
- No app-source change required. Existing shots/presets remain unchanged. Camping and Episode 4 still deferred by user choice.
- No merge, push or publication.

## Usage-stop checkpoint (2026-10-24)
- Stopped on `area/cafe-bar-light`; no performance/task-30 work started. No app-source changes in task 29.
- Full run session 6067 was stopped with Ctrl+C during more-buildings (last progress: paper style). Completed: pony-farm 32, camping-night explicit factory smoke 14, train-trip 28, area-shots 7, build-mode 525, clouds-water 227, family-mode 46, hamlet-shots 47 and hamlet 37: **963 passed + 2 startup reload checks so far**. No failure was reported before interruption. This is NOT a completed full suite.
- Remaining: finish/re-run more-buildings, names-tour-shots, pavi-siri, shot-clearance, sunset-cove, playground, lantern-evening, pavi-siri-moments and balloon-ride. On reset run the full suite once cleanly before marking 29 done.
- Full command: `$env:DH_URL='http://127.0.0.1:8811'; node world/tests/run-browser.cjs pony-farm camping-night train-trip area-shots build-mode clouds-water family-mode hamlet-shots hamlet more-buildings names-tour-shots pavi-siri shot-clearance sunset-cove playground lantern-evening pavi-siri-moments balloon-ride`.
- All four cafe day/night previews and both pixel-data JSON files are already committed. Counter path measured at ten poses: 0% near black, mean luma 126.07-159.86. Stale cafe STUCK item removed; other STUCK entries retained.
- Latest completed full suite: task 27, 1440 + 2. Task 28 added station view 64 and Episodes 2/3/5; its smoke 5 and clearance 66 pass, but Episode 4 remains WIP because the user explicitly deferred camping startup wiring. Do not add that wiring without later authorization.
- Resume 29 verification, then 30 performance. Task 31 must not begin before Thu Oct 29; follow its skip/stop rule if earlier.
- Local server was running on 8811 (session 18090); restart if needed. Never push, merge or publish.
