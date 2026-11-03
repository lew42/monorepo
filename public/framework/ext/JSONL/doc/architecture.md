# JSONL architecture — one verb per line, replayed into object state

`JSONL` is an append-only log, one JSON object per line, replayed into a plain object. `TaskJSONL` is its subclass for the task manifest (`ai/<date>/<task>/task.jsonl`). Entry: [`JSONL.js`](../JSONL.js) (class `JSONL`, class `TaskJSONL`, function `ranked`), with the socket half in [`live.js`](../live.js).

## One verb per key, the value carries its own time

**Decided:** each key of a line is a verb (`assign`, `log`, `decision`, …), and its value is a self-contained object with its own `at`.
**Why:** a writer that is an AI appends blindly, so every line must read alone; sibling metadata would need two handlers to agree.
**Instead:** `{"at": …, "log": "msg"}` with handlers taking `(value, entry)`. It would merge the whole entry through `assign`, so it was rejected.
**Detail:** [decisions](./decisions.md#one-verb-per-key-value-self-contained)

## An unknown verb is dropped and counted, never guessed

**Decided:** a verb not in `static verbs` goes to `skipped`, and warns once per verb per file.
**Why:** a typo stays visible without flooding the console.
**Instead:** ignoring it silently, which hides typos.
**Detail:** [task-jsonl](./task-jsonl.md)

## A line that is not JSON is dropped and counted

**Decided:** `parse()` catches a bad line, counts it in `unparsed`, and warns once per file.
**Why:** a torn append must cost one line, never the whole file.
**Instead:** failing the whole file, which would blank every card that reads it.
⚠ A backslash before a backtick is invalid JSON, so such a landing line is dropped with no other symptom.
**Detail:** [decisions](./decisions.md#traps)

## `assign` replays the constructor

**Decided:** `{"assign": {…}}` runs the same merge the constructor runs, so the assembled object reads like the plain object it replaced.
**Why:** `dashboard.js` and `AITask.js` read `landed_at`, `tokens` and `agents` the same way from JSON or from a log.
**Instead:** a shape check on every key, which would reject lines the readers already accept.
⚠ The code does not let a key shadow a method: a key named like a method is stored in `this.fields`, not on the method. Only non-method keys are overwritten.
⚠ A scalar written to `agents` still replaces the array that `agent` lines build, so the trap in the decisions record stands.
**Detail:** [decisions](./decisions.md#assign-replays-construction)

## Flat lines are read as log lines

**Decided:** a line with no known verb but with `msg`, `text` or `title` becomes one `log` line; a line with only `at` folds into `assign`.
**Why:** old day logs and the oldest task logs have no verb wrapper, and they must still render.
**Instead:** warning on every such line, which flooded the console.
**Detail:** [decisions](./decisions.md#flat-lines-render-as-a-plain-log-line-never-warn)

## Live is a stream, and off localhost it is a fetch

**Decided:** `live(changed)` subscribes over the dev socket, replays each batch, and calls `changed`; with no socket it is `load()`.
**Why:** a board follows a running task with no reload, and the static site needs nothing from the server.
**Instead:** a timed `fetch`, which shows stale data.
**Detail:** [live](./live.md)

## The task manifest merges by id, and a verdict reconciles

**Decided:** `agent`, `ask`, `decision` and `note` merge by their id; a `verdict` is its own line, and `judged()` copies the newest verdict onto its decision.
**Why:** a decision can never disagree with the owner's verdict on it, and no line ever edits another.
**Instead:** editing the decision line in place, which an append-only log cannot do.
**Detail:** [task-jsonl](./task-jsonl.md)

## A rank replaces the whole order

**Decided:** `rank` replaces the order for one list outright, and `ranked()` puts anything the order does not name after everything it does, in its original place.
**Why:** half an order is not an order, so merging would mix two decisions.
**Instead:** merging ranks item by item, which keeps stale positions alive.
**Detail:** [task-jsonl](./task-jsonl.md)

## `experiment`, `review`, `shots` and `bands` join `logs`

**Decided:** these four verbs push one computed `msg` onto `logs`; none grows its own array.
**Why:** every reader already draws `logs`, so one line renders everywhere with no new view.
**Instead:** a new array per verb, which needed a renderer for each.
**Detail:** [decisions](./decisions.md#experiment-review-shots-and-bands-join-logs-not-a-new-array)

## More

- [`doc/decisions.md`](./decisions.md) — the full record, with reversals and traps
- [`doc/task-jsonl.md`](./task-jsonl.md) — the task manifest verbs
- [`doc/live.md`](./live.md) — streaming, the registry, resets
- [`readme.md`](../readme.md) — the module index
