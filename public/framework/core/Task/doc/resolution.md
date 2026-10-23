# Task resolution: what becomes a task, and how every task ends done or documented

Today a task ends only if the agent remembers to end it. This page is the model that makes it end on purpose: **few tasks, each linked to the owner's words, each closed with proof, and node chasing any that go quiet.** The owner's words: tab `e00f55c9`, transcript line 7479 (2026-10-23, "this next idea is about the task resolution"). Where things get lost today, measured: [cracks.md](cracks.md).

## 1. What is a task, and what is not

An owner prompt is split into **parts** by node ([prompt records](/framework/ext/Refine/doc/prompt-records.md)). Each part is one of five kinds, and only one kind becomes a task:

| The part is… | Example | It becomes |
|---|---|---|
| **an ask**: something should exist or change, and you could show it done | "the session page shows its tasks" | **a task** |
| **a rule**: a standing direction | "keep descriptions short" | one line in the readme or role readme it concerns |
| **an operating principle** already in a role readme | "keep an eye on usage" | nothing; it is already the rule |
| **a question** | "who decides it's done?" | the answer, on the reply or a card |
| **an idea** or narration | "not sure if that's a good idea…" | a note beside the module, or nothing |

When unsure between a task and a note, it is a note. Noise is a failure: 44 tasks filed for one tab's prompts (one per sentence) were all stopped.

## 2. How many tasks, and how they nest

- **One prompt gives 1 to 3 tasks, 5 at most.** Each is one thing the owner asked for. Its specific points are its **subtasks**.
- **A refinement of an existing task goes into that task** (its subtasks or text), never a new task.
- **A plan the agent makes** to get the ask done (build, review, shoot) is a **process** or a project under the task ([process.md](process.md)), not more tasks from the prompt.

## 3. A requirement or a suggestion

- **Requirement** = a subtask. It must be done (or documented as not done) before the task completes. Only what the owner clearly asked for.
- **Suggestion** = a bullet in the task's `content`: "Try: …", "Avoid: …". It guides; it never blocks completion. An agent may take a simpler path and say why.
- When unsure, it is a suggestion. A guess turned into a hard rule makes agents force a square peg into a round hole.

## 4. Linked to the prompt, completed once

- Every task filed from a prompt carries `source: {session, line, part}`: the transcript line of the raw prompt and the prompt record's part id. The receiver reads the owner's own words from there.
- **The prompt's completion is computed from its tasks** (`Prompt.completion()`: a part whose outcome is a task is settled when that task is complete). Nobody marks a prompt complete by hand. A session is complete when its prompts and tasks are.

## 5. The four states a task moves through

**proposed** (waiting for a verdict) → **accepted** (worth doing, queued; nobody on it yet) → **started** (an agent called `start` and is on it now) → **complete** or **stopped** (with a reason).
Accepted and started are different: only a started task is chased.

## 6. Honest completion

- **`complete` needs evidence:** `{outcome, evidence: [a file, commit, shot or test], confidence: "high" | "medium" | "low", caveats: [...]}`. A completion with no evidence is refused by node.
- **Caveats** are the things asked but not done. They go to the parent (the mastermind that owns the task), which decides each: do it now, take a quick stab, or write it as a loose end (a `⬜` line in the module readme, linked to the task).
- **Drift is allowed, silently is not:** an agent may solve it a better way than its subtasks said; it then changes the subtasks (a line on the log) before it completes.

## 7. Who decides it is done

| The task | Completed by |
|---|---|
| a quick fix (one file, a test or shot proves it) | the worker, with evidence |
| anything the owner sees (a page, a card, words), or confidence below high | the worker proposes; a reviewer (`Server/review.mjs`) checks, then it completes |
| any task | the owner's check is final (`check`) |

## 8. Node chases started tasks

Every **started** task with no new line for about 5 minutes: node asks its agent for status (one message). Silent after three asks in a row, or the agent says it is blocked: one red flag on the board, then one more per hour while it stays silent. A new line resets the count. The counts are `ask`/`flag` lines on the task's own log, so a restart keeps them (`Servex/TaskLoop.js` `chase()`, test `Servex/TaskLoop-chase.test.mjs`). Proposed and accepted tasks are left alone. What already does part of this today is listed in [cracks.md](cracks.md#what-chases-a-task-today); this extends it, it does not add a second chaser.

## Build list (in order)

- ✅ `complete` refuses without `evidence`; `confidence` and `caveats` fields; caveats reach the parent's log. (2026-10-22: `Task.complete`, `Task.completion_problem`, and the item tool in `page_tools.js`, which refuses before it writes and calls `tell_parent_caveats`; test `Servex/agents/honest-completion.test.mjs`. Exempt: replay of old logs, the automatic completion when the last child completes, a Project reaching `landed`, and the node-written `stop` of `StaleClose`.)
- ✅ `approve` moves to **accepted** (`idle`), not straight to running; `start` is the agent's own call. (2026-10-22: `Task.approve`.)
- ⬜ `source` on every task the live prompt process files (with mastermind-prompt, [PromptTasks](/Servex/agents/PromptTasks.js)).
- ✅ The chase, in the existing `TaskLoop.tick()`: no opt-in gate, a status ask every 5 quiet minutes, a flag after three unanswered asks (or a blocked line), re-flagged hourly. (2026-10-23, `Servex/TaskLoop.js`; it skips an agent Heartbeat already has a check out for.)
- ⬜ Something reads every inbox: 454 lines in 69 inboxes were never read ([cracks.md](cracks.md), row 1).
- ⬜ This tab's session tasks regrouped by this model.
