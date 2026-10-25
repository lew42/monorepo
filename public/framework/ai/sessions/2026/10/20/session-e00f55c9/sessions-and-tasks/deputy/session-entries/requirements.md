# Every spawn is a Session entry in its parent's record, under the task that caused it

Budget: $25. Load the `minion` skill first, then read [plan.md](plan.md) beside this file: it holds the design and its decisions. Work in a worktree from `take_worktree` (or `node Server/worktree-up.mjs session-entries`), committing at every working step by exact path (never `commit -a`). The deputy reviews and merges. Never kill or restart the dev server or Servex, never `git stash`, never drive the owner's tabs. Log on this folder's `task.jsonl` through the item tool.

**The owner's asks** (session-is-a-task brief, [items 31, 32 and 33](../../session-is-a-task/requirements.md#part-7-the-owner-2026-10-24-one-list-children-as-a-view-three-costs)):
- A session's `tasks` is the one list of everything to be done: prompts, tasks and child sessions. `children` is a computed view of it (the entries that are Sessions), never a second stored list.
- Upgrading a task into a session is the one way work is handed off. The parent's entry becomes a Session entry that records the spawn's configuration (role, model, effort, role readme, brief path, session id). The hand-off is the folder.
- A task is a line by default. It gets a folder only when it becomes a session or a project, and the parent indexes that folder.
- Cost is three numbers computed at read time: own, children (the sum of each child's total), total.

**What is true today** (2026-10-24, e00f55c9): 46 folders on disk, 17 `{"task": "<folder>"}` link lines plus 3 from `ChildLinks --apply` (89f14fccb), and 0 Session entries among its ~300 tasks. A spawned child's record starts with an `{"assign": …}` line, so `Task.from_ref` replays it as a plain Task. The page therefore cannot show child sessions in place.

**Build (details and decisions in plan.md):**
1. A spawn writes one Session entry on the parent's record, nested under the task that caused it, carrying the spawn's configuration.
2. A referenced child folder whose entry says `type: "Session"` (or whose record is a session record) replays as a `Session`.
3. `children` and the three costs come from the entries; agents with no entry still count through today's registry lookup (`agents_under`) until backfilled.
4. A backfill script for e00f55c9 (both day folders), with a dry run and a manifest. Every folder becomes an entry, and the existing link lines become Session entries.
5. Readmes: `core/Task/readme.md` (item 33's defaults, today's mismatch in numbers) and `core/Session/readme.md` (the entry shape, children as a view, the three costs). CLAUDE.md law 9: the readme states the on-disk shape, the writer and the reader.

**Proof:**
- A test in `core/Test`: spawn under a parent whose task "x" is running → the parent's record has one Session entry under "x", carrying role, model, effort and session id → the child completes → the parent's completion and children cost move. It runs on a scratch tree (`SERVEX_PUBLIC`, as `Servex/agents/child-links.test.mjs` does), never the live tree.
- The backfill's dry-run counts on e00f55c9, then `{"children":{}}` and `{"summary":{}}` from the item tool after `--apply` on a COPY of the record (the deputy applies it live after merging): the number of child Sessions, and own/children/total.

**Report (your task's `complete` outcome, one screen):** the entry's shape, the commits, the test's name and checks, the backfill's counts, and anything left with its reason.
