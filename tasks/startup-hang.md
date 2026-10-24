# Task: Fix local startup and hanging

User requested investigation and repair of the stopped server and hanging page/Play mode.
Scope: `SP Creek.bat`, `serve_world.py`, `world/src/world.js`, `world/tests/startup-hang.js`, and this task/result.
Lead follow-up: add `28a startup-hang: done` to `tasks/QUEUE.md`, commit on `area/startup-hang`, never push, then stop this chat. The queue chat continues separately.
Keep world geometry, terrain heights, shot numbers, styles and deterministic animation unchanged.
Measure startup before/after, exercise Play movement, and run every browser suite. No camera changes.
