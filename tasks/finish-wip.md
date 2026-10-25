# Task: Finish the three WIP tasks (Claude authorises the extra files) (branch `area/finish-wip`)

Read `AGENTS.md`, `tasks/QUEUE.md` and `tasks/BLUEPRINT.md` first. Branch from the tip of the branch you just finished. Child-safe, calm, light checks while building; full suite + day/night screenshots + result file before done. Append shots/presets, never renumber. Never push, merge or publish.

Claude (lead) authorises the files these need, so finish them in this one branch:
1. **Task 26 camping:** wire it at startup in `main.js` (import `buildCamping`, construct it with the other areas, call its update in `step(dt)`). Then its full checks and previews.
2. **Task 28 Episode 4:** add "Episode 4: Camping under the stars" using shots 59-60 (`presets.js`).
3. **Task 22 cove polish:** the Episode 1 cut changes in `presets.js`.
4. **Train sound (STUCK.md):** in `main.js` listener(), use the locomotive's real world x/z for the train sound.
Update the result files of 22, 26 and 28 and mark them done in QUEUE.md; remove the solved items from STUCK.md.
Files: `main.js` (only these three wiring/listener changes), `presets.js`, plus the files of tasks 22/26/28.
