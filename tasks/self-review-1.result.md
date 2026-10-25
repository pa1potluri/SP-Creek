# Self-review 1 - WIP

- Branch from task-32 completion 7c9019c. Read rules, queue, blueprint and supplied Pavi/Siri reference sheets.
- Reviewed 272 camera poses (34 shots, four positions, day/night), captured twelve task main views in film day/night and oil (36 images), plus twelve Play-mode day/night images.
- Short Play-mode passes at 13 sites in both moods: 26 walks, finite positions, dry footing, nonzero movement; errors [], sound locked. Data: world/tests/self-review-1-check.json. Model GLB files remain unchanged since 279d2c7.
- Contact-sheet inspection found normal walking-view protagonists absent after balloon -> train -> walking scene switching. Reproduced both hidden on shot 37: the playground captured the balloon's temporary false visibility, then the train reused it.
- Fixed life.js: release outgoing balloon/train ownership before the next scene/playground snapshots visibility, and update the playground's saved baseline when restoring. Added four scene-handoff regressions to train-trip.js (32 now); focused train 32 + balloon 20 + moments 35 = 87 passed, errors [].
- Refreshing all review screenshots/walks after the fix, with an explicit assertion that the walking-view protagonists render after the whole probe sequence.
- Pending: reproduce and fix visibility handoff within life.js, regression checks, refresh review images, full suite once, SELF-REVIEW-1 report and final result/QUEUE commit. Then continue task 34.
- No merge, push or publication.
