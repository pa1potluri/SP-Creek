# Codex task queue

Work top to bottom. When a task is done (result file written, committed), mark it `done` here,
commit, then start the next one at once on a new branch from the tip of the branch you just
finished. Re-read this file each time; Claude may change it.

| # | Task file | Branch | Status |
|---|---|---|---|
| 1 | `tasks/ghost-town.md` | `area/ghost-town` (from `main`) | done |
| 2 | `tasks/forest.md` | `area/forest` | done |
| 3 | `tasks/meadow-lake.md` | `area/meadow-lake` | done |
| 4 | `tasks/crystal-mine.md` | `area/crystal-mine` | done |
| 5 | `tasks/pond-polish.md` | `area/pond-polish` | done |
| 6 | `tasks/shots-polish.md` | `area/shots-polish` | done |
| 7 | `tasks/kid-cleanup.md` | `area/kid-cleanup` | done |
| 7a | `tasks/names-tour-shots.md` | `area/names-tour-shots` | done |
| 7b | `tasks/visual-fixes.md` | `area/visual-fixes` | done |
| 7c | `tasks/crystal-polish.md` | `area/crystal-polish` | done |
| 7d | `tasks/shot-clearance.md` | `area/shot-clearance` | done (from crystal-polish) |
| 8 | `tasks/watercolor.md` | `area/watercolor` | done via task 31; historical WIP b0f369b superseded |
| 9 | `tasks/atmo-light.md` | `area/atmo-light` | done |
| 10 | `tasks/atmo-mist-life.md` | `area/atmo-mist-life` | done |
| 11 | `tasks/village-details.md` | `area/village-details` | done |
| 12 | `tasks/seasons.md` | `area/seasons` | done |
| 13 | `tasks/season-presets.md` | `area/season-presets` | done |
| 14 | `tasks/build-pieces.md` | `area/build-pieces` | done |
| 15 | `tasks/gentle-weather.md` | `area/gentle-weather` | done |
| 16 | `tasks/sky-edge.md` | `area/sky-edge` | done (from main) |
| 17 | `tasks/soft-wind.md` | `area/soft-wind` | done (from main) |
| 17a | `tasks/pavi-siri.md` | `area/pavi-siri` | done |
| 17b | `tasks/sunset-cove.md` | `area/sunset-cove` | done; preview fixes + Episode 1; full 1172 + 2 passed, day/night previews saved |
| 18 | `tasks/lets-build-replay.md` | `area/lets-build-replay` | done; full 1202 + 2 passed; final replay checks 32; day/night previews saved |
| 19 | `tasks/playground.md` | `area/playground` | done; full 1240 + 2 passed; day/night and oil previews saved |
| 20 | `tasks/lantern-evening.md` | `area/lantern-evening` | done; full 1266 + 2 passed; day/night, dusk and oil previews saved; stopped after 20 |
| 21 | `tasks/pavi-siri-3d.md` | `area/pavi-siri-3d` | done (from main 75a90ab); full 1293 + 2 passed; original-model day/night previews saved |
| 22 | `tasks/cove-polish.md` | `area/cove-polish` | done in task 32; continuous Episode 1 view 65, warm pebbles and route clearance; full 1460 + 2 passed |
| 23 | `tasks/pavi-siri-moments.md` | `area/pavi-siri-moments` | done; full 1335 + 2 passed; day/night previews 46-52 saved |
| 24 | `tasks/balloon-ride.md` | `area/balloon-ride` | done; full 1358 + 2 passed; day/night previews 53-55 saved |
| 25 | `tasks/train-trip.md` | `area/train-trip` | done; full 1389 + 2 passed; day/night 56-58 saved; audio-pan follow-up resolved in task 32 |
| 26 | `tasks/camping-night.md` | `area/camping-night` | done in task 32; normal startup/frame registration authorized and wired; four day/night previews; full 1460 + 2 passed |
| 27 | `tasks/pony-farm.md` | `area/pony-farm` | done; full 1440 + 2 passed; day/night farm 61-63 and camera correction 60 saved |
| 28 | `tasks/episode-presets.md` | `area/episode-presets` | done in task 32; Episodes 2-5 complete, Episode 4 wired; day/night previews; full 1460 + 2 passed |
| 28a | `tasks/startup-hang.md` | `area/startup-hang` | done; server launcher + terrain startup fix; full 1446 + 2 passed; queue chat continues from here |
| 29 | `tasks/cafe-bar-light.md` | `area/cafe-bar-light` | done; full 1446 + 2 passed (19 suites); four day/night previews + counter metrics saved; startup fix 2bbec71 incorporated |
| 30 | `tasks/performance.md` | `area/performance` | done; full 1446 + 2 passed; targeted 29 passed; ten day/night previews; render cost 8.249 to 7.450ms; stopped after 30 per user |
| 31 | `tasks/watercolor-resume.md` | `area/watercolor-resume` | done; preview-only Watercolour; full 1773 + 2 passed (26 suites); 12 day/night film-oil-watercolour previews + 2 comparisons; stopped after 31 |
| 32 | `tasks/finish-wip.md` | `area/finish-wip` | done; camping + Episode 4 + continuous cove take + real train listener; full 1460 + 2 passed; six day/night previews |
| 33 | `tasks/self-review-1.task.md` | `area/self-review-1` | done; SELF-REVIEW-1 report + day/night/oil and Play captures; visibility handoff fixed; full 1464 + 2 passed |
| 34 | `tasks/rainy-day-fun.md` | `area/rainy-day-fun` | done; full 1493 + 2 passed; rainy suite 26; six day/night previews 66-68 |
| 35 | `tasks/market-day.md` | `area/market-day` | done; full 1537 + 2 passed; market suite 41; six day/night previews 69-71; inactive-balloon cleanup fixed |
| 36 | `tasks/boat-trip.md` | `area/boat-trip` | done; full 1561 + 2 passed; boat suite 21; six day/night previews 72-74; inherited cove night waterline flagged in review 39 |
| 37 | `tasks/garden-time-lapse.md` | `area/garden-time-lapse` | done; full 1604 + 2 passed; garden suite 40; six day/night previews 75-77; terrain and raw-path clearance corrected |
| 38 | `tasks/episode-presets-2.md` | `area/episode-presets-2` | done; Episodes 6-9; full 1633 + 2 passed; episode suite 25; eight final day/night previews 78-81 |
| 39 | `tasks/self-review-2.task.md` | `area/self-review-2` | done; SELF-REVIEW-2 report; full 1636 + 2 passed; 128 poses, 14 dry walks, 32 captures + contacts; inherited cove night-strip follow-up in STUCK; stopped after 39 |
| 40 | `tasks/BIG-QUEUE-40-47.md` (cove-night-strip) | `area/cove-night-strip` | STUCK; review 47 confirms night band; no app fix retained; diagnosis in STUCK.md |
| 41 | `tasks/BIG-QUEUE-40-47.md` (public-ready) | `area/public-ready` | done for startup/fallback; full 1787 + 2; static copy validated again in 47; wide picnic visual follow-up in STUCK |
| 42 | `tasks/BIG-QUEUE-40-47.md` (showcase-media) | `area/showcase-media` | done; six 3.8s 640px loops under 728KB; no Pavi/Siri; full 1787 + 2; 12 day/night stills |
| 43 | `tasks/BIG-QUEUE-40-47.md` (contributing) | `area/contributing` | done; contribution guide + 10 draft ideas; links checked; full 1787 + 2; day/night baseline saved |
| 44 | `tasks/BIG-QUEUE-40-47.md` (snow-day) | `area/snow-day` | done; four scenes 82-85 + 240s preset; full 1822 + 2; snow checks 31; eight day/night + Oil previews |
| 45 | `tasks/BIG-QUEUE-40-47.md` (kite-picnic) | `area/kite-picnic` | done feature; six views 86-91 + two 240s presets; full 1861 + 2; outing 33; previews saved; wide public picnic follow-up in 47 |
| 46 | `tasks/BIG-QUEUE-40-47.md` (episode-presets-3) | `area/episode-presets-3` | done; Episodes 10-13 at 180s + wide views 92-95; full 1900 + 2; episode checks 35; day/night + Oil saved; inherited cove band open |
| 47 | `tasks/BIG-QUEUE-40-47.md` (self-review-3) | `area/self-review-3` | done; SELF-REVIEW-3; full 1900 + 2; normal/static 132 poses + 14 walks each; 35 raw + 3 contacts; two visual follow-ups open; stopped after 47 |
| 48 | `tasks/review-feedback.md` | `area/review-feedback` | WIP visual follow-up; reproduced bench-state freeze fixed in task 50; full 2015 + 2 passed, 31 suites; 96 preset switches clean; 12 Film day/night views; deer clear; steep-bank tree silhouettes remain in STUCK |
| 49 | `tasks/preview-autostart.md` | `area/preview-autostart` | done; restart/sign-in verified 2026-10-25 19:27; watchdog/server launched automatically; HTTP 200; isolated restart passed; unchanged checkpoint full 2001 + 2; no camera changes; task 48 remains WIP |
| 50 | `tasks/preview-performance.md` | `area/preview-performance` | done, awaiting lead review; bench-state render freeze fixed; full 2015 + 2 passed, 31 suites; 96 preset switches clean; 12 Film day/night views; startup about 8.6s in final diagnostic; task 48 forest visuals still open |
| 51 | `tasks/character-pipeline-test.md` | `area/character-pipeline-test` | done isolated experiment, awaiting review; 12 residents + Pavi/Siri test slots; focused 94 and full 2015 + 2 passed; 8 day/night + 2 comparisons; RTX render ~0.6ms, head payload 34MB; no full-game rollout; Siri face provisional |
| 52 | `tasks/character-profile-rollout.md` | `area/character-profile-rollout` | WIP approved real-game opt-in; 12 residents + Pavi wired; Siri original; solid residents now use a 27KB manifest + unchanged 5.18MB Pavi; task 55 verifies walking/styles; original URL rollback retained; Pavi rig fit/persistence/expressions and broader rollout remain WIP |
| 53 | `tasks/character-pipeline-v01.md` | `area/character-pipeline-v01` | superseded by task 55: source v01 profiles retained, resident dot renderer replaced with simple solid meshes per user correction; hero unchanged |
| 54 | `tasks/character-preview-loading.md` | `area/character-preview-loading` | done loading repair; unused GLB wait removed; progress/errors + narrow-pane fit retained; current loading 5 and full 2015 + 2 checks passed in task 55 |
| 55 | `tasks/solid-residents.md` | `area/solid-residents` | done solid pedestrian increment, awaiting review; full 2015 + 2, solid/walking/style 44, loading 5 passed; front/side/back + Film gameplay day/night saved; no resident point downloads; Pavi untouched |
| 56 | `tasks/showcase-20s.md` | `area/showcase-20s` | done, awaiting review; 36 automatic 20-second scenes, 12-minute loop; focused pass + Film day/night; full 2015 + 2 passed |
| 57 | `tasks/showcase-watercolor.md` | `area/showcase-watercolor` | done, awaiting review; all-watercolour 36-scene loop; focused + mixed-style regression passed; day/night saved; full 2015 + 2 passed |
| — | `tasks/kids-presets.md` | — | dropped: the renames are part of kid-cleanup |
| — | `tasks/cafe-bar-light.md` | — | dropped: the café counter is part of kid-cleanup |

