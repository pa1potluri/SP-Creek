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

## Town elevations/playground reference — 27 October
Durable reference: tasks/ref/town-elevations-review.png (codex-clipboard-1deee8e9-62f5-4af7-ac05-1b4ce59c6e8c.png). Extend the existing town/layout task; do not create a duplicate redesign task.
The accompanying review highlights easier navigation, better connection between lower town and upper hillside buildings, and clearer playground/building detail. The illustrated target suggests a gentler winding hillside approach, coherent paths/fences and a more integrated playground; verify these routes and current grades/colliders in the running app before implementation. Preserve the recognisable town layout, Clean 3D sunset atmosphere, existing buildings/landmarks and six-tab UI. Treat extra decorations in the illustration as visual guidance rather than automatically required new systems.
Priorities: (1) continuous readable street and lower-to-upper access, (2) safe playground approach/surface/equipment visibility and spacing, (3) building doors/windows/awnings/signage and restrained planting/lighting detail. Keep gate/crossings and playground routes clear, avoid intersecting fences and overly dense props. Preserve earlier train-framing/steam/foreground-tree corrections.
Verification: walk both elevation routes and playground entrances; check slopes/ground contact, rail/road crossings, collision continuity, benches/equipment separation, and camera visibility by day/night. Any terrain/pad change must update routes/colliders/affected views together. No global light/style replacement or unnecessary new assets. Full suite and affected Film day/night evidence before done.

Q13 scope approved by user in this session: world/src/areas/playground.js for surface and entrance paths (actual owner module). Increment adds neutral fine-grain ground, equipment surface zones and continuous rendered-ground entrance; source/result on area/quick-13-playground. Equipment/collider/actor placement and dynamics retained; larger town/elevation review remains open.
