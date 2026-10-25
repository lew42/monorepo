# Tracking `ai/tracking/`

A page at `/framework/ai/tracking/` that says how well the [task-bucket rule](/framework/ai/doc/task-buckets.md) is being kept. It shows five checks, each from `report.json`:

1. **Work with no task open**: the share of dollars and tokens spent in a session while no task was open, per day and for the sessions with the most untracked dollars.
2. **Child sessions without a parent link**: agents whose `parent` is an agent name instead of a session id, that have no parent at all, or that their parent's record does not list. Routine roles (clarity, reviewer, checkers) are skipped.
3. **Stored numbers that disagree**: a stored `usd`, `tree_usd` or `children` figure that a fresh computation does not give.

4. **Owner prompts without a refinement record**: per session that has a `prompts.jsonl`, the owner's unique prompts in the transcript (`PromptRecords.prompts`, a compaction's replays counted once) against those whose record has `parts`; the percentage, and the transcript line of every prompt with none. A session whose transcript is not on this machine is listed as such.
5. **JSONL read and write time**: the eight largest records under `ai/sessions`, read and parsed (flagged over 200 ms), and the item tool's write time (flagged over 2 s). Read, parse and one raw append on a copy run every time; the write timing runs with `--item` (in-process, on a scratch copy of the largest session record) and `--http <page url>` (three real writes through Servex's `POST /mcp`, so point it at a scratch record), and the last measurement is kept in `report.json` with its time when a run does not repeat it.

| Piece | Job |
|---|---|
| `report.json` | the result of the last run, `{generated_at, days, untracked, children, numbers, prompts, perf}`; generated, never hand-edited |
| `Server/TrackingCheck.mjs` | the writer: `node Server/TrackingCheck.mjs [--days 7] [--id <session>] [--print] [--item [--source <session.jsonl>]] [--http <page url>]`. Reads the session index, the transcripts (`~/.claude/projects/*/<id>.jsonl`, each message priced once with `AISession.price_for`), the task events in each session's record and the Servex registry; writes only `report.json`. Checks 4 and 5 are `prompt_coverage()` and `jsonl_perf()`; the first reuses `PromptRecords` (so it reads prompts from the checkout the script lives in, run it from the main one) |
| `Server/JsonlPerf.mjs` | the timer behind check 5, also run alone: a table of file, KB, lines, ms read, ms parse, ms append and a verdict naming the slowest stage. Read-only on real files; writes only to copies, and removes its scratch folder |
| `TrackingView.js`, `TrackingView.css` | the reader: fetches `report.json`, five cards and the tables |
| `page.js` | the page |

A message is **tracked** when a task bucket was open at its timestamp: a `tasks.add` with state `running` until its `complete`, an id's `start` until its `complete`, or a task folder's file as a whole. A bucket that is never closed counts as open to its file's last line and at most 2 hours past its last event. A session's own start and stop is the session, not a task. The `index.json` and `cache.jsonl` files it reads are gitignored, so run the script from the main checkout.

**Prompt counts, what they mean (session e00f55c9, 2026-10-24).** The transcript holds 235 owner-prompt lines, which are 111 unique prompts (a compaction replays old ones). `prompts.jsonl` holds 131 `raw` lines, one per prompt id and all with parts: the extra 20 are rows keyed by a replayed copy's own uuid, not by the unique prompt, so they inflate a count of log lines. The owner's "155 logged, 123 refined" could not be reproduced from the records: it fits none of 235, 131, 111 or the 115 rows the file had before the backfill. The page now shows log lines next to unique prompts so the two can be read side by side; coverage is always against the unique prompts.

