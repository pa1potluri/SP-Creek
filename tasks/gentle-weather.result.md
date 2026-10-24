# Gentle weather - done

Added a Weather control: Follow mood, Gentle drizzle, Clearing rainbow and Breezy day. Weather is saved in projects/preferences; video presets default back to Follow mood. Fine, short, slow raindrops use the existing rain mixer at 0.3 strength. Twenty-five shallow shiny street puddles add no water or collision areas. Existing walkers carry rounded pastel umbrellas on their existing routes, including the boardwalks and porches; route logic is unchanged.

Clearing reduces drizzle over 35 seconds, displays a soft pastel rainbow opposite the sun, then dries the puddles and fades the rainbow by 120 seconds. Umbrellas fold as the rain stops. Breezy day boosts existing grass/tree and laundry sway by 2.2 and adds seeded drifting petals/leaves. New weather motion and transitions use world time. No thunder, lightning, sudden flashes, new audio files, new point lights or new camera indices.

Ten focused checks passed: gentle drizzle/effective audio level, puddles, umbrellas, rainbow while clearing, dry/fold/fade after clearing, windy particles and sway, project round trip, normal-wind restoration, audio locked, and byte-identical frozen weather on a fixed town camera. The initial free-camera freeze comparison changed; repeating on a fixed camera after settling passed. No browser errors. Tests did not unlock audio.

Full suite passed once: area-shots 7, build-mode 493, clouds-water 119, family-mode 44 plus 2 startup reload checks, hamlet-shots 47, hamlet 37, more-buildings 155, names-tour-shots 47 and shot-clearance 38. Total 987 checks plus 2 startup checks, in addition to 10 focused checks. All 37 shots / 7,437 clearance samples passed; browser errors none. Tests used the local server on 8811.

Animated film previews: world/tests/gentle-weather-drizzle-24-day.png and gentle-weather-drizzle-24-night.png; gentle-weather-windy-26-day.png and gentle-weather-windy-26-night.png; gentle-weather-rainbow-day.png. No existing camera paths changed. No known unfinished implementation; Claude review remains required before merge.

Queue tasks 13-15 are complete on stacked local branches. Watercolour remains separately paused until Thu Oct 29. No push, publication, upload, visibility change or merge to main.
