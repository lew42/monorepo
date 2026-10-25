# Completion: no ask goes unaccounted for

**Top priority, second only to dictation (the owner, 2026-10-25).** The owner's words are in this tab's prompt log, the prompt beginning "So whatever this dropped at review problem is, this seems like a major issue". In short:

> We need 100% completion for all sessions, all tasks, all prompts, everything. And that doesn't mean just mark it as complete. That means we need to actually make sure we're completing things.

## What failed, measured

- **This session's record, read with the item tool on 2026-10-25 02:45:** 402 tasks: 100 complete, 78 stopped, 174 never started, 39 "running", 10 waiting, 1 missing. **Completion is 31%.**
- **One example, "Prompt extends Task".** The owner asked on 2026-10-24 (session-is-a-task, item 21). mastermind-deputy filed it on its own record and deferred it at review ("starts after this merge"). Then the deputy went dormant, and nothing noticed an open task whose owner had stopped. It was found only because the owner asked. It is now being built (`core/Task/tasks/prompt-extends-task/`).
- **The rule already existed and wasn't built.** Item 23 of session-is-a-task ("100% completion is a top priority") went to ai-system-mastermind. That agent was paused for pace before it got there.

## Build (code first, judgment second)

1. **Red flag, by code.** A node check, run at every heartbeat, finds every open task whose owner agent isn't working: stopped, dormant, gone, or never assigned. Each one gets one line in its parent's log and appears on the queue page under "Dropped". No AI is involved. The Prompt-extends-Task case would have been flagged the night it was deferred.
2. **Deferral is a real state, never a quiet stop.** A deferred task carries a reason, a home (the module or task that will decide it) and a decide-by time. A deferral with no home counts as dropped.
3. **Each session shows its deferral and stop rate,** split out for the owner's own asks. If more than about 20% of the owner's asks end up deferred or stopped, the session is red-flagged.
4. **A completed owner ask needs proof:** an outcome, plus a link to the thing. A cheap Haiku check compares the claim against the owner's words and flags "marked done, not done". The owner can reopen any task from the page.
5. **A completion value for every item,** read in one item-tool call: session, task, prompt, question, process and project. The percentage is computed from the states, never typed. Partly built (item 26); finish it for the new types (Prompt and Question from `prompt-extends-task`).
6. **Close this session properly.** Walk all 302 open tasks. Each one is done; handed to a working agent; deferred with a home; or stopped with a reason the owner would accept. `session-closeout/verdicts.jsonl` already has 102 verdicts as a start. Target: 100% accounted for, with the stop rate shown.
7. **This prompt is a task of its own,** under the Prompt it came from once Prompts are tasks, and it is complete only when items 1–6 land.

## Order and budget

Dictation comes first (mastermind-dictation-2). Items 1–2 are small node work and can run beside it on Sonnet. Item 6 waits until item 1 exists, so the walk can use it. The week is at 90% of pace, so use one agent and no Opus.
