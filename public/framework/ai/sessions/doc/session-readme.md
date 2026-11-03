# A readme for every session and task folder, written by code

**The proposal (2026-10-19).** Each session or task folder gets a `readme.md` that a script writes from the folder's own record, so a reader opening the folder sees what it is, who ran it, what came of it and what to open next, without reading the log. No agent types it (CLAUDE.md law 7: record-keeping is code).

## Built: one example

```
node Server/SessionReadme.mjs <folder>            # writes <folder>/readme.md
node Server/SessionReadme.mjs <folder> --print    # prints it, writes nothing
```

`class SessionReadme` (`Server/SessionReadme.mjs`). Example output: [task-system/readme.md](../2026/10/19/cloud-voice-agent/task-system/readme.md).

| Section | Computed from |
|---|---|
| title and the table (agent, kind, caller, model, session id, requested, home, landed, line count) | line 1 of the record (`assign` or `session`), found with `SessionRecord.file(dir)`; `landed` from the last `landed_at` |
| counts and commits | the verbs in the record (`log`, `action`, `commit`, `decision`, `chat`, `owner_words`, `tool_call`, `spawned`) |
| "Asks that name this folder" | rows of `ai/asks.jsonl` whose `card` or `task` sits inside this path, or whose `owner` is the folder's agent |
| "In this folder" | the directory listing, with one line for the known files (`requirements.md`, `report.md`, `past-work.md`, `session.md`) |
| last log lines | the last five `log.msg` lines |

Only the generated header says "do not edit"; running the script again overwrites it.

## Not built yet (the open choice)

Who runs it for all ~1,600 folders. The cheap options: (1) `Servex/TaskLoop.js` calls it for a folder when its record gets a `landed_at` line (one call, at the end, when nothing changes any more); (2) `append.mjs` calls it on the same line, which is also where the landing checklist prints; (3) a one-time sweep. Until one is chosen, only folders where it was run by hand have the file. A folder that gets a hand-written `readme.md` is overwritten by the script, so hand notes belong in `report.md` or `doc/`.

## What `requirements.md` is

The brief a task was started with: what to build, the owner's words it came from, which files it may touch. It is written by whoever opens the task (the `new-task` skill, the mastermind that spawns the agent, or `Server/refine.mjs` when it condenses a dictation), **not** by `open_task` and not by `TaskDirs.mjs --new`, so a folder can exist without one. About 85% of the task folders of 2026/10 have it (522 of 605 on 2026-10-19). It is read by the agent that does the task, via `spawn_agent` with `task: {dir, card, brief}`. `report.md` is its counterpart: what came back. `past-work.md` is written by `Server/PastWork.mjs`.
