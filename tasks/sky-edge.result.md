# Sky edge - done

Branched area/sky-edge directly from main (af9aa1e), with the supplied task and queue update committed as 42829cd. The grey band is the upper rim of the painted open-cylinder panorama, drawn over the procedural sky. Hiding that mesh removes the band. Added a smooth height-based alpha fade in the existing atmosphere backdrop shader hook, keeping the painted horizon while fading its upper rim into the live sky. No camera paths, shot numbers, presets or sounds changed.

Added 108 rendered regression checks to the existing clouds-water suite: upward moon, rainbow and balloon views across all six styles and six moods, covering Winter, Autumn and Summer. A white-painted panorama over black isolates the curved edge from ordinary painted clouds. Adjacent-row brightness changes in the upper half of each frame must stay below 10/255. Worst fixed result: 5.9875/255. Disabling the fade in an isolated diagnostic reproduces a 40.375/255 jump, so the check detects the original defect.

The initial focused test yielded to animation while its existing dry-route walker was still manipulated, exposing intermittent null-position errors. The test now restores that walker before yielding. The final full run had no browser errors.

Full suite passed once: area-shots 7, build-mode 493, clouds-water 227, family-mode 44 plus 2 startup reload checks, hamlet-shots 47, hamlet 37, more-buildings 155, names-tour-shots 47, shot-clearance 38. Total 1,095 checks plus 2 startup checks. All 37 shots / 7,437 clearance samples passed. Tests used local port 8811 and did not start sound.

Animated film previews saved and inspected: world/tests/sky-edge-rainbow-day.png, sky-edge-rainbow-night.png, sky-edge-moon-day.png and sky-edge-moon-night.png. The hard band is absent. The rainbow naturally fades at night; the same upward view is still captured. Capture errors: none; audio locked.

No known unfinished implementation or child-safety concern. Claude review remains required before merge. No push, upload, publication, visibility change or merge to main. Task 16 done; stopping and waiting as requested. Watercolour remains paused until Thu Oct 29.
