# Public readiness - complete

- Branch area/public-ready, stacked after task 40 diagnosis (846d85c). Task 40 remains STUCK with all speculative app probes reverted.
- Optional private models now load with a guarded fetch/parse. Missing, rejected or malformed files select the existing code-built cast instead of rejecting module startup. Code-built stars have child-sized scale and foot joints for rain props. Present original models retain the original rig/material path.
- New public-ready browser suite: 14 passed with private models and 14 passed on a separate plain static-server copy containing zero .glb files; browser errors [] in both, sound locked.
- No active /save requests exist in current world HTML/JS (backdrop uses browser IndexedDB; MP4 downloads/streams to browser file picker), so no unavailable server-only UI has been added or disabled. No main.js change needed.
- Full suite: **1787 passed + 2 startup reload checks**, all 27 suites, exit 0, browser errors []. Counts: world/tests/public-ready-full.json.
- Four inspected Animated-film previews: public-ready-39-day.png / -night.png and public-ready-40-day.png / -night.png. Static proof public-ready-static.json confirms privateModels=false, audioLocked=true, errors=[].
- Remaining known issue: task 40 night strip remains visible; not introduced by model fallback. Public model fallback intentionally uses the existing rounded code-built cast.
- No unfinished task 41 work. Continue task 42 on a stacked branch. Never push or merge.
