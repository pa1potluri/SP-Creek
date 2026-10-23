# Names, Mayor and Grand tour shots

Built the friendly Mayor with a bowler and a pink buttonhole flower, including compatibility for old cafe guest lists. Updated the cafe shot labels without changing their indices. Renamed the remaining cast display labels to cafe host, cafe singer and board game neighbour. Every cast outfit and generated variant is audited for weapon properties and named parts.

New shots (all in Grand tour, all 12 seconds):
- 30: Old Hollow Tour
- 31: Firefly Forest Tour
- 32: Meadow and Lake Tour
- 33: Crystal Mine Tour
- 34: Willow Creek Pond Tour

Existing indices remain unchanged. Outdoor tour curves pass a 201-sample vegetation/prop clearance audit; shots use elevated viewpoints to stay clear of tall plants.

Checks: names-tour-shots 48 passed; area-shots 7 passed; build-mode 435 passed; clouds-water 119 passed. family-mode 44 passed plus 2 startup reload checks; hamlet-shots 47 passed (27,009 samples); hamlet 37 passed; more-buildings 155 passed. Full suite: 892 checks plus 2 startup reload checks, all passing across the initial run and reruns after updating stale expectations. Browser errors: none. The old family and hamlet test expectations were updated for the requested names and Mayor. No audio activation.

Preview screenshots: world/tests/names-tour-shots-<shot>-day.png and -night.png for 2, 17, 18, 19, 20, and 30-34 (20 images, Animated film). Screenshot 20 enables the cast lineup. No merge; awaiting Claude review.
