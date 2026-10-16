# pilot2: the stripped-transcript path, first slice (scratch scripts, 2026-10-16)

The pilot for [page/query section 9](/framework/core/Page/doc/query.md). Not the finished pipeline: the first slice of a future `SessionTagger` class. Run in this order:

1. `node strip.mjs measure`: sizes of every Claude SDK transcript under `~/.claude/projects/`, and the stripped size (owner prompts, assistant text, files edited). Writes `measure.json` (not committed).
2. `node kinds.mjs`, then `node real.mjs`: splits machine pipeline calls (dictation cleaners and the like) from real work sessions, and marks which sessions a `task.jsonl` names.
3. `node estimate.mjs`: packs the real sessions into calls and prices them (Haiku 4.5, $1 in and $5 out per million tokens).
4. `node classify2.mjs claude-haiku-4-5 <a>.jsonl <b>.jsonl ...`: one `claude -p` call on one or more stripped sessions; prints tags, summary and the real cost.

Round 3 (no AI at all, all re-runnable for free):

5. `node filesTouched.mjs`: how many `task.jsonl` logs name files, by month, week, day, and how many modules they touch.
6. `node extract.mjs [days]`: owner prompts, final result, agent name and named task folder for every real transcript; writes `%TEMP%/pw/extract.json` and prints the size per session (about 54 s for all 9,603 transcripts).
7. `node tag.mjs [days]`: how far script signals alone can tag (files, task join, task folder, keywords), and the Haiku fallback cost for the sessions left over.

`runs/` holds the outputs the doc quotes. `topic-tree.txt` is the module list plus the topic names (about 1,700 tokens).

Round 4 (the class is `ai/AISession/AISessionDigest.mjs`; results in `../round4-result.md`, rebuilt by step 12):

8. `node sizes.mjs [days]`: tokens before and after stripping, as distributions.
9. `node reconcile.mjs [days]`: per-session cost from the transcript's own `usage`, against the audit, the snapshot and the Servex registry.
10. `node prompts.mjs [days]`, `node asks.mjs prep|chunks|merge`, `node judge.mjs`: the owner's relayed prompts, a Haiku cluster pass, then a judge pass (`haiku.mjs` keeps the $2 ledger). `repeats.mjs` is the no-AI exploration (noisy: templates dominate).
12. `node report.mjs`: writes `round4-result.md` from `runs/r4-*.json`.
