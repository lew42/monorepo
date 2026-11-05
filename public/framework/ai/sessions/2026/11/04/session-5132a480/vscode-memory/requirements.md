# VS Code memory, the usage reading and the dirty tree

What the owner asked (session 5132a480, 2026-11-04), and where each answer is. Details: [report.md](report.md).

- [x] **Why did VS Code reach 4 GB, and is that the long sidebar session?** Mostly normal size (about 3 GB) plus that session; no code change. Proof: [report.md](report.md), "VS Code does not grow".
- [x] **How much usage was there before the reset?** 75% at 08:54; the final figure is unknown. The stale-cache bug it exposed is fixed in `Server/UsagePace.mjs` (a reading over 60 minutes old now reads UNKNOWN). Proof: [report.md](report.md), "The usage guard".
- [ ] **Why are the zombie Chrome processes there?** Named in the [process cleanup report](../../spawned/mastermind-process-cleanup/report.md); killing them waits for the owner's yes.
- [x] **Why is git so dirty?** Records, not code. The missing `LogSweeper.ALLOW` rules are added. Proof: [report.md](report.md), "The dirty tree".

## Still open, none built here

- [ ] Why the access token went missing.
- [ ] The six `Temp_*.mjs` files in the repo root.
- [ ] A one-time cleanup of the untracked files.
- [ ] Track each job's expected cost against its actual cost. The owner declined a hard cap (2026-11-04): a job can legitimately take longer.
- [ ] Pushing to `main` as staging: the order of steps in [report.md](report.md), "Main as staging".
