# Task migration: the real run, 2026-10-17 04:29 UTC

**211 old tasks now have a module home.** The other 1,452 stay in their session folder, each for the reason given in [dry-run-final.md](dry-run-final.md). Nothing was deleted. Each moved old task gained exactly one `{"home"}` line pointing to its new home, and the new home's `sessions` points back.

- See them: [/tasks/](/tasks/), the index of every module's task list. One example is [ext/Panel → framework-clock](/framework/ext/Panel/tasks/framework-clock/), which came from [its old session task](/framework/ai/sessions/2026/08/14/framework-clock/).
- Every move is in the ledger: [task-migrations.jsonl](/framework/ai/sessions/task-migrations.jsonl) holds 211 lines, each with the old file's sha256 and byte count from before the run.
- Go: [mastermind-checkup-task-system](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) gave it on behalf of voice-app, after reading [plan.md](plan.md) and [dry-run.md](dry-run.md).

## Counts, before and after

| | before | after |
|---|---|---|
| old tasks (ai/sessions task.jsonl) | 1,663 | 1,663 |
| old task lines | 42,621 | 42,834: +211 `home` lines, plus 2 lines other agents wrote during the run |
| module task folders (`<module>/tasks/<slug>/`) | 5 | 216 |
| homes in the /tasks/ index | 5 | 74 |
| homes the /tasks/ walk finds | 5 | 72: the 2 lists it can't reach are a known gap, and the index still lists them |

## The check

`node Server/TaskMigrate.mjs --apply` ran the check itself, and `--check` was then run on its own:

```
{ "checked": 211, "old_tasks": 1663, "problems": [] }
```

For every move, the check confirms three things:
- the old file's bytes from before the run are an unchanged prefix (same sha256);
- exactly one `home` line was added;
- the replayed new home matches the replayed old task.

`node Server/TaskHomes.mjs --write` reported "the index lists them all".

Before committing, a script confirmed the git diff of all 211 old files: exactly 211 added lines, every one `{"home"}`, and no lines removed.

## Commits

- `2c8f4b674`: the run. 821 files, 1,981 insertions, 0 deletions:
  - the 211 new homes (each with task.jsonl and page.js);
  - 73 module task lists;
  - the 211 old task.jsonl files;
  - 68 module files.jsonl;
  - the /tasks/ index;
  - the ledger.
- `78bf8eb52`: each list's own `tasks/files.jsonl` record, which the first commit's path list missed. 38 files, 192 insertions, all append-only, and every named file exists.

`git revert` of both commits is the undo.

## Left as it was

- **1,452 old tasks stay in their session folder.** The reasons: unclear (576 with no signal, 466 with one signal, 304 with only a catch-all signal, 43 where signals disagree), and 61 active in the last 7 days. A later run, or a person, can move them.
- **`ai/health/files.jsonl` is gitignored**, so its `tasks/` line is on disk only.
