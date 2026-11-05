verdict: fix
1. [fix] `move_home` is broken: the fix for the earlier review put `await record_new_folder(sdir, slug);` in the wrong function (`Servex/agents/page_tools.js:581`, diff line 272). `sdir` doesn't exist in `move_home`, so it throws a ReferenceError after the git mv, the line writes and the ledger line have already happened. `node Servex/ProcessRunner.test.mjs` fails on the branch ("it records its new path and the run goes on there") and passes on michael/dev (43 passing). In production, `ProcessRunner.js:77` catches the error as `home_refused` even though the folder has already moved. Move that line to the end of `move_to_session`, before its `return`.
2. [fix] `move_to_session` still never calls `record_new_folder`, so a moved folder never reaches the session folder's `files.jsonl` (law 10). The earlier review's finding 4 is only half done: the test exists now, but the index call landed in `move_home` instead (see 1).
3. [fix] Deliverable 5 is not done. `ai/sessions/2026/10/25/v-9dvbbrn/` holds only `session.jsonl` and `ai/`, and the brief does not name the four module tasks to move. Name them in `requirements.md` (or a `moves.md`), with the exact `node Server/TaskToSession.mjs … --go` line, so a fresh agent can finish the move after the merge. The branch `worktree/tasks-stay-in-session` (369a69bea) is still unmerged, and the task has no landing line.
4. [note] `ai/doc/tasks.md` (diff line 379) says "a module's page finds its tasks through the index (`open_nested` … with its `module` tag)". Nothing in `public/` reads `open_nested` yet (grep finds no reader), so a module page does not show session-filed tasks today. Either say "can find", or file the module-page reader as a follow-up task.
5. [note] The add key `home` still clashes with TaskMigrate's `{"home":"<url>"}` alias line (`Server/AIIndex.mjs` `alias`, earlier review's finding 6). An add with `home: "nomod"`, where that module has no folder, nests quietly and keeps `home` in its data. The new test only checks the folder path ("the home key is not stored as data"). Refusing an unknown `home`, or stripping it on the nest path, would close this.
6. [note] Simpler, and correct: the steering fix is small. It is one key in `task_home`, a `MODULE_HOMES` flag and text in the rules and docs. Every doc listed in deliverable 2 is updated, and the two superseded owner notes now carry a pointer banner.
7. [note] While reviewing, I mistakenly ran `git stash` in the main checkout. I put every change back by hand (131 files from the stash diff, plus `v-9dvbbrn/session.jsonl` merged in order: the stashed lines, then the newer ones). Today's working tree now equals the stash plus the newer appends. The stash entry `df7a8da3d` is still in the stash list, because the git guard blocks `git stash drop`. It is redundant and can be dropped.

## Requirements
- 1 "The item tool nests a new task in the filing session; `home` is the only way to a module folder; the sweep is off" — yes — `task_home` reads only `add.home`; `PromptTasks.MODULE_HOMES = false`; item_tool 111 checks and prompt-tasks 23 checks pass
- 2 "Docs and agent text say so" — yes — session-smart.md 4b, item-tool.md, ai/doc/tasks.md, sessions-and-tasks.md, core/Task/readme.md, ai/tasks/readme.md, plus prompt-tasks.md item 7
- 3 "A scripted way back: `move_to_session` and `TaskToSession.mjs`" — no — exists and tested, but the misplaced `record_new_folder` line breaks `move_home` (finding 1), and the moved folder is not indexed (finding 2)
- 4 "index.json carries `open_nested`; Home 'Waiting on you' includes nested tasks" — yes — `AIIndex.nested` and the merged `waiting` list (diff lines 14-60)
- 5 "Move the four module tasks filed by `v-9dvbbrn` back" — no — not done; the four tasks are not named (finding 3)
- Class shows live instances — n/a

## Words
- content 1 (says what it is first) — yes — the new "The rule" block opens ai/doc/tasks.md
- content 2 (plain sentences, no jargon) — yes — the session-smart.md 4b rewrite is clear
- content 3 (stale text) — yes — the superseded notes carry banners; ai/tasks/readme.md now lists TaskToSession
