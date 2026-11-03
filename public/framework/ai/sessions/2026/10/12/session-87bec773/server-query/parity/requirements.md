Budget: $20

# Build: Sessions remote mode reaches parity, then becomes the default

Parent: @mastermind-server-query. Model: Sonnet. Work in a worktree from `michael/dev` (`take_worktree`, or `node Server/worktree-up.mjs server-query-parity`); commit each working step; do NOT merge. Load the `code` skill first. Log to `task.jsonl` beside this file (`node .claude/hooks/append.mjs <file> <lines.json>`, verb `log`).

Background: [../plan.md](../plan.md) and [ext/Query/doc/architecture.md](/framework/ext/Query/doc/architecture.md). The Sessions page has a remote mode (`?source=node`, `AISessionsPage.start_remote`): node answers `rpc:query` over the session index and the browser gets only 50 rows. It is opt-in because it differs from the files view. Close the gaps listed under "Known gaps" in that doc, in this order, one commit each:

1. **Provider/source column.** Rows all say "VS Code". Find where the files path gets the source (`sessions.json`, Servex's agent list) and give node the same answer (a field on the snapshot, or a join in the sessions source's `items()`); never a second store.
2. **Cost total.** The files path shows Claude spend only; make `totals` match (a `where` on provider, or a second sum), and check the number against the files view for the same date window.
3. **Show closed + needs attention.** Same meaning as the files path (read `AISessionsPage.draw()` and `AISessionFlags`).
4. **Buckets and nesting.** Run `AISessionBuckets` (isomorphic) and the parent nesting in node after the filter, before the page slice: a `QueryServer` source option `arrange(rows, spec)` or a step in the sessions source — the smallest seam. Rows sent are still one page.
5. **Flip the default.** Remote mode becomes the default on the dev socket; `?source=files` forces the old path (swap the check in `start_remote`). Update `ext/Query/readme.md`, `doc/architecture.md` (remove the closed gaps), `code/performance/doc/server-query.md`.

Proof: a private-port dev server from your worktree with `SESSION_TAIL=1` and `SESSION_ROOT` pointing at the main checkout's `public/framework/ai/sessions` (see `../build/measure/serve.mjs`; do NOT let it write into the main tree — set it read-only or confirm the tailer writes nothing there); headless screenshots at 400 and 1920 of `/framework/ai/sessions/` and `?source=files` side by side: same rows at the top, same counts, same cost total. Re-run `../build/measure/perf.mjs` with label `parity` and add the row to the perf doc. `node Server/smoke.mjs <worktree>` passes. Do not commit files.jsonl/page.jsonl churn from your worktree's watcher (gone-marks for files that are missing in the worktree).

Report: one screen to the parent — commits, side-by-side shots, the numbers, what is still different. Never write the owner's name.
