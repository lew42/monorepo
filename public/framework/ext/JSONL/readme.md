# ext/JSONL

Append-only `.jsonl` logs the AI can blindly append to, assembled back into
object state by replaying verbs. `TaskJSONL` is the task manifest as a log:
`ai/<date>/<task>/task.jsonl` supersedes `session.json` — the dashboard and
AITask read either, new tasks write the log. `ai/<date>/day.jsonl` is the
day's blind-append log, read fine by base `JSONL`.

## One verb per key, value self-contained

Considered sibling metadata (`{"at": …, "log": "msg"}`) with handlers taking
`(value, entry)`. Rejected: the `assign` verb dispatches to the house
`assign(...args)`, and a second argument would merge the whole entry onto the
instance. So one key is the verb and its value carries its own `at`/`task`.
Multiple verbs in one line still work; an unknown verb warns and lands in
`skipped` — a typo stays visible instead of vanishing.

## `assign` replays construction

`{"assign": {…}}` runs the same `Object.assign` the constructor runs, so the
assembled object reads exactly like the POJO it replaced — `dashboard.js` and
`AITask.js` read `m.landed_at`, `m.tokens`, `m.agents` unchanged, JSON or
log. Accepted risk: a log line can shadow a method; log files sit at the same
trust level as the site's own modules.

## Progress is assigned, not a verb

`steps` (the outline, once) and `step` (the 1-based index underway) arrive as
ordinary `assign` fields. A `step` verb was the obvious alternative and is
worse: two sources for one number, and an append-only file cannot retract a
miscount. With one index, `1..step-1` are done by definition.

## `chat` is the browser's turn, in the same log

`{"chat": {"at", "role", "text", "cost_usd"}}` — appended by
`Server/plugins/Ask.js` when someone talks to a task from its own page, replayed
into `chats[]`, rendered by `AITask.chat()`. A new verb rather than a second
file: the task log already *is* the record, and two stores would need joining.
See [`ext/Ask`](/framework/ext/Ask/).

## `agent` lines merge by `task`

Dispatch appends `{kind, task, model}`; landing re-sends
`{"agent": {"task": …, "outcome": …, "tokens": …}}` and TaskJSONL merges on
`task` — an append-only file expressing mutable state.

## Deferred

- **DayJSONL / PageJSONL** — no renderer wants them yet.
- **Dual json + jsonl** (condense the log into a snapshot, keep the log as the
  heavy record) — skipped by request, 2026-08-14.
- **Browser-side append** — the dev server appends `chat` lines on the browser's
  behalf (`ext/Ask`); a *direct* browser append would still go through
  ext/Saver's RPC. Everything else is appended by Claude, with file tools.
- **Migrating 08-08…08-13 session.json files** — the fallback makes migration
  optional; decide when the AITask redesign lands.
