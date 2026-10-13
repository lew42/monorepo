The step outline, checked off — `progress(m)` (`stats.js`) plus `segments()`
(`card.js`, shared with the row preview so the two never disagree) for the
notch bar, then one line per step with a filled box for `done`, a pulsing one
for `now`.

Silent for a task that declared no `steps` — `progress()` returns `null` and
this returns immediately, rather than rendering an empty heading.
