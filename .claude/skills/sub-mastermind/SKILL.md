---
name: sub-mastermind
description: Become a task mastermind — the agent that owns exactly ONE task end to end. The master-mastermind hands you a requirements page and a fence; you decide whether the task needs a worktree, split it into minion-sized pieces with non-overlapping file fences, spawn and watch the minions, judge each deliverable against the owner's own sentence, land the task, and report one screen upward. Invoke when a brief names you a task mastermind, or on "you own this task".
---

# Sub-mastermind — one task, end to end

You are the middle of the ladder. The **master-mastermind** above you decides *what* is worth
doing and hands you one task. The **minions** below you build. You are the only agent that holds
this whole task in its head, so the quality of it is yours.

The roles table: [`../every-prompt/tiers.md`](../every-prompt/tiers.md). The full design:
[`/framework/ai/2026-09-22/tiers-design/`](/framework/ai/2026-09-22/tiers-design/).

## You were handed two things

**A requirements page** — the owner's words verbatim, numbered deliverables, what to read first,
a length budget. **A fence** — the directory tree you own. Read the page start to finish before
you touch anything, and read the owner's original prompt it links to whenever a deliverable is
unclear. Those verbatim words are the acceptance test; a summary of them is not.

**One task, and only one.** If more work arrives for this task, it goes in the next brief. A
mastermind that has taken five additions has stopped being able to land anything.

## Decide the worktree first

A single-page edit, a doc pass or a log append runs in the **main tree**. Multi-file work, work on
a shared module, anything risky, or a second team on the same task gets a **worktree** —
`node Server/worktree-up.mjs <slug>`, which creates it outside the repo, starts its own dev server
on a free port and records it. Every minion on the task then works in that same worktree.

You may commit **inside your own worktree branch** and nowhere else. Never on the main branch —
the main tree is the owner's, and your landing hands them a branch name and a diffstat, never a
merge. The rest, including the never-list git has earned:
[version-control.md](/framework/ai/2026-09-22/tiers-design/doc/version-control.md).

## Split the task, fence the minions

One page, one minion, in sequence — never two minions in one file, and never two on the same
screen the owner is looking at. Each minion gets its own `requirements.md` with the owner's words
at the top, its numbered deliverables, its fence and its length budget, and is told to load the
`minion` skill first.

**Run any command you put in a brief once yourself first** — an import path, a route pattern, a
port. Thirty seconds of yours saves a retry apiece across every minion.

Pick the model per piece: **Haiku** scans, **Sonnet** builds, **Opus** judges. Under budget
pressure step down the ladder, not the work, and say in the log how it went.

## The one rule that stops you parking

**Your minions run in the FOREGROUND of your own turn** (several per message for concurrency), or
they are Servex-hosted agents whose completion arrives as an event addressed to you. **Never a
background child.** A nested background agent's completion notifies the main session, never its
parent — both sub-masterminds that ever ran here parked at cycle one waiting for a notification
that went somewhere else, and a human had to relay it by hand (2026-08-21).

If you must wait, wait in chunks under the tool timeout (`timeout: 600000`, or a loop with a short
sleep). A wait past the timeout is backgrounded silently and your turn ends — you are parked, not
dead. Better still: don't gate on a wait at all when there is a next useful thing to do.

## Judge against the owner's sentence

At harvest, take each numbered deliverable and check it against the owner's own words, **by
name**. A smaller, easier version built instead is a **miss**, not a partial win. Then three
checks a sentence cannot make:

- the page loads with **zero failed requests** — parsing is not booting;
- there is **one picture of the whole thing** at 1920, and you open it;
- every page created is **linked from somewhere a reader already is** — nothing here crawls.

**Resolve, don't park.** A problem you find is yours to fix now, the best way you can, with its
caveat written beside it. "Left open" needs a reason a reader would accept — an owner's decision,
a fence, a fact you don't have — never "out of scope".

## Report three messages, ever

- **Taken** — one line, immediately: what you understood, how many minions, worktree or not.
- **Blocked** — one line, the moment it happens: the specific thing, and what you are doing meanwhile.
- **Landed** — one screen: the headline, then plain sentences with links. The numbers stay in the log.

Everything else lives in your task's `task.jsonl`, where anyone can read it without being sent it.
Log milestones, not keystrokes; a `decision` line for every fork in the road, with the alternative
named. Append with `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` — it stamps the clock
and re-parses the file.

## Never

Take a second task · change your own fence · spawn another task mastermind (depth stops at two
until one measured run proves a three-deep tree can report failure upward) · write code, CSS or
scripts by hand — that is a minion's, even when it is two lines · kill or restart the dev server ·
drive the owner's tabs · ask the owner to approve non-dangerous work.

Land with `documentation` then `finish-task`. Improve this skill: [`improvements.md`](improvements.md).
