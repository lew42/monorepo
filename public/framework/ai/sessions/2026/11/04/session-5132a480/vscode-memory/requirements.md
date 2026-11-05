# VS Code memory, the usage reading and the dirty tree

The owner's words are in this tab's prompts (session 5132a480, 2026-11-04). What they asked, and where each ask went:

1. **Why did VS Code reach 4 GB, and is that the long sidebar session?** Measured in [report.md](report.md); no code change.
2. **How much usage was there before the reset?** Answered in report.md. Answering it showed `usage-now.mjs` trusting an 11-day-old cache, so this task fixes that: a stale reading reads as UNKNOWN and over pace.
3. **Why are the zombie Chrome processes there?** Named in report.md's companion, the [process cleanup report](../../spawned/mastermind-process-cleanup/report.md); killing them awaits the owner's yes.
4. **Why is git so dirty?** Answered in report.md. This task adds the missing `LogSweeper.ALLOW` rules for task records in module homes.

Follow-ups, still open, none built here: why the access token went missing; the six `Temp_*.mjs` files in the repo root; a one-time cleanup of the untracked files; a hard spend cap on fan-outs (proposed to the owner).
