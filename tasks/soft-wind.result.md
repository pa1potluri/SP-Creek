# WIP - Soft wind

Lowered the wind noise band to 220 Hz with a smaller 45 Hz / 40-second sweep, narrower Q, a 550 Hz low-pass, lower source level and half the wind bus gain. Live and offline use the same helper; seeded brown noise and offline loop offsets keep rendered pieces continuous. Slider default is 0.15. All preset audio wind settings are reduced to 45% of their previous values; visual life.wind settings are preserved.

Eight silent graph checks passed: lower band/Q, low-pass, identical seeded buffers, correct export loop offset, bounded offline sweep, slower LFO and smaller gust amplitude. No AudioContext was created. Browser capture passed with audio locked and no errors. Animated film previews saved as world/tests/soft-wind-24-day/night.png and soft-wind-26-day/night.png. Full suite is running; remaining final counts and completion commit. No sound will be started by tests. No push. Next lets-build-replay, playground, lantern-evening on stacked branches.
