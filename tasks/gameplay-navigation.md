# Gameplay-first navigation — user request
Keep art styles as compact always-visible top choices. Add always-visible Gameplay and Free Camera
on/off controls at top. Side navigation should clearly list places, not a long mixture of episode,
shot and video options. Keep episodes/long videos as a secondary collapsed section, not the main
exploration interface. Preserve existing functionality/saved IDs; no deletion of presets.
Scope index.html, style.css, main.js navigation/mode wiring and showcase control integration;
focused tests, captures and metadata. User says the art styles are the core concept.

User screenshot clarification: fullscreen/play-pause/menu belong at the top-right edge of the game picture, outside the side panel. They must not overlay Clouds/Cloud shadows or other panel sliders. Offset controls with the picture width when panel opens, restore to viewport edge when it closes; verify narrow windows.


User screenshot: move Brush & Finish out of permanent right-side panel into a compact popover below the persistent art-style bar. Open from a clear style-adjustments control; click outside (and Escape) hides it automatically. Keep original sliders/values and style-specific options, avoid blocking the main world/panel. Preserve all earlier requests.


Latest annotated layout: top mode cluster includes Auto director, Free camera (on/off) and Pause. Separate fullscreen/play-pause/menu cluster stays on game picture side of panel boundary. All must stay accessible without scrolling; opening panel must not place these over sliders. Gameplay toggle also retained from earlier request.


Implementation scope includes world/src/explore-ui.js to keep place/popover wiring separate from the frame loop.


User screenshot adds bottom Build dock: replace long side Build catalogue with compact bottom category/tool buttons and a popover above them. Preserve all 43 choices, rotation/scale, roads/fences and selection editing. Reuse original controls/handlers; no copied third-party toolbar assets. Side panel stays places-first.


User follow-up: verify real road point placement/finish; freeze automatic camera/timeline when drawing or placing. Add Free camera wheel dolly in/out (Alt+wheel retains building rotation while Free camera is active), preserve terrain clearance. Terrain sculpting is tracked separately in task 72.
