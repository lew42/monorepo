# v3-axis-fix — the pinned strip is eating the timeline, and Live doesn't look live

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Two fixes on one page. Do not redesign the page.
2. **Clear beats brief — by far.**
3. **Prioritize.** The strip first — it is blocking the owner's view right now. Then the toggle.

## The owner's words, just now

> the problem here with the V3 dashboard is that there's this it says two PM and it says now
> two twenty-two PM. Um it's a white box that says V3 axis sticky. And it's just floating on the
> top of the whole column, but it takes up like eighty percent of the column. So all of the whole
> timeline, the left column on the V3 page, is being kind of blocked visually.

> now I did sort of want some way to have you know like a live view … there's a live kind of toggle
> button I think that should have a primary background when on and then like more like a disabled
> look when off. the live is just to you know auto scroll or automatically show new things coming
> in. and then it should disable itself when you kind of scroll down and click on something. So
> that it, you know, because the live mode might actually hijack your scroll or something.

## Fix 1 — the strip. The cause is already found; do not re-diagnose it

`.v3-axis-sticky` (`v3.css:214`, built at `page.js:519`) wraps two things: the hour/clock row, and
**`$pinned` — the pinned strip, which holds EVERY `needs-you` card plus the newest `focus` card.**

**There are 23 `needs-you` cards on the board right now, and 28 carry `focus`.** The strip wraps
onto line after line and drags the sticky box down to most of the column. Measured, not guessed:
211 distinct cards, 23 of them `needs-you`.

So the CSS is not wrong — **the design is unbounded.** It assumed a handful of pinned items and got
a backlog. Fix the unboundedness:

- **Cap what the strip shows** — a small number of the most important, with a plain way to see the
  rest ("+19 more", a count that expands). You choose the number from the shots; my guess is three
  or four, but judge it by eye at 1920 and at 400.
- **Cap its height too**, so no future backlog can ever do this again. The sticky box should never
  take more than a small fraction of the column — pick the fraction, defend it in your log, and
  make the overflow scroll or collapse rather than push the timeline down.
- Keep the hour/clock row and the "New item" button exactly as they are. They are not the problem.

**The strip must stay useful**: its whole purpose is that a `needs-you` card can never be buried by
the stream. A cap that hides the newest one would defeat it, so order by what matters, not by age
alone — and say in your log how you ordered it.

## Fix 2 — the Live toggle

Three things, all from the owner's words above:

- **On: a primary background.** Off: a dimmed, clearly-inactive look. Right now it does not read as
  on or off at a glance, which is the complaint.
- **Live means: follow new items as they arrive** — auto-scroll to and show the newest. That
  behaviour already exists from yesterday's work; this is about making its state visible.
- **It turns itself off the moment the owner takes control** — scrolling away, or clicking a card.
  The owner's own reasoning: *"the live mode might actually hijack your scroll"*. So the rule is
  that any deliberate act by the owner wins and Live drops to off, visibly. They said they have not
  figured this out fully, so use your judgement — but a Live that fights the owner's scroll is the
  one outcome to avoid.

## Prove it

Drive it, do not describe it (`ui-test`):
- A shot of the left column at **1920 and 400**, before and after, showing the timeline visible
  again. State what fraction of the column the sticky box occupies in each — that number is the
  headline.
- Live on, Live off: a shot of each, so the difference is obvious.
- Scroll away with Live on and shot the result; click a card with Live on and shot the result.
  Both must show Live turned itself off.

Then load `/framework/ai/v/3/` and `/framework/ai/` headless: 200, no new console errors.

## What you must not do

- **Never kill or restart the dev server** — port 80 is the owner's and they are watching this exact
  page; also whisper-server on 8178 and the health watcher. **Never drive the owner's tabs.**
- **Never write to `public/framework/ai/board.jsonl` or `verdicts.jsonl`** — they are the owner's
  real words and verdicts. Test against a scratch copy in your own task dir, as the v3-timeline
  minion did yesterday, and tail the real files before and after to prove you did not touch them.
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**, and do not touch
  `stash@{0}`.
- **Stay out of `public/framework/dev/DevBar/**`, `public/framework/ux/Dictate/**`,
  `public/framework/ext/AITask/**` and `public/framework/framework.css`** — two other minions are
  working in those right now.
- Hold reloads around each batch and re-take the hold before each one; it expires after five
  minutes. Load the page before releasing.
- Run the `css` skill before writing CSS, `new-css-class` before naming one.

## Deliverables

1. **Both fixes**, proven by the shots above.
2. **`page.js` in your task dir — one screen**, led by the before/after of the left column.
   `new-page` for the shape; add it to `public/framework/ai/2026-09-20/`'s `children:`.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, `"worker": "v3-axis-fix (in-process
   agent)"`. One `decision` line for the cap you chose, naming the alternative. Land with
   `finish-task`.

## Fences

You own `public/framework/ai/v/3/**` (not its data files) and
`public/framework/ai/2026-09-20/v3-axis-fix/**`. One line in that day page's `children:`, one append
to its `day.jsonl`.

## Length budget

One screen, mostly shots. Landing `outcome`: the column fraction before and after, and at most five
sentences.
