# Market day - WIP

- Branch area/market-day from rainy-day completion 48b6217. Read rules, queue, blueprint and task.
- Five rounded stalls: fruit, flowers, bread, soft toys and balloons; two pastel bunting strings with rounded posts; friendly street pianist at a small keyboard; six chatting/shopping townsfolk.
- Off-by-default Market day switch controls scenery and its approach boundaries. Saved projects and the market preset restore the same switch. Stalls use the existing Build extension registry; no general World.js changes needed.
- Original Pavi/Siri visit the balloon stall, keep a pastel balloon and share a bun. Pure-time scene poses, cleanup when disabled; removable props preserve original models/textures.
- Appended views 69-71 and five-minute preset, wide start/end. New viewpoints stay near the cafe's existing quiet piano ambience, reused for a calm tune after the user enables sound. No new audio context or score/source; existing live/offline mix is retained.
- Smoke: **40 passed**, errors [], audio locked. Verified switch/physics cleanup, duplicate prevention, six shoppers, original protagonists, bun/balloon staging, seeks, project and Build round-trips, all six styles and preset playback. Maximum new-view distance to the existing cafe piano source: 33.357m (inside its 55m audible range).
- Six Animated film previews 69-71 saved and inspected: clear stalls/balloon/bun, soft night lanterns and friendly pianist. No browser errors.
- Full 22-suite run underway. Pending final counts and result/QUEUE commit; then task 36.
- No merge, push or publication.

- First full run found a cleanup regression at pavi-siri child-proportions: an invisible market balloon remained parented to Pavi and enlarged bounds. Fixed by detaching it when inactive and reattaching only while used; added a body-bounds cleanup regression. Focused market -> original-model check pending, then rerun the full suite. No partial run claimed as success.

- Cleanup verification passed: market 41 + original-character 50 = 91 focused checks, errors []. Active appearance unchanged, so six inspected previews remain final. Fresh full 22-suite run now underway on the corrected code.
