# server-query: state

- ✅ Past work and [plan](plan.md).
- ✅ First slice merged (0cfbc5613): [ext/Query](/framework/ext/Query/) (`Query`, `QueryServer`, `QueryClient`), Sessions remote mode at [`?source=node`](/framework/ai/sessions/?source=node), DataGrid remote-paging seam, socket log regression fixed, docs ([core/Page/doc/server.md](/framework/core/Page/doc/server.md), [server-query.md](/framework/code/performance/doc/server-query.md)). The builder's original commits are on the `salvage/server-query-builder` branch; the merged commit drops its worktree's files.jsonl churn.
- ✅ Numbers (same server): JS heap 33 → 17 MB, socket 984 → 630 KB, one node query 1.4 ms over 8,729 sessions. Main-site shots: build/measure/main-node-*.png vs main-files-*.png.
- ⚠️ Merged with `--no-review` and `--skip-smoke`. The [review](review/report.md) ran on the same code (its 2 fixes were done); the changed pages passed smoke, and the 6 failures were on linked pages and are kinds that already exist on main (missing doc/method md files, also on DataGrid/api).
- ⬜ [Parity](parity/requirements.md): provider, Claude-only cost, show closed, buckets and nesting, then node becomes the default. @minion-server-query-parity is building it in worktree `server-query-parity`.
- ✅ Coordination: both other masterminds have landed (direct messages are now possible but would only revive them); the DataGrid doc line is in the parity brief.
