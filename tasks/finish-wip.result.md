# Finish WIP - complete

- Branch area/finish-wip from area/performance 08beea1. New task files 32-39 and updated queue committed as 9a1cb87.
- User/lead explicitly authorized camping main.js registration, Episode 4 and Episode 1 presets, and real locomotive listener coordinates; earlier task-26 deferral is superseded for these changes.
- Camping now imports/constructs normally and advances in step(dt). Train sound snapshot uses the locomotive world x/z; sound still requires a real user click.
- Episode 4 appended, 180s, natural cuts: wide clearing 59, sky 60, wide clearing 59, calm night throughout.
- Episode 1's five abrupt camera/staging cuts replaced by one appended cove view 65: wide start, slow from-behind beach walk, wide end, 180s. Existing views 0-64 remain numbered unchanged and still available. No face close-ups or character redesign.
- Added finish-wip regression checks and updated the old fixed Episode 1 shot-order assertion to the new uninterrupted-take contract.
- Smoke: 13 passed, errors [], sound locked. Full Episode 1 simulation: 1800 samples at 10Hz; maximum camera step 0.10817m and actor step 0.02177m. No visible staged townsfolk cross the recording path.
- Normal-startup day/night captures 59, 60 and 65 saved and inspected (six images): warm tents and guarded fire, nearby grown-ups and friendly owl, readable nights, original siblings from behind on dry sand. No hidden preview factory used.
- Full suite: **1460 checks + 2 startup reload checks passed**, all 20 suites, exit 0, Browser errors: []. Clearance: 67 passed, 66 shots / 13,266 samples. Per-suite counts: world/tests/finish-wip-full.json.
- Tasks 22, 26 and 28 completed on this follow-up branch; result files and queue updated. Train sound follow-up also resolved. All four solved STUCK entries removed. No unfinished task-32 work; continue self-review 33.
- No merge, push or publication.
