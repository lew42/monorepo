# front-door-today — the AI page opens on a view showing Friday

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** This is one behaviour, probably a few lines. Do not redesign a view.
2. **Clear beats brief — by far.** Someone landing on `/framework/ai/` should see the newest
   thing that happened, whatever that thing is.
3. **Prioritize.** One deliverable: the front door shows today.

## The bug, measured

`/framework/ai/` is the site's AI front door as of today — it draws V3. It opens on the **Now**
view, and Now renders a *conversation thread*: an owner card, then the replies under it.

**The newest owner-authored card on the board is `2026-09-19T17:21:12`.** Every one of today's
26 cards is authored `mastermind`. So Now has been showing a two-day-old conversation all day,
on the page the owner was told to land on, while the timeline right beside it is current.

Confirm both numbers yourself before changing anything — count the owner-authored cards in
`public/framework/ai/board.jsonl` and find the newest, and count today's. Say both in your log.

## Why it happens — do not try to fix this half

The fast assistant tier (`every-prompt`) is what echoes the owner's words onto the board as
owner cards. **It is not running**, so nothing the owner said today became a card. That is the
owner's to restart — it needs its own tab — and it is already on the board as an owner item.

**Your job is the other half:** the front door should not show stale content just because one
source of cards is quiet. A view that silently renders Friday is wrong even when the reason is
legitimate.

## What to do — your judgement, with my reading

The rule worth aiming at: **the front door shows the newest activity on the board**, whatever
kind of card that is.

Three ways there, and I think the third is right — overturn me with a measurement if you disagree:

1. **Change the default view to `timeline`.** One line. But `prefs` persists the owner's last
   chosen view (`page.js`, the `prefs.get({ view: "now" })` line), so anyone who has already
   landed on Now keeps landing on Now — it fixes nothing for the person who has the problem.
2. **Make Now show the newest cards instead of the newest owner thread.** Honest, but it
   changes what Now *is*, and Now was built deliberately as the conversation view. That is a
   redesign, and the brief says not to.
3. **Make Now notice it is stale.** If the newest card it would show is much older than the
   newest card on the board, Now is not "now". Say so where the owner will see it, with a way
   straight to what *is* current — and let the rest of the view alone. My guess at the
   threshold is "the thread's newest card is not from today", but pick it from what you see and
   defend it in a `decision` line.

Whichever you choose, **the test is the same**: land on `/framework/ai/` with no stored
preference and with a stored preference of `now`, and in both cases be able to reach today's
work without knowing to click anything in particular.

⚠ **Do not touch the timeline, the grid, the head row or the links.** All four changed today and
all four are verified. This is Now only, plus at most the default.

## Prove it

- Load `/framework/ai/` at **1920 and 400**, with `localStorage` cleared, and shot it.
- Load it again with the `now` view stored as a preference, and shot that.
- State the date of the newest thing visible on the front door in each case. That date is the
  headline of your page: it should be today.
- `/framework/ai/v/3/?view=timeline`, `?view=grid`, `?view=now` and `/framework/ai/?v1`: 200, no
  console errors.

⚠ **Your shell will probably refuse `node`, `git` and `node --check`** — it has for every minion
today. Try, and report each refusal individually naming the command and what you would have
checked. Do not describe a shot you could not take. The mastermind runs the proofs at harvest.

## What you must not do

- **Never write to `public/framework/ai/board.jsonl` or `verdicts.jsonl`** — and in particular
  **never post a card authored `owner`**. The whole bug is that the owner's real words are
  missing; inventing some would be fabricated input in a permanent record.
- **Never kill or restart the dev server**, the whisper server on 8178, or the health watcher.
  **Never drive the owner's tabs.** Headless only.
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**; do not touch
  `stash@{0}`.
- **Stay out of** `public/framework/framework.css`, `.claude/**` and
  `public/framework/dev/DevBar/**`.
- Run the `css` skill before writing CSS, `new-css-class` before naming one. Search scoped to the
  repo.

## Deliverables

1. **The front door showing today**, proven by the shots and the two dates.
2. **`page.js` in your task dir — half a screen**, led by the before/after of what the front door
   shows. `new-page` for the shape; add it to `public/framework/ai/2026-09-21/`'s `children:`.
3. **`task.jsonl`**: append only, `"group": "ai-ops"`, `"worker": "front-door-today"`. One
   `decision` line on which of the three routes you took and why, naming the alternative. One
   `log` line with the two counts you confirmed. Land with `finish-task`.

## Fences

`public/framework/ai/v/3/**` (not its data files) and
`public/framework/ai/2026-09-21/front-door-today/**`, plus one line in the day page's `children:`
and one append to its `day.jsonl`.

## Length budget

Half a screen. Landing `outcome`: what the front door now shows, the date proving it, and at most
three sentences.
