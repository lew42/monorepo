verdict: fix
1. [fix] Every live prompt now files its asks twice in the same session.jsonl. Server/RefineQueue.mjs:175 runs `AskIndex.after_refine` whenever `p.session` is set, and PromptTasks always sets it (Servex/agents/PromptTasks.js:53). `after_refine` calls `make_tasks` (Server/AskIndex.mjs:176,193), which adds EVERY ask as a Task (questions and statements too) to the session's session.jsonl through `task_home`, then PromptTasks adds the task asks again as `waiting`. SessionTasks would show the duplicates plus question-tasks that have no Approve button, and module inbox lines get written as well. The test misses this because it stubs `refine` (Servex/agents/prompt-tasks.test.mjs:32). The simplest fix is to let one path file the tasks: either pass a flag so `one()` skips `make_tasks` for this caller, or drop PromptTasks' own add and have `make_tasks` write `state: "waiting"` for task-kind asks.
2. [fix] Part of the owner's ask was not built (process-system/session.jsonl:60): "upgradable to a project, movable to <module>/tasks/ on approval". core/Session/doc/prompt-tasks.md:26 lists both as "Not built yet". Approve only changes the state from waiting to running; nothing moves and nothing gets an owner.
3. [fix] The same ask said "Also check that asks kept as doc notes were actually written down". Nothing in the diff or the doc answers that check.
4. [note] When line 1 of session.jsonl has no readable id, `session` falls back to `rec.rel` ("2026/10/22/session-xxxx", PromptTasks.js:53). `AskIndex.session_dir` then takes `"session-" + slice(0,8)` = "session-2026/10/" and runs mkdirSync on it (AskIndex.mjs:59), which leaves junk folders under ai/sessions/.
5. [note] Proposals are written with `caller: "owner"` (PromptTasks.js:59), so a machine-made task is stamped `by: owner` in the record. A caller such as "prompt-tasks", with `from: "owner"` kept, would say what really wrote it.
6. [note] `record_for` assumes the prompt's card folder and the session record share the same day and folder name. prompt-relay.mjs pins its card folder to the day the session started, but the folder can be renamed later ("until something … renames the folder", prompt-relay.mjs:105). After a rename the prompts go quiet with no error, because `run` returns `{ok:false}` and nobody reads it.
7. [note] `seen` (PromptTasks.js:23) keeps growing for as long as Servex runs, and it is empty again after a restart. That is harmless today because only a new page_add fires the hook.
8. [note] The page change was judged from the author's own shot, core/Session/doc/shots/session-tasks-1200.png, since this review was given no shots. The Tasks block reads clearly, says "2 waiting on you" and shows Approve / Not now beside each task. "Not now" saves a `reject` (SessionTasks.js:30), which stops the task for good, while the label suggests "later". The words should match: either "Reject", or a verb that snoozes.
9. [note] The two page_tools.js tweaks (`r.to` guard at :536, skip `from === "owner"` at :546) are sensible side fixes, but neither has a test.
10. [note] The task/prompt-tasks worktree has moved on since this diff: SessionTasks.js line 2 there now mentions "Make it a project". This review covers diff.patch only, and line numbers are those of the files after the diff.

## Requirements
- 1 "each owner prompt's asks filed as proposed tasks on its session (item tool)": yes, but twice (finding 1). PromptTasks.js:56-60
- 2 "visible on the session page": yes. SessionTasks.js, shown in core/Session/doc/shots/session-tasks-1200.png
- 3 "approvable": yes. A `decide` line in Session.js:65-69, the schema verb in jsonl-schema.mjs:154, test checks 8 and 9
- 4 "upgradable to a project": no. doc/prompt-tasks.md:26
- 5 "movable to <module>/tasks/ on approval": no. doc/prompt-tasks.md:26
- 6 "check that asks kept as doc notes were actually written down": no. Not addressed
- 7 Expected "a new prompt shows its proposed tasks within a minute": plausible. One Haiku call per prompt, and SessionTasks streams the record. Not verified live, because it needs a Servex and dev-server restart.
## Words
- The doc (core/Session/doc/prompt-tasks.md) is plain and ordered: what it does, a picture, six numbered steps, a Watch out section and a Not built yet list. Yes.
- The "Not now" label does not match what it does (reject, so the task stops): finding 8.
- The code comments name their files and the owner's sentence. Yes.
