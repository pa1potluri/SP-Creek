# Coach window/lamp flicker repair
- User's annotated screenshot identifies coach corner/window trim and lamp edges; this is separate from task 59's platform/rail overlap fix.
- Found actual coplanar geometry: end-wall face and corner-post face both at local z=4.46m, plus overlapping post/header side faces. Trim is now 3cm proud of the end wall; vertical posts meet the header at y=3.16 without overlapping it. Doors/boarding steps and route unchanged.
- Glowing station lamp shades no longer receive crawling self-shadow edges; posts and other station geometry retain shadows.
- Focused actual raycast confirms corner face z=4.4900000 and wall z=4.45999999, distinct by 3cm. 600 motion steps over five train views, finite cameras, no browser errors, audio locked. Evidence coach-flicker-check.json.
- Six Film day/night captures coach-flicker-{56,57,58}-{day,night}.png with current approved default residents and supplied Pavi/Siri models.
- Full suite: 2015 + 2 startup checks passed, 31 suites, exit 0, Browser errors []. Identified depth conflicts fixed; no quantitative guarantee against every driver/filter aliasing effect. Further user-observed flicker should remain open rather than be dismissed by passing tests.
- Verified repair saved; next navigation task 68 includes ALL latest top-controls/auto-hide popover screenshots; task 65 includes brighter/readable kites and cast facing; earlier collision/episode/atmosphere requests remain queued. No push/merge/publish.

