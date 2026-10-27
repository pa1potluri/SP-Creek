# Pond duck interaction — completed implementation, awaiting review
Branch area/pond-duck-interaction. Resumed saved investigation c9474cb. Latest reference: tasks/ref/pond-duck-review-latest.png.

## Built
- Confirmed the affected Willow ducks belonged to pavi-siri-moments.js; their old x/z coordinates overlapped the dock. New small pond-ducks.js helper keeps the same three birds/scene API and uses a slow time-sampled loop beyond the dock.
- Soft yellow bodies with eyes, bill and visible wings; gentle bob/roll. Click turns a selected bird toward the current viewer and flaps its wings, then blends back into the swimming direction over2.4seconds. Position continues smoothly, no teleport or history-based collision nudge.
- Three expanding, fading ripple rings per bird, driven by world time. Full-body pond/dock exclusion and mutual separation verified.
- Existing main pointer guard protects Build/road/fence and gameplay camera input; exploration/Freecam clicks select visible ducks and respect opaque ground/dock occlusion. Synthetic events can animate birds but never start audio.
- Real trusted click gives a short, low-volume synthesized quack; audio envelope bounded and rate-limited to one per.4seconds. No startup/camera-change sound, external files or new libraries.
- Fixed visible broken shoreline bands: broad annular rim faces cut through the sloping bank. Fine radial/angular tessellation now follows the bank triangle surface with a soft alpha fade. Existing water, lilies, reeds, dock and seven style switches retained.

## Verification
- Existing moment smoke suite35 passed, no browser errors.
-11 focused checks plus pointer ownership checks passed:7203 full duck-body poses over480seconds,0 dock hits,0 boundary violations,0 duck overlaps; minimum centre separation3.118m. Finite transforms, reaction/ripple seeking, ending flap, synthetic-audio guard verified.
- Actual synthetic canvas click reaches the duck; same click with Draw Road active leaves reaction untouched. Audio context remains locked. Quack envelope/rate-limit tested with mock audio nodes only, no hardware output.
- Full31 suites:2015 checks +2 startup reload checks passed, exit0, Browser errors []. Log world/tests/pond-ducks-full.txt.
- Film pond tour and feeding moment day/night: pond-ducks-{tour,moment}-film-{day,night}.png. Clean/Oil tour day/night also saved. Clean day and Film moment captures inspected. Focused script/report: pond-ducks-check.cjs / .json.

## Limits
This completes the functional duck correction and fixes the diagnosed shoreline banding; it is not pixel-identical reproduction of the reference illustration. Broad water-art/vegetation detail and global character/boat routing remain separate queue work. Interaction currently belongs to exploration/Freecam; active Play and Build retain their existing controls. One shared loop deliberately keeps birds on open water beyond the dock. No push/merge/publish.
