# Why the first Haiku pass was unreliable (about 58% right)

The first pass fed each Haiku about 10 tasks in one text file and asked for a one-line verdict. It could not look anything up, and it wrote no record of what it checked. Four causes, each seen in the real verdicts (`haiku-verdicts.txt`, evidence in `$TEMP/ta/batch*.txt`, task data in `tasks.json`):

1. **No tools.** It could only read the text it was handed. It could not open a file, grep, or run `git log`, so "delivered" or "not found" was a guess from a few words.
2. **It trusted the task's own status text.** The `now:` line is written by the agent itself and is often stale. A task can say "starting" and have screenshots, files and commits.
3. **The commit count was misleading.** It counts commits that touch the folder, and a child task shares the parent's commits, so "4 commits" says nothing about this task's own work.
4. **No receipts.** It wrote "partial" with a clause of reasoning. Nobody could re-check what it searched for or what it could not find, so a wrong verdict was invisible until I spot-checked by hand.

## Three real examples

| Task | Haiku said | What the evidence showed |
|---|---|---|
| `2026-08-21/pg-tree` | partial: "State starting; screenshots + requirements present; 4 commits but incomplete" | State line was stale ("starting"). It had 5 screenshots and a files list, so something was built. The 4 commits reach back to 2026-09-29 and are shared with the parent folder, so it proved nothing either way. The right answer needed a look at the files and at `git log -- <dir>` for its own commit subjects. |
| `2026-09-28/check-consensus` | not found: "No start date, state, or log; only requirements and review setup" | The folder has `review.md`, `review/`, `files.jsonl` and 3 commits. A review report only exists after work was reviewed, so "not found" is very probably wrong. Haiku read the empty log and ignored the review files in the same list. |
| `2026-09-29/item-ui/a-item` | delivered: "deliverable committed; heartbeat log: delivered and replied to mastermind" | The folder holds only `requirements.md` and has **0** commits. "Delivered" rests on the agent's own sentence ("merge pending"). Nothing in git shows the deliverable. |

A fourth shape, caught by script afterwards: OpenRouter test-run folders (`.../runs/...-17xxxxxxxxxxx`) are not tasks at all, but were judged as if they were.

## What the new design changes (see `verify-brief.mjs` and `receipts.mjs`)

- Each Haiku verifies **2 or 3 tasks**, with Read, Grep and read-only git, so it can look.
- It must write a **receipt** per task: what it searched, what it found (paths and commits), what it could not find, a verdict, a confidence, the smallest next step, and whether it agrees with the old label.
- `receipts.mjs` checks the receipt is complete and that every path it cites really exists, then appends it to `verified.jsonl`. A Haiku never writes the JSONL by hand.
- I spot-check 10% against the files myself and report the agreement rate in `verified.md`.
