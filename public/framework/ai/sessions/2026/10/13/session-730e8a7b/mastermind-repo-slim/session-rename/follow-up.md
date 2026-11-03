# Follow-up: new session folders start with `session.jsonl`

The move is done: 699 existing session folders now hold `session.jsonl` ([the rule](../../../../../doc/session-record.md)). This follow-up made the writers match, so no folder created after 2026-10-17 needs the move script.

## Done

- `SessionRecord.start_file(dir, first)` picks the file for a line: the log that exists, else `session.jsonl` for a new session folder (directly under a day, own `session_id` on line 1), else `task.jsonl`.
- `Servex/agents/Agents.js` (`open_task`, the launch line of `spawn_agent`) and `.claude/hooks/append.mjs` (every `new-task` launch line) ask it. A task folder inside a session keeps `task.jsonl`.
- `Server/review.mjs` appends to the folder's existing log, so it no longer recreates `task.jsonl` in a moved folder.
- Tests: `Server/SessionRecord.test.mjs` and the new `Servex/agents/open-task.test.mjs`.

## Left, by name

- `Server/TaskDirs.mjs --new` only makes the folder; it never wrote a record, so it needed no change. The `new-task` skill still says `<dir>/task.jsonl`; the hook redirects it, and the skill text is the mastermind's to refresh.
- Swap the spelled-out `log_file(dir) ?? path.join(dir, "task.jsonl")` expressions in readers for `SessionRecord.log_or_old(dir)`. Same behaviour, shorter code.
- `ai/AISession/AISessionIndex.mjs` still reads the old audit path for its category join.
- A folder with digest tag lines only (no log yet) opens as an empty task-style page.
- A running Servex needs a restart to use the new `open_task`.
