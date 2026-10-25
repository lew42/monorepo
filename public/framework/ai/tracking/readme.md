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

**Prompt counts, what they mean (session e00f55c9, 2026-10-24).** These counts (111 unique, 131 raw lines) are from the backfill run on 2026-10-24, not a live recount; run the check for today's. The transcript holds 235 owner-prompt lines, which are 111 unique prompts (a compaction replays old ones). `prompts.jsonl` holds 131 `raw` lines, one per prompt id and all with parts: the extra 20 are rows keyed by a replayed copy's own uuid, not by the unique prompt, so they inflate a count of log lines. The owner's "155 logged, 123 refined" could not be reproduced from the records: it fits none of 235, 131, 111 or the 115 rows the file had before the backfill. The page now shows log lines next to unique prompts so the two can be read side by side; coverage is always against the unique prompts.


## JSONL read and write time: what was measured (2026-10-24)

Which layer each number covers, so none is read as more than it is:

| Layer | Number | What it measured |
|---|---|---|
| Raw append | under 1 ms (0.2 to 0.7) | `fs.appendFileSync` of one line to a copy of each of the eight largest records (`JsonlPerf.measure_files`) |
| Read and parse | read 4 to 22 ms, parse 8 to 21 ms, about 25 ms for the largest record | `readFileSync` plus `JSON.parse` per line of the same eight records (the 1.3 MB `candidates.jsonl` read once at 167 ms cold) |
| Item write, in-process | 4 to 13 ms in the first run; 23 to 62 ms in the runs for this page (397 KB `session.jsonl`) | `run_item` from `Servex/agents/page_tools.js` called directly, on a scratch copy, on the branch that already has the fast write. **No live Servex host was around it** (no HTTP, no socket fan-out, no lock contention), so it is a **lower bound**, and it varies by run |
| Item write over Servex HTTP | first write 4,816 ms, then 48 and 42 ms | three `POST /mcp` `item` calls through the running Servex (`--http`). The first one pays for the host loading the record and its classes; later ones do not |
| Page tail (`ext/JSONL` `live()`/`follow`): delay from an append to the callback | **not measured** | needs the dev server's socket; this checkout has no dev server, and the main tree was off limits |
| Browser load of a large `page.jsonl` | partly measured | `fetch` and parse of a 7.4 MB, 4,497-line record inside headless Chromium from a plain static server: fetch 35 to 209 ms, parse 11 to 14 ms. This is the transfer and the parse only, not what a page does with the rows after |

Script cost: `TRACKING_ROOT=<main checkout> node Server/TrackingCheck.mjs --print` took 39.6 s and 65.4 s before check 4 read each session's prompt rows once (`rid()` re-folded `prompts.jsonl` per prompt), and 35.5 s and 35.4 s after. The rest is the transcripts and the session index.

`--item` copies the record into a scratch `public/` tree in `os.tmpdir()` and points the item tool at it with `SERVEX_PUBLIC` (removed in a `finally` and on exit). Needs a `page_tools.js` that reads `SERVEX_PUBLIC`. No measured step came near 60 s: the worst was a 4.8 s cold first write over Servex HTTP, taken on a branch that already has the fast-write fix, so the original 60 s was not reproduced. Prompt counts in this readme are a snapshot; the page shows the live numbers. `report.json` is always written next to the script that ran, never into `TRACKING_ROOT`.
