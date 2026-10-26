# Episode 12 coverage — completed camera correction, awaiting review
- Runtime diagnosis: the 180-second episode activates five clips (94,89,90,91,94) and the picnic cast correctly. A permanently stuck waterfall-only sequence was not reproduced. However, shots89 and91 had identical camera positions and targets, making the sequence repetitive.
- Shot91 now views the picnic from the opposite wider side; shot90 targets the blanket/fruit more directly. Existing shot IDs, preset length, five clips, character assets and other scenes retained. No face close-ups.
- Focused runtime diagnostic verifies 180 seconds, four distinct camera positions, picnic activation on every clip, three visible friends, and locked audio. Evidence world/tests/episode-12-coverage.cjs/.json.
- Full suite: 31 suites, 2015 + 2 startup checks passed; Browser errors: []. Log world/tests/episode-12-full.txt.
- Film screenshots of affected picnic sequence: episode-12-{89,90,91}-{day,night}.png. Reviewed new day angles: blanket/cast/lake visible, no face close-ups. No styles changed or camera IDs renumbered.
- Wider meadow landscape/plant/path/water polish remains task65 WIP. If the whole episode still remains on one view in a particular review session, the session-specific freeze needs a fresh reproduction; this change does not claim that unobserved failure is solved.
