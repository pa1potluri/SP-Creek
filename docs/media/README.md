# SP Creek preview loops

Six silent, 640 × 360 animated WebP loops, each 3.8 seconds and under 3 MB:

- `sunset-cove.webp`: the golden beach and hillside village.
- `balloon-ride.webp`: a gentle flight above the valley.
- `market-day.webp`: fruit, flowers, bread and toy stalls in the square.
- `rainbow.webp`: the clearing rainbow over town.
- `garden-growth.webp`: growing beds in a forward-and-back time-lapse study.
- `lantern-evening.webp`: warm floating lights above the meadow lake.

Pavi and Siri are excluded from every capture, including their shadows and attached props. No sound starts. These are local draft media for lead review; nothing has been uploaded or published.

To regenerate locally, start the world server, then run `node world/tests/capture-showcase.cjs`. The script needs Chrome, Playwright and ffmpeg on the capturing computer; these are tooling dependencies only, not app dependencies. Override `DH_URL`, `CHROME_PATH`, `PLAYWRIGHT_PATH` or `FFMPEG` for your setup. It also saves Animated-film day/night review stills under `world/tests/`.
