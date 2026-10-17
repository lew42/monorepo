# Follow-up: new session folders should start with `session.jsonl`

The move is done: 699 existing session folders now hold `session.jsonl` ([the rule](../../../../../doc/session-record.md)). Two writers still make new folders the old way, so every new session folder starts with `task.jsonl` until someone changes them.

## What to change

- `Server/TaskDirs.mjs --new`: when it creates a session folder (a depth-4 folder under a day), write the first line to `session.jsonl`. A task folder deeper down keeps `task.jsonl`.
- `Servex/agents/Agents.js`: the initial `assign` line for a new session goes to `session.jsonl` the same way.
- A sweep that swaps the spelled-out "task.jsonl, else session.jsonl" expression in readers for `SessionRecord.log_or_old(dir)`. The behaviour is the same; the code gets shorter.

## Until then

`node Server/SessionRecord.mjs --apply` is safe to re-run: it folds any new `task.jsonl` in a session folder into `session.jsonl` (idempotent, manifest appended, `--undo` reverses the run). Run `--plan` first to see the counts.

## Also left, by name

- `ai/AISession/AISessionIndex.mjs` still reads the old audit path for its category join.
- A folder with digest tag lines only (no log yet) opens as an empty task-style page. See "What is not done yet" in the rule doc.
