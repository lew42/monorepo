# This session's tasks: every one closed with evidence, and the splitter fixed

Sonnet, medium effort. The owner (2026-10-24): "We want 100% completion... it's your job to be following up on all these."

## What the census found (scratchpad script, from `session.jsonl`)

This session's record (`ai/sessions/2026/10/20/session-e00f55c9/session.jsonl`) holds 195 tasks:
- 154 from the live prompt splitter (`by: prompt-tasks`), 28 from a backfill (`PromptRecords`), 13 from the tab.
- **73 stopped, and all of them are splitter noise:**
  - one task per sentence (54);
  - tasks filed from the tab's own scheduled check-in prompts (17).
  These are not unfinished work.
- **64 waiting:** every splitter task is filed `waiting_on: "owner"`. These are the owner's asks, so nobody picks them up. That is the follow-up gap.
- Also 15 idle, 8 running, 35 complete.
- **Duplicates:** the splitter's "Make session extend task" (waiting) and the tab's "Session is a Task" (idle) are one ask, filed twice.

## Do

1. **Close out every open task** (waiting, idle and running). For each one:
   - done: the work landed. Complete it with the evidence (commit, page, doc);
   - the same as another task: link it and stop it with "same as <id>";
   - still to do: assign it to the agent that has it, or add it to the queue.
   Write it all with the item tool (writes on this record are slow, about 60s each, and the deputy is fixing that). Batch where the item tool allows.
2. **Write `closeout.md` here:** one line per task, with its verdict and its evidence. Finish with a `show:` line that has the counts before and after.
3. **Fix the splitter itself, or hand it to whoever owns `prompt-tasks`** (`ai-system-mastermind`; see `../session-is-a-task/requirements.md`, items 14–17):
   - an owner's ask is filed as open work for the session, not `waiting_on: owner`;
   - the tab's own check-in prompts are never split into tasks;
   - when the tab hands an ask off, it attaches the brief or agent to the splitter's task instead of making a second one.
