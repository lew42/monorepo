# head-mobile — the front door's header eats a quarter of a phone screen

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** The answer is almost certainly *fewer things in the row*, not a cleverer
   layout. Deleting and demoting beat rearranging.
2. **Clear beats brief — by far.** Every control that survives should still say what it does.
3. **Prioritize.** 400px first. Do not regress 1920.

## The measurement, which is the whole brief

`/framework/ai/` is now the front door — it draws V3. Its head row (`.v3-head`, `page.js`)
measures:

- **76px at 1920** — fine.
- **255px at 400** — a quarter of a phone screen consumed before a single card.

Measured this morning with Playwright at both widths, no console errors either side. Reproduce it
yourself first and put both numbers in your log before you change anything; your after-numbers
have to be comparable to them.

The row currently carries, all in one `flex wrap`: the **AI** title (a link home), **four text
links** (Today's board · Everything · Process · Start here), the **version picker**, the **count**
("N left"), **five view tabs** (now · grid · timeline · gallery · dashboard, the last two
disabled), the **Live** toggle, the **author filter** dropdown, and the **card width** slider.

That is eleven controls in one row. At 400px they wrap into roughly six lines.

## What to do — your judgement, but here is my reading

**Not everything in that row deserves a phone.** Some of it is desk furniture. My reading, which
you may overturn with a measurement or a good argument:

- **The card-width slider** is a desk control — there is one column at 400px. Strong candidate to
  hide below some width.
- **The two disabled tabs** (gallery, dashboard) advertise things that do not exist. They cost two
  slots and deliver nothing on a phone.
- **The four links** are the newest thing there and the most useful when lost — but four text
  links is a lot. A single affordance that opens them could be right; so could keeping them.
- **The author filter** and **the count** are genuinely useful and small.
- **The view tabs** are the primary navigation of the page and should survive in some form.

⚠ **Do not remove a control outright at any width.** Hiding on a narrow viewport is fine;
deleting is not — these were fought over twice this week, and the owner asked for the Live toggle
and the author filter by name. If something must go from the phone layout, it goes *behind*
something, not away.

**Pick a target and say it in your log**: I would take 255px under **120px** at 400 without
losing any control's reachability. If you can do better, do; if 120 is not achievable without
hiding something that should not be hidden, say so with the number you did reach.

## Prove it

- **`.v3-head` height at 1920 and at 400, before and after.** Those four numbers are the headline
  of your page. 1920 must not grow.
- Shots at both widths, before and after.
- Every control still reachable at 400 — say how each one is reached if it is no longer visible.
- `/framework/ai/`, `/framework/ai/v/3/?view=now`, `?view=grid`, `?view=timeline` and
  `/framework/ai/?v1`: 200, no console errors, at both widths.

⚠ **Your shell will probably refuse every command** — `node`, `git`, `node --check`, and `.claude/`
writes were all refused for four minions today. **Try, and report each refusal individually**
naming the command and what you would have checked. Do not describe a screenshot you could not
take. The mastermind runs the proofs at harvest. An honest "written, unproven, here is the check
I need run" is worth far more than a confident claim.

## What you must not do

- **Never write to `public/framework/ai/board.jsonl` or `verdicts.jsonl`.**
- **Never kill or restart the dev server** (port 80 is the owner's and this is their page), the
  whisper server on 8178, or the health watcher. **Never drive the owner's tabs.** Headless only.
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**; do not touch
  `stash@{0}`.
- **Stay out of** `public/framework/framework.css` and `public/framework/dev/DevBar/**`.
- Take the reload hold around your batch if your shell allows it; if refused, say so.
- Run the `css` skill before writing CSS, `new-css-class` before naming one. A container query is
  likely the right tool here — `.v3-board` is already `container-type: inline-size`. Search scoped
  to the repo.

## Deliverables

1. **The narrow layout**, with the four height numbers.
2. **`page.js` in your task dir — half a screen**, led by the before/after at 400. `new-page` for
   the shape; add it to `public/framework/ai/2026-09-21/`'s `children:`.
3. **`task.jsonl`**: append only, `"group": "ai-ops"`, `"worker": "head-mobile"`. One `decision`
   line on what you demoted and what you kept, naming the alternative. One `log` line for anything
   you refused to hide and why. Land with `finish-task`.

## Fences

`public/framework/ai/v/3/**` (not its data files) and
`public/framework/ai/2026-09-21/head-mobile/**`, plus one line in the day page's `children:` and
one append to its `day.jsonl`.

## Length budget

Half a screen, mostly the two shots and the four numbers.
