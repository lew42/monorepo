# The task queue's 133 tasks: triaged into a short, real list

Sonnet, medium effort, about $5 (an estimate). The owner (2026-10-24): "if they're just sitting there not being worked on… we have a major resource bottleneck… what kind of granularity are these tasks? Where did they come from?… We need to clean this up."

## What the tab measured (`node Server/TaskQueue.mjs --check` plus a census script)

- **133 open tasks, all under `ai/`:**
  - 77 made on 10-17 by `undone-to-tasks` (a backfill of older asks nobody finished);
  - 54 made on 10-23 by `asks-to-tasks` (the asks ledger);
  - 2 orphans.
- **86 queued, 47 waiting.** Estimates total $871, and only 4 are under $5.
- **Many are small UI asks about pages that have since been redesigned**, such as "split bar defaults to 50%" and "reduce padding above the chat header".
- **Nothing runs from this queue automatically.** New owner asks don't enter it; they go straight to agents.

## Do

1. **Check each task against today's site and code.** Mark each one, with evidence (a commit, a page, a doc):
   - **done**;
   - **obsolete**: its page has been redesigned, or it was superseded. Stop it with that reason;
   - **duplicate**: stop it as "same as <id>", or "same as" one of tonight's briefs in `../`;
   - **still wanted**.

   Never delete anything. Write the verdicts with the item tool, which is fast now.
2. **Group what's still wanted into 10–15 buckets of real work,** each one a task with its small asks nested as subtasks. Rank the buckets.
3. **Finish** with the task's outcome and links:
   - the counts before and after;
   - the top 10 buckets, with an estimate each;
   - one line saying what should pick from the queue automatically, and when (the agent-base brief's queue paragraph will cite it).
