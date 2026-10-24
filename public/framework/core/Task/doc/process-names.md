# Process names and structure: decided 2026-10-23

You asked to be in the loop on names before they harden (2026-10-22). On 2026-10-23 you said not to wait on the names and to go ahead and build (session-e00f55c9 `prompts.jsonl`, prompt at 2026-10-23T23:51:53Z), so every proposal below is **decided**. This page is the record: each name, what it means, where it lives. The long form is [process.md](process.md).

## The names

| Name | What it is | Where it lives | Status |
|---|---|---|---|
| **Process** | A task whose children are done one after another, in order, and node starts each one. | `core/Task/Process.js` (`class Process extends Task`) | built |
| **Step** (today's code says *phase*) | One child of a process: a title, the job (`do`), and who does it (`session.run`). A step is a plain Task. | a `tasks.add` line in the process's own log | **decided 2026-10-23:** *step*, your word. Done by `Server/rename-phase-to-step.mjs`; old logs keep their `phase` field and are still read. |
| **Process template** (was `Process.DEFINITIONS`) | A named list of steps you can start by name: `build`, `design`, `investigate`. | `core/Task/processes/` | **decided 2026-10-23, built:** one subclass per template, `class BuildProcess extends Process { static steps = […] }`, one file each; `Process.template("build")` finds one. |
| **Your own steps** | A process with no template: the caller lists the steps. | `tasks.add {title, steps: [{title, do}]}` | built 2026-10-22 (below) |
| **Who runs a step** (`session.run`) | `fresh` (a new session), `same` (the previous step's session), `owner` (whoever created the process), `wait` (you). | on each step | built |
| **Handoff** | A mastermind gives a task to a child session by moving the task into the child's folder, not by writing a requirements.md. | the item move (mastermind-item, [design](/framework/core/Item/tasks/item-move/design.md)) | **decided 2026-10-23.** Not built here: the item move is its own task. |

## Where one process is stored

- **One folder, one log.** A process is the folder `<session folder>/<slug>/` with its `task.jsonl`. Line 1 is `{"class":"Process", "process":"<template or steps>", …}`, followed by one line per step, and then node's lines: `start`, `spawn`, `measure`, `complete`.
- **Its session references it**, and the session's completion counts it: [Session → task → child session](/framework/ai/sessions/doc/session-record.md).
- **It can move home.** A process that names a `module` moves to `<module>/tasks/<slug>/` once its plan is approved. The old place keeps a reference, so the move is never lost.

## How agents learn which processes exist

- **Ask for a template that does not exist,** and the item tool's refusal lists every template name.
- **[process.md](process.md)** describes each template, and it is linked from the [Task readme](../readme.md).
- **Decided, done:** one line in the mastermind role readme: "to start work, name a process template, or give your own steps."

## Three overlapping "template" ideas, and the one word for each (decided 2026-10-23)

| Today | What it decides | Word |
|---|---|---|
| `ROLES` (`Servex/agents/roles.js`) | who the agent is: role readme, model, effort | **role** |
| `Task.TEMPLATES` (`code`, `doc`, `scan`) | the routine around one task: a worktree, commit lines, read-only | **kind** (a task's kind) |
| process templates (`build`, `design`, `investigate`) | the steps, in order | **process template** |

A spawn then names three things: the role (who), the kind (the routine), and the process template (the steps). Folding these three into one named "spawn template" is the skills-port review, next in this session's tasks.

## Proven: a simple process through the tool

One item call creates the process, and node does the rest:

```js
item({ path: "<your session>", delta: { tasks: { add: { title: "Two steps",
  steps: [{ title: "Write the note", do: "write note.md" }, { title: "Check the note", do: "read note.md back" }] } } } })
```

1. Node writes line 1 and both steps, then starts step 1 and sends you its prompt. A step with no `session` goes to you, the creator.
2. You complete it: `item({path: "<process url>", delta: {"write-the-note": {"complete": {"outcome": "…"}}}})`.
3. Node prompts step 2 and includes step 1's outcome.
4. A step added while the process runs comes after the others.
5. When every step is done, the process is complete, and so is its line in the session's count.

Test: `node Servex/ProcessRunner.test.mjs` (the "simple process" checks). A step named for a Task verb (`start`, `complete`, `improve`) is refused, because the line `{"start":…}` would call the verb instead.
