# The 60-second item write: measured, found, fixed, and what is left of the owner's model

**In one line:** the write itself never took long. Appending one line takes under 1 ms. What took 20 s was the answer: after each write, the item tool rebuilt the whole session picture, and that made 2,652 cost lookups, each re-reading an agent's log from disk. A write now answers with the line it wrote, in 5–7 ms. A full read takes 56 ms with the logs cached, 1.8 s cold.

Measured 2026-10-24 on session-e00f55c9's record (`session.jsonl`, 339 lines, 206 tasks at all levels), with the probe `steps.mjs` (deputy scratch). Before = `michael/dev`; after = branch `worktree/qf-4`.

## 12b. Each step of one write, timed (ms)

| Step | Before | After |
|---|---|---|
| replay `session.jsonl` (339 lines) | 4 | 11 |
| append the one line | under 1 | under 1 |
| read Servex's registry (5.8 MB, 3,582 rows) | 24 | 18 |
| group the registry by task folder | 21 | 24 (kept for 60 s) |
| find the child agents (`agents_resolver`) | 1,540 each call (74 found) | 3,329 the first time, then 31 (156 found: it now also finds the agents the tab spawned outside its folder) |
| cost of each task (206 tasks) | 321 | 0 |
| newest summary in `cache.jsonl` (2.6 MB) | 3 | 4 |
| **a full read (the picture a write used to return)** | **21,735, with 2,652 cost lookups** | **56, with 970 lookups** |
| **one write, end to end** | **about 20,000** (field write 19.8 s, add 19.8 s, again 21.3 s) | **5–7** (112 on a caller's first write, which carries the instructions) |

**Why 2,652 lookups.**
- A task with no folder of its own (most of this session's 182 asks) looks its cost up by the session's folder (`at_path`), so every row asked for the same agents.
- Each ask read those agents' logs again: 11 MB of logs, rebuilt into turns every time.
- A verb write did it three times: two "did anything change" checks, then the answer.

**What fixed it (commits on `worktree/qf-4`):**
- `Agents.log_cost` keeps each log's rebuilt turns until the file's size or mtime changes (4a3f49090's parent, e3073f74a).
- A write answers `{ok, ids, line, size, now: {state, completion}}`, and the full picture is a separate read. The "did anything change" check is a fingerprint without costs (8af2fd177).
- One more reason this mattered: the browser's own writes (`Item.Store.post_to_tool`) give up after 5 s and then append the line themselves. At 20 s a click could land twice.

## 12c. The owner's model, against what exists

1. **Servex keeps a live instance cached, and a write is one append plus an in-memory update.** *Exists, and now holds.* `live_root` in `Servex/agents/page_tools.js` keeps one replayed root per record file. It is rebuilt only when the file's size or mtime, or a child file it read, changes. After a write, `advance()` replays the one new line on it. Every write since 8af2fd177 is exactly that.
2. **A session is built from its own `session.jsonl`, which names its child sessions, with no registry scan.** *Half there.*
   - Children whose task folder sits inside the session's folder are already named by the `{"task": "<folder>"}` lines that `SessionRecord.link_parent` appends at spawn.
   - Children whose task lives elsewhere, such as `mastermind-page` in `core/Page/tasks/`, are not named there. Today they are found by scanning the registry (`agents_under`, by `parent_session` or the parent's name and span).
   - **Plan:**
     - (a) At spawn, `open_task` also appends one `{"task": "<child folder url>", "as": "<agent id>"}` line to the parent *session's* record, found from `parent_session` by `Session.locate`.
     - (b) A one-off script, with a dry run and a manifest, appends those lines for the existing children of e00f55c9 (the 82 not already linked).
     - (c) `session_state` reads its children from its own task references: each child's line 1 names its agent, and that agent's log gives its cost. The registry is no longer read for a session that names its children. A record with none falls back to `agents_under`.
     - Cost: about $3.
3. **Indexes per scope** (`ai/sessions/index.jsonl` lists years; a year's index its months, a month's its days, a day's its sessions). *What exists:*
   - `YYYY/index.json` and `YYYY/MM/index.json`, rolled up by `AISessionIndex.roll` (`ai/AISession/AISessionIndex.mjs`);
   - `YYYY/MM/DD/index.json` (the day's snapshots), by `AISessionIndex`;
   - `YYYY/MM/DD/index.jsonl` (one `session` row per folder on its start day), by `DatedFiles.sessions.watch()`/`sync()` (`Server/DatedFiles.mjs`).
   - Nothing lists the years, and no month or year has an append-only list.
   - **Plan:** extend `DatedFiles.sessions`. When it writes a day's first row, it appends one `{"day": "YYYY/MM/DD"}` line to the month's `index.jsonl`; on a month's first day, one `{"month"}` line to the year's; and on a year's first month, one `{"year"}` line to `sessions/index.jsonl`. A backfill script writes them for the folders that exist (dry run plus manifest). The rolled `index.json` files stay as they are: they carry totals, and the `.jsonl` files are the lists.
   - Cost: about $3.

**Not done in this pass, and why:** 2 and 3 change where records are written, so they go through review first (12d). The targets are already met by the fix above: a write in 5–7 ms, and a full read in 56 ms warm or 1.8 s cold.

## 12d. Review, then build 2 and 3

The branch (`worktree/qf-4`) goes to a fresh reviewer with this file as the plan. After it merges and Servex restarts, measure again on the live record and add the numbers here.

## Item 20. Does a long session replay slowly?

**No.** Replaying the whole 4-day record (339 lines, 206 tasks at all levels) takes 4–11 ms, and `cache.jsonl`'s newest summary is found in 4 ms. The time went on the work *after* the append, which is fixed above. **No checkpoint lines are needed.** They would be worth adding only if one record's replay passed about a second, which would take about 30,000 lines at this rate. Nothing is deleted or rewritten either way.

## The first small merge

The write answer and the log-cost memo shipped on their own, ahead of the rest. Task folder: [deputy/fast-write](../deputy/fast-write/requirements.md), branch `worktree/qf-3`, commit f795532e9. A write on a copy of this record: 254 ms on a caller's first write, then 10–14 ms.

**Live, after the merge (69b5f0dc6) and the Servex restart (22:05, 2026-10-24):**
- Two item writes were sent at once: one to the deputy's record (`deputy/session.jsonl`, 252 lines), one to its session page.
- Both answered with the new shape (`{ok, ids, line, size, now}`).
- They were stamped 0.43 s apart (03:12:25.078Z and 03:12:25.505Z).
- Before the fix, one write on this record took 20 to 60 s and stalled Servex.

## The read that still froze Servex: found and fixed (2026-10-24, 22:49)

- **What the owner saw:** the session page's cost tile stayed on "…" for 74 s.
- **What Servex did:** its 5 s heartbeat (`crumbs.log`) stopped for 72–107 s at a time, every few minutes, and every route and agent waited.
- **What named it:** new breadcrumbs ([servex-crumbs](../deputy/servex-crumbs/requirements.md)) caught `item> …/session-e00f55c9/ summary by owner`, followed by `item< 103311ms`.
- **What a live CPU profile showed:** `existsSync` 31 s and `readdir` 26 s, under `TaskDirs.list` < `TaskLoop.find_task_files` < `Heartbeat.find_task_dir` < `Agents.task_dir_for` < `Agents.task_dirs` < `task_cost`.
- **The cause:**
  - `task_dirs()` groups the registry rows by task folder.
  - For each of 3,000+ rows with no recorded `task_dir`, it fell back to `find_task_dir`, which reads every recent task log. That fallback was meant for one stopped agent at revive.
  - Its 60 s cache meant the full scan ran again whenever a page asked a cost.
- **Why the measurements above missed it:** they ran in a separate process with no Heartbeat attached, so the fallback did nothing there.
- **The fix (76b63287f):** `task_dirs()` reads only each row's own `task_dir` and the heartbeat's owner map.
- **Live after the restart:** the summary's first, cold call takes 5–9 s, then 0.14–0.19 s.
