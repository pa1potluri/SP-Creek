# Character pipeline test — verification in progress

Built a separate local scene at /character-pipeline-test.html: 12 supplied residents plus Pavi and Siri on existing code-built game bodies. Original game files/characters are untouched. Pavi uses the exact frozen supplied hero binary, checksum verified. Siri uses a clearly labelled temporary town-202 profile because no Siri-specific face is supplied.

GPU-rendered Three.js points use normal scene depth, display-RGB colors converted to linear attributes, original head joints and cached deterministic 1x/quarter/eighth point levels. No runtime random generation, new dependencies, source-package edits, upload or publication. Current/original heads toggle provides an identical-body comparison. Drag/zoom, group/hero/resident views, day/night, optional deterministic gentle head turn.

Focused test: 94 checks passed, no browser errors; counts, part coverage, fallback toggle, attachment, hero SHA-256 and rendered occlusion checked. Eight day/night poses plus two Pavi original/pipeline comparison frames saved. Test poses use simple animated-film-like Lambert bodies and ACES lighting, not the main world's post-processing filters; all-style integration is outside this isolated test.

Head data: 34,171,980 bytes packed; 1,708,599 unique points; 1,844,030 displayed with duplicated provisional Siri profile at full detail, 461,013 in quarter mode. Decoded head arrays 27,337,584 bytes; all three cached point-geometry levels 56,384,016 CPU bytes plus GPU copies for uploaded levels. V8 heap alone excludes these buffers. Also imports existing game character code, which loads the two existing GLBs (~22.7MB) even though this scene uses code-built bodies.

Preliminary 14-character synchronized render samples about 0.5–1ms on RTX 5060 Ti. Last memory-report capture overlapped the full world test run, so final timing must be taken after that finishes; no mobile or complete-world claim. Close-up point/hair surface quality still needs art review; no facial expressions, gaze or blink rig is supplied. Never replace the whole town automatically.

Remaining before completion: full existing suite running (character-pipeline-test-full.txt), then one clean focused benchmark/capture; write final result and exact counts, mark QUEUE, commit all. No new areas/tasks. Preserve the earlier forest WIP separately.
