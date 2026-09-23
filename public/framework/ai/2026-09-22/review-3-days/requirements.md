# review-3-days — what the last three days produced, cleaned up and presentable

Minion: Opus, effort high. Session id `f808e806-d507-4535-bed4-d8b5b8f40601`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then this.

## The owner's words

> create an opus minion to review the last few days, and see what's complete, what's left, and try
> to clean things up, and get them presentable.
>
> our new ai dashboard system still sucks... i never have a nice clean report of what happened....

That second sentence is the real brief. The owner has never once opened the AI pages and been
able to say, in a minute, what happened. Your deliverable is that minute.

## Deliverables

1. **One page: `ai/2026-09-22/review-3-days/page.js`** — the clean report of 2026-09-19, 09-20
   and 09-21. One screen, mostly above the fold. Newest day first. For each day: a one-line
   headline, then the things that landed as short plain sentences each with its link, then what
   is left (also linked). Under a fold or one click down: the numbers and the caveats. A reader
   who was not here should be able to say what the three days produced in sixty seconds. The
   sources are the day logs (`ai/<date>/day.jsonl`), every task's landing line (`landed_at` and
   `outcome` in its `task.jsonl`), `ai/handover.md`, and `ai/2026-09-20/start-here/`. Read the
   landing lines, not the transcripts.
2. **The "what is left" list, checked, not copied.** `ai/handover.md` lists seven waiting items
   and `ai/2026-09-20/start-here/` lists four. Verify each one against the repo today: is it
   still true, is it done, is it wrong? Item 3 (minion permissions) is already resolved — the
   run ledger `ai/2026-09-22/mastermind-servex/task.jsonl` has the recipe. Your page carries the
   corrected list; `handover.md`'s "What the owner is waiting on" section gets the same
   corrections (that section only — the rest of the handover is the mastermind's).
3. **Clean-up.** Task pages from those three days that fail the presentation rule — a wall of
   text where a headline and links would do, a landing line that is an essay, a page that does
   not say what it is for in ten seconds — get fixed, in place, smallest edit that works. Log
   each one you touched with before/after line counts. Do not rewrite content; nest it. Do not
   touch `ai/v/3/` code, `Server/`, or any `.jsonl` except to append.
4. **A `state` of the dashboard itself, in three sentences, on your page:** what the owner sees
   at `/framework/ai/` today, why it does not read as "what happened", and the one change that
   would fix that most (a proposal for the mastermind — do not build it).

## Fence

You may write: `ai/2026-09-22/review-3-days/**`, `ai/2026-09-22/page.js` (add your slug to its
`children:` — it has a `page.js`, so it must be declared), the `## What the owner is waiting on`
section of `ai/handover.md`, `ai/2026-09-20/start-here/page.js`, and `page.js`/`requirements.md`
files under `ai/2026-09-19/`, `ai/2026-09-20/`, `ai/2026-09-21/` for deliverable 3. Append-only
to any `task.jsonl`/`day.jsonl`. Nothing else.

## Proof

Load your page headless from a private server (`PORT=8091 node server.js` from the repo root,
kill it by PID when done) and screenshot it at 1280 wide into `ai/2026-09-22/review-3-days/shots/`.
The screenshot is a deliverable: the mastermind judges the page from it. Take the reload hold
before the batch that touches live pages (`ai/page.js` is not in your fence; the day page is).

## Length

The page: one screen at 1280×800 above the fold, at most two screens in all. Your landing
report: eight sentences.
