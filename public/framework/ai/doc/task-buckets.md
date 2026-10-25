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

## One writer for owner asks

An owner ask is filed as a task by **one writer: the prompt splitter** (`prompt-relay.mjs` hook and the Refine prompt records). The tab (`vscode-mastermind`, a voice session) **takes the splitter's task and never adds its own** for the same ask; two writers is how one ask becomes two tasks and its tokens are counted twice. A tab that finds no task for an ask yet (the splitter has not run) waits for it or opens one with the prompt's id as its source, so the splitter finds it and files nothing new. (Code: `task-mastermind-session-closeout` is changing it; this page is the rule it builds to.)

## What a session log holds (item 18, the owner, 2026-10-24)

The tab used to ask agents for `show:` log lines. That was a loose convention, not a system, and it is retired. Where each thing goes:

| What | Where |
|---|---|
| A finished piece of work | The task's `complete`, with its `outcome` and `links` (the `finish-task` landing). This is what the tab relays to the owner. |
| A state change | The session log, one line each: a task **added, started, waiting** (`wait` with `on` and `what`), **complete**. Nothing per step: the raw transcript already records every step. |
| A file the owner should know about was written | A **pointer line**: its path and a one-line synopsis, e.g. `{"log":{"msg":"public/framework/ai/doc/x.md: why X beats Y"}}`. Shots go in a `shot` line. |
| A decision, a design, a finding | The module's own docs (`architecture.md`, `doc/*.md`). The session log only points to them. |
| A reviewer's verdict | One `review` line with the `verdict`; the findings are in the review file the line points to. |

A look-first brief stops with `wait` (`on: "owner"`, `what: "the look"`, the shots in `links`), not with a `show:` line.

## Following children (item 19)

A parent does not poll or ask a child for status. **Servex follows the child's log for it:** `Agents.spawn` calls `follow_child`, so the parent receives the child's new lines, one message per 60-second burst (`Servex/Follow.js`, [Servex/doc/follow.md](/Servex/doc/follow.md)). A parent that wants another log (a grandchild, a worktree task) calls the `follow` tool on its `session.jsonl`.

**Only the lines above reach the parent.** `Follow.kind(line)` sorts every line as `state`, `pointer`, `watcher` or `other`; a subscription made for a child (`of`) forwards only state and pointer lines, each cut to 600 characters, so a child's step logs, `action`, `decision` and node's own `worktree-watch:` lines wake nobody. A child whose log is still noisy has a logging problem to fix at the child (a brief that says "log states, not steps"), not a reason to stop following.

**What following costs (measured):** `node Server/FollowCost.mjs --days 3` reads Servex's agent logs and prices every delivery. Before the filter, 3 days (2026-10-21 to 24): 159 deliveries and 83,299 tokens delivered to five masterminds, 31 wake-up turns; only 49 of the 708 forwarded lines were states and 84% of the tokens were chatter (single `review` findings alone: 281 lines). The same lines through the filter: 41 of the 159 deliveries send nothing (no wake-up), and 20,466 tokens remain (25%). Run it again after the next Servex restart to see the real figure. Tokens delivered are small next to what each wake-up turn costs (re-reading the follower's whole cached context), so the number to watch is *wake-up turns*, which falls with the silent deliveries.

[The tracking page](/framework/ai/tracking/) (linked from the AI page's tabs) is the sibling check: it reports the untracked share of tokens, unlinked children and stale numbers.

## Where notes and findings live (item 17)

A note, a decision or a finding belongs to the task it came out of, not to chat. The proposal for how the item tool adds them, and for the session log as a replayable timeline, is [task-notes-proposal.md](task-notes-proposal.md).

## One subscription system

Everything an agent needs to hear arrives through Servex `follow`; no second mechanism. The rule, and the two second mechanisms still to move (WorktreeWatch's direct send, the global errors folder), are in Servex/doc/follow.md, "One subscription system".

## Do by default; 100% completion per session (items 22–23, the owner, 2026-10-24)

**Approval defaults to "do".** An agent given a task does it, unless the owner's words say "plan" ("let's plan this", "plan first"). Only then does it write a plan and stop for the owner's look; even then the plan comes with a picture or mockup, never a bare question. A task that "needs approval" by default is a bug in the task, not a wait (CLAUDE.md law 5).

**Every session is driven to 100% completion; it is always a top priority.** Each task of a session ends in exactly one of three ways, and every part of every prompt is covered by one:
- **done** (or documented), with its link;
- **reworded** so it can be done (a task that cannot be completed as written is rewritten, not left open);
- **stopped**, with the reason written on it.

A task is never deleted to reach 100%: a stopped one stays, with its why. The completion of each session is shown on the session's row on [the tracking page](/framework/ai/tracking/) and as the prompt completion on its Coverage tab, both computed from the records, never written by hand.

*Status of the tracking-page column:* the Coverage tab's `done of N prompts complete` line exists; the tracking page's per-session column is not built yet and stays in the tracking page's own task list.

## What done looks like, and the size of an ask (item 29, the owner, 2026-10-24)

**Every ask of substance gets a "what done looks like" before work starts:** one or two lines naming the check that proves it (a page that opens, a test that passes, a number before and after). Where a quick option and a robust one both exist, name both and propose the shape early; the default is the quick one that can be improved, and the robust one is the alternative recorded (law 5).

**Size it by the question "does it fit the task I am on?":**
- **A quick job:** it fits the open task. Do it; no task of its own.
- **A task:** one piece of work with its own done-criteria and a start and an end.
- **A project:** several tasks planned up front (a plan, then each task started as you reach it).

**No skill chooses the size; this rule does** (checked 2026-10-24: none of the skills in `.claude/skills` covers it). **Never sit in the wrong task:** close the one you leave before the next starts, or leave it open on purpose with `wait`. Prompt refinement may draft the done-criteria as a line on the ask's task; the tab refines it.

## A session's log is not the home of conclusions (item 30)

What is true about a module goes in that module's readme or docs, and the session points to it. A session log holds task states (added, started, complete, stopped, each with its reason), the closeout's verdicts, and pointers to files; a finding about a module is written in that module's doc, in the task that found it, and linked.

