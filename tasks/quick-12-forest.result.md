# Q12 forest readability increment
Branch area/quick-12-forest from pond tip5a65f5d. Task78 remains open for its broader tree/root/deer/hillside/sky review.

## Changed
- Reproduced forest trail height mismatch: vertices ranged-.303m below to+.573m above rendered ground. Widened2.4→3.2m and used fine rendered-ground fitting. Final vertex clearance .099996–.100004m.
- Replaced3 isolated route lanterns with7 evenly spaced, alternating-side warm lanterns, grounded posts and visible small frames. No new point lights, no global lighting/exposure changes. Trail-only low emissive fill follows night level.
- Existing90 fireflies retained;60 distributed along trail and30 around clearing. Larger soft radial points with restrained per-bird brightness variation, calm motion, height sampled above actual terrain. Static anchors precomputed to avoid curve/vector allocations every frame.
- Route check identified original seating log blocking last bend. Shifted log/seats together to x=FOREST.x-6 and replaced undersized circle with full-length rectangular collision. All601 static centreline samples now clear. Moving actors excluded only during static-route diagnostic and restored immediately; runtime collision logic unchanged.

## Verification
- Focused forest diagnostic: trail clearance range above;0 static blockers, minimum firefly terrain clearance .600m at sampled times, repeated seeking identical,7 lanterns, no browser errors/audio.
- Film before/after Trail/Tour/Deer views day/night: quick-12-{before,after}-{trail,tour,deer}-{day,night}.png. Final Oil Trail day/night: quick-12-after-trail-oil-{day,night}.png. Before/after night trail inspected.
- Full31 suites passed:2015 checks +2 startup reload checks, exit0, Browser errors []. Log quick-12-full.txt. Focused reports quick-12-before.json / quick-12-after.json, script quick-12-forest.cjs.

## Still open
This is Q12 path/lantern/firefly readability, not completion of the full forest reference. Steep hillside silhouette, tree overlap/grounding and deer-view composition, broad sky/atmosphere/art polish remain task78/Q17. No shot/preset renumbering, style changes, new assets/libraries or sound.
