verdict: fix
1. [fix] The cost total and count still do not match the files view, which ask 2 and the proof ask for ("same counts, same cost total"): the work's own doc records 6,458 sessions / $5,189.57 in remote mode against 6,359 / $5,020.66 in files mode (ext/Query/doc/architecture.md, last line of the diff). Find the ~99 extra rows (likely sessions the files path drops, e.g. rows with no day snapshot or a different date test) before remote becomes the default.
2. [fix] "Same rows at the top" is not met: the files view puts in-flight rows first, node sorts by last activity only (named in architecture.md as still different). Add the in-flight-first key to the default sort in `AISessionsPage.remote_spec` or in `AISessionSource.arrange`'s `sort`, so flipping the default (ask 5) does not change what the owner sees first.
3. [note] Flipping the default (ask 5) landed while items 1–2 are open; if they cannot be closed quickly, keep `?source=node` opt-in until they are, since the brief made parity the condition for the flip.
4. [note] In node, `AISessionFlags.rows` is never loaded, so "needs attention" only sees alerts, the $10 total and the Opus-minion flag; stalled, bloat and hour-cost never fire (AISessionSource.mjs:170 `attention_of`). It is documented, but the checkbox counts differ from the files view for the same reason; loading `session-flags.json` in `AISessionSource.load` would close it.
5. [note] `shape` spreads a new object and runs `flags_of` for every one of ~8,700 snapshots on every query, and the shared `AISessionSource.buckets` then sees all-new objects; the perf row added to server-query.md gives browser numbers only, so re-measure the node query median (it was 1.4 ms before) to confirm it is still small.
6. [note] AISessionsPage.js, the `remote_ask` hunk: the `this.attention_only_text?.text(...)` line has one tab too many.
7. [note] Simpler-way check: the shared `AISessionBuckets.nest` / `arrange` extraction is the right seam (one implementation for browser and node, as Law 6 asks), and `shape`/`arrange` as `QueryServer.Source` options is small and clean. Moving `AISessionRows` out of `AISessionFlags`' static imports (dynamic import in `load`, `usd_of` hook set by the page) works but leaves a module-level assignment in AISessionsPage.js:219 between imports; a comment-free `static` set inside the class would be easier to find.

## Requirements
- 1 "Provider/source column" — yes — `AISessionSource.source_of`: Servex agent → "servex", else the sessions.json tag, else "vscode"; a join in `shape`, no second store.
- 2 "Cost total … check the number against the files view" — no — `claude_usd` summed, but the recorded totals differ ($5,189.57 vs $5,020.66).
- 3 "Show closed + needs attention, same meaning" — partly — closed uses the same `rec.closed`; attention uses `flags_of` + alerts but without session-flags.json (finding 4).
- 4 "Buckets and nesting in node, after the filter, before the page slice" — yes — `Query.run(items, arrange)`, `AISessionBuckets.arrange` shared by both paths; rows sent are still one page.
- 5 "Flip the default; update readme, architecture.md, server-query.md" — yes — `start_remote` checks `source === "files"`; all three docs updated, closed gaps removed.
- Proof (same rows on top, same counts, perf row, smoke) — partly — perf row added; counts and top rows differ; shots are said to be in the worktree (not reviewed here); smoke result not reported in task.jsonl.

## Words
- content — yes — docs are plain sentences and name what still differs; the readme line is one sentence with links.
