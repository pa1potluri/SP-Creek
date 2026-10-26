# Automatic showcase result

- Branch: area/showcase-20s. User requested a hands-free showcase rather than the old 30–120-second clips.
- Open http://localhost:8811/showcase.html and press Play SP Creek showcase once.
- 36 scenes, exactly 20 seconds each: 12 minutes, looping automatically. Includes Pavi/Siri, Sunset Cove/beach, town, cafe, village/pond, playground, friendly Old Hollow, forest/fireflies, waterfall, crystal hill, balloon, train, camping, ponies, market, boats, garden, snow, kites and picnic.
- Animated 3D, Oil, Watercolour (Cove preview), Paper, Toy, Clean and Pixel styles; day/evening/night, rain and winter. Brief soft fade between locations. Home restarts.
- Uses the existing world-time timeline instead of separate wall timers; loading pauses cannot race ahead to another segment. Original camera/preset numbers and saved timeline storage unchanged.
- Focused browser check passed: silent Play gate; all 36 valid 20-second scenes; automatic wrap to first scene; audio stayed locked without a real user click; no browser errors. world/tests/showcase-20s-check.json.
- Film day/night evidence: world/tests/showcase-20s-town-day.png and -night.png. No camera definitions changed.
- Full suite: 2015 checks passed + 2 startup reload checks, all 31 suites, exit 0, browser errors []. Log: world/tests/showcase-20s-full.txt. Complete, awaiting lead review.
- Existing visual limitations remain (including the inherited Cove night water band and rough forest silhouettes). This presentation does not repair those areas. No push, merge or publishing.

