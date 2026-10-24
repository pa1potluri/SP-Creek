# Cafe counter light - WIP verification

## Finding / scoped change
- The requested bright counter outcome already exists in the inherited code: shelf/counter self-lit strips, warm emissive wood/ivory, bright painted room lining and the existing two lamps. Source history includes main commit 3d5cde8; the old STUCK entry predates those changes.
- Kept the existing appearance; no duplicate glow geometry, texture replacement or new point lights were added. Removed only the stale dark-counter STUCK item.
- Fixed mid-shot Animated film pixel check at 960x600 (luma below 16/255 counted near black): golden mean 141.88, median 120, 0% near black; night mean 159.99, median 141, 0% near black. Data: world/tests/cafe-bar-light-check.json.
- Counter day/night images inspected: cosy cream/honey surfaces, clear cake/tea sign and friendly cafe host, no dark jump-scare corner in the counter view.

## Left / exact checkpoint
- Saved counter images cafe-bar-light-18-day.png / -night.png and entry images cafe-bar-light-17-day.png / -night.png.
- Full counter path check: five positions in each mood (ten rendered frames), all 0% near black; mean luma 126.07-159.86, median 98-147. Data: world/tests/cafe-bar-light-path-check.json.
- Full suite running next; record complete counts before marking done.
- No app-source change required. Existing shots/presets remain unchanged. Camping and Episode 4 still deferred by user choice.
- No merge, push or publication.
