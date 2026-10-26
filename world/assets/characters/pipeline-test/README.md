# User-supplied character pipeline test assets

Copied unchanged on 26 October 2026 from `E:\claude pa1\SP Creek art\Character-Pipeline-Setup` for the user's local SP Creek experiment. Version: supplied head-stage package v1. Source package and original game characters were not edited.

- `hero/`: frozen, reference-baked Pavi candidate, 258816 records. SHA-256 is in the supplied model-manifest.json and verified by the test driver.
- `residents/`: twelve supplied packed resident point files and their manifest.
- `profiles/`: saved hero/resident identity parameters for provenance. Runtime does not generate random identities.
- Decoder copied from the supplied `game/point-data.mjs` to `src/experiments/point-data.mjs`.

Siri has no separate source face in this package; the isolated test explicitly borrows town-202 for her slot. This is not a replacement for her approved character. Source references, authoring tools and standalone HTMLs are not included here. These local files have not been pushed, published or uploaded.

## Resident source refresh: package 1.1 / v01
Current resident binaries/profiles came from the user's `Character-Pipeline-Setup_ v01` folder. Hero binary is byte-identical to the earlier package. Denser resident sources now total 2,048,527 points; see tasks/character-pipeline-v01.result.md. Previous asset version remains in Git history.

## Solid-pedestrian runtime supersedes resident dots
Residents now render from the saved profile parameters as opaque one-mesh heads/hair. The frozen source binaries remain here for provenance/rollback, but the preview does not fetch resident .bin files. Pavi's separate hero data is unchanged. Current checks and gameplay evidence: tasks/solid-residents.result.md and world/tests/solid-residents-check.json.
