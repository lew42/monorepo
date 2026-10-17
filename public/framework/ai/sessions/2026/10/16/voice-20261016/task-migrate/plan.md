# Task migration: the plan

**What it does:** a node script, [`Server/TaskMigrate.mjs`](/Server/TaskMigrate.mjs), gives each old task that clearly belongs to a module a new home at `<module>/tasks/<slug>/`, the primary home from now on. The old session folder stays exactly as it is, plus one line pointing to the new home, and the new home points back to the session. Nothing is deleted or rewritten. Sources: [the owner's words](/framework/core/Task/doc/owner-2026-10-16-migration.md) · [research](research.md) · [the task system plan](../task-system/plan.md).

**Approved by mastermind-task-migrate, 2026-10-16**, against the owner's two tests (see the end). The real run waits for voice-app; everything before it runs now.

---

## 1. What moves, what stays

- **Moves (gets a home):** an old task whose module is *clear*. Clear means one of these signals names a real module (a folder under `public/framework/` with a `readme.md`):
  1. the title starts with `<Module>: …`;
  2. the brief (`assign.brief`) sits inside the module;
  3. the files the task edited (`action.files`) and the paths its `requirements.md` names agree on the same module.
- **A catch-all is never a home:** `ai`, `ext`, `core`, `ui`, `ux` (and `ai/sessions/**`) only become tags.
- **Stays (no home this run):** one weak signal, no signal, or signals that disagree. These are listed in the dry-run report, by reason, so a later run (or a person) can decide. Research estimates about half of the 1,658 old tasks have *some* signal; only the clear ones move.
- **Also stays:** a task with a line in the last 7 days (it may still be live; a later run picks it up), a task already in the new format, a task with nested subtask lines, and any task whose slug clashes (below).

## 2. What the script writes, per moved task

| Where | What | Why |
|---|---|---|
| `<module>/tasks/<slug>/task.jsonl` (new) | line 1: `{id, path, parent, title, module, tags, source, sessions, by:"task-migrate", ts}` | the task's identity in the new system |
| same file | `{"set":{…}}`: the old task's replayed data (outcome, landed_at, steps, cost, model, card, …) | the facts, copied by code, not retyped |
| same file | `{"commit":"<hash>"}` per commit | `Task.commits` |
| same file | one verb line with the **original** time: `complete` (landed), `stop` (closed, or open and stale, with a why) | the state, with the right timestamps |
| `<module>/tasks/<slug>/page.js` | the same one-line `TaskPage` as the item tool writes | the folder routes |
| `<module>/tasks/task.jsonl` | `{"task":"<home>"}` (and line 1 if the list is new) | the module lists it |
| `<module>/tasks/files.jsonl`, `<module>/files.jsonl` | `{"file":"<slug>/page.js"}` via `ModuleLog.record` | discovery |
| `/tasks/task.jsonl` | the new list, via `TaskHomes.add` | `/tasks/` and `/live/` see it |
| **old** `…/<slug>/task.jsonl` | ONE appended line: `{"home":"/framework/<module>/tasks/<slug>/"}` | the session finds its task |
| `ai/sessions/task-migrations.jsonl` | one ledger line: old path, home, module, signals, the old file's sha256 and line count | the record of what was done |

- **`sessions`** (new field, added to `Task.FIELDS`): `[{"id":"<session uuid or null>","task":"<old app path>"}]`. **`home`** is a new string field and a new `task.jsonl` verb in `jsonl-schema.mjs`, so the old folder's replay carries `data.home`.
- **`source`** follows today's homes (the brief's app path, else the old folder). Amendment 4 wants `source` to name who asked; when step 3d lands, the migration's line 1 can gain that without a rewrite.
- **Not `{"task":…}` in the old file:** in `Task.replay` that line makes a *child*, so the old task would show itself as its own subtask. `home` says "this task lives there now".

## 3. Open old tasks

397 old tasks never landed or closed; `Task.replay` calls them `running`. A moved open task with no line in 7 days gets `{"stop":{"why":"migrated: never landed or closed; last line <date>","at":"<last line time>"}}` in its **new** home only. That is the one place the new home says something the old file does not, and it is the truer statement (nothing has run it since). The old file is not touched. The alternative was `idle`, which would claim it never started.

## 4. Safety

- **Dry run is the default.** `node Server/TaskMigrate.mjs` prints the before/after counts and the plan per task, and writes nothing. `--apply` writes. `--root <dir>` points at a copy. `--check` runs the round trip alone.
- **Idempotent:** every write checks first. A home whose line 1 already names this old folder is "done"; a missing list line, files line or `home` line is repaired; a second run changes nothing.
- **Slug clash refuses:** if `<module>/tasks/<slug>/` exists and is not this task's own earlier migration, or two old tasks want the same home in one run, all of them are refused and reported. Never `-2`, never overwrite. The slug is the old folder name, cut to 40 like the item tool's `slug_of`.
- **Append only on old files:** the script verifies that the old file's content before the run is a byte-for-byte prefix of the file after (sha256 in the ledger).
- **Round-trip check (runs after every `--apply`, and alone with `--check`):** every ledger line's old folder has a `home` line naming its home; every home names its old folder in `sessions`; the module list references it; replaying old and new gives the same title, state, completion time, outcome, commits and session (the one allowed difference: open-and-stale → stopped, §3); the old task count is unchanged.
- **Tests first:** `node --test Server/TaskMigrate.test.mjs` runs on a copy of a few real old tasks (frozen into this folder as `fixture.json`, materialised into a temp dir, so no fake task logs sit on the site). Only after they pass does the dry run read the real tree.
- **The real run** (later, when voice-app says): hold live reload (`Server/hold.mjs`), `--apply` on the main tree, `--check`, one commit. Git is the undo (`git revert`); the script has no delete mode.

## 5. Build order (one commit each)

1. `Task.FIELDS` += `sessions`, `home`; `jsonl-schema.mjs` += `home` verb.
2. `Server/TaskMigrate.mjs` (class `TaskMigrate`: `scan → classify → plan → apply → check`), dry run by default.
3. `fixture.json` + `Server/TaskMigrate.test.mjs`: dry run counts, apply, idempotent rerun, clash refusal, round trip, prefix check.
4. Dry run on the real tree → [`dry-run.md`](dry-run.md). Report to voice-app; stop.

## 6. Approval

- **No data lost:** the script never deletes, never rewrites; old files only gain one line, proven by the prefix hash; every fact in the new home is copied by code from the replayed old task, and the round trip compares them.
- **Truth preserved:** each moved task is findable from both sides (`home` ↔ `sessions`); state and times come from the original lines; the only new claim (stale open → stopped) is labelled with its reason; anything unclear stays where it is instead of being guessed into a module.

Both tests pass on paper. **Approved; building.**
