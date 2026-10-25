# Preview auto-start result

## Built and checked
- Windows user Startup shortcut installed: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\SP Creek Preview.lnk`.
- Hidden PowerShell watchdog starts the local-only preview on port 8811 and checks every 15 seconds. Reuses an existing listener; a per-port mutex prevents duplicate watchdogs.
- SP Creek.bat starts the watchdog and opens the preview. Logs live in `%TEMP%\SPCreekPreview`.
- Script parser: zero errors. Live port 8811: HTTP 200.
- Isolated port 18811: initial HTTP 200 (PID 15372); stopped only that test server; automatic replacement PID 10640 returned HTTP 200. Test processes cleaned up; live preview preserved.

## Status / exact stop
- Setup installed and runtime restart verified. Actual reboot/sign-in has not been performed. Starts after sign-in, while this machine is awake; does not fix a hung browser or GPU.
- WIP verification: full browser suite not rerun for this launcher-only change; no camera shots changed, so no new screenshots. Do not treat inherited world WIP as accepted.
- Task 48 forest/menu feedback remains WIP, with remaining work in tasks/review-feedback.result.md. No world code changed in this task. Never pushed or merged.
- Resume: verify startup after the next Windows sign-in; return to task 48's remaining grounding/menu-hang checks before its full suite and completion.
- To disable automatic startup, delete only the SP Creek Preview.lnk shortcut from the user Startup folder. Existing hidden processes continue until sign-out/restart.

## Verified after Windows restart
- Observed a new boot at 19:27:00 local time on 2026-10-25, after the Startup shortcut was installed at 16:55:14.
- Startup watchdog launched at 19:27:29 (PID 13560); Python preview server launched at 19:27:30 (PID 13744). Port 8811 returned HTTP 200 without a manual launch in this resumed session.
- Auto-start task is now verified complete. The unchanged app/launcher checkpoint has full-suite evidence of 2001 + 2 passing checks in b328374; no camera shots changed by this launcher, so no extra screenshots apply.
- Remaining work belongs to task 48/50, not auto-start. Keep the preview available while this machine is awake and signed in. Never pushed or merged.
