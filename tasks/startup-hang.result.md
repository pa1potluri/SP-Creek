# Startup and Play hang repair

The local server had stopped listening on port 8813. Restarted it as an independent hidden process. Changed SP Creek.bat to use port 8813, reuse an existing server, fall back to Python on PATH when the old virtual environment is absent, and keep startup errors visible. The optional --open server flag opens the browser only after binding the port. Users can double-click SP Creek.bat offline and keep its server window open.

World startup repeatedly checked every railway terrain pad while rebuilding terrain and clearing plants. Added conservative distance rejection and cached rotations; nearby calculations still use the original exact formula. Pad rotation changes invalidate the cache.

Checks:
- Original startup: 50.154 seconds at 1280 x 720 in headless Chrome.
- Intermediate optimization: 30.340 seconds while a separate full-suite browser was also running.
- Final startup: 27.167 seconds in a fresh headless Chrome process at 1280 x 720, compared with 50.154 seconds before (about 46% less startup time). First load still takes time to build the whole world; it is not instantaneous.
- Ten seconds walking in Play: 592 frames, largest frame interval 66.7 ms, finite player position, no JavaScript errors. The reported Play freeze did not reproduce in this diagnostic.
- Five new regression checks passed, including 1800 exact terrain comparisons, rotated pad clearance boundaries, cache invalidation and Play movement.
- Server returns HTTP 200; Python syntax and diff whitespace checks pass.
- Mocked launcher ordering confirms binding happens before opening is scheduled.
- Final Play check: 590 frames over 10.020 seconds (about 59 fps), largest interval 33.5 ms, finite player position, sound remained off, zero JavaScript errors. Raw timing is in world/tests/startup-hang-timing.log (ignored local log).

Full suite completed: all 19 suites passed, 1446 checks plus 2 family-mode startup reload checks, exit code 0, Browser errors: []. Command: DH_URL=http://localhost:8813 node world/tests/run-browser.cjs with every .js suite in world/tests. Full output is in world/tests/startup-hang-full.log (ignored local log).

No shots changed, so no new camera screenshots are required. Nothing merged or pushed. Queue entry 28a is done. Saved on area/startup-hang for Claude's review; STOP this chat after committing. The queue chat continues separately.
