# Contributing to SP Creek

SP Creek is a calm, child-safe Three.js world for children. Thank you for wanting to help! See also [JOIN.md](JOIN.md).

## Run locally

From the repository folder, run `python serve_world.py 8810`, then open `http://localhost:8810`. The app uses the Three.js copies in `world/vendor/`; it has no npm install or build step. A normal static HTTP server can also serve the `world/` folder. Opening `index.html` directly as a `file:` URL is not the supported way to run ES modules.

Do not include private models, reference pictures, renders or personal information in a public contribution. Ask before adding assets; record their source and permission to use them. This guide does not grant rights to private character art.

## Keep it kind and safe

- Use soft colours, rounded shapes, warm lighting and gentle movement. Keep original character designs intact.
- No weapons, fighting, alcohol, gambling, smoking, frightening imagery or jump scares. Old Hollow is mysterious and friendly; nothing chases or startles visitors.
- Keep water barriers, rails and dry walking routes intact. Check camera views and walking routes in day and night.
- Sound starts only through a real user action. Automated tests and screenshot tools must leave audio locked.

## Suggest a small idea

Write down the place, what a child would see or do, why it fits the calm world, and one simple way to check it. Include a sketch or screenshot only when you have permission to share it. Do not include a child's name, photo, contact details or other personal information.

[Good first ideas](docs/good-first-issues.md) are a good place to start. Keep unrelated ideas separate.

## Send a change

Keep each change small and focused on one place or feature, and use the existing helpers and local libraries (no new packages, no build step). Check your change in day and night, and in each art style, then open a pull request that says what changed and how you checked it. Every change is reviewed before it is accepted.
