# What the detail view loads for a row

Five plain lines, for anyone asking "where does this number come from?":

1. **The row** (name, model, state, cost in the grid) is the session's small `index.json` snapshot, kept current over the socket; the header line (title, source) comes from `sessions.json`.
2. **The accounting summary** is the session's own folder, `cache.jsonl` (about 1 KB: tokens, cost parts, models, tools, purpose split). Every cost and token number on the page is computed from it; it holds no conversation text.
3. **The trace** (`trace.json`, the cost-over-time chart) exists for only a few sessions; the page asks for it only when the index lists the session.
4. **The spend tree** (who spawned this, what it spawned, the descendants total) comes from `spend-tree` and only knows Servex agents; `tree_usd` is the descendants total from the older whole-file index.
5. **The prompts you read** come from the raw transcript through the dev-only `/ai-logs/<id>` route, never copied into the repo; with no dev server they simply do not show.

The **Related** section on the same page lists the other records of the session (inbox card, task folder, brief, report, parent, children), each with a one-line label saying what it is. Those paths are the snapshot's `links`, worked out by `Server/session-links.mjs` from the real folders; no new storage place was added. Counts of each kind: [patterns](patterns.md).
