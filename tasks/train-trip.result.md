# Little train trip - complete

## Built
- A 422m railway branch south of Willow Creek, outside its houses and pond, ending at a sheltered seaside halt above Cove. Stops and route recorded in BLUEPRINT.md.
- Windowed coaches, original Pavi/Siri passengers, gradual boarding, retracting steps, closed lower travel doors, soft steam and the existing main-station departure whistle.
- Appended shots 56-58 and four-minute "A little train trip" preset. Existing north-south service remains.
- Smoothed track grade capped at 10%; narrow terrain pads prevent coach-floor burial. Railway pad priority survives Hamlet off/on and project changes. Clearing preserves seeded scenery outside the corridor.
- Fixed visibility ownership with the playground and restored both normal and Cove siblings when the trip ends. Warm emissive trim keeps coach windows readable at night without new lights.

## Checked
- Fresh full browser suite: **1389 passed + 2 startup reload checks**, browser errors `[]`; sound stayed locked.
- Counts: train-trip 28; area-shots 7; build-mode 525; clouds-water 227; family-mode 46 (+2 startup); hamlet-shots 47; hamlet 37; more-buildings 155; names-tour-shots 51; pavi-siri 50; shot-clearance 60; sunset-cove 40; playground 35; lantern-evening 26; pavi-siri-moments 35; balloon-ride 20.
- Clearance: 59 shots / 11,859 samples, no failed paths. Route sampling keeps coach floors at least 0.827m above sampled longitudinal ground; deterministic seeks, stops, doors, steps, Hamlet toggles and final rendered preset frame pass.
- Animated film previews: `world/tests/train-trip-56-day.png` / `-night.png` through shot 58 (six images), day/night inspected.

## Follow-up / scope limit
- Visual trip complete. Branch audio pan remains tied to original rail x=70 because main.js listener() is outside this task's files. Main-station whistle works; request for actual locomotive x/z is in STUCK.md. No main.js edit was made.
- Claude reviews before acceptance. No merge, push or publication.

## Follow-up resolved in task 32
- Explicitly authorized listener() change now reads the locomotive world x/z. Integration checks confirm it follows the branch, away from the old rail x=70. Existing quiet whistle/steam and real-click sound lock remain.
- Final stack verification: 1460 + 2 passed, all 20 suites, errors []. The old audio-pan STUCK item is resolved.
