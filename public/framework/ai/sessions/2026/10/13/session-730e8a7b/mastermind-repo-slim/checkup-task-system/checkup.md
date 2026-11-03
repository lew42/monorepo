# Checkup: the task system and the migration of old tasks (2026-10-17)

The task system build is on dev, all 17 steps. Old tasks now have module homes (211 of them, nothing deleted), and [/tasks/](/tasks/) shows them, open work first. The last two build steps and the first "a task spawns its own agent" slice are running now.

| Task | State | Open | Decision | Next |
|---|---|---|---|---|
| [Task system build, session record](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) | ✅ 17 steps on dev: every one of the 44 logged commits is on `michael/dev` (steps 1–2 squashed as 8935e1c77) | steps 3d (sessions, source, cost) and 10 (skills and readmes); 16 of 17 child logs had no landing line | the owner's go handed to `mastermind-task-system`, with the merge hash for each child | ✅ 3d merged 04bea0291, 10 merged b6d7329f1, 16 child landing lines cfedac676, landed 7dc04864c |
| [Task system build, module home](/framework/core/Task/tasks/task-system-build/) | ✅ agrees with the session record: 19/24, open = 3d, 10 and three dictation tasks | the same two steps | **the module home is the truth from now on**; the session folder keeps the reference | ✅ 3d ticked b162725a0, 10 ticked 7dc04864c; two owner asks stay open there (reviewer checks of `expected`, the /live/ grid) |
| [Task migration](/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/) | ✅ real run 2c8f4b674 + 78bf8eb52, landed c02c46759: 1,663 old tasks before and after, +211 `home` lines, 0 deletions, `--check` 0 problems | 1,445 tasks stay in their session (no clear module, or active this week) | go given after reading the dry run ([result.md](/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/result.md)) | none; a later pass could re-try the 42 "signals disagree" |
| [/tasks/](/tasks/) index and [/framework/ai/tasks/](/framework/ai/tasks/) watcher | ✅ index: 74 homes. Watcher: a hand-started one from 10-14 was running old code (no `waiting`, 8 landed where today's code counts 28); replaced with one on current code | Servex starts it from the next restart on | TaskLoop starts the watcher as its child; the newest watcher wins a lock (978f39bf8) | ⚠ needs a Servex restart to take over |
| [Templates](/framework/core/Task/doc/templates.md) (ask 4) | ✅ design page; the owner's ask recorded in [owner-2026-10-17-node-driven.md](/framework/core/Task/doc/owner-2026-10-17-node-driven.md) | the first slice: an approved task with an `agent` spawns itself | a Sonnet minion builds it ([brief](approve-spawns/requirements.md)) | ✅ merged 0407636e1 ([minion-approve-spawns](approve-spawns/), proved on a private Servex); goes live at the next Servex restart |
| Pages at 400 and 1200 | ✅ [/tasks/](/tasks/) finished tasks fold under "+ N done" (7e5633aa6; browser test 4/4); [Live](/framework/core/Task/live/) rows wrap on a phone (the Complete button was cut off); [TaskPage](/framework/core/Task/page/) and the /live/ Tasks card are fine | — | fixed on the spot | — |

**Was `task.jsonl` renamed to `session.jsonl`?** No. It is decided, but 757 session folders still log to `task.jsonl`. The 588 `session.jsonl` files hold tags, not the rename. Counts and owner: [owner-2026-10-17-node-driven.md §4](/framework/core/Task/doc/owner-2026-10-17-node-driven.md); the verdict and brief belong to the [sessions checkup](../checkup-sessions/).

## Decisions made for the owner

- **The real migration ran without a further dry run.** The rehearsal on a full copy was clean and nothing had changed since. Another dry run would only have repeated it.
- **Steps 3d and 10 went to the agent that planned them, not to a fresh minion.** It was already awake and can close its own children. A cold Sonnet minion would have cost about $2–3 just to re-read the plan.
- **The watcher runs as Servex's child process, not inside Servex.** One snapshot blocks for about 100 ms (measured), which is too long to run every 5 s on Servex's own event loop. Retiring `/framework/ai/tasks/` in favour of `/tasks/` would win once every session task has a module home.
- **Templates are fields on line 1, not subclasses, and the `approve` line triggers the spawn instead of a timer.** A `CodeTask` subclass would win once a template needs its own state.
- **The past-work search runs at spawn time,** inside `TaskLoop.launch`, not in `TaskDirs --new`: when a task folder is created, there is no brief yet to search for.

## Needs the owner

Nothing. A Servex restart (when nobody is mid-step) switches the task watcher to the Servex-run one.
