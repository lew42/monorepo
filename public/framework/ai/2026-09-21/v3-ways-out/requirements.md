# v3-ways-out — V3 is the front door now, and you cannot get anywhere from it

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** This is a handful of links, not a navigation system. If you are building a
   component, stop.
2. **Clear beats brief — by far.** Someone landing here should see where else they can go without
   hunting for it.
3. **Prioritize.** Getting out of V3 at all comes first. Looking good comes second.

## The owner's words

> the AI framework slash AI page should default to V3. **And there should be a link to any
> important things on V3.**

The first half landed at 11:16 — `/framework/ai/` now draws V3. The second half never got done:
the minion briefed for it was stopped mid-run, and nothing picked this up.

## What is actually wrong

Before today, `/framework/ai/` was V1: a rail of every day and every task, plus the log and the
process page. That rail *was* the navigation. V3 replaced it and is a card stream with **no way
out at all** — no day boards, no task dirs, no log, no process page.

So the site's AI section currently has a front door and no corridors. Everything is still
reachable by typing a url, which is not the same as being reachable.

Check this yourself before you start: load `/framework/ai/` and try to get to
`/framework/ai/2026-09-21/` by clicking. Say in your log whether you found any path at all.

## What to build — one small region, six links at most

Put it where it does not push the cards down the page. The head row (`.v3-head` in `page.js`,
which already holds the title, the version picker, the count and the toolbar) is the obvious
home, but it is already busy — **your judgement**, and say why in a `decision` line.

The links worth having, which you may edit down but not up:

- **Today's board** — `/framework/ai/<today>/`, computed, never hardcoded. This is the most
  useful one: it is where the in-flight tasks and their progress bars live.
- **Everything** — `/framework/ai/log/` — every task of every day.
- **Process** — `/framework/ai/process/` — how the work itself is going.
- **Start here** — `/framework/ai/2026-09-20/start-here/` — the owner's own four-things page.
- The version picker is already in the head; do not duplicate it.

⚠ **Today's date must be computed.** A hardcoded `2026-09-21` is wrong tomorrow, and a day dir
that does not exist yet 404s. If today has no dir, fall back to the log rather than linking a
dead page — and say which behaviour you chose.

## Do not

- Do not rebuild V1's rail. The whole point is that V3 replaced it. Six links, not a directory.
- Do not touch the toolbar's existing controls (view switch, Live, author filter, card width) —
  they were fought over twice this week.
- Do not add a second bar. Fold into what is there.

## Prove it

**Your shell will probably refuse every command** — measured three times today: a CLI minion
under `--permission-mode acceptEdits` can write files but cannot run `node`, `git`, or even
`node --check`. **Try anyway, and when it refuses, say exactly which command was refused and what
you would have checked.** Do not describe a screenshot you could not take. The mastermind runs
every proof at harvest.

What needs proving, for whoever runs it:
- `/framework/ai/` at 1920 and 400 — the links visible, the cards not pushed down.
- Every link clicked, each resolving 200.
- `/framework/ai/v/3/` and `/framework/ai/?v1` still fine, no console errors.

## What you must not do

- **Never write to `public/framework/ai/board.jsonl` or `verdicts.jsonl`.**
- **Never kill or restart the dev server** (port 80 is the owner's, they are on this page), the
  whisper server on 8178, or the health watcher. **Never drive the owner's tabs.**
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**; do not touch
  `stash@{0}`.
- **Stay out of** `public/framework/framework.css` and `public/framework/dev/DevBar/**`.
- Take the reload hold around your batch (`node Server/hold.mjs on "v3-ways-out"`) if your shell
  lets you; if it refuses, say so — the mastermind will hold for you.
- Run the `css` skill before writing CSS, `new-css-class` before naming one. Search scoped to the
  repo.

## Deliverables

1. **The links region.**
2. **`page.js` in your task dir — one screen**, led by a shot of the head row with the links in
   it (or a plain statement that you could not take one). `new-page` for the shape; add it to
   `public/framework/ai/2026-09-21/`'s `children:`.
3. **`task.jsonl`**: append only, `"group": "ai-ops"`, `"worker": "v3-ways-out"`. One `decision`
   line on where you put the region, naming the alternative. One `log` line answering whether any
   click path out of V3 existed before you started. Land with `finish-task`.

## Fences

`public/framework/ai/v/3/**` (not its data files) and
`public/framework/ai/2026-09-21/v3-ways-out/**`, plus one line in the day page's `children:` and
one append to its `day.jsonl`.

## Length budget

Half a screen. Landing `outcome`: what the links are, where they sit, and at most three sentences.
