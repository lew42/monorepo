verdict: fix
1. [fix] Ask 1 says every write to a record file goes through the entry point, but Servex's own direct appends to task and session records still skip it and leave the live root stale: `Servex/agents/Agents.js:1082`, `:1736`, `:2280`, `:2319`, `Servex/Lifecycle.js:126`, `Servex/WorktreeWatch.js:290`. They run inside Servex, so routing them to `record_lines` is cheap. If they stay out, `core/Item/doc/one-writer.md` "Not routed" must list them, because today it names only line 1 of new sessions.
2. [fix] `core/Item/doc/map.md` is stale. Its "How a change is saved" section (lines 49–60) says a browser change goes `Store.flush` → `FsFile.send` → `Append.js` with no `by` or `ts`, and the map's writer table never names `RecordWriter.js` or `record_lines`. This file is the module's own "every writer" map, so it has to describe the one writer.
3. [fix] `core/Item/doc/architecture.md:49` still says the Store "sends each new line via `FsFile.send`". For record files that path is now only the fallback, behind `RecordWriter.post`.
4. [fix] Ask 4 also requires the integration branch's smoke, but no smoke result is recorded. `proof/` holds `tests.txt` (74 of 77, the same 3 baseline failures) and `replay-compare.txt` (9626 of 9626 the same). `proof/browser-probe.mjs` is there, but none of its output is saved, so a fresh agent cannot confirm that a tab click on the worktree's dev server still saves once. Save the probe's output in `proof/`.
5. [note] `Server/LogLine.mjs` `append`: when `record_lines` answers `ok: "partly"`, it is not thrown, so `report` says every line was appended even though some were refused. `.claude/hooks/append.mjs` makes the opposite mistake: on a partial refusal it exits 3 with "Not written" after the other lines were written.
6. [note] `.claude/hooks/ledger.mjs` now makes one HTTP post for each record line on every hook event, with a 3 s timeout (`RecordWriter.write`). When Servex's event loop is held (the crumbs case), every hook can stall for 3 s. Hook latency was not measured.
7. [note] One twin window remains beyond the same-millisecond limit in `one-writer.md`. Suppose `run_item_now` passes its `already` tail check (`page_tools.js` near the `stamp` change) and is still writing when the tab's 15 s fallback goes through `Append.js`. Both writers then see a tail without the line, and both write it. It is rare, but the doc should name it.
8. [note] `serve_item` ignores the `by` that `RecordWriter.post` sends with a verb (`page_tools.js`, `serve_item`), and the caller is always `"owner"`. That is right for a tab, but the field does nothing, so a future node caller posting verbs would be stamped as the owner.
9. [note] `core/Item/doc/one-writer.md` says "RecordWriter.test.mjs (7 checks)", but the file has 9, and the task log says 9/9.

## Requirements
- 1 "Every write to a record file goes through one entry point … the browser Store, the hooks, LogLine" — partly. The browser (`Store.js`), `ledger.mjs`, `naming-guard.mjs`, `append.mjs` and `LogLine` go through it. Servex's own direct appends do not (finding 1).
- 1a "raw append only as the fallback … check the file's tail first … remove the blind 5 s self-append" — yes. `post_to_tool` is gone. `RecordWriter.append_once` and `Append.js` check the last 64 KB by `by`+`ts`. Test 3 covers down, slow, stubbed and late posts in both orders.
- 2 "Keep it in Servex; one function, one caller-facing signature; say how F1 moves it" — yes. The callers use `RecordWriter.post`/`write`, and the move is the one line in `entry()`. `one-writer.md` "Moving it to the dev server" says how. The landing is not written yet.
- 3a "two writers at once give no twin and no lost line" — yes. `one-writer.test.mjs` section 1: 40 adds, 40 unique, the live root equals a fresh replay.
- 3b "a hook write no longer makes the next tool call replay the whole file (measure it)" — yes. 1 replay before and 0 after; on real records 164 → 16.5 ms (8,383 lines) (`one-writer.md` Measured, `proof/measure-real.mjs`).
- 3c "the fallback, when the entry point is down, writes once" — yes, test 3 "down".
- 4 "Keep the integration branch's test counts, replay comparison and smoke" — partly. The counts and the replay comparison hold (`proof/tests.txt`, `proof/replay-compare.txt`); the smoke is not recorded (finding 4).
- Class page for the new class (`RecordWriter`) — no. It is a stateless static helper with no live instances to watch, so this is a note, not a fix.
- Fences — yes. The worktree `worktree/one-writer` is locked and not merged (`git worktree list`). The main tree's hooks are untouched.
- Fresh agent can continue from the folder — mostly. `session.jsonl` has the worktree, url, decision and commits, and the task is indexed in `plan.md:112`. The smoke result is the missing piece.

## Words
- content: plain sentences — yes. `one-writer.md` leads with what it is, then a table of writers, then the no-twin rule.
- content: the numbers are right — no. The check count is wrong (finding 9).
- content: stale wording in the touched module — no (findings 2 and 3).
