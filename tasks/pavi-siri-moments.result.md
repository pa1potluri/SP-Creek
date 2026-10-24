# Pavi & Siri moments — WIP

## Done
- Seven appended shots (46–52): bench, hand-in-hand walk, sandcastle, pond ducks, waving, balloon pointing and collar fixing.
- Original textured characters reused; world-time poses, bench/sandcastle/ducks props and five-minute preset added.
- Animated film day/night previews saved for every appended shot: `world/tests/pavi-siri-moments-46-day.png` / `-night.png` through shot 52. Corrected skirt pose carry-over, moved collar scene onto flat sand, and adjusted the hand to collar height.
- Moment smoke: 35 passed, browser errors empty, audio locked. Separate clearance: 54 passed, 53 shots / 10,653 samples, no failures.

## Left / stopped point
- Stopped at the user's usage-limit request on `area/pavi-siri-moments`; task 23 remains WIP. No task 24 work started.
- Full suite was deliberately interrupted after area-shots **7**, build-mode **525**, clouds-water **227**, family-mode **46** and **2 startup reload checks** passed (805 + 2 so far). No failure was reported before interruption; this is NOT a completed full suite.
- Resume by running the full suite, including the new `pavi-siri-moments` suite. Remaining suites were not completed in this interrupted run: hamlet-shots, hamlet, more-buildings, names-tour-shots, pavi-siri, shot-clearance, sunset-cove, playground, lantern-evening, pavi-siri-moments.
- Full command: `$env:DH_URL='http://127.0.0.1:8811'; node world/tests/run-browser.cjs area-shots build-mode clouds-water family-mode hamlet-shots hamlet more-buildings names-tour-shots pavi-siri shot-clearance sunset-cove playground lantern-evening pavi-siri-moments`.
- All fourteen day/night previews are saved. Review hand contact during the walking loop, duck-facing direction and the wide balloon composition; the collar pose now reaches collar height. Extra `pavi-siri-moments-collar-pose-trial.png` shows the pose trial.
- Record the completed suite counts and any fixes, then mark 23 done and branch task 24 from this tip. Do not mark 23 done based on the partial run.
- Task 22 remains WIP: Episode 1 transition changes need presets.js scope approval; see STUCK.md and cove-polish.result.md.
- Latest inherited completed full suite is task 21: 1293 + 2 startup checks.
- Local server was started on 8811; restart if needed after reset. No merge, push or publication.
