# WIP - original 3D Pavi and Siri: rig built, full suite running

Started area/pavi-siri-3d from main 75a90ab. Commit 279d2c7 saved all new task files/QUEUE and the user's two GLB models. Models and embedded textures remain byte-for-byte unchanged; no upload. The unchanged official Three r160 GLTFLoader was added locally; its only add-on dependency is the existing BufferGeometryUtils.

The shared character factory now loads both original textured meshes once, prepares skin weights once, and gives every appearance an independent 18-bone skeleton. A uniform 1.42 scale takes the supplied 1.2m meshes to the existing cast height (~1.70m), keeping paths/camera framing. Position-based, smoothly blended weights use at most four influences. Siri's distinct arm proportions and mesh connectivity isolate her arms from the long skirt/bag; her skirt follows the hips, feet move inside, and back braid follows head/chest. The face texture remains intact. Known arm/cheek patches and the extra front braid are preserved for Claude's texture pass.

Walk/idle/gesture APIs are retained. Pavi keeps his lively wave; Siri has a slower restrained wave. Torso motion has its own bone, avoiding overwrite of bind offsets. All main-town, cove/Episode 1, playground and festival appearances use the same new factory. Townsfolk are unchanged. Models retain original colour maps in all six styles and cast/receive shadows, with a small shared emissive lift for night readability. Faces are baked textures; no new facial morphs were invented.

Early positional-only Siri arm assignments pulled adjacent garment geometry; a colour-mask trial was discarded. The final mesh-connectivity partition and Siri-specific bone proportions fixed the wave. Final idle/walk/rear/wave inspection captures are saved and visually checked. In-world front/back walking and Episode 1 sunset day/night captures reported no errors and audio locked.

Exact resume point: complete thirteen-suite run is active on port 8811 (exec session 84636). Wait for output, fix any failures, record full counts and mark done/commit only after it passes. Expanded pavi-siri tests check normalized weights, feet isolated from arm bones, original bind geometry, independent skeletons/shared textures, all styles and all scene appearances. Earlier smoke passed 23 and an earlier expanded check passed 48; final expanded suite is part of the pending full run.

Required previews: world/tests/pavi-siri-3d-front-day.png / -night.png, -back-day.png / -night.png, -sunset-day.png / -night.png. Also saved source-front/back and rig-idle/walk/back/wave inspection PNGs.

Next after this task: cove-polish (22), then the queue in order. The queue note explicitly permits a larger review backlog while Claude is offline. Task 31 is not eligible before Thu Oct 29. Never merge, push or publish.
