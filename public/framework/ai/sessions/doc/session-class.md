# The Session class

`Session.js` turns one raw Claude transcript into cost numbers. It runs the same on the server and in a browser. A script reads the file; no model ever does.

## What it computes

- Cost per session, split into input, output, cache read and cache write, priced per message id (the last line of an id holds the final usage).
- Per model and effort: tokens, dollars, messages. The model comes from the file's own per-message field, version included.
- Tools used, wall time, active time.
- Subagent transcripts (`<session>/subagents/agent-*.jsonl`) are rolled into the parent.
- A best-effort split of tokens by purpose. Method and error are printed beside it (`PURPOSE_METHOD`).
- Claude and OpenRouter are never added together; this class only knows Claude.

## `session.jsonl` (cache, one per session, gitignored)

`sessions/<session-id>/session.jsonl`. Each line is `{summary, at, by}` (the rolling totals plus a byte cursor and a ring of the last 40 message ids) or `{audit, at, by}` (time, old totals, new totals, match, diff). More than 30 lines fold into one summary plus the latest audit.

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

The owner can mark a session done ("rubber stamp"). `Session.close(id, by, closed)` appends a stamped `{closed: true|false, at, by}` line to `session.jsonl`; a later line wins, so `closed:false` reopens it. Nothing is deleted. The detail view has a Close/Reopen button (`POST /ai-logs/<id>/close`, `?undo=1` to reopen), and `node Server/session-summary.mjs --close|--reopen <id> [--by name]` does the same from a script or an agent. `--index` lists closed sessions in `session-index.json` (`closed: {id: at}`); the table hides them unless "show closed" is ticked. Anything that chases or wakes sessions should skip an id listed there.
