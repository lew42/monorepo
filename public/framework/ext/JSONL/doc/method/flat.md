A static helper, checked by `apply()` before it dispatches anything: is this entry a line with no verb key of its own? `day.jsonl` has always had a few (`{"at", "task", "msg"}`), and the oldest task logs wrote `{"type": "launch", …}` the same unwrapped way, before every writer agreed on "one verb per key".

Given such an entry, `flat()` looks for something to actually show — `msg`, `text` or `title` — next to a `type` or `at` that marks it as a real record rather than a stray key. Find both and it returns `{...entry, msg: <that text>}`, shaped exactly like a `log` line's own value, ready to push straight onto `logs`.

Find neither and it returns `null` — `flat()`'s whole job is just "is there something to READ here", nothing more. `apply()` is what decides what happens next: with a real `at` but nothing to read, it folds the whole entry into `assign` instead, the way `session.json` was always written (a bare object of fields, no verb wrapper). Only a line with neither a readable text nor an `at` falls through to the normal per-key `skip()` warning — there is genuinely nothing to show instead.

See [decisions.md](../decisions.md#flat-lines-render-as-a-plain-log-line-never-warn) for why this exists and what it replaced.
