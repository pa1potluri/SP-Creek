# Showcase media - WIP verification

- Branch area/showcase-media from public-ready 86c6f83. Six locally generated animated WebP loops in docs/media/: sunset-cove, balloon-ride, market-day, rainbow, garden-growth, lantern-evening.
- Each 640x360, 38 frames / 3.8 seconds, looping forward/back without a hard reset; encoded ANMF duration verified. File sizes 362860-727318 bytes (all below 3 MB). Garden intentionally grows and gently reverses as a looping time-lapse study.
- Capture script world/tests/capture-showcase.cjs excludes every Pavi/Siri group mesh, attached props and shadows using camera layers; also hides detached gardening hand props. Excluded mesh counts 40-48 per scene. Sound locked throughout; browser errors []. Proof showcase-media-check.json.
- Six clips visually inspected; no Pavi/Siri visible. Twelve Animated-film day/night stills showcase-media-{39,54,69,79,76,27}-{day,night}.png plus inspected showcase-media-contact.png. Cove night band remains inherited/open task 40; README Cove clip uses golden hour.
- No app changes or camera definitions changed. docs/media/README.md documents local-only drafts and regeneration. Nothing posted, uploaded, merged or pushed.
- Full 27-suite run in progress on localhost:8811; not done until final counts saved. Next: finish run, update result and queue, commit, then task 43 contributing on stacked branch.
