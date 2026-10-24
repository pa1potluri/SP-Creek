# Little train trip - WIP

## Built
- Railway branch south of Willow Creek, clear of its houses and pond, to a sheltered seaside halt above Cove. Both stops recorded in BLUEPRINT.md.
- Windowed coaches, boarding steps, closed lower doors during travel, original Pavi/Siri passengers and soft steam.
- Appended shots 56-58 and four-minute "A little train trip" preset. Existing north-south service retained.
- Track clearing uses clear-only pads after scenery generation, preserving the original seeded layout elsewhere. A smoothed 10%-maximum grade prevents the coaches cutting into steep natural banks.

## Stopped point / left
- Corrected station framing, boarding height, level halt decks, retracting steps and closed lower travel doors. Fixed the station/playground visibility ownership interaction.
- Focused checks: 25 passed, including final rendered preset frame and visibility cleanup. Clearance: 60 passed (59 shots / 11,859 samples), browser errors empty. Graded-route floor clearance at least 0.827m in the sampled longitudinal check. Full suite running (session 69490); not yet complete.
- All six final Animated film screenshots for shots 56-58 are saved, in day/night.
- Still need the completed full-suite outcome and counts before done. Code and all six final day/night previews saved. Warm emissive coach trim makes the night windows readable without new lights.
- Existing departure whistle is reused at the main station. Audio listener in main.js still assumes rail x=70; spatial following on the branch would require main.js scope (not edited).
- Current branch area/train-trip, from balloon completion 2d48a57. No merge, push or publication.
