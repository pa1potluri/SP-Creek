# Game health review — 26 October 2026

## Fresh check
- Local game server responded. Pipeline game ready in 8,259ms (one local sample, not a guarantee).
- Film shots 18 cafe, 26 forest, 40 beach and 94 picnic checked in day/night: eight views rendered, finite camera positions, zero browser JavaScript errors. Sound stayed locked.
- Pipeline URL: 10 sampled town walkers have new heads. Normal URL: 0/10 have new heads, confirming the old faces remain the default. This is incomplete rollout, not a browser cache fault.
- Latest full suite on unchanged app code: 2015 + 2 passed (showcase-watercolor-full.txt). Not rerun for this read-only inspection. Passing tests do not establish visual acceptance or rule out every later freeze.
- Fresh evidence: world/tests/game-health-review-{18,26,40,94}-{day,night}.png and game-health-review-check.json.

## Confirmed pending work, recommended order
1. Character rollout and consistency. Normal game still shows originals; opt-in Pavi uses a simple fallback body while Siri retains her original detailed model. The fresh beach image shows the mismatch clearly. Finish approved head/body fit and decide the default rollout together, preserving rollback. Persistent per-person profiles and facial blinking/expression are still WIP; pedestrians only need simple solid surfaces.
2. Beach night rendering. Broad flat navy strip still plainly visible between shore and sea in fresh shot 40 night. Diagnose depth/terrain/water coverage; prior speculative material/overlap probes failed and were reverted. See STUCK.md task 40.
3. Forest grounding. Shot 26 day still has abrupt root/card silhouettes on the slope and a stretched-looking steep bank. Centre/footprint sampling alone did not solve the visual issue. Needs deliberate placement/trunk/card review rather than more blanket burial.
4. Meadow/picnic composition. Fresh view 94 still makes picnic props hard to read. It also shows a very straight water/land boundary behind the waterfall, reducing the natural landscape appearance. Inspect terrain/water backdrop and actual prop visibility before changing geometry; cause of the prop problem is not established.
5. Loading and first-use performance. 8.3s readiness remains long for quick review. Earlier evidence records shader first-use pauses; the specific null-seat freeze was fixed and 96 preset switches passed. This brief check did not reproduce a freeze and does not prove none can occur in extended use. Profile cold load and representative long playback before claiming production smoothness.
6. Presentation polish. The new 12-minute showcases work automatically, but intentionally reuse these unfinished environments and preview Watercolour treatment. Current fades are short dark overlays after camera cuts, not true two-scene image crossfades. Final reference-style visual quality is not complete.

## Handoff
- This task only checks and records findings; no app code, assets, camera definitions or saved game settings changed.
- Fix work remains in tasks 40, 48 and 52 plus the meadow/background follow-up above. Do not call the entire game finished based on test counts.
- No new child-safety violation seen in the sampled views. Full-world safety review was not repeated here.
- No push, merge or publishing.
