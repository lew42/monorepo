# architecture.md, sixth batch: the next 12 modules by importers

Budget: $12. Load the `sub-mastermind` and `documentation` skills first. Same ask and method as batch 5 (`../architecture-md-5/requirements.md`; the owner's words: `../requirements-2.md` ask 4). Five batches landed: 66 of 113 modules have one; the census is `node Server/ArchitectureCensus.mjs`; the per-module minion brief is `../architecture-md/minion-brief.md`; the lessons so far: one `files.jsonl` entry per doc, no dates or "the owner said" lines, leave `page.js` notes alone, stub lines fixed in review. Your log is this dir's `task.jsonl`.

## Deliverable

1. Re-run the census on current `michael/dev`; the next 12 by importers with no `doc/architecture.md`; skip modules touched by a task in the last hour; if the remaining ones have under 3 importers, take the 12 largest by size instead and say so.
2. Same method; you review each against the code; readme "More" line and `doc/files.jsonl` link it once.
3. Commit per module on a worktree, `merge.mjs` once; the census before/after in your log.
4. Card report with the links; landing line checked with `tail -1`.

Fence: the modules' `doc/architecture.md`, `doc/files.jsonl` and readme "More" line (listed in your log first), this task dir. Sonnet; minions as before.
