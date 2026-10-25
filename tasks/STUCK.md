# Stuck / later

Things that did not get solved after a few tries go here.

Task 32 resolved Cove continuity, camping startup, Episode 4 and branch-train sound location. Historical scope requests and measurements are preserved in the task result files. The current inherited visual follow-up is recorded below.

## Inherited cove night waterline - visual follow-up from self-review 2

- What/where: a broad solid navy strip appears beside the waterline in night Play views at Sunset Cove; strong palm shadows can also dominate shore-facing frames. New boat riders remain visible and walking boundaries stay dry.
- Evidence: world/tests/self-review-2-walk-cove-shore-night.png. The same strip already appears in world/tests/self-review-1-walk-cove-night.png, before tasks 34-38.
- Tried: compared the earlier review capture, tested several establishing-camera angles, then framed appended view 80 over open water so the new episode ending excludes the strip and dark hillside. The underlying Play view is unchanged.
- Request: Claude should scope a cove shoreline/sea/night-rendering cleanup. Exact cause is not yet diagnosed; task 36 allowed boat changes only, so this review does not alter the existing sea/shoreline renderer. This is a visual follow-up, not a blocked path or new threatening content.

## Task 40 diagnosis (area/cove-night-strip)

- Reproduced the navy band in Film shot 40 at night. Browser-only mesh hiding and a bright shoreline material isolate its screen region, but ray intersections and visible coverage need further investigation.
- Tried sea/sand geometry overlap (+8m) and a brighter sea-only near-field reflection; neither removed the band. Both app probes reverted; no speculative renderer changes retained.
- Next check: map screen points using the actual canvas rectangle and inspect shoreline/ground shader discard and depth coverage together. Keep the original follow-up open. Moving on after several attempts per AGENTS.md.
