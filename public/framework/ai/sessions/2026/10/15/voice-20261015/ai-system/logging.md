# Do agents append to jsonl with plain writes, or through a timestamped tool?

Ask: [ask-ea3d4c58](../ask-ea3d4c58.md), B2. Checked 2026-10-15 against the hooks, the skills and all 587 `task.jsonl` files of October (15,338 lines).

## On one screen

- **Agents write through a validating tool, and a hook blocks the plain write.** `.claude/hooks/append.mjs` is the tool. `.claude/hooks/jsonl-guard.mjs` is wired in `.claude/settings.json` on Bash, PowerShell and Write/Edit: a `>>`, `tee`, `Add-Content` or an edit of an existing `.jsonl` is refused with the way to do it right. The hook also runs for Servex-spawned agents: this session's own `git stash` was refused by the sibling `git-guard` hook.
- **The tool validates but did not always timestamp.** It turned only the literal string `"NOW"` into the clock. A line written without `"NOW"` got no time at all. In October, 2,271 of 15,338 lines have none (assign 1,200, review 849, experiment 57, agent 33). All 15,338 parse; none is malformed.
- **Fixed today:** `append.mjs` now puts `at` into every appended line that has none (commit `d13829124`). `{"assign":{"step":2}}` becomes `{"assign":{"at":"…","step":2}}`. A writer who typed `"NOW"` still gets the same result.
- **Where plain writes still happen, by design:** Servex and the dev server are node code and write their own logs directly (`appendFileSync` in about 20 files under `Servex/` and `Server/`: `Heartbeat.js`, `TaskLoop.js`, `review.mjs`, `Cards.js`, `Asks.js`, …). They are the single writer for those files, and they stamp their own times. That is the tool, run by the system, not an agent typing into a file.

## The routes, and what each one guarantees

| Route | Who | Validates | Stamps time |
|---|---|---|---|
| `node .claude/hooks/append.mjs <file> <lines.json>` | agents, for task, day and board logs | yes, by file name (`jsonl-schema.mjs`), whole file re-parsed after | now every line |
| Servex `append_log` tool | agents, for Servex's own named logs only | yes (needs a string `type`); refuses repo task lines | Servex stamps `at` |
| `ext/JSONL` | pages in the browser or node, for `page.jsonl` | by its reader (`fold.js`) | the writer's call |
| Direct write in node code | Servex, the dev server | its own class | its own class |
| A hand `>>` or Write over an existing `.jsonl` | an agent | none | none: **blocked by `jsonl-guard`** |

## What is left

- **A new `.jsonl` can still be created by the Write tool.** The guard allows it on purpose so a task can open its first line. A first line without a time is possible. Small fix, not made: have `new-task` (`node Server/TaskDirs.mjs --new`) write the first line, which it already does for spawned tasks.
- **Review lines get a time only from today on.** The 849 old `review` lines stay as they are (never rewrite history).
- **`jsonl-schema.test.mjs` has one failing check** (`page.jsonl: every structured key is one ai2/fold.js absorb() reads`). It is the page schema against the `ai2` reader, it compares schema and reader and never calls `append.mjs`, so it is not caused by this change (the other 43 pass). Flagged for whoever owns the page schema.
- **The task logs do not say which tool wrote a line.** Whether a given line came through `append.mjs` or a node class cannot be seen from the file; the schema check and the `at` stamp are the evidence that it did.
