# Willow Creek shots and dusk preset fix

Fixed all three Willow Creek shots while retaining their names and indices **21–23**.

- Approach now starts within the cleared lane and finishes farther from the chapel. The original interpolated path sampled as much as **6.72 m below the flattened ground**; the old camera fallback then held it only 0.5 m above ground. Repeating that Approach explains the grass-level view after the loop restarted.
- Chapel now follows a gentle street-side arc instead of circling through the surrounding buildings/trees. Its wider framing keeps the entire chapel and steeple visible.
- Overlook is now a slow elevated path looking toward the village throughout, rather than a stationary panorama that can look away from it.
- Willow Creek shot samples enforce a live **3 m minimum above walkHeight**. Connecting flights sample 255 interior points to raise their Bézier controls over terrain, with a live clearance fallback. The final camera also keeps this clearance after handheld sway. Other camera groups retain their existing behavior.

The original dusk mood did **not** darken over a simulated ten minutes: its light and exposure were constant, but its low fill light made shaded views look like night. Added **Warm village dusk**, with a warm sky, stronger fill, readable walls and fully lit windows. Every Village at dusk clip explicitly uses this same mood, including loop restarts. The original dusk mood and all other video presets remain unchanged.

The preset still lasts **270 seconds**, uses shots 21/22/23 in order, cuts into its first clip and flies into the next two. An already saved timeline containing the old dusk/keep clips retains that old mood; reselect **Village at dusk** to load the updated preset.

Validation at http://localhost:8810:

- Build/Main Street: **435 passed**.
- Hamlet: **37 passed**.
- More Buildings: **155 passed**.
- Family Mode: **133 passed**, plus **2** actual startup reload checks.
- New hamlet shots suite: **47 passed**, checking **27,009 poses**: 1,001 samples per complete shot, 1,001 per connecting flight (raw and rendered, including an optional fly-back), and ten minutes of actual timeline/director simulation at 30 fps. Checks cover terrain/walkHeight, expanded building collider volumes with roof heights, visible tree canopy bounds, maximum handheld sway, repeated loop transitions, constant dusk illumination/exposure and audio remaining locked.
- **809 checks total**. Minimum measured ground clearance: **6.80 m**; minimum clearance over overlapping tree canopy bounds: **11.33 m**. No building-volume intersections.
- JavaScript syntax checks passed. No runtime/shader errors or sound activation. The same pre-existing optional cutout/favicon 404 resource messages remain excluded from runtime-error reporting.

Used the requested frame-review option: advanced the same world step as export at **30 fps**, skipping intermediate GPU draws, then rendered **1920×1080 Oil frames every 20 seconds** across the full loop, plus the end and restart. Inspected all 16 frames and close views of the chapel and Overlook. No ground/building clipping or late darkening was visible. First/restart frame mean luminance was 83.10/83.26 out of 255, with identical light/exposure settings.

Contact sheet: **`tests/village-dusk-frames.png`**. Full frames and capture metadata: `tests/village-dusk/`. Capture helpers: `tests/capture-village.cjs` and `tests/make-village-contact.py`.

Full regression command:

```powershell
node world/tests/run-browser.cjs build-mode hamlet more-buildings family-mode hamlet-shots
```

Town/hamlet layouts, other shot indices, other video presets and showroom files were not changed. No required work unfinished.
