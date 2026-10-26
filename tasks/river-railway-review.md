# River and railway — user review
Status: queued; no scene fixes claimed.
References (26 October 2026): annotated codex-clipboard-81a53a58-806b-405d-ac29-5f2f85d25096.png (Blocky style, Free camera), and codex-clipboard-8eb22646-5072-4b12-9ebe-da01824dd942.png (Clean 3D, River & mill, Free camera). The second image is an additional visual reference without new written corrections; do not invent extra requirements from it.

## Review and requested order
1. Camera and track scale: railway overwhelms the foreground in the annotated view. Review perspective and proportions; make the horse/rider readable through framing first, retaining consistent world scale and safe track clearance.
2. Crossing and river framing: clarify road/rail crossing geometry and priority, keep the bridge and river's key structures within intentional framing rather than accidentally clipped at the right edge. Check safe passage and train clearance, not just appearance.
3. Props and distant scenery: ground lanterns/markers read as scattered cubes; give them intentional placement and readable purpose. Vary repeated distant silhouettes/depth and unify tree scale/spacing within the selected art style.

## Boundaries and verification
Blocky style should deliberately use blocks (task 76); do not round away its intended shapes to address the annotation's inconsistent low-poly appearance. Compare matching camera/time in Film, Blocky and Clean 3D to separate geometry/framing problems from style-specific ones. Inspect the named River & mill view and free-camera perspectives. Do not force free camera to one fixed composition.
Proposed scope: world.js rail/road/river props and crossing geometry, camera.js relevant existing views or their shot module, styles.js only for demonstrated style inconsistency; life.js if rider framing needs focus helpers. Preserve all saved shot/preset numbers, train route alignment and other styles. No train/rail rescaling without corresponding movement, collision and boarding checks. Full suite, affected Film day/night screenshots, style comparisons and result before done.
Related pending work: task 73 river boats/fish, 74 station residents, 76 Blocky appearance/menu, 77 composition/readability, 64 actor clearance and prior train flicker motion review. Preserve all of these; this task does not replace them.

## Additional river and hill landscape review
Reference: codex-clipboard-e92f1dad-86e1-4dec-896d-2410c150af01.png, 26 October 2026. Extend this task rather than creating overlapping landscape work.
- P1 — river banks and crossings: banks look jagged/geometric; smooth their contour and vary bank width naturally. Make road-to-bridge alignment continuous with a smooth approach. Clarify the left road/rail intersection and ensure rails meet the ground cleanly. Preserve safe bank boundaries, bridge supports and train clearances.
- P2 — terrain texture and prop distribution: reduce repetitive/noisy hillside tiling, introduce restrained scale/patch variation, and arrange trees, shrubs and rocks in deliberate natural clusters rather than uniform scattering. Keep foliage grounded and retain open sightlines.
- P3 — distant depth and mill readability: improve layered hill/plateau silhouettes and atmospheric separation without merely adding uniform fog. Improve mill and waterwheel readability through camera composition, local contrast/lighting and proportion checks; keep wheel/bridge/water alignment and existing animation intact.
- Combined implementation order: address bank/crossing continuity and camera/track framing first; then terrain texture/props; then distant depth and mill presentation. Retain all earlier task 79 rider, marker, edge-framing and style-consistency points.
- Additional checks: walk both bridge approaches and road/rail crossing; inspect shoreline at low and high camera angles; verify bank collision/water restrictions, boat routes and deterministic waterwheel/train motion. Compare the affected view in Film by day/night and in the selected reference styles. No visual correction is marked done by recording this review.

27 October reference tasks/ref/railway-crossing-review.png adds functional warning lights/barriers/whole-train clearance and road/gate continuity. Implementation tracked separately in tasks/railway-crossing.md (task 88); preserve the existing river/rail visual review and sunset/Clean style direction.
