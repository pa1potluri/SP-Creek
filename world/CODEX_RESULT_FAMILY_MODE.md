# Family Mode result

Added **Family mode (kid-friendly)** at the top of Art style. It switches live, defaults off, and saves as `dh.familyMode` in localStorage and `familyMode` in project files. Old projects retain the original town. Presets do not reset the switch.

When enabled:

- THE GOLDEN SPUR SALOON becomes THE GOLDEN SPUR CAFÉ; its two-sided blade sign reads CAFÉ.
- GUNSMITH becomes TOY SHOP, including TOYS on both blade faces. UNDERTAKER becomes BAKERY.
- Back-bar bottles become lidded ceramic jars; counter/table glasses become handled cups, and the counter bottle becomes a plated cake. Playing cards become checkerboards with pieces. The café owner, pianist, singer and seated guests remain and animate normally.
- Additional items found in the audit: wanted/bounty posters become landscape pictures; tobacco spittoons become flower pots. Plain storage barrels remain.

Audited `characters.js`, the player, walkers, riders, coach, cast, hamlet people and other props. This version already contains **no gun or holster geometry**: outfits have belts/buckles, and the sheriff has a badge. There was no weapon mesh to remove, so character geometry was left intact. Tests instantiate every cast outfit and random townsfolk, check the player/hamlet outfits, and confirm even unsupported gun/holster options do not add geometry. No other weapon prop was found.

Original facade maps, blade textures, interior objects, materials and transforms are retained. Switching off restores their original identities and visibility, without rebuilding the town or resetting people. Alternate facade maps are cached once and disposed with their building. All six art styles work, including new builds made while the switch is on, and Willow Creek continues to toggle normally.

Build sign provenance is saved: catalogue/default signs may adapt, while text entered in the sign input stays exactly as typed. Older saved Build signs are treated as user text to preserve them. This includes a user deliberately typing one of the stock shop names.

Validation at http://localhost:8810:

- Build/Main Street: **435 passed**.
- Hamlet: **37 passed**.
- More Buildings: **155 passed**.
- Family Mode: **133 passed**, including six-style on/off restoration, actual facade pixel changes, both sides of blade signs, all interior swaps, retained performers, character audit, Willow Creek, new/default/custom signs, exact project round-trip, old-project compatibility and the Golden Spur preset.
- Actual page reloads with the saved switch on and off: **2 passed**.
- **762 checks total**. All modified JavaScript and all browser test files passed syntax checks. No JavaScript/runtime or shader errors. Pre-existing optional cutout/favicon 404 resource messages remain excluded from the runner's runtime-error report, as documented in More Buildings.
- Audio stayed locked; no test called audio.ensure() or used trusted input to unlock sound.

Visually inspected the café and street in Oil and Clean 3D. Required Oil interior preview: `tests/family-mode-preview.png`. Supporting images: `tests/family-mode-clean-interior.png`, `tests/family-mode-oil-street.png`, `tests/family-mode-clean-street.png`.

Repeatable full run on this workstation:

```powershell
node world/tests/run-browser.cjs build-mode hamlet more-buildings family-mode --family-preview
```

Existing camera shot indices, preset definitions, Main Street/hamlet layouts and showroom files were not changed. Test layouts/settings are restored after suites. No required work unfinished.
