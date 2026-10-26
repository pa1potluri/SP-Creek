# Solid rough pedestrians — complete, awaiting visual review

## Cause and correction
The supplied v01 resident data was loaded, but rendering it as isolated point samples still allowed background gaps when heads turned. Increasing point density/round footprints did not create a closed surface. The earlier previews therefore failed the user's rough, solid pedestrian requirement.

Residents now use actual opaque low-detail meshes for skin, neck, ears, simple eyes/nose/smile and sealed hair caps/back volumes. There are no resident point clouds, alpha cutouts, strand details or facial textures in this path. Saved profile width/height/depth/jaw/proportions, colours and rough hairstyle lengths still distinguish the twelve identities. This is a deliberate simple mesh approximation, not an exact reconstruction of every original point or a new hero-quality redesign.

Each profile is cached as one vertex-coloured mesh with shared material; additional appearances reuse geometry/materials at the existing head joints. Existing bodies and walking remain. Pavi's detailed source and point renderer are unchanged; actual-game Siri retains her original GLB. The isolated Siri test slot still uses the explicitly provisional town-202 shape.

## Review links
- Group and turn inspection: http://localhost:8811/character-pipeline-test.html?residents=solid-1
- Actual-game walking test: http://localhost:8811/?characterFaces=pipeline&residents=solid-1
- The extra version parameter opens a fresh page for review; existing tabs need reload. Ordinary game URL remains original-face rollback.
- Resident face focus temporarily hides neighbors so they cannot block a side/back inspection. Everyone restores all 14 actors. The detail dropdown now says Pavi detail and affects only Pavi.

## Verified
- **44 solid/integration checks passed**, zero browser errors. All 13 solid test slots (12 residents plus provisional Siri slot) contain one mesh and no Points objects, have opaque materials with no alpha cutouts/textures, and intersect face/hair coverage rays from 24 directions. Front/90/180/270-degree images inspected: no see-through point sampling.
- Actual game uses all twelve resident IDs; all resident heads are solid and attached to their rigs. A pedestrian moved 1.069m through world steps; no resident point .bin requests; sound locked. All seven styles (oil, film, toy, clean, paper, pixel, watercolor) rendered without errors.
- **Full suite: 2015 checks + 2 startup reload checks passed across 31 suites**, final exit 0, Browser errors []. Evidence: world/tests/solid-residents-full.txt. Final runtime mesh batching was included in this full run; no runtime changes afterwards.
- **5 loading/layout checks passed** after the change: ready overlay clears, no unused GLBs, all heads fit a narrow pane, no horizontal overflow, explicit failure/reload message. Sample local readiness 361ms; not a network guarantee.
- Six preview day/night views: solid-residents-{group,pavi,town-202}-{day,night}.png. Three turning views: solid-residents-turn-{90,180,270}.png. Two actual Film walking frames: solid-residents-gameplay-{day,night}.png. Focused evidence/driver: solid-residents-check.json / solid-residents.cjs. The old character-pipeline-test.cjs entry now delegates to this current verification instead of assuming all residents are dots.
- Hero export hash equals the unchanged frozen source. Original source package, GLBs, main.js, camera IDs and showroom are untouched. No safety concerns introduced by the simple friendly shapes.

## Resource change
- Runtime manifest including all twelve solid profiles: **27,451 bytes**. Resident point download: **zero**. The only head .bin requested is Pavi, **5,176,320 bytes**; this is separate from the existing bodies/world assets.
- Old resident binaries remain on disk/Git for rollback/provenance, but are not fetched by either the preview or opt-in game.
- Group sample: 14 bodies, 13 solid pedestrian/test heads, Pavi 64,704 review points; **180 draw calls / 143,194 triangles**, textures 0 in this isolated scene. Earlier v01 full group drew 2.50 million head points. No claim that this sample predicts complete-world frame rate; regular GPU rendering is still used.

## YouTube-focused handoff
The requested rough pedestrian surfaces and walking test are ready for user visual review. Keep residents as background walkers in wide/medium town shots; do not spend more time adding hair strands or hero-level facial textures. Main-character body/rig fit, dedicated Siri pipeline identity, expressions, saved per-person profile persistence and further streaming/LOD remain separate task 52 work. Default rollout/merge still belongs to lead review. Older forest/cove/picnic follow-ups remain in STUCK; this task does not fix those visuals or claim every episode production-ready.

Everything saved on area/solid-residents. No merge, push, upload or publication. No further experiments started.
