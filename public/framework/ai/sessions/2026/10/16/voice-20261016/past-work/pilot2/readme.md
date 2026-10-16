# pilot2: the stripped-transcript path, first slice (scratch scripts, 2026-10-16)

The pilot for [page/query section 9](/framework/core/Page/doc/query.md). Not the finished pipeline: the first slice of a future `SessionTagger` class. Run in this order:

1. `node strip.mjs measure`: sizes of every Claude SDK transcript under `~/.claude/projects/`, and the stripped size (owner prompts, assistant text, files edited). Writes `measure.json` (not committed).
2. `node kinds.mjs`, then `node real.mjs`: splits machine pipeline calls (dictation cleaners and the like) from real work sessions, and marks which sessions a `task.jsonl` names.
3. `node estimate.mjs`: packs the real sessions into calls and prices them (Haiku 4.5, $1 in and $5 out per million tokens).
4. `node classify2.mjs claude-haiku-4-5 <a>.jsonl <b>.jsonl ...`: one `claude -p` call on one or more stripped sessions; prints tags, summary and the real cost.

`runs/` holds the outputs the doc quotes. `topic-tree.txt` is the module list plus the topic names (about 1,700 tokens).
