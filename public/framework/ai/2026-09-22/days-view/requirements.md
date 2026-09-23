# days-view — "what happened" as a dozen finished sentences, not four hundred moments

Minion: Sonnet, effort high. Session id `14ca2320-7e50-4b1b-b71d-4a2ee1df3b81`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `code`, `layout`
and `css` before writing. Private port **8098**. The page you own is
`/framework/ai/v/3/` — nobody else touches it while you do.

## Why

The owner, today: "our new ai dashboard system still sucks... i never have a nice clean report
of what happened." The three-day review (`ai/2026-09-22/review-3-days/`, section "The dashboard
itself") diagnosed it: V3 shows 458 cards, 227 from one narrator — activity, not outcome — while
what each piece of work produced lives in that task's landing line. Its proposal, which the
mastermind has decided to build: **a Days view that reads only the finishing line each task
writes when it lands.**

## Deliverables

1. **A fourth view, `days`, on `/framework/ai/v/3/`** beside `now`, `grid`, `timeline`
   (`page.js:370` is the view switch; `timeline.js` is the shared model — read both, and the
   `readme.md`). Newest day first. Each day: its date as a heading, then one row per landed
   task: the task's headline (the first bold sentence of its landing `outcome`, or the first
   sentence), the rest of the outcome folded behind a click, its `links`, and a link to the
   task page. Unlanded tasks of today show as one quiet line each ("working — <now>").
   Data: `ai/<date>/day.jsonl` has a `landed - …` log line per task (one fetch per day) and
   `ai/<date>/<slug>/task.jsonl` has the full `assign.outcome` + `links`; decide which to read
   (the day log for the list, the task log lazily on open is the likely shape) and write a
   `decision` line. The day list comes from `directory.json` or `ai/page.js`'s `children:` —
   whichever the existing views already use.
2. **Days is the default view** of `/framework/ai/` from now on, with the timeline, now and grid
   one click away exactly as today — the owner opens the site to see what happened, not what
   is happening. Keep the `?view=` param and the saved preference working; a saved `now`/`grid`
   preference is honoured as before.
3. **One screen at 1280, and it reads on a phone at 400.** The `layout` skill's five questions
   first. No new CSS class without `new-css-class`; reuse `v3.css` where a rule exists.
4. **Proof:** load headless from your private server at 400, 1280 and 1920, zero console
   errors; a screenshot of the default view into `shots/`; count the rows for 2026-09-22 and
   check it equals the number of `landed` lines in that day's `day.jsonl` (two numbers that must
   agree). Take the reload hold for the batch (`v/3/` is open in the owner's tabs); release only
   after the headless load passes.

## Fence

`public/framework/ai/v/3/**` (not `board.jsonl`), your task dir. Append-only to `.jsonl`.
Nothing under `ai/page.js`, `Server/`, `Servex/`.

## Length

Aim under 150 new lines. Landing report: six sentences and the screenshot.
