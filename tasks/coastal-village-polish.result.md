# Coastal village reference — WIP, first continuity increment verified
User reprioritised supplied beach reference above remaining quick fixes. Current branch area/coastal-village-polish. Latest image preserved in tasks/ref/coastal-village-review-latest.png.
## Completed structural increment
- Reproduced cottage ground intersections down to1.29m and path shader fading along length instead of width. Regraded cottage plots, added stone foundations, corrected path feather axis and used rendered-ground fitting.
- All15 door approaches now join two connected stone spines and the main cross lane. Steps use matching paving instead of a white strip. Relocated one palm found blocking an approach.
- Added16 pier supports reaching below seabed, a graded land approach and connecting path, retaining existing deck/rail bounds and water safety.
-135 cottage footing samples:0 buried, minimum floor clearance .02m.615 approach samples clear/dry after palm move. Pier supports grounded; actual90-step land-to-pier walk reaches x-354,y1.204. No page errors/audio.
- Full31 suites2015+2 startup passed, Browser errors []; coastal-continuity-full.txt. Film/Clean overview day/night in coastal-continuity-*.png; Clean before screenshot retained.
## Remaining / exact stop
Still WIP: near-shore shallow-water/foam integration, vegetation/rock grouping and refinement of cottage materials/light toward the reference. Do not mark whole beach reference done. Next inspect cove sea shader: distance-based backdrop mix can cover nearshore detail when viewed from above; use local offshore falloff, preserve one far horizon. Then coastal vegetation placement/route clearance. Keep no new lights/global exposure changes. Full final suite and fresh evidence required after further code changes.

## Second increment — shoreline and planting
- Sea shader now preserves procedural near-shore water instead of covering it with the distant sunset picture. Added shallow-water colour falloff and stronger broken foam, still driven by world time; far horizon and all style switches retained.
- Removed inland courtyard palms and placed the18 coastal palms farther seaward with four sizes. Added small instanced shrub/rock groups outside cottage footprints and access corridors. No new lights or external assets.
- Trial terrain grass overlay showed triangular edges in the overview; removed before saving. Broader hillside texture/vegetation polish remains open.
- Rechecked135 footing and615 cottage approach samples: no buried floors, blocked approaches or deep water; pier supports and actual land-to-deck walk pass. No page errors, audio remains locked.
- Fresh Film/Clean/Oil day/night overview and beach-walk captures: coastal-continuity-{film,clean,oil}-{day,night}.png and coastal-beach-{film,clean,oil}-{day,night}.png.
- Full31 suites passed:2015 checks +2 startup reload checks, exit0, Browser errors []. Log: coastal-polish-full.txt.

## Still open after second increment
Cottage roof/material detail and warmer window balance; larger uphill vegetation and less repetitive hillside surface; broader moving-camera/performance comparison. Shoreline is more integrated but still needs a closer artistic comparison with the supplied target. Overall task89 stays WIP; do not tick Q20 or claim the image is fully matched. No camera/preset IDs, UI, global exposure or light count changed.
