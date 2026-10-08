# Session class — findings

Outcome: `Session.js`, the Sessions page cost cell and detail view, the audit (button, route, `audit_session` tool, CLI), `Server/session-summary.mjs`. Docs: [`sessions/doc/session-class.md`](/framework/ai/sessions/doc/session-class.md).

## 1. Does the SDK account in real time, and which source is the truth?

- **Claude, the SDK:** yes. The result message carries a cumulative `total_cost_usd` and `modelUsage`, and every assistant message carries `usage`. Servex already uses them. Evidence: `dedupe-truth.mjs` and `fit-rates.mjs` in this folder.
- **Claude, the transcript:** the truth for a session that was not run through the SDK (a VS Code tab or CLI run). Priced per message id with the last line of an id winning, it matches the SDK ledger to about 0.2% for verified models.
- **Claude, the old `session-cost.mjs`:** it priced every transcript line, so it overcounted about 2x (one block per line, each repeating the usage). Fixed: it dedupes by message id, prices the 5-minute and 1-hour cache writes separately, and includes the subagent files (which the main transcript omits and which are still billed).
- **OpenRouter:** its own ledger is the truth, shown as "$total", never added to "Claude $total". The Session class only knows Claude.

## 2. Gap against `session-cost.mjs`

The rolling total and the independent recomputation agree to rounding: 87a85cd1 gap $0.000012 on $41.03; a 12,056-message session with 90 subagent files gap $0.000075 on $1,450.06; a 199-message session gap $0.000025. The test also corrupts a total and confirms the audit names the field and the amount. The audit caught a real bug in my own rolling path on its first run (partial output tokens on the first line of a message).

## 3. Page load

The Sessions page already loads about 16.8 MB in 839 requests (before). With the Session class: 840 requests, about 16.9 MB. The grid adds one file, `session-index.json` (about 106 KB at the server's compression; 302 KB raw), and the detail view adds `session-tree.json` (148 KB raw) plus one small `/ai-logs/<id>/session` call. The old grid still loads `sessions.json` and `spend-tree.json`; retiring them is the next saving.

## 4. Open items (Note: cards)

- The opus-5-5 and sonnet-5-5 rates are fitted, not confirmed by a published price list.
- `Servex/agents/tools.js` gained `audit_session`, so Servex needs a restart to offer it.
- Unlinked spawned agents: 809 registry agents have no recorded parent; the page counts them as a defect. Servex should write `parent` on every spawn.
- Grid nesting (children indented under the parent) is not built; the grid shows "own + N children" and the detail view shows the tree. Reason: the grid sorts and filters flat.
- Effort for VS Code and CLI sessions comes only from the file; the registry covers Servex agents.

## 5. Recommendation: sessions that create things (owner note, 2026-10-08)

When a session creates a task or request that is later filed in a page's `page.jsonl`:

- The session keeps its own cost untouched. It also keeps a reference `{path, id}` to what it created. The content is stored once, in the page's file. Cost is never moved out of the session.
- Referencing ONE item without loading the whole file: **a sidecar index file** beside it (`page.index.json`: id to byte offset and length). A reader seeks to the offset and parses one line. It is rebuilt by a script from the file, since the file is append-only and offsets never move. Instantiating the page and asking by id loads everything; offsets inside the line references themselves would break if a file were ever rewritten.
