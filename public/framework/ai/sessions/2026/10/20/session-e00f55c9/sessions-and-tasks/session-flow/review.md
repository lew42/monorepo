verdict: fix
1. [fix] The owner's expected outcome, "this tab's session page shows its real tasks and child sessions without hand edits", is not met by this branch. The references only exist after a manual `node Server/SessionRecord.mjs --links --apply`, and the architect's own check (process-system/session.jsonl line 115) says the tab session page still shows no task list (queued as minion-session-page-tasks).
2. [fix] The brief also expects "one written flow". There isn't one: the flow is split across sessions/doc/session-record.md:380-385, ai/doc/records.md:362-370, Server/doc/stale-close.md and core/Task/doc/process-names.md. Add one short "session → task → child session" section in session-record.md that the others link to.
3. [fix] `Process.from_steps` (public/framework/core/Task/Process.js:437) accepts step ids that collide with line keys. I checked with Task.replay: a step titled "File" never completes (its `{"file":…}` line is read as a file reference), and a step titled "Id" is dropped by the List, so the process has a missing phase. Refuse the reserved line keys (`file`, `id`, `log`, `title`, `by`, `ts`, `type`, …) along with the verbs.
4. [note] Handoff ("tasks hand off to child sessions; moved tasks stay referenced") isn't in this diff. It is handed to mastermind-item's item-move, and the branch says so. It stays open against this brief.
5. [note] Simpler: `link_parent` (Server/SessionRecord.mjs:62-77) and the census `links()` (SessionRecord.mjs:92-104) each write their own copy of the "which parent log" rule (explicit parent, then nearest log, then the tab's session.jsonl). One shared `parent_log(dir, opts)` would keep the census and the writer from ever disagreeing.
6. [note] Both callers swallow link failures silently: `catch {}` in Server/TaskDirs.mjs:58 and Servex/agents/Agents.js:944. A missing reference is exactly the gap this task closes, so log it instead of dropping it.
7. [note] The backfill is a step someone must remember after the merge (session-record.md:385). Running `--links --apply` once as part of the merge, or from the daily tick next to StaleClose, would keep it from being forgotten (CLAUDE.md law 7).
8. [note] `{process: "<unknown name>", steps: [...]}` is accepted under the unknown name (Servex/agents/page_tools.js:294, Process.js:424–426). `run_of` then falls back to `fresh` for any step added mid-run, so it spawns an agent instead of prompting the creator. Force `process = "steps"` when no template matched.
9. [note] Stopping a process only halts a phase whose `spawned.run` is `fresh` (Process.js:398). A running `same` phase reuses the earlier fresh agent, and that agent keeps going.
10. [note] Server/stale-close.test.mjs:116 and :136 write into the real store (`sessions/2026/10/22/.stale-close-test-<pid>`, `session-abcd1234`). That is the same thing this branch fixes in awaken-race. `link_parent` matches any `…/public/framework/ai/sessions/…` path, so a temp-dir root would work.
11. [note] The branch also carries unrelated work: Process steps, the process-names proposal and the voice guide section. Each part is fine on its own, but merging them together makes this review and the merge decision larger than the brief.

## Requirements
(No requirements.md in the task folder; the asks are from process-system/session.jsonl line 95.)
- 1 "a task created from a session is indexed in it automatically, by whatever tool": yes. open_task (Agents.js:944), TaskDirs.make (TaskDirs.mjs:58) and the item tool add one `{"task":url}` line. Tested in stale-close.test.mjs:122-134.
- 2 "a child session nests under its parent (in its folder) and is indexed": yes for new spawns. Old folders are only covered after `--links --apply` (801 references; 299 cannot be placed).
- 3 "tasks hand off to child sessions": no. It is delegated to item-move (finding 4).
- 4 "moved tasks stay referenced": n/a here. The same-id reference replace is in Task.js:384 and is not changed by this diff.
- 5 "session completion is computed from all of it": partly. Session.js:52 reads the references, so it is right only after the backfill.
- 6 "Includes the StaleClose bug": yes. The child-folder and transcript rules are in StaleClose.mjs, with 6 checks in stale-close.test.mjs:101-113.
- Expected "one written flow + this tab's session page shows its real tasks without hand edits": no (findings 1, 2).

## Words
- content 1 (plain sentences): yes. process-names.md and the stale-close.md rule read clearly.
- content 3 (one point per bullet): no. The session-record.md:385 "Backfill and census" bullet ends with unrelated sentences about review.mjs, Start.js and tests that belonged to the old paragraph.