Shot and preset slots, in this order (append at the end, never renumber): ghost town, forest,
meadow & lake, crystal mine & balloon.

> **User's decision (2026-10-24): long queue for 3–4 days.** Claude may be offline or out of credit, so keep
> building through tasks 21–31 on stacked branches even though more than 2–3 finished tasks will wait for review.
> Never merge, push or publish; Claude reviews them in batches later. Save/commit before every usage limit.
> If a task gets stuck, write it in STUCK.md and go to the next one. Then tasks 32-39 (added 2026-10-25, again a 3-day queue); task 31 timing wait lifted by user after review of 32-39; stop after task 31.

> Queue extension 2026-10-25: task 31 completed in 988845b; continue 40-47 on stacked branches, then stop. Never merge, push or publish.

> User style direction (2026-10-25): STYLE*.png images are final-output references; current world is the foundation. Shared Claude handoff and tentative visual timeline: `tasks/STYLE-TIMELINE.md`. Finish review 47, then stop; no new visual-expansion work started.

> Small user-requested health pass (2026-10-25): app unchanged; server 8811 and 20 local review URLs verified; saved 1900 + 2 evidence and 28 new-shot PNGs checked. Review landing page: `http://localhost:8811/tests/self-review-3-index.html`. Two visual follow-ups remain open; no larger task started.

> Loading diagnosis follow-up: 21.558s startup at 720p; terrain pad calculations and first-use shaders dominate CPU samples. Four preset clicks responsive in isolated test; the later reproduced bench-state freeze is now fixed and validated in task 50. Task 48 retains its forest visual follow-up; see its result.
> Follow-up complete: user-approved life.js state reset fixes the reproduced null-seat freeze; full 2015 + 2 and 96 preset switches passed; 12 Film day/night frames saved. Task 48 retains only the unresolved forest visual follow-up. No new content queued.




