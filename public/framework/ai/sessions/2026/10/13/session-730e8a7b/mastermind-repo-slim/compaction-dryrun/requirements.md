# Smart compaction, as a dry-run script: what a compacted task log would keep and lose

- Budget: $10. Load the `sub-mastermind` and `code` skills first.
- The owner's words: `../requirements.md` ask 4 ("compress the deltas significantly without losing much of the history or decision-making… definitely do not do anything destructive").
- The proposal is written: the compaction section of `public/framework/ai/doc/repo-size.md` (when a log may be compacted, what is kept, what is lost, the rule that keeps the decision path).
- Your log is this dir's `task.jsonl`.
- CLAUDE.md: never destructive; compute don't recall; classes not function bags.

## Deliverable: `Server/Compact.mjs` (`class Compact`), dry run only, and `ai/sessions/doc/compaction.md`

1. **The class**: `Compact.plan(taskDir)` reads a task's `task.jsonl` and returns, without writing anything: eligible or not (landed, no `ask` left open, no `decision` reversed, quiet > 7 days: the rule from repo-size.md, written once as a method), the lines it would keep verbatim (the assign launch line, every `decision`, `verdict`, `review`, `agent`, the landing line), the lines it would fold (consecutive `log`/`action` lines into one summary line each with the count, first and last time, and the files touched), the byte sizes before and after, and the undo (the original stays in git history; the compacted file carries one line naming the commit that holds the full log).
2. **The report**: `node Server/Compact.mjs --dry <taskDir>` prints the plan; `--dry --all 2026/09` prints a table for a month (task, lines before/after, bytes before/after, eligible or why not) into this task dir. Two numbers that must agree: tasks scanned vs task dirs in the month.
3. **Numbers for the owner**: run it on August and September; the total bytes saved if applied, the share of lines that are `log`/`action` noise vs decisions; put the three numbers at the top of `ai/sessions/doc/compaction.md` with the rule and "not applied; `--apply` does not exist yet".
4. **A test**: `Server/Compact.test.mjs`: a fixture log compacts to the expected keep set; a log with an open ask is not eligible; the folded line counts match.
5. Owner note (kind `decision`): the numbers, the rule, the link, "apply is a later brief if you want it".
6. Card report; landing line checked with `tail -1`.

Fence: `Server/Compact.mjs`, `Server/Compact.test.mjs`, `ai/sessions/doc/compaction.md`, one link line in `ai/sessions/readme.md` and `ai/doc/repo-size.md`, this task dir. No `--apply`; nothing written to any task log. Sonnet.
