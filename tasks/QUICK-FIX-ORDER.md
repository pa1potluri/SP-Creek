# Quick-fixes-first checklist — 27 October

User requests smallest corrections first, then larger work. This execution order supersedes the historical order of unfinished queue rows; existing task IDs, results and all earlier requests remain intact. Terrain72 is saved WIP, not discarded.

Times below estimate hands-on implementation of a confirmed local issue, not a delivery promise. Diagnosis, full browser suite, screenshots, result and commit add time. Reproduce visual findings first; if a proposed quick fix needs a larger change, log it and move it to the appropriate later batch. No review wait required. Never push/merge/publish.

Tick an item only after its relevant checks and required full suite/day-night evidence are saved. Group closely related adjustments within one existing area/task branch; do not mix unrelated areas merely to reduce test runs. Already completed road/save/style-lock/menu repairs are not reopened without a new failure.

## A — Small adjustments first

| Tick | Order | Correction | Existing task | Initial implementation estimate |
|---|---|---|---|---|
| [x] | Q01 | Resize/reposition campsite owl onto a natural perch | 84 | 3–5 min |
| [x] | Q02 | Reduce oversized station/train steam where it obscures buildings | 81 | 3–5 min |
| [x] | Q03 | Reduce distracting Willow Creek rain/particle density while preserving manual weather | 82 | 5–10 min |
| [x] | Q04 | Check warm Kite Festival weather activation; correct only if reproduced | 65 | 5–10 min |
| [x] | Q05 | Improve Film focus/bloom without washing out signs | 85 | 5–10 min |
| [x] | Q06 | Move the obstructing station foreground tree; retain safe routes | 81 | 5–10 min |
| [x] | Q07 | Standardise sign contrast/placement in one town at a time | 80,82 | 10–20 min per town |

## B — Camera, layout and lighting passes

| Tick | Order | Correction | Existing task | Initial implementation estimate |
|---|---|---|---|---|
| [x] | Q08 | Station/train framing and signage; inspect camera bounds and road/structure clearance before any scale change | 81 | 15–30 min |
| [x] | Q09 | Town street/landmark/storefront margins and visible cast | 80 | 15–30 min |
| [x] | Q10 | Willow Creek road/landmark/storefront framing | 82 | 15–30 min |
| [x] | Q11 | Campsite framing, campers/tent spacing and firelight | 84 | 20–40 min |
| [ ] | Q12 | Forest path/lantern readability and firefly visibility | 78 | 20–40 min |
| [ ] | Q13 | Playground ground/contrast and connection to paths | 81 | 20–40 min |
| [ ] | Q14 | Remaining top/side/build UI hierarchy and composition | 77 | 20–40 min |

## C — Diagnose rendering and refine environments

| Tick | Order | Correction | Existing task | Initial implementation estimate |
|---|---|---|---|---|
| [ ] | Q15 | Beach diagonal lines/dune edges and sky transition; identify geometry vs style cause | 75,77 | 30–90 min |
| [ ] | Q16 | Meadow shoreline/path/flower/tree distribution and public wide-picnic readability | 65,47 | 45–120 min |
| [ ] | Q17 | Forest root silhouettes, spacing and hillside balance | 48,78 | 45–120 min |
| [ ] | Q18 | River banks, bridge approaches, mill visibility and prop clusters | 79 | 45–120 min |
| [ ] | Q19 | Mine/Balloon landscape polish beyond verified structural increment | 67,91 | 45–120 min |
| [ ] | Q20 | Coastal cottage paths/ground contact, pier support, shore foam/materials | 89 | 1–3 hours |

## D — Larger gameplay and style work

| Tick | Order | Correction | Existing task | Initial implementation estimate |
|---|---|---|---|---|
| [ ] | Q21 | Finish shared character/horse/player/scripted collision routing | 64 | Multiple sessions; scope boundary logged |
| [ ] | Q22 | Functional railway barriers/signals and safe occupancy handling | 88 | Multiple sessions |
| [ ] | Q23 | Pond duck click reaction, swimming, ripples and dock clearance | 87 | 1–3 hours |
| [ ] | Q24 | Quiet seated/standing/reading station residents | 74 | 1–2 hours |
| [ ] | Q25 | River boat placement and gentle jumping fish | 73 | 1–3 hours |
| [ ] | Q26 | Old Hollow cube ghosts/reactions, connected street and decoration | 90 | Multiple sessions |
| [ ] | Q27 | Genuine consistent block-built style | 76 | Multiple sessions |
| [ ] | Q28 | Terrain brush integration, protected structures/water/rail, support updates, undo/save and UI | 72 | Multiple sessions; foundation saved |
| [ ] | Q29 | Gameplay balloon boarding/return interaction | 91 | Scope boundary logged; estimate after integration inspection |
| [ ] | Q30 | Remaining character profile identity/fit/expressions | 52 | Multiple sessions |
| [ ] | Q31 | Remaining Oil/Paper/Pixel/Watercolour identity, atmosphere/colour/depth; seven-style same-view comparisons | 60,85 | Multiple sessions |
| [ ] | Q32 | Remaining first-use loading stalls/performance, persistence and whole-game regression | 50,61 | Profile as changes land; no fixed estimate |

Safety/collision regressions found during any earlier batch take priority immediately; cosmetic ordering must not defer a newly broken path or unsafe edge. Q21/Q22 remain important work even though their implementation is larger.

## Images / user work

- Existing screenshots are sufficient for Q01–Q32 to begin. No new reference pack needed.
- Optional only: final approved Siri face if replacing the current supplied appearance; custom transparent avatar/building thumbnails if desired. Existing fallbacks remain usable.
- If a reported freeze cannot be reproduced, request the specific location/style and short recording then; do not require the user to retest the whole world.
- Builder records checks, current preview evidence and exact WIP status. User can review at their convenience.

## First implementation batch

Start Q01 (campsite owl): inspect current camera and geometry, adjust only if the report is reproduced, verify existing campsite/character access, save Film day/night and full suite, result and commit on its own stacked area branch. Then Q02. Escalate unexpectedly complex findings without losing them.











