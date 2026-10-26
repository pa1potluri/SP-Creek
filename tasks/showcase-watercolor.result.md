# Watercolour showcase result

- Separate preview: http://localhost:8811/showcase-watercolor.html. Press Play watercolour showcase once.
- Same 36 scenes, 20 seconds each, 12-minute automatic loop, soft location fades and existing weather/season/day-night changes. All scenes use the existing watercolour preview shader. No shader/assets/camera changes; normal game and mixed-style showcase unchanged.
- Focused test passed across all 36 scenes, checking watercolour metadata on every clip, valid shots, automatic looping, silent Play gate and locked audio for synthetic clicks. Browser errors []. Evidence: world/tests/showcase-watercolor-check.json.
- Watercolour day/night screenshots saved and inspected: world/tests/showcase-watercolor-town-day.png and -night.png. Existing Film evidence: showcase-20s-town-day.png and -night.png. No camera definitions changed.
- Full suite running; completion pending final counts. Mixed-style regression check running.
- Uses the current preview art treatment, not new reference-quality painted assets. Existing Cove night band and forest silhouette limitations remain. Nothing pushed, merged or published.
