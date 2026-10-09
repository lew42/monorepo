# The Session class

`Session.js` turns one raw Claude transcript into cost numbers. It runs the same on the server and in a browser. A script reads the file; no model ever does.

## What it computes

- Cost per session, split into input, output, cache read and cache write, priced per message id (the last line of an id holds the final usage).
- Per model and effort: tokens, dollars, messages. The model comes from the file's own per-message field, version included.
- Tools used, wall time, active time.
- Subagent transcripts (`<session>/subagents/agent-*.jsonl`) are rolled into the parent.
- A best-effort split of tokens by purpose. Method and error are printed beside it (`PURPOSE_METHOD`).
- Claude and OpenRouter are never added together; this class only knows Claude.

## Two files per session

- `session.jsonl` is the **record**: tags, notes, alerts, weight, closed, questions, links. Tracked in git, append-only, written only by `Session.log` (see [record-spec](record-spec.md)). Never folded or rewritten.
- `cache.jsonl` is the **computed numbers**, gitignored and rebuildable, described next.

## `cache.jsonl` (one per session, gitignored)

This is a rebuildable cache, so it is rewritten freely (it folds when long); the never-destructive rule applies to `session.jsonl`, the record. The brief put usage and cost in `session.jsonl`; the split exists so the record can be tracked in git while the numbers are not. On the static production site the index files are absent, so the Cost cell falls back to the older figures and the detail view says the dev-server route is not running.

`sessions/<session-id>/cache.jsonl`. Each line is `{summary, at, by}` (the rolling totals plus a byte cursor and a ring of the last 40 message ids; the byte cursor is the real guard against double counting, the ring only covers a cursor reset) or `{audit, at, by}` (time, old totals, new totals, match, diff). More than 30 lines fold into one summary plus the latest audit.

## Loading and saving

- `node Server/session-summary.mjs <id>` reads only the bytes after the cursor, then saves.
- `--audit` recomputes everything with `Server/session-cost.mjs` (a separate parser) and records the verdict. The page's Audit button calls `POST /ai-logs/<id>/audit`; Servex agents call the `audit_session` tool.
- `--index` writes `session-index.json` (one short array per session, what the grid loads) and `session-tree.json` (parents and children, loaded by the detail view only).
- `node Server/session-summary.test.mjs [id]` checks the rolling total against the audit path, replay safety, and that a corrupted total is caught.

## Timing

A 12,000-message session with 90 subagent files audits in a few seconds; `--index` over 30 days (7,400 sessions) takes about 40 s cold and 5 s warm.

## Known limits

The tree uses the Servex registry; spawned agents with no recorded parent are counted as a defect on the page. Effort is only known where the file or the registry records it.

## Lifecycle: closing a session

The owner can mark a session done ("rubber stamp"). `Session.close(id, by, closed)` appends a stamped `{closed: true|false, at, by}` line to `session.jsonl` (the record); a later line wins, so `closed:false` reopens it. Nothing is deleted. The detail view has a Close/Reopen button (`POST /ai-logs/<id>/close`, `?undo=1` to reopen), and `node Server/session-summary.mjs --close|--reopen <id> [--by name]` does the same from a script or an agent. `--index` lists closed sessions in `session-index.json` (`closed: {id: at}`); the table hides them unless "show closed" is ticked. Anything that chases or wakes sessions should skip an id listed there.

## Where each part runs

`Session.js` imports no node code at the top, so the browser loads it. Node-only methods load their modules inside the method.

| Method | Server | Client |
|---|---|---|
| `apply_line`, `preview`, `set_configured`, the numbers | yes | yes |
| `update`, `save`, `audit`, `locate`, `load_cached` | yes | no |
| `use_index`, `from_index`, `of`, `apply_delta`, `on`, `index_row`, `grid_row` | no use | yes (the light live Session) |
| `render()` | throws (`Session.View` is unset) | yes |

`Server/SessionTailer.mjs` is the server user; `SessionLive.js` is the client user.

## A Session draws itself

`Session.View = SessionView` is attached after the class (the last line of `SessionView.js`, not a static field) when the browser loads `SessionView.js`, so `session.render()` draws that session as a grid row. It does `new this.constructor.View({ session: this, ... })`, a fresh view each call, the same way `core/Item`, `audio/Part` and `lab/LiveView` do, so a subclass can override `static View`. The other classes nest beneath it as helpers:

- `SessionView` is the row. It subscribes to its Session (`ses.on`) and redraws only itself.
- `SessionDetail` is the session's own page; it opens from a row.
- `SessionRows` is the data helper (fetch, merge, sort, nest). `SessionTrace` is the chart and tool-table helper used by the detail page.
