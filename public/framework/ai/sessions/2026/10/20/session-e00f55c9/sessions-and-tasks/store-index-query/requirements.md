# One store, one dated index, one query: the class architecture (a plan, checked against the prompt; no code)

Budget: $6. Opus, medium effort. Parent: `vscode-mastermind` (the owner's VS Code tab), who tails your `session.jsonl`: log there with the `log` tool as you go, not chat. **Plan only: no code, no renames, no moves.** The owner (2026-10-20 18:50): "we're building a lot of stuff without planning it"; make a plan, cross-check it against the raw prompt, then build.

## The owner's asks (essence; words in the tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl` after line 83)

[ai/doc/owner-2026-10-20-who-makes-tasks.md](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) section 15 (this dictation), section 10 (query, names), section 11 (index not state), section 12 (items save through their parent); [core/Task/doc/owner-2026-10-20-projects-and-completion.md](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md) section 3 (the YYYY/MM/DD breakout as one system). In short:

- Session data is the AI truth.
- Code keeps the index for each dated path, never out of sync.
- One portable class owns the dated breakout: it makes the folders, keeps the index and answers queries.
- One JSONL database: create, move and query are the same operations whether an SDK/MCP tool or the dev socket calls them.
- It "kind of feels like" it belongs in `core/Item`, with JSONL as one swappable store.
- Any item gets real-time updates.

## What exists (read these first, with file:line; the inventory is deliverable 1)

- `core/Item/Item.js` + `core/Item/Store.js`: one `.jsonl` = one object's history; replay, append, `live()`; a child's deltas bubble to the host's store. Findings and the rule: `core/Item/readme.md`, `core/Item/doc/architecture.md`, `core/Item/doc/next.md`.
- `ext/JSONL/JSONL.js` (`TaskJSONL`, `live()`), its readme's converge note; `core/Page/doc/jsonl.md` (page.jsonl). Three doc homes for one idea.
- `core/Session/Session.js`, `core/Session/Day.js` (the day rule), `Server/TaskDirs.mjs` (makes dated folders), `Server/ProjectMove.mjs`, `Server/TaskMove.mjs`, `Server/SessionDayMove.mjs`.
- Index writers: `Server/AIIndex.mjs` (`ai/index.json` + `ai/index.jsonl`), `Server/AIIndexStream.mjs` (day `index.jsonl`), `ai/AISession/AISessionIndex.mjs` (day/month/year `index.json`, `cache.jsonl`, `record_snap`), `Server/SessionIndex.mjs` (the Query sources `sessions`, `tasks`).
- Query: `ext/Query` (`Query.js`, `QueryServer.mjs`, `QueryClient.js`; `rpc:query` on the dev socket), `Server/session-query.mjs` (CLI over the day indexes). Docs: `ext/Query/readme.md`, `Server/doc/session-index.md`, `Server/doc/ai-index.md`.
- Creators: `TaskDirs --new`, the `item` tool (`tasks.add`), `Agents.open_task` (Servex), `register_session` and `voice_session` (`Servex/ext/remote/RemoteMCP.js`), `.claude/hooks/session-page.mjs`.

## Deliverables (one doc: `core/Item/doc/store-index-query-plan.md`, linked from `core/Item/readme.md` and `core/Item/doc/next.md`)

1. **Inventory table:** every writer and reader of a store or an index above, file:line, what it writes, what duplicates what. Facts only.
2. **The class architecture** (the owner: wrong names and hierarchy are why built things don't feel right): each class's name, one-line job, what extends what, what composes what, which one orchestrates. Expected shape to test, not to copy: `Item.Store` (swappable; JSONL first); one class for the dated breakout (make `YYYY/MM/DD/<slug>/`, keep the index per path, re-index on move, answer a query) that sessions, tasks and projects share; `ext/Query` over it; one set of operations (create, move, query) called by the SDK/MCP tools and by the dev socket. Use the owner's names; name every alternative. Where it lives (`core/Item` vs `ext/JSONL` vs `Server`) is a decision written with `node Server/Decide.mjs`, options ranked.
3. **Coverage check:** a table, one row per ask in section 15 and section 3: where the plan covers it, or "dropped" or "made stricter", with the reason. This is the step the owner asked for.
4. **Slices:** the smallest working slice first, then the order; each one Sonnet task with a budget, and what proves it (a test, a page).
5. **One doc home** for the JSONL store: which of the three becomes the page and which two become one-line pointers.

Done when the doc exists, is linked, the decision is logged, and `finish-task` is called in your own `session.jsonl`. Do not touch code. Do not spawn.
