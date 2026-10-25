# Contributing to SP Creek

Draft for lead review. SP Creek is a calm, child-safe Three.js world for a children's channel. Start by reading [AGENTS.md](AGENTS.md), the [blueprint](tasks/BLUEPRINT.md) and the current [queue](tasks/QUEUE.md).

## Run locally

From the repository folder, run `python serve_world.py 8810`, then open `http://localhost:8810`. The app uses the Three.js copies in `world/vendor/`; it has no npm install or build step. A normal static HTTP server can also serve the `world/` folder. Opening `index.html` directly as a `file:` URL is not the supported way to run ES modules.

Pavi and Siri's private GLB files are optional. If they are absent, the world uses its rounded code-built cast. Do not include private models, reference pictures, renders or personal information in a public contribution. Ask the lead before adding assets; record their source and permission to use them. This guide does not grant rights to private character art.

## Keep it kind and safe

- Use soft colours, rounded shapes, warm lighting and gentle movement. Keep original character designs intact.
- No weapons, fighting, alcohol, gambling, smoking, frightening imagery or jump scares. Old Hollow is mysterious and friendly; nothing chases or startles visitors.
- Keep water barriers, rails and dry walking routes intact. Check camera views and walking routes in day and night.
- Sound starts only through a real user action. Automated tests and screenshot tools must leave audio locked.

## Suggest a small idea

Write down the place, what a child would see or do, why it fits the calm world, and one simple way to check it. Include a sketch or screenshot only when you have permission to share it. Do not include a child's name, photo, contact details or other personal information.

[Good first ideas](docs/good-first-issues.md) are local drafts, not assigned work or published issues. The lead chooses scope and writes the task before implementation. Keep unrelated ideas separate.

## Make a focused change

Work on one task per `area/<name>` branch, following its allowed files. Ask the lead to expand scope before editing outside those files. Keep area code in its module, use existing helpers and local libraries, and leave `world/src/showroom/` alone.

Append camera shots and presets; never change saved IDs. Drive animation from world time so seeking to the same point gives the same result. Preserve all art styles and the optional Watercolour preview. Do not add a package or change project structure without an agreed task.

## Check and hand off

Use a light smoke check while building. Before calling the task done:

1. Run every browser suite once. The test runner requires suite names; no arguments runs none. In PowerShell: `$env:DH_URL='http://localhost:8810'; $suites=Get-ChildItem world/tests/*.js | Select-Object -ExpandProperty BaseName; node world/tests/run-browser.cjs @suites`. The test tooling needs Node, Playwright and Chrome; the current runner lists the local paths to adapt for your machine.
2. Save Animated-film day and night screenshots of each added or changed shot under `world/tests/<task>-<shot>-day.png` and `-night.png`. Include an Oil comparison where relevant. Check for clipping, harsh lighting and unsafe edges.
3. Write `tasks/<task>.result.md`: what changed, actual test counts, screenshot filenames, limitations and any unfinished work. If several attempts fail, record the problem and attempts in `tasks/STUCK.md`.
4. Update the queue and commit locally. If unfinished, use a `WIP:` commit and state exactly where to resume. Leave a clean working tree at handoff.

Claude reviews loading, day/night walking, child safety, the Oil view and full-suite results before acceptance. The user decides direction and approves each area. Builders do not merge to `main`, push, upload, publish, post issues or change repository visibility. Claude handles publication only with the user's approval.
