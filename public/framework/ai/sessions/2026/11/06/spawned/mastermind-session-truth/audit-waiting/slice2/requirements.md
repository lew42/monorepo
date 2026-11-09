Budget: $3

# Audit "waiting on you" items 21–40 (slice 2): propose a verdict for each

Load the `minion` skill first. Change nothing in the repo except the one output file below: no closing, moving, waiting, answering or completing any task or decision. Your verdicts are proposals the owner will read.

**Same job as slice 1:** read `../requirements.md` (the fields, the verdicts, what to watch for) and look at `../results.json` for the shape and tone the owner accepted. Design: `public/framework/ai/doc/past-work-audit-design.md`. Search past work with `git grep` (`public/framework/ai/indexing-past-work.md`), never rg or `find /`.

**Input:** `evidence.json` beside this file: items 21–40 of `list_waiting`, newest first, each with its log lines and the last commits on its folder.

**New this slice, two kinds of item:**
- `kind: "task"` (items 25, 28–34): a task waiting on the owner, as in slice 1.
- `kind: "decision"` (items 21–24, 26, 27, 35–40): a question card on a voice card page. Its `question` is the text, its `lines` point at the `page.jsonl` line that posted it (`dir` is the folder). Check whether a later line on that page answered it, and whether the thing it is about still exists. Items 21–24, 26, 27 look like the same daily check-in re-posting one waiting task (items 28 and 29); items 35–40 are budget pauses on helper agents from 2026-10-17. Confirm or refute that from the files; don't take it from this brief.

Numbering: `n` runs 21–40 (a duplicate may name an item from slice 1, `n` 1–20, if it is the same ask).

**Output:** `results.json` beside this file: a JSON array of 20 objects `{n, id, asked, asked_link, built, still_true, verdict, question, confidence}`, the same fields as slice 1. Not .jsonl. Then reply with one line: the tally by verdict.

Never: kill or restart the dev server or Servex, drive the owner's tabs, use git's stash/checkout/reset in the main tree, or commit anything (the mastermind commits). Keep under ~80k tokens: read lines, not whole files.
