# Session record spec

A session's record is one append-only file: `sessions/<session-uuid>/session.jsonl`. Each line is one JSON object. Nothing is ever edited or deleted; a later line wins. The Sessions page reads this record (via `session-index.json`'s `meta` and `closed`; computed cost lives separately in the gitignored `cache.jsonl`), so write what you know in these shapes and nothing else.

**Goal state:** for every session from the past few days, a clean record with name, cost, runtime, model and effort, tags, core links and alerts. Cost, runtime and model are computed by `Session.js` from the transcript, so you never write them. You write the judgment: tags, links, alerts, notes.

## Line types

Every line carries `at` (time), `by` (author) and `session` (the uuid); the writer stamps all three. You supply exactly one of these keys:

| Key | Shape | Meaning |
|---|---|---|
| `tag` | `{"tag":"refactor"}` (1 to 40 chars) | A short label. One tag per line. |
| `note` | `{"note":"Built the audit button; merge is pending."}` | A plain sentence for the next reader. |
| `alert` | `{"alert":"asked for X, never followed up","level":"warn"}` | Needs attention. `level` is `info`, `warn` or `error` (default `info`; `urgent` is not a level). |
| `weight` | `{"weight":7}` (0 to 10) | How important the session was. Drives sort order. |
| `closed` | `{"closed":true}` or `{"closed":false}` | Done (rubber stamp) or reopened. Closed sessions hide by default. |
| `question` | `{"question":"Keep the old table?","options":["yes","no"]}` | Two or more options for the owner. |
| `links` | `{"links":[{"path":"/framework/ai/sessions/","label":"Sessions"}]}` (1 to 3) | The core classes, files or pages the session created or edited, most important first. `path` is required. |

## How to write a line

The Servex tool `log_session` and this script both check the shape and stamp the line:

```
SESSIONS_ROOT=C:/Code/lew42/monorepo/public/framework/ai/sessions \
node Server/session-summary.mjs \
  --log <session-uuid> '{"tag":"refactor"}' --by mastermind-task-audit
```

`SESSIONS_ROOT` makes it write into the main tree's `sessions/` folder (this file is tracked and append-only, so two writers never conflict). A bad shape exits with code 2 and says why. After the branch merges, the same command runs as `node Server/session-summary.mjs --log ...` without `SESSIONS_ROOT`. The Servex tool wraps the same function (`Session.log`); its arguments are `session`, `line`, and your agent name as `by`.

Required: the session uuid (36 characters, the Claude session id), `by`, and one valid key. Never write `at`.

## For an old session that lacks something

- No tag: add one to three tags that say what kind of work it was.
- No core links: add one to three `links`, most important first.
- An unclear or unfinished thing: add an `alert`; if the owner must choose, add a `question`.
- Finished and unremarkable: add `closed`.
- Never write a cost, runtime or model. If the numbers look wrong, run `node Server/session-summary.mjs <uuid> --audit` and note the mismatch.

More about the class: [session-class.md](session-class.md).

## Writing a line from an agent

The Servex tool `log_session {session, line, by}` wraps `Session.log` (restart Servex to see it). From a script: `node Server/session-summary.mjs --log <uuid> '<json>' --by <name>`. The Sessions table filters by tag and by "needs attention" (any alert line).

## The day index line

Not a record line: this is the **computed** feed in `sessions/YYYY/MM/DD/index.jsonl`, written by `Server/SessionTailer.mjs`, never by hand (design: [realtime.md](realtime.md)). One JSON object per line:

```json
{"id":"<session uuid>","at":"2026-10-08T21:55:33.120Z","usd":6.0,"tree_usd":6.0,"state":"active","last_activity":"2026-10-08T21:55:31Z"}
```

- `id` and `at` are always there. Every other key is a field that **changed**; a missing key means unchanged.
- A session's first line each day is a **keyframe** with every field: `usd, tree_usd, children, wall_ms, model, effort, flags, day, provider, state, first_at, last_activity`.
- Later lines win, field by field (`Session.apply_delta` in the browser, `SessionDays.fold` on the server).
- `state` is `active` when the last transcript line is under 5 minutes old, else `idle`.
