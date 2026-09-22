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
  "outcome": "markdown — first line is what the card shows",
  "highlight": { "icon": "explore", "title": "five words or fewer",
                 "line": "one plain sentence", "url": "/the/thing/" }
}}
{"agent": {"kind": "agent|cli", "task": "one line", "tokens": …, "outcome": "…"}}
{"ask": {"id": "…", "at": "…", "summary": "one plain sentence", "quote": "verbatim",
         "prompt": "<uuid of the owner's message>", "status": "open|building|landed",
         "topic": "the parent subject — groups the Asks wall; optional",
         "tasks": ["<slug>"], "links": [{"url": "…", "label": "…"}]}}
{"ask": {"id": "…", "needs": {"owner": "what only you can do", "minutes": 5,
         "done": "<date once you have — the off switch>"}}}
{"rank": {"list": "asks|decisions|tasks", "at": "…", "order": ["<id>", "<id>"]}}
{"decision": {"id": "…", "at": "…", "about": "the question, one line",
              "options": [{"id": "…", "say": "one line", "why": "one line"}],
              "chose": "<option id>", "because": "one sentence",
              "rule": "<skill>#<section>", "status": "open|approved|improve", "note": "…"}}
{"verdict": {"id": "…", "at": "…", "decision": "<decision id>",
             "say": "approve|improve", "note": "…", "filed": "<date>"}}
{"chat": {"at": "…", "role": "user|assistant", "text": "…", "cost_usd": …}}
{"shot": {"at": "…", "path": "absolute — never in the repo", "url": "…", "width": 1400, "label": "…"}}
```

## `highlight` puts the task on the front page

The one optional field a task adds when it produced something the owner will
go looking for weeks later — a tier, a realm, a study, a post, a tool, a
standard. It draws one card on the wall at [`/framework/ai/`](/framework/ai/),
grouped under its day, and the card links to `url` — **the thing**, not the
task page.

Four fields, all required if the field is present at all: `icon` (one of six
Material Icons names, one per kind of thing), `title` (five words or fewer),
`line` (one plain sentence a newcomer follows) and `url`. Nothing curates it
and nothing crawls: the task record is the only source, so deleting the line
removes the card. What earns one, the six icons and the traps:
[`doc/highlights.md`](/framework/ext/AITask/doc/highlights.md).

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

## `ask` is one thing the owner asked for, and it opens the page

Written by whoever is running the session, as they read a long prompt back.
`summary` is one plain sentence, `quote` is what the owner actually said —
verbatim, never tidied — and `prompt` is the `uuid` of the transcript message
they said it in, so the card can link to the real sentence. `status` is the
writer's claim; the card puts it next to `n of m tasks landed`, counted from
the serving tasks' own `landed_at`, and the two are allowed to disagree.

It merges by `id` the way `agent` merges by `task`, so the ask is appended
again whenever its status moves. A task whose log carries any asks renders them
as its FIRST tab, open by default. An optional `topic` groups the wall into one
labelled band per subject. Full design record:
[`doc/asks.md`](/framework/ext/AITask/doc/asks/).

## `decision` and `verdict` are the feedback loop

A `decision` is one choice a worker made, with the options it was made over and
the skill rule that produced it; a `verdict` is the owner pressing **Approve**
or **Improve** on it, from the **Decisions** tab, which appends into this same
log. `TaskJSONL.judged()` merges the newest verdict onto the decision's
`status` and `note`, so the two can never disagree.

An Improve whose decision names a `rule` is a defect in that rule:
`decisions.mjs` files it as one dated line in that skill's `improvements.md`
and marks the verdict filed. Full record:
[`doc/decisions-tab.md`](/framework/ext/AITask/doc/decisions-tab/).

## `chat` is the browser's own turn, in the same log

Appended by `Server/plugins/Ask.js` when someone talks to a task from its own
page (see `AITask.chat()`), replayed into `m.chats` and handed to
[`ext/Ask`](/framework/ext/Ask/)'s panel as chat history. A new verb rather
than a second file: the task log already *is* the record.

## `shot` is a screenshot taken outside the repo, rendered by `shots.js`

Screenshots are scratch (CLAUDE.md RULE#12) — `path` is absolute and is the
only way back to the file, served dev-only through
`Server/plugins/Screenshots.js`. Full shape and the reasoning for keeping it
a plain dict (so a `scores` field can arrive later with no shape change):
[`ext/JSONL/readme.md`](/framework/ext/JSONL/).

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
