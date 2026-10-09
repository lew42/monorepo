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

## Asking about past sessions

To find past work (by tag or system) and see what it cost, run the same query the dashboard filters use. It reads the day files, counts each session once (on the day it was last active), and caps the rows so the answer stays small. The totals always cover every match.

`node Server/session-query.mjs [flags] [--json]`. Every flag is optional:

| Flag | Meaning |
|---|---|
| `--since` `--until` | First and last day, `YYYY-MM-DD`. |
| `--tag` | Comma-separated tags; a session needs all of them. |
| `--system` | A core module (`ext/Dictate`, or any part of it) or a task category. |
| `--state` `--model` `--provider` | `active`/`idle`/`closed`; part of a model name (`opus`); `claude` or `openrouter`. |
| `--parent` | A session id: only its children. |
| `--min-cost` | Dollars; hides cheaper sessions. |
| `--text` | A word found in the id, agent, category, tags or modules. |
| `--sort` `--limit` | `recent` (default), `oldest`, `cost`; rows to show, default 25, at most 200. |

The answer is `{count, claude_api_equivalent_usd, openrouter_real_usd, rows}`. Claude sessions are priced at API-equivalent rates (what the plan saves); OpenRouter dollars are real money, so the two are never added together.

Three example questions:

1. *What did we do on dictation this week, and what did it cost?* `node Server/session-query.mjs --system dictat --since 2026-10-02 --json`
2. *Which sessions tagged `transcription` cost the most?* `node Server/session-query.mjs --tag transcription --sort cost --limit 5`
3. *Which expensive Opus sessions ran this month?* `node Server/session-query.mjs --model opus --min-cost 20 --since 2026-10-01`

An in-process agent can call the SDK tool `query_sessions` instead (same arguments, same code, no network hop). It is not loaded by default: `Servex/agents/tools.js` exports `query_sessions_tool()`, and a role that needs it adds it to the tool list it gives `server()`.

## The snapshot

Not a record line: a session's `index.json` is the **computed** current state, written atomically by `Server/SessionIndex.mjs`, never by hand (design: [realtime.md](realtime.md)). The day composite `sessions/YYYY/MM/DD/index.json` bundles the snapshots of one day.

```json
{"id":"<session uuid>","state":"active","model":"claude-sonnet-5","provider":"claude","usd":6.0,"tree_usd":6.0,"children":0,"tags":[],"alerts":0,"first_at":"2026-10-08T21:50:00Z","last_activity":"2026-10-08T21:55:31Z"}
```

- It is **state, not events** (decided 2026-10-08): a reader needs no transcript read, and an event-sourced index was rejected. It is never a history; the history is the transcript and the session's cache.
- `state` is `active` when the last transcript line is under 5 minutes old, else `idle`.
- The same object reaches the browser over the socket, and `Session.apply_delta` folds it field by field.
