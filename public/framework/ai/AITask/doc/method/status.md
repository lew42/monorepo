Where this is right now, above the checklist — the same `now` `card.js`
reads (an explicit `assign.now`, else the latest agent still missing an
`outcome`), imported rather than re-derived.

Silent once `landed_at` is set (`now` is stale by then; `figures()`'s
`outcome` is the report) or when the manifest never wrote a `now` at all —
either way, nothing beats a wrong answer. Also silent when `now` repeats the
checklist's own current step, so the outline never gets said twice.

Called first inside `refresh()`, not `report()`, so a live task's streamed
`now` lines replace this line in place — not just at first paint.
