# Self-review 2: tasks 34-38

- Review base: area/episode-presets-2 at **884d1a3**. Scoped fixes are on area/self-review-2, **40da424**. No merge, push or publication.
- Full suite on final review code: **1636 passed + 2 startup reload checks**, all 25 suites, browser errors []. All **82 views / 16,482 samples** pass clearance. Focused rain 28 + garden 41 = **69 passed**, no browser errors. Garden movement maximum: 1.064m over one-second samples.
- **128 rendered camera poses**, **14 short Play movement checks** at seven places in day/night, all dry and finite; **32 raw previews + three contact sheets**. Browser errors []; sound stayed locked. Original character assets match 9ca912b byte-for-byte in Git.
- Overall: new content is calm, rounded and child-friendly; no threatening themes or new deep-water access found. One inherited cove night rendering issue needs a separately scoped follow-up, below.

## 34 - Rainy day fun: PASS after cleanup fix

- Source tip **48b6217**; files: world/src/{characters,life,camera,presets}.js. Source full suite **1493 + 2 startup**; current rain checks **28**.
- Saw original Pavi/Siri, pastel umbrellas/boots, small puddle hops, a warm cafe window and clearing rainbow. Hidden rain clothes now detach so normal character bounds stay intact; returning to rain reattaches each item to its owner.
- Screens: world/tests/self-review-2-34-{day,night,oil}.png; walk-puddles, walk-cafe and walk-rainbow day/night images under the same prefix. Views 66-68 also retain their task previews.

## 35 - Market day: PASS

- Source tip **2ffb852**; files: world/index.html, world/src/main.js, world/src/areas/town-center.js, world/src/{life,camera,presets}.js. Source full **1537 + 2**; market checks **41**.
- Five soft stalls, pastel bunting, friendly keyboard player, shoppers, balloon and shared bun read clearly in film and oil; warm night lamps. Off-by-default switch, project restore, Build pieces and inactive balloon cleanup are covered. Quiet piano reuses the nearby cafe ambience after a real Sound click.
- Screens: world/tests/self-review-2-35-{day,night,oil}.png; self-review-2-walk-market-{day,night}.png. Task previews 69-71 retain all six day/night views.

## 36 - Little boat trip: PASS feature; inherited visual follow-up

- Source tip **e41d975**; files: world/src/areas/{meadow-lake,sunset-cove}.js (cove boat only), world/src/{life,camera,presets}.js. Source full **1561 + 2**; boat checks **21**.
- Both original riders wear bright life jackets; rounded boats/oars, ducks and tiny fish stay on slow near-shore routes. Lake waterfall view remains readable at night; shore Play checks stayed dry.
- **Needs visual follow-up:** a broad solid navy strip at the cove waterline in night Play. It already exists in world/tests/self-review-1-walk-cove-night.png, before this batch. Exact cause is not diagnosed. STUCK.md requests a separate existing shoreline/sea/night-rendering scope; no such renderer changes were made here. No blocked path or threatening content observed.
- Screens: world/tests/self-review-2-36-{day,night,oil}.png; self-review-2-walk-lake-shore-{day,night}.png and self-review-2-walk-cove-shore-{day,night}.png. Check that cove night strip first before choosing shore-facing footage.

## 37 - Growing a garden: PASS after continuity fix

- Source tip **a458ffe**; files: new world/src/areas/garden.js, world/src/{life,camera,presets}.js, tasks/BLUEPRINT.md. Source full **1604 + 2**; current garden checks **41**.
- Four beds meet the ground; sunflowers, carrots, pumpkins and flowers grow from time, with quiet insects, watering and harvest. Five Build pieces save/reload. Original actors now take a smooth 14-second walk between beds instead of jumping ten metres at 45 seconds; hand props hide during the move and outside the story.
- Screens: world/tests/self-review-2-37-{day,night,oil}.png; self-review-2-75-{day,night,oil}.png shows the corrected bed-change walk; self-review-2-walk-garden-{day,night}.png. Earlier terrain overlap and raw-camera clearance findings were fixed before the source full pass.

## 38 - Episodes 6-9: PASS

- Source tip **884d1a3**; files: world/src/camera.js and world/src/presets.js only. Source full **1633 + 2**; episode checks **25**. Four presets are exactly 180s, natural paced, wide at both ends, with existing shot numbers unchanged.
- Rain clears gently, market switch restores, boat end card follows the cove route, garden ending holds the completed harvest. New rainbow view clears the church roof; cove end card frames open water so the inherited night strip/hillside stay out of view. No face close-ups.
- Screens: world/tests/self-review-2-38-{day,night,oil}.png; all eight episode-presets-2-{78,79,80,81}-{day,night}.png are final. Check the end-card space and garden harvest handoff first.

## Evidence and handoff

- Contact sheets: world/tests/self-review-2-film-contact.png, self-review-2-oil-contact.png, self-review-2-walk-contact.png. Raw pose/walk evidence: self-review-2-check.json. Full counts: world/tests/self-review-2-full.json.
- Rain cleanup and garden movement are the only app changes on this review branch. The inherited cove waterline request is recorded in STUCK.md and the result file.
- Original review instructions are preserved as tasks/self-review-2.task.md, because Windows cannot keep that original task name distinct from requested uppercase SELF-REVIEW-2.md.
- Task 39 is complete; stopped here. Task 31 remains paused until Thu Oct 29. Claude reviews before any acceptance or publication.
