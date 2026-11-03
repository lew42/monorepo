verdict: fix
1. [fix] A task folder whose line 1 is a task's own line (`{id, path, title}`) and which a spawn later wrote an `{assign}` into now replays wrong: `Task.from_ref` makes it a `Session` (`lines.some(Task.spawned)`, `core/Task/Task.js:796`), but `Session.replay_line` picks its shape from line 1 only (`core/Session/Session.js:623`). So it goes to `apply_line`, which ignores `complete`. A repro in the worktree: a completed folder replays `state running`, and the parent's completion reads 0; as a Task it reads `complete`. The live tree has 7 such folders, 4 of them finished (e.g. `core/Page/tasks/page-mastermind/task.jsonl`, `…/sessions-and-tasks/readmes-page/task.jsonl`). Fix: pick the "task" shape when any line is a spawn (or when line 1 is not `{session}`), and add this case to `session-entries.test.mjs`.
2. [fix] The new manifest `public/framework/ai/sessions/session-entries.jsonl` (`Server/ChildLinks.mjs`, `ENTRIES`) is listed only in `core/Session/readme.md`. `public/framework/ai/sessions/readme.md`, the readme of the folder it lands in, doesn't mention it (or the older `session-links.jsonl`). CLAUDE.md laws 9 and 10 say a new file is indexed where it lives: add one row naming the file, its writer and what it is for.
3. [note] Cause rule (c) (`cause_of`, `Servex/agents/Agents.js` diff +361) skips any task with `_own_file`. A task added with the item tool on a `task.jsonl` record gets its own folder (`core/Task/readme.md`, "Homes and references"), so a spawner that is itself a task folder will almost never find a running cause there, and its entries go to the top level. The test only covers a `session.jsonl` parent. Worth one line in the readme's cause section, or one more test.
4. [note] The worktree `C:/Code/lew42/worktrees/session-entries` still has uncommitted record writes from a test side effect: `public/framework/ai/sessions/session-links.jsonl` (+10 lines), and the `session.jsonl`/`task.jsonl` records of `sessions-and-tasks`, `deputy`, `dictation-debug` and `queue-top`. The log says these would be reverted before handoff, but they are still there. The deputy should leave them out of the merge.
5. [note] The task hasn't landed: its record has no `complete` line, so the one-screen report requirements.md asks for isn't written yet. The numbers it would carry (95 upgrades, 0 adds, 25 plain folders; 127 → 133 entries; $293.26 / $851.70 / $1144.96, unchanged) are on the record's `experiment` line and in `core/Session/readme.md`, so a fresh agent could continue from this folder.
6. [note] The proof test is `Servex/agents/session-entries.test.mjs`, not a file in `core/Test`. It uses core/Test's `Test` class, and the record's decision line explains why. I ran it: 24 checks pass, and so do `child-links.test.mjs` (16) and `session_tasks.test.mjs` (10).

## Requirements
- 1 "A session's `tasks` is the one list … `children` is a computed view" — yes — `Task.sessions_below` / `get children` (`Task.js` +768) compute it from the entries; nothing is stored
- 2 "Upgrading a task into a session … records the spawn's configuration (role, model, effort, role readme, brief path, session id)" — yes — `open_task`'s `spawn` (Agents.js +337); a handoff upgrades in place (`move_item` `entry`); test checks 4–5 and the handoff check
- 3 "A task is a line by default … the parent indexes that folder" — yes, as words plus a check — `core/Task/readme.md` +837, and `--entries` prints the 25 stray folders; moving them is deferred, and the readme says so
- 4 "Cost is three numbers computed at read time" — yes — `session_state` returns `{own, children, total}`; the test checks child 1.5 + unlinked 0.25 = 1.75, counted once
- Build 2 (replays as a Session) — partly — no for the mixed-shape folders in finding 1
- Build 4 (backfill with a dry run and a manifest) — yes — `ChildLinks --entries`, `entries_apply` writes the manifest; a second dry run appends 0 (record's experiment line)
- Build 5 (readmes) — yes — Session's "Session entries" section gives the shape, the writer, the reader and the costs; but see finding 2
- Proof: test on a scratch tree — yes — `SERVEX_PUBLIC` set to a temp folder; 24 checks pass
- Proof: counts after `--apply` on a copy — yes — the record's `experiment` line, 2026-10-25T00:26
- Report — no — not landed yet (finding 5)
- Class page with live instances — n/a — no new class

## Words
- readme sentences plain and complete — yes — `core/Session/readme.md` "Session entries" reads as full sentences, with each term defined (cause, placed, linked)
- every term defined where it is used — yes — "item 33's check" in the Session readme points at the brief, and the Task readme says what the check means right beside it
