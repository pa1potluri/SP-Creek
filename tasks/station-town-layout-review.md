# Station and town layout — user corrections to implement
Status: queued; no implementation or completion claimed.
Reference: codex-clipboard-206895cd-a168-4656-a712-3142d25a9111.png, 26 October 2026. Includes explicit written corrections from the user.

## Required corrections
1. Train framing: locomotive/carriages are oversized in the foreground and cropped at the bottom. Adjust camera/framing first so the intended train is visible; investigate scale only after bounds/clearance checks.
2. Station visibility: rebalance the dominant right foreground, reduce obstruction and keep SP Creek Station signage readable.
3. Playground: improve surface detail/contrast and connect paths naturally to town; preserve safe equipment spacing and access.
4. Town layout: organise buildings around readable streets with purposeful spacing and clear routes. Retain approved names and working access/colliders.
5. Steam/smoke: reduce plume size, opacity and density so buildings remain visible; preserve gentle readable steam and deterministic animation.
6. Foreground tree: reposition the large yellow tree or adjust authored framing to avoid blocking the right side; preserve grounded placement and other views.
7. Ground texture: reduce repetitive/noisy tiling and place purposeful vegetation/props in empty areas without cluttering walkways or raising render cost unnecessarily.
8. Connections: clarify road/rail crossing, platform approach and station access; inspect alignment and traversal continuity.

## Priority and technical gate
- P1: camera/train framing and route readability.
- P2: station visibility and town layout.
- P3: playground, smoke, foliage and ground polish.
- Before any train scale change, verify camera bounds over the moving train's route and collision/clearance with nearby roads, station structures and platform. Check complete locomotive/carriage extents, boarding steps, wheel/track alignment, passenger attachments and saved train shots. Do not hide cropping by making the train implausibly small.
- Screenshot is a Free camera view: authored shot improvements must not restrict user Free camera navigation or promise uncropped framing from every arbitrary angle.

## Scope and evidence
Proposed scope: relevant station/train camera views in camera.js or their shot module, world.js station/town/playground paths and local textures/foliage, life.js train bounds/effects where demonstrated, atmosphere.js emitter handling only if needed. Preserve saved shot/preset IDs, town functionality, train routes and all art styles. Avoid moving whole town blocks without updating pads, routes, colliders and existing camera coverage.
Before done: focused train bounds/crossing/boarding checks through motion, no page/resource errors, full suite, Film day/night captures of every affected authored shot, plus a same-view style comparison and result file.
Related tasks: 79 river/rail and crossing review, 80 town layout/sign/prop review, 74 quiet station residents, 71 train flicker motion review, 64 actor clearance and 77 readability/composition. Coordinate shared changes rather than duplicating or discarding those requests.
