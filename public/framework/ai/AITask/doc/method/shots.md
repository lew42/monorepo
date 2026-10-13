Runs between `extra()` and `figures()` — a task's own custom content, then any
screenshots it logged, then the spend tables. Delegates straight to
`shots.js`'s `shot_wall()`, which is the whole implementation; this method
exists so a task's own `page.js` can override where the wall sits, the way
every other named part of `report()` can.

Silent for a task that logged no `shot` lines — `shot_wall()` returns before
rendering anything. See [ext/JSONL's `shot` verb](/framework/ext/JSONL/)
for the log-line shape, and `shots.js`'s own file doc for the
localhost/`.missing` degradation.
