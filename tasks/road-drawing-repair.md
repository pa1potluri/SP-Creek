# Road drawing recurrence
Status: WIP investigation, not fixed. User cannot reliably create dirt roads at Old Hollow in Watercolour.
Scope: main.js road tool input/preview/save, explore-ui.js road popup usability, index.html/style.css feedback; world.js only if visible road geometry diagnosis requires it; tests and metadata.
Real-pointer diagnostic at Old Hollow created three ground points and a road mesh with audio locked (canvas pointer events prevented from bubbling to automatic sound start). Screenshot road-real-input.png shows the broad road after Finish. Prior test did not prove the user's workflow works; add clear per-point feedback, prevent Enter default activation of focused tool buttons and verify road survives save/reload. Full suite and Film day/night before done.
