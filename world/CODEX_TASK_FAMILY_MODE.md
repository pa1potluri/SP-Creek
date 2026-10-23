# Task for Codex: "Family mode" (kid-friendly town)

Same project and rules as before. The user will make "Let's build" videos for a kids' YouTube
channel, so the town needs one switch that makes it suitable for children.

## What to build

A checkbox **"Family mode (kid-friendly)"** near the top of the panel (e.g. in *Art style* or
its own small section), saved in localStorage and in the project file. When ON:

1. **No alcohol or gambling**: the saloon becomes **"THE GOLDEN SPUR CAFÉ"** (or "ICE CREAM
   PARLOR"): its sign text, blade sign and the back-bar bottles turn into jars/cups/cakes, the
   card tables show a board game or plates instead of cards, glasses on the bar become cups.
   The bartender stays (a café owner), the pianist and singer stay.
2. **No guns**: the GUNSMITH becomes a **TOY SHOP**; holsters/guns are removed from every
   character outfit (check `characters.js` and any prop that looks like a weapon). The SHERIFF
   building and role can stay (a friendly sheriff with a badge is fine) but no gun.
3. **UNDERTAKER** becomes a **BAKERY** (signs only).
4. Anything else you find that isn't suitable for young kids: list it in the result and change it
   if simple.
5. Turning it OFF restores everything exactly. Switching must work live (no reload), in every art
   style, and in Willow Creek and Build-mode buildings too (sign text a user typed stays theirs).
6. Video presets and shots keep working; "Rainy night at the Golden Spur" can keep its name.

## Check

Add tests (on/off round trip, signs, interior swaps, outfits without guns, saved setting), run
every suite, no console errors, no sound started by tests. Look at the saloon/café inside and the
street in Oil and Clean 3D with family mode on. Write `world/CODEX_RESULT_FAMILY_MODE.md` and
save `world/tests/family-mode-preview.png` (the café interior, oil).
