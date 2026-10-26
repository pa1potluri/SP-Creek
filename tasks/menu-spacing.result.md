# Menu spacing result — WIP small correction
User requests only two small changes during low usage: separate Welcome from logo, match Free camera height to art bar. Colour/font redesign deferred explicitly.
Implemented: greeting at top-left below the art controls on Home, with >83px gap from logo; hidden on other tabs to avoid their headings. Original Free camera button now aligns with the art bar, both 56px high. User's latest size request supersedes the earlier 64px Free camera target; other main/category controls keep existing sizes.
Focused menu-spacing.cjs passed at 1280x720 and 1024x720: both heights 56px, aligned top edges, greeting below bar and clear of logo. Evidence menu-spacing-check.json and menu-spacing-wip.png. Older focused test expectations updated for this explicit layout change. No full suite rerun: keep this small correction WIP as user requested with 10% usage remaining.
Next: full regression and refreshed final menu captures when usage permits; further font/icon choices wait for user direction. No new large work, merge/push/publish.

## Resumed 27 October — verification complete
Full 31 suites passed: 2015 + 2 startup checks, no browser errors (menu-spacing-full.txt). Desktop/tablet geometry checks rerun; Film day/night saved as menu-spacing-day.png / -night.png. Status: done spacing increment, awaiting review. Font/icon redesign remains deferred.
