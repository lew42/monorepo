# Tracking `ai/tracking/`

A page at `/framework/ai/tracking/` that says how well the [task-bucket rule](/framework/ai/doc/task-buckets.md) is being kept. It shows four checks, each from `report.json`:

1. **Work with no task open**: the share of dollars and tokens spent in a session while no task was open, per day and for the sessions with the most untracked dollars.
2. **Child sessions without a parent link**: agents whose `parent` is an agent name instead of a session id, that have no parent at all, or that their parent's record does not list. Routine roles (clarity, reviewer, checkers) are skipped.
3. **Stored numbers that disagree**: a stored `usd`, `tree_usd` or `children` figure that a fresh computation does not give.
4. **Session identity**: for the 10 most recent sessions (and any given with `--id`), `Server/SessionIdentity.mjs` checks the transcript holds only this session's id, there is one dated folder, the stored cost matches a recount, no message is shared with another transcript and every child is linked from its parent. One row per session: ✅ or the first problem.

| Piece | Job |
|---|---|
| `report.json` | the result of the last run, `{generated_at, days, untracked, children, numbers, identity}`; generated, never hand-edited |
| `Server/TrackingCheck.mjs` | the writer: `node Server/TrackingCheck.mjs [--days 7] [--id <session>] [--print]`. Reads the session index, the transcripts (`~/.claude/projects/*/<id>.jsonl`, each message priced once with `AISession.price_for`), the task events in each session's record and the Servex registry; `Server/SessionIdentity.mjs` is called for check 4; writes only `report.json` |
| `TrackingView.js`, `TrackingView.css` | the reader: fetches `report.json`, four cards and four tables |
| `page.js` | the page |

A message is **tracked** when a task bucket was open at its timestamp: a `tasks.add` with state `running` until its `complete`, an id's `start` until its `complete`, or a task folder's file as a whole. A bucket that is never closed counts as open to its file's last line and at most 2 hours past its last event. A session's own start and stop is the session, not a task. The `index.json` and `cache.jsonl` files it reads are gitignored, so run the script from the main checkout.
