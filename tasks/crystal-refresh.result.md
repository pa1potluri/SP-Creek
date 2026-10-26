# Crystal Mine refresh — WIP visual handoff

## Implemented
- Replaced the short square stone-box lining/roof with a continuous rounded cave vault and closed rounded back wall. Kept a level floor and original safe wall/ceiling collision limits; no shafts/drops.
- Replaced oversized brick-like rock texture with a small locally generated soft stone texture, muted layered rock colours and rounded outer arch shapes. No downloaded images or new libraries.
- Rebuilt crystals with bevelled hexagonal profiles and pastel colours; lowered harsh emissive intensity/pulse. Moved sign forward to keep it readable.
- Moved mine cart 3.6m to the side and updated its collision rectangle/crystal cargo, clearing the central entrance track. Balloon ride and existing shot/preset IDs untouched.

## Checked / current status
- Four Film views (existing 28 and 33, day/night), no browser errors, finite camera positions, sound locked. Current default approved residents still loaded. Evidence crystal-refresh-check.json and crystal-refresh-{28,33}-{day,night}.png.
- Original comparison evidence crystal-refresh-before-{28,33}-{day,night}.png. Do not use old screenshots as the current game review.
- Current look is a first pass, not final visual acceptance. Outer rock shapes remain visibly procedural/rounded; a more organic hillside/entrance blend and atmospheric art pass may still be needed. Keep WIP rather than claim the user's rejection is resolved merely because geometry changed.
- Full suite: 2015 + 2 startup checks passed, all 31 suites, exit 0, Browser errors []. Log crystal-refresh-full.txt. No character version rollback, push, merge or publishing.

## Exact handoff
Suite recorded and all changes saved. Next functional priorities remain top Gameplay/Free Camera + simple side places (68), full actor clearance (64), Kite Day facing (65), Episode 12 coverage (66). Task 63 top style bar is implemented with preference retention, but final all-mode UX acceptance is unfinished. Prior atmosphere/forest/picnic and hero fit/persistence work stays open.

