# WIP - Sky edge

Branched directly from main. The hard band comes from the upper rim of the painted open-cylinder panorama, not the procedural sky sphere. Hiding that mesh removes the band. Added a height-based alpha fade in the existing atmosphere backdrop shader hook, preserving the painted horizon while blending the upper rim into the sky. No geometry, camera indices, presets or sounds changed.

Added a high-contrast rendered regression probe to clouds-water: white panorama over black isolates the physical upper edge from painted clouds. Upward moon, rainbow and balloon views cover all six styles and moods, and the three seasons. It measures adjacent-row brightness in the top half of each frame. Initial fixed probe measured 5.99/255 worst row step; threshold 10/255.

Focused suite passed 227 checks, including 108 new sky-rim combinations; worst measured row change 5.9875/255. Four Animated film moon/rainbow day/night screenshots saved and inspected: band absent, no capture errors, audio locked. Initial regression run exposed an intermittent null-seat error because the existing dry-route test left its walker manipulated during the new animation-frame yields; restored that walker before yielding. A repeat run was error-free. Remaining: full suite once, record final counts and mark done. No push. Stop after this task; Watercolour stays paused.
