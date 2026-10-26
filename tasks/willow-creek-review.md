# Willow Creek — user corrections to implement
Status: queued; no implementation or completion claimed.
Reference: codex-clipboard-3c7ca884-9a05-4fd3-8f8b-dfb09695ef76.png, 26 October 2026. Explicit written corrections accompany the annotated Clean 3D / Free camera screenshot. Willow Creek is distinct from the main town; coordinate shared helpers without conflating their layouts.

## Required corrections
1. Camera/road: reduce the central road's visual dominance through camera height/perspective and road-width review; preserve usable routes and collisions.
2. Church landmark: strengthen its focal hierarchy and recognisability through framing, sightlines and local contrast before changing world scale.
3. Storefront framing: keep important buildings visible with intentional safe margins in authored views.
4. Rain/particles: reduce distracting rain streak density and floating-particle opacity where appropriate; verify intended weather/mood and keep other areas and weather options working.
5. Shop signs: improve size, contrast, placement consistency and readability, retaining approved child-safe names.
6. Characters: improve visible placement/staging and readability along the street. Inspect camera focus/distance before arbitrarily scaling current approved characters; preserve walking and clearance.
7. Ground: reduce repetitive texture and broad empty areas using restrained purposeful environmental detail, without clutter or needless render cost.

## Priority
P1 camera and road framing; P2 landmark and storefront readability; P3 weather, characters and terrain polish.

## Scope and mandatory checks
Proposed scope: hamlet.js Willow Creek layout/signs/props, its camera shot module or camera.js existing views, world.js shared road/terrain helpers only where needed, atmosphere.js local particle/mood treatment, life.js staging only if required. Preserve saved shot/preset IDs, model identity, existing routes, safe access and all styles. Free camera remains unrestricted: no promise of safe framing from every arbitrary user angle.
Test at multiple camera distances and aspect ratios, including wide desktop, narrower window and portrait review viewport, with side panel open/closed. Verify church, key storefronts and featured characters remain readable in authored views, and that top controls do not obscure them. Check day/night, dry/rain, Clean 3D and Film/Oil comparisons; no test-triggered sound. Before done: full suite, Film day/night screenshots of every changed shot, focused framing/weather evidence and result file.
Related reviews 80 main-town, 77 UI/composition, 64 actor clearance and 60 atmosphere acceptance remain open. Preserve them; this task is specifically Willow Creek.
