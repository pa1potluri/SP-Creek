# Task for Codex: fix the Willow Creek shots and the "Village at dusk" preset

A 10-minute 1080p render of the "Village at dusk" preset (looped, 30 fps) showed:

1. **The camera goes through buildings** during the Chapel orbit (shot index 22): it passes inside
   houses near the chapel. Make the orbit radius/height clear every hamlet building (and trees
   close to the path), or turn it into a path shot that keeps a clear line.
2. **The camera dips into the grass** near the end of the loop (around 8–9 min of the looped
   render, i.e. in the Overlook shot, index 23, or in the fly-back from it to the first clip).
   Keep the camera at least ~1.5 m above the ground/plants along every shot and the flights
   between them (check against `terrainHeight` / `walkHeight` along the whole path, sampled).
3. **It is too dark**: after the first clip it looks like night, not dusk. Keep it dusk the whole
   time (warm sky, lit windows, readable buildings); if the dusk mood darkens with time or the
   later clips switch mood, fix that. Brightness should stay similar from start to end.

Add a test that samples every shot of the Willow Creek group (and the preset's flights between
clips) at many points and asserts: camera above ground + margin, and not inside any building
collider. Run all suites (no sound from tests). Then render a short check yourself if you can, or
grab frames every 20 s across one full loop of the preset and look at them. Write
`world/CODEX_RESULT_FIX_HAMLET_SHOTS.md` with a contact sheet `world/tests/village-dusk-frames.png`.
