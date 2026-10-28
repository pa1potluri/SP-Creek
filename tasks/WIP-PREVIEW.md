# Separate WIP preview — 28 October 2026

- Local folder: `E:\claude pa1\painting_studio\WIP version`.
- Review URL: http://localhost:8812/ . Current preview8811 remains separate.
- Run `Start WIP Preview.bat` inside that folder after a restart (Python required).
- Snapshot source: a838a6a on area/quick-15-cove-edges. Contains world/src, assets, vendor and runtime HTML/CSS plus server; excludes test/renders history.
- Local snapshot is ignored by Git to avoid duplicating assets/history. The separate Git branch contains its original source, all saved WIP evidence and PROJECT-HANDOVER.md. Changes in the main checkout do not automatically update this snapshot.
- Smoke rendered1280x720: loading completed, page errors[]. Screenshot world/tests/wip-version-review.png. No full-suite run; Q15 remains WIP per cove-surface-lines.result.md.
- User explicitly approved uploading code/assets to pa1potluri/SP-Creek on area/quick-15-cove-edges in this session. No merge, public hosting or deployment is authorized by that branch-only approval.
- To recreate the local snapshot elsewhere: copy world/src, world/assets, world/vendor, index.html, style.css and showcase/character HTML into a separate folder's world directory; copy serve_world.py beside world and run python serve_world.py8812 (with a space before8812).
