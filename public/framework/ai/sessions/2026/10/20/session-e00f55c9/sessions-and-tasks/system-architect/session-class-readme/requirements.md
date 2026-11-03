# core/Session: the class snapshot and its rules on its readme

Budget: $3. Sonnet, medium effort. Parent: mastermind-system-architect, who tails your `session.jsonl`: log an overview there as you go, not chat. Docs only; no new files except `doc/architecture.md` if it is missing.

## The owner's ask (2026-10-20, 16:15)

On the Session class's readme: the class architecture snapshot (files, classes, properties, core API, how it loads), and these rules: a session has tasks (projects or tasks); its completion is computed from its tasks; it is never marked complete while a loose end exists (add a task instead). Read with the decided shape in [sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md) ("The decided shape": every origin writes `ai/sessions/YYYY/MM/DD/<name>/session.jsonl`; a session gets a folder, a task does not).

## Do

1. Read `public/framework/core/Session/` (`Session.js`, `Day.js`, `Session.test.mjs`, `page.js`, `readme.md`, `doc/`) and who imports them (`git grep -l "core/Session/"`).
2. `core/Session/readme.md`: keep it under about 60 lines. Top: one sentence on what a Session is. Then the snapshot, as code: `class Session extends …`, each class with its file, its key properties (type and meaning), its core API signatures, who calls it, how it loads (which file it replays, which tool writes that file). Then **Rules** (the three above, in plain sentences). Verified against the code: say only what the code does; where a rule is not built yet (completion from tasks, the loose-end guard), say "not built yet" plainly and link the queued work if there is one.
3. `core/Session/doc/architecture.md`: the decisions behind it (link [sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md) and [the owner's dictation](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) sections 9 and 11), linked from the readme.

Docs only, in a worktree; commit there. Your parent merges. Land with `finish-task` in your own `session.jsonl`.
