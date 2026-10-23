# AGENTS.md: how we build Dusty Hollow

Both Claude (Claude Code) and ChatGPT Codex read this file before every task. Follow it exactly.

## What this is

**Dusty Hollow** is a cosy, child-safe 3D western valley for a **children's YouTube channel**:
calm background videos, "let's build" videos and simple play. It must always feel friendly,
bright, soft and safe.

**Engine:** not Unity/Unreal. It is a **web 3D world in Three.js r0.160** (ES modules from the
jsdelivr CDN importmap, **no build step, no npm packages in the app**). Run it with
`python serve_world.py 8810` from this folder and open http://localhost:8810.
Browser tests: `node world/tests/run-browser.cjs <suites…>` (see existing suites in `world/tests/`).

## Roles

- **Claude = lead.** Plans the work, decides the structure, keeps the code organised, writes each
  task, and **reviews everything Codex does before it is accepted** (merged).
- **Codex = builder.** Builds the one area or small feature it is given, inside the files and
  folders its task names. Nothing else.
- **ChatGPT (images)** paints textures and plant/prop cut-outs on request (Claude asks for them).
- **The user** decides direction and approves each area.

## Child-safe rules (always)

- **No action, no weapons, nothing scary.** No guns, knives, fighting, blood, skulls, graves,
  alcohol, gambling, smoking, villains or jump scares.
- "Spooky" places (the ghost town) are **mysterious but friendly**: smiling ghosts, soft fog,
  gentle sounds, nothing that chases, shouts or startles.
- Soft colours, rounded friendly shapes, warm light, calm sounds. Cartoon characters only.
- Family mode must stay ON by default for the kids' world; the old western details (saloon,
  gunsmith…) only exist behind the Family-mode switch for the separate music-background videos.

## How we work

1. **One area (or small feature) per task.** Claude writes `tasks/<area>.md`: the area, the mood,
   what's needed, which files/folders may change, and how it will be checked.
2. **One Git branch per task**: `area/<name>` (e.g. `area/town-center`). Codex works only on that
   branch and commits there. Never commit to `main`; Claude merges after review.
3. **Stay inside the task's files.** If something outside them must change, stop and write it in
   the result file as a request instead of changing it.
4. **Keep the code organised.** New areas live in their own module `world/src/areas/<name>.js`,
   registered from one place; shared helpers stay in the existing modules. Match the existing
   style: plain ES modules, short comments only for the "why", no new libraries.
5. **Never break what exists**: don't renumber camera shots or video presets (saved timelines use
   their numbers; append new ones at the end), don't touch `world/src/showroom/` (another project),
   keep every art style working, keep renders deterministic (everything driven by the world time
   in `step(dt)`).
6. **Build first, check light.** Usage is limited, so spend it on building the area and its
   atmosphere, not on polishing. Fine detail matters little: the oil-paint (and later watercolour)
   filters soften it. One quick smoke test (the page loads, no console errors, the area appears)
   is enough; no long test suites, frame captures or repeated previews unless the task asks.
   Claude does the deeper review later. Tests must never start sound (sound only starts on a
   real user click).
7. **Review before every merge (Claude, never skipped).** "Build first, check light" only works
   because this review always happens before a branch is merged:
   1. The page loads with no errors.
   2. Walk through the area (and anything else on the branch) in day and night.
   3. Nothing scary or unsafe for children: no sharp or harsh shapes, no dark jump-scare spots,
      nothing threatening; water and edges are safe (no wading into deep water).
   4. One screenshot in the oil-paint style, compared with what the task asked for.
   5. Run the full test suite once (`node world/tests/run-browser.cjs` with all suites). Anything
      failing is fixed before merging.
   Then the user sees a screenshot or description and decides. The clean starting point is the
   Git tag `baseline`.
8. **Finish with a result file** `tasks/<area>.result.md` in plain words: what was built, what was
   checked (test counts), anything unfinished, and preview screenshots in `world/tests/`.

## Project map (short)

- `world/index.html`, `world/style.css`: the panel UI.
- `world/src/main.js`: wiring, UI, render/export, the frame loop `step(dt)`.
- `world/src/world.js`: terrain (`terrainHeight`, `walkHeight`, pads), buildings, river, props,
  plants, texture sets (oil / clean / flat), Build mode pieces, colliders.
- `world/src/hamlet.js`: Willow Creek. `world/src/life.js`: townsfolk, riders, train, animals.
- `world/src/characters.js`: the cartoon cast. `world/src/interior.js`: the café/saloon interior.
- `world/src/atmosphere.js`: moods, sky, fog, particles. `world/src/camera.js`: shots.
- `world/src/presets.js`: ready-made videos. `world/src/ambience.js` + `audio.js`: place sounds.
- `world/src/styles.js`, `painterly.js`: art styles and the post-processing look.
- `world/assets/`: painted textures and cut-outs (`textures/<set>/`, `foliage/<set>/`).

## The areas (the plan)

1. **Town center**: cosy buildings (bakery, general store, train station, church), warm lanterns,
   friendly feeling.
2. **Ghost town district**: foggy, creaky signs, friendly ghosts. Mysterious but safe.
3. **Forest**: fireflies, soft light, owls at night.
4. **Flower meadow and waterfall lake**: bright, calm and beautiful (uses the Dreamland art).
5. **Crystal mine and hilltop with a hot air balloon**: magical and glowing.
