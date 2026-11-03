# architecture.md, fourth batch: the next 12 modules by importers

Budget: $12. Sonnet; minions as before. Your log is this dir's `task.jsonl`.

## Read first

- **Skills:** load `sub-mastermind` and `documentation`.
- **Same ask and method as batches 2 and 3:** `../architecture-md-3/requirements.md`; the owner's words are `../requirements-2.md` ask 4.
- **Census:** `node Server/ArchitectureCensus.mjs`. Three batches landed (36 modules).
- **Per-module brief:** `../architecture-md/minion-brief.md`.
- **Known 404s:** `ux/Tree` and `ext/Saver` `page.js` seeds 404 in smoke (seen in batch 3). Leave those pages alone and say so.

## Deliverable

1. Re-run the census on current `michael/dev`. Take the next 12 modules by importers with no `doc/architecture.md`; skip any module a task touched in the last hour.
2. Same method per module:
   - Haiku extracts the decision lines and `decisions.md`.
   - Sonnet writes `doc/architecture.md` in the template's shape: under 80 lines, no dates, no reversal history, each decision with its why, the alternative and a link.
   - You review each against the code.
   - The readme links it in its "More" line, and `doc/files.jsonl` lists the new doc (batch 3's fix).
3. Commit per module on a worktree, then run `merge.mjs` once. Log the census before and after; it must differ by 12, or say why.
4. Card report with the 12 links; check the landing line with `tail -1`.

## Fence

Only the 12 modules' `doc/architecture.md`, `doc/files.jsonl` and readme "More" line (list them in your log first), plus this task dir.
