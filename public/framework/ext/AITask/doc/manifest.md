# The manifest

`task.jsonl` ([`ext/JSONL`](/framework/ext/JSONL/)) is the current format;
`session.json` still renders read-only, for tasks opened before the log
existed. Every field below is optional and the viewer draws whatever's
present — except **`session_id`**, whose absence costs the entire session
log, and which the detail page now says out loud (`AITask.log()`) rather than
rendering nothing.

```json
{"assign": {
  "session_id": "uuid — the transcript this task ran in",
  "request": "the ask, verbatim",  "tab": "which VS Code window",
  "requested_at": "…", "landed_at": "… — stamped LAST; its absence IS 'running'",
  "model": "…", "tokens": 738899, "cost_usd": 2.53,
  "group": "the EFFORT this belongs to — see effort.md",
  "steps": ["the outline"], "step": 3,
  "now": "one line, updated as state changes",
  "window": { "before": 0.15, "after": 0.4 },
  "links": [{ "url": "…", "label": "…" }],
  "outcome": "markdown — first line is what the card shows"
}}
{"agent": {"kind": "agent|cli", "task": "one line", "tokens": …, "outcome": "…"}}
{"chat": {"at": "…", "role": "user|assistant", "text": "…", "cost_usd": …}}
```

## `window` is fractions, not percents

`window.before`/`window.after` are fractions of the 5h session window
(`0.15` = 15%), read straight off `check-claude-usage`'s output at launch and
landing. `figures()` (`AITask.js`) formats them as percents for display; the
raw manifest stays in the units the skill wrote.

## `agent` lines are dispatched, then merged

An agent line is appended once at dispatch (`{kind, task, model}`) and again
at landing (`{"agent": {"task": …, "outcome": …, "tokens": …}}`) —
`TaskJSONL` merges the two by `task`, so the manifest's `agents[]` always
holds one entry per sub-task, complete or not. `card.js`'s `current()` reads
the first entry still missing an `outcome` as the live "now" line.

## `chat` is the browser's own turn, in the same log

Appended by `Server/plugins/Ask.js` when someone talks to a task from its own
page (see `AITask.chat()`), replayed into `m.chats` and handed to
[`ext/Ask`](/framework/ext/Ask/)'s panel as chat history. A new verb rather
than a second file: the task log already *is* the record.

## Who authors which field

Nothing here is computed by the viewer except the derived reads in
`stats.js` (`state()`, `progress()`, `spend()`). Every other field is
self-reported by the session that wrote it, so `landed_at` and `window.after`
are the last edit before that session stopped — approximate by nature, not a
bug in the reader. Exact token usage *is* recoverable from the raw transcript
(`stats.js`'s `usage_of()`, deduped by `message.id`), which is the standing
argument for a manifest that stops hand-typing `tokens` wherever the
transcript is still reachable — full verdict in
[`manifest-vs-log/analysis.md`](/framework/ai/2026-08-13/manifest-vs-log/).
