# Task: crystal hill polish (from Claude's review of batch 2)

Read `AGENTS.md` and `tasks/QUEUE.md` first. Branch: `area/crystal-polish`, from the tip of the
branch you just finished. Light checks.

## Problems seen (oil style, golden hour and night)

- **The crystals and the rock surround look pale white**, so the mine reads as a white cloud house,
  not a magical crystal mine. Crystals should be clearly **pink, sky blue, purple and mint**,
  saturated and glowing (stronger emissive colour, a soft coloured glow sprite on the bigger
  clusters); the rock surround should be warm grey-brown stone with moss, not white.
- **Balloon Hilltop shot (29)**: the camera hugs the balloon, so the frame is just three broad
  stripes. Pull back so the balloon, basket, platform, flags and the valley view are all in frame;
  give the balloon more, narrower pastel rainbow stripes (8–12) and a lighter wicker basket.
- **Crystal Mine shot (28)**: fine, but let it end looking a little into the bright crystal room.

## Files you may change

`world/src/areas/crystal-mine.js` and `world/src/camera.js` (only shots 28–29 keyframes).

## Check (light)

Page loads, no console errors, one oil screenshot each of shots 28 and 29 at golden hour:
`world/tests/crystal-polish-mine.png`, `world/tests/crystal-polish-balloon.png`. Write
`tasks/crystal-polish.result.md`, commit, mark done in `QUEUE.md`, start the next task.
