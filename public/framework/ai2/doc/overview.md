# overview.json — how it is built

`Server/ai2-overview.mjs` writes `public/framework/ai2/overview/overview.json`. The Overview
tab's page reads that file straight off disk; it does no computing of its own.

**What it reads:** every `public/framework/ai/<date>/<slug>/task.jsonl` (about 800 of them —
merging each one's `assign` lines, latest value per key wins), plus the owner's own prompts in
`.claude/prompts/*.jsonl` (only lines with `"author":"owner"`).

**How a task joins a concept:** the seven concepts (Servex, Page, View, App, AI 2, Dictation,
Research & Collab) are listed at the top of the script, most important first, each with a list of
match words. A task's slug, group and request text are joined into one lowercase string; the task
joins the FIRST concept whose word list appears anywhere in that string. A task that matches none
of the seven is left out and only counted, in `unfiled` — it is never forced into the wrong
bucket, and no new concept is invented.

**Open vs. done:** a task with no `landed_at` and requested in the last 7 days is `open`. Older
unlanded tasks are dropped from the list and only counted, in that concept's `stale_count`. A
landed task is `done`; the newest 30 per concept are kept in the file, `done_count` is the true
total.

**The owner's own words:** when a task's `request` clearly matches a line in the prompt log (the
first 40 characters of one contains the other), the ASK's `quote` is the prompt's own text instead
of a paraphrase. No match is fine — most tasks won't have one.

**To rerun it:** `node Server/ai2-overview.mjs` from the repo root. It takes well under a second
and prints a per-concept open/done/cost line, the same numbers this task's log recorded.

**To change a concept:** edit the `CONCEPTS` array at the top of the script — add match words, or
change a concept's `url` if its real page moves. Nothing else in the script needs to change.
