# Slice 3 of the store/index/query plan: queries through `Dated`, and the "in flight" page

Budget: $5. Sonnet, medium effort. Parent: `vscode-mastermind` (the owner's VS Code tab), who tails your `session.jsonl`: log with the `log` tool, not chat. Own worktree (`worktree/dated-queries`); commit each working step; `node Server/merge.mjs`; do not restart Servex or the dev server (say which one is needed).

## The plan is the brief

[core/Item/doc/store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md): section 2 (the classes), section 4 row 3 (this slice), and the owner's 19:20 section (one data system for every log kind). Slices 1 and 2 landed 2026-10-20 (merges 070ccc46c, 5330072c6): `core/Item/Dated.js`, `Server/DatedFiles.mjs` (`DatedFiles.sessions`, `DatedFiles.projects`), `Server/doc/dated-files.md`. The owner's words behind this slice (18:50): "when you're checking everything in flight, you should probably be doing a query… do we have a query system for all of our session data? The session data should be the most reliable source of AI truth: who's doing what and when and where it's all at."

## Do

1. The `ext/Query` sources `sessions` and `tasks` (`Server/SessionIndex.mjs`) read through `DatedFiles.query`, so one index feeds the grid; `Server/session-query.mjs` (the CLI) calls the same method. No second reader of the day indexes is left; say what you deleted or thinned.
2. **The in-flight page** `/framework/ai/now/` (or the existing page the plan names, if one exists: check `ai/readme.md` first; never a second page for the same thing): one screen, live, computed by a query, never by an agent: every session and task that is running right now (state running or working, last activity within the hour), who it is (agent id, model), what it is doing (its `now` or latest log line), where it lives (a link to its folder), and its cost so far. Rows update through the socket as the index streams. Mobile first: it must make sense at 400 px with no prior knowledge (the owner's gate from 19:15: a page with no data and no way to make data is a failed page, so with nothing in flight it says so and links the day).
3. Proof: the sessions grid in remote mode is unchanged (shot before and after); `node public/framework/ext/Query/check.mjs` passes; the in-flight count equals Servex's `list_agents` working count at the same moment (write the two numbers in your log); `check_page` at 400 and 1200.
4. Docs (law 9): `ext/Query/readme.md` names `DatedFiles.query` as the source; `Server/doc/dated-files.md` gains the query section; `ai/readme.md` indexes the in-flight page in one line; tick slice 3 in the plan.

## Done when

- [ ] One index feeds the grid, the CLI and the in-flight page.
- [ ] The in-flight page is live and right at 400 px.
- [ ] Tests and shots as above; merged; `finish-task` in your own `session.jsonl`, one screen, check marks.
