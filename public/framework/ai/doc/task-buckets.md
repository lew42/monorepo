# Task buckets: when to open a task, who starts one, who may write it

A **task is a bucket**: every token a session spends between a task's `start` and its `complete` is counted against that task. So the cost of a session is only meaningful if a task was open while the work happened. This page is the rule (the owner, 2026-10-24, priority 1: [the brief](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-is-a-task/requirements.md), items 8 and 14 to 17). The *how* (which file is written, which class reads it, where it shows) is in [core/Task/readme.md](/framework/core/Task/readme.md) and [core/Session/readme.md](/framework/core/Session/readme.md); this page does not repeat it.

## The rule

**Every agent opens a task for each piece of real work and closes it. A tab files each owner ask as a task on its own session.** A task is a bucket of meaningful work (fix the tab bar, audit the readmes), never one per file read. Tokens spent with no task open show as *untracked*; [the tracking page](/framework/ai/tracking/) reports how much (`node Server/TrackingCheck.mjs`).

## When to make a task (item 14)

- **It fits the task you are on: just do it.** No child task. A rename inside "fix the tab bar" is part of "fix the tab bar".
- **It is unrelated: open a sibling or a child task first.** A child when it is a step of the current task; a sibling when it is something else the session is now doing. Close the one you leave, or leave it open on purpose with `wait`.
- **With a plan, make the tasks up front.** A plan with several tasks is a project; the whole list is added before the first edit, and each task is started as you reach it.
- **Autonomous, no plan: open each task as you go,** at the moment the work changes, not afterwards.
- **Why:** so the tokens are counted against what was actually done. A task that is too big hides what the money bought; a task per file read is noise.

## Every agent starts with a task (item 15)

- **A spawned agent is handed a task already made.** `Servex/agents/Agents.js` `spawn` calls `open_task` for every spawn with a `task` spec (a bare spawn gets a default one), so the mastermind and the agent both hold the same link, and the task's `assign` line is line 1 of its `task.jsonl`.
- **An agent that gets a prompt with no task opens one as its first act.** This is every VS Code tab and every voice or sidebar session: the first owner ask becomes a task on the session's record (`tasks.add` through the item tool), then the work starts.
- **Enforcement, proposed (not built):** a node hook, `.claude/hooks/task-open-check.mjs`, on `PreToolUse` for `Edit`, `Write` and shell commands. It replays the session's record with the same `task_events` and `open_spans` functions as `Server/TrackingCheck.mjs` and answers one of two ways: a task is open, so continue; or none is, so say "open a task first" (log-only for the first week, then a refusal). It must be fast (it reads one file's tail) and must never block the item tool itself, or an agent could not open the task it is asked to open. The tracking page's untracked share is the measure of whether it is needed: build it only if the share does not fall.

## One writer per task (item 16)

Once a mastermind hands a task off, **only the agent that holds it writes to it** until it hands it back. The hand-back is what starts the review. Two writers on one `task.jsonl` is how progress and outcomes get overwritten.

| Who | May write | May not |
|---|---|---|
| **The assignee** (the agent the task was handed to) | progress lines, notes, findings, `start`, `wait`, `complete` with `outcome`, `evidence`, `confidence`, `caveats`, child tasks of its own | the `assign` line, the review verdict, the priority |
| **The mastermind** that handed it off | the `assign` line (once, at hand-off), priority, scope changes before hand-off, the review verdict after hand-back, `accept` / `reject` | progress or `complete` of a task it has handed off, while it is handed off |
| **A reviewer** (after hand-back) | the review verdict and notes | work on the task itself |
| **Node** (Servex, `TaskLoop`, `AIIndex`) | computed fields: `landed_at`, cost, the stale-close lines | anything a judgment decides |
| **The owner** | anything, through the Inbox card or an owner note; the owner is not bound by the table | |

A mastermind that needs something changed while the task is handed off **sends the assignee a message** (`send_to_agent`); it does not edit the file. If the assignee is gone (stopped, compacted away), the mastermind takes the task back with a logged hand-back line first, then writes.

## Where notes and findings live (item 17)

A note, a decision or a finding belongs to the task it came out of, not to chat. The proposal for how the item tool adds them, and for the session log as a replayable timeline, is [task-notes-proposal.md](task-notes-proposal.md).
