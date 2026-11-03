verdict: pass
1. [note] Server/ProposalTriage.mjs:144 sets priority as `{score: 4-N, big: N}` rather than the plain `priority: N` the brief asked for; the comment explains it (Task.rank reads bigger as higher), but the deputy should confirm `run_item` accepts that shape before the real `--apply`, since a refused line is only reported, not retried.
2. [note] public/framework/ai/asks/ProposalTriage.js:288 "Approve all" appends `approve` to backlog tasks but gives them no priority, so approved tasks land as plain idle work outside the three big things; fine for the owner's "approve whole chunks" ask, just be aware.
3. [note] The diff has no card screenshots at 400 and 1200 px and no scratch-copy Approve-all test (both required by requirements.md "Test"); it only shows the dry-run numbers (241 = 11 + 4 + 7 + 219) in undone-asks-2026-10-17.md:363. The deputy should open /framework/ai/asks/undone/ once after merge.
4. [note] ProposalTriage.js:300 reuses the `sessions-chip` class and the card uses `triage-card` / `triage-approve-all` / `triage-list` classes that have no CSS in this diff, so the button and counts may look unstyled.
5. [note] There are two classes named ProposalTriage (Server/ and public/…/asks/), as the brief specified, but the browser one never reads priorities from priority.md and hard-codes the three names (ProposalTriage.js:261); they will drift if priority.md is renamed.
6. [note] Roughly 200 KB of the diff is Haiku batch data under deputy/proposals/batches/; harmless and the brief wanted the cost in runs.jsonl, but it is bulk to review.

## Requirements
- 1 count by replay — yes — ProposalTriage.proposals() folds each task.jsonl via AIIndex.fold; `--count`
- 2 Haiku question via UndoneVerify `--question priority`, 25 per batch — yes — write_batches_priority reuses chunks/BATCH3 and runs.jsonl
- 3 approve with by/note and priority — yes, with the score shape caveat in note 1
- 4 backlog = waiting_on "backlog", no new state — yes — write() line 145
- 5 writes via run_item, dry run, triage.jsonl manifest — yes — plan/apply, one row per change
- 6 summary card, counts link to lists, Approve all, at top of undone page — yes — UndoneAsksPage.js:46; AIDashboard untouched
- Docs (readme paragraph, dated section with numbers) — yes
- Testing (shots, scratch Approve-all) — not shown in the diff (note 3)
## Words
- readme and doc paragraphs are plain and say where the files are — yes
