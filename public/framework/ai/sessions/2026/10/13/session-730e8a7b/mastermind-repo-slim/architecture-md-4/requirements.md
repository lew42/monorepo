# architecture.md, fourth batch: the next 12 modules by importers

Budget: $12. Load the `sub-mastermind` and `documentation` skills first. Same ask and method as batches 2 and 3 (`../architecture-md-3/requirements.md`; the owner's words: `../requirements-2.md` ask 4). Three batches landed (36 modules); the census is `node Server/ArchitectureCensus.mjs`; the per-module minion brief is `../architecture-md/minion-brief.md`; batch 3 noted that two `page.js` seeds (`ux/Tree`, `ext/Saver`) hit pre-existing 404s in smoke: leave those pages alone and say so. Your log is this dir's `task.jsonl`.

## Deliverable

1. Re-run the census on current `michael/dev`; the next 12 modules by importers with no `doc/architecture.md`; skip any module a task touched in the last hour.
2. Same method: Haiku extracts each module's decision lines and `decisions.md`; Sonnet writes `doc/architecture.md` in the template's shape (under 80 lines; no dates, no reversal history; each decision with why, the alternative and a link); you review each against the code; the readme links it in its "More" line; `doc/files.jsonl` lists the new doc (batch 3's fix).
3. Commit per module on a worktree, `merge.mjs` once; the census before/after in your log (must differ by 12 or say why).
4. Card report with the 12 links; landing line checked with `tail -1`.

Fence: the 12 modules' `doc/architecture.md`, `doc/files.jsonl` and readme "More" line (listed in your log first), this task dir. Sonnet; minions as before.
