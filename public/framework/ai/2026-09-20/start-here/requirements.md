# start-here — one page that says what to do first

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** One screen. If it needs scrolling to get the point, it has failed.
2. **Clear beats brief — by far.** Plain sentences for someone who has been away and is
   overwhelmed. No jargon, no task slugs as if they were words.
3. **Prioritize.** That is literally the deliverable: an order.

## The owner's words, just now, leaving to run an errand

> There's been a lot of stuff done in the past day. I'm not really sure where everything is. It's
> not really clear to me what I should look at or where I should start. So we need to prioritize
> the list. Like number one, do this first. I'll be back in a little

That is the whole brief. **They come back to a screen that tells them what to do first.**

## What to build

**A page at `public/framework/ai/2026-09-20/start-here/page.js` that answers three questions, in
this order, on one screen:**

1. **What should I do first?** A short numbered list — three to five items, no more — of things
   that need the OWNER, ranked by what unblocks the most. Each one says what it is in a plain
   sentence, how long it takes, and links to the detail. Number one should be genuinely number one.
2. **What was done since yesterday?** Not a changelog — a handful of plain sentences, each linking
   to the thing itself so they can look at it rather than read about it. Group it so it can be
   scanned: what got fixed, what got built, what got recovered.
3. **What is still broken or unfinished?** Honest, short, linked.

## Where the material is — read these, do not invent

- `public/framework/ai/handover.md` — the state of the world, already written and current. Your
  page is the **shorter, friendlier front** to this, not a replacement. Link to it.
- `public/framework/ai/2026-09-19/mastermind-sonnet-run/task.jsonl` — the run ledger. Its `agent`
  lines carry an `outcome` for every task that landed, and its `decision` lines say what was chosen
  and why. This is your richest source.
- `public/framework/ai/2026-09-19/*/` and `public/framework/ai/2026-09-20/*/` — the task dirs, each
  with its own one-screen page.
- `public/framework/ai/board.jsonl` — every card. **23 carry `status: "needs-you"`** — that is the
  raw list of things waiting on the owner, and your numbered list is essentially a ruthless edit of
  it. Many are stale or duplicated; several are one command or one settings line. **Judge them** —
  do not transcribe 23 items onto a page that is supposed to reduce confusion.

## How to rank — this is the judgement, so spend your thinking here

Rank by **what unblocks the most, soonest**, not by age or by how much work went in. A one-line
settings change that fixes a recurring failure outranks a large finished feature that needs no
decision. Say the cost in the item ("one command", "about a minute") because that is what makes a
list actionable.

Two items I already believe belong near the top, but **verify them rather than trusting me**:
- **How this repo gets committed.** Twice in two days an accidental `git stash` reverted every
  uncommitted change; the second time it took a night of recovery. The mastermind may not commit.
  Until the owner either commits regularly or grants a branch, every hour of work is one keystroke
  from vanishing. This is a decision only they can make.
- **Two one-line settings entries and one command** — a health watcher still running old rules, a
  reload-hold guard that is built but half-armed, and a prompt hook that would cut the measured
  29-minute delay between the owner speaking and seeing a result. Each is a minute.

If your reading says something else is number one, **say so and put it there.** A defended
disagreement is a better result than agreement.

## Shape

- **Do not tell the reader what you are about to show them.** No "this page contains…". Show it.
- Every claim gets a link. A claim without a clickable is not a result.
- Level 1 is the numbered list and the three groups. Everything else is one click down.
- `new-page` skill for the shape. Add it to `public/framework/ai/2026-09-20/`'s `children:` —
  nothing crawls.

## Prove it

Load it headless at **1920 and 400**, shot both, and check it renders 200 with no console errors.
**Then look at your own shot as a stranger who has been away for six hours: can you tell, in ten
seconds, what to do first?** If not, cut until you can. Say in your log what you cut.

⚠ The site currently has a spacing bug being fixed by a sibling — `framework.css` lost four
derived tokens and padding reset to zero in several places. **Do not fix that or work around it
with your own CSS**; use the normal classes and let the sibling's repair land under you. If your
shots look cramped because of it, say so rather than patching around it.

## What you must not do

- **Never kill or restart the dev server** (port 80 is the owner's; also whisper on 8178 and the
  health watcher). **Never drive the owner's tabs.** Headless only.
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**, and do not touch
  `stash@{0}`.
- **Never write to `board.jsonl` or `verdicts.jsonl`.** Read them freely.
- **Stay out of** `public/framework/ai/v/**`, `public/framework/framework.css`,
  `public/framework/ext/AITask/**`, `public/framework/dev/DevBar/**` — three siblings are in those.
- Do not search from the filesystem root.

## Deliverables

1. **The page.**
2. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, `"worker": "start-here (in-process
   agent)"`. One `log` line naming what you deliberately left OFF the page and why. Land with
   `finish-task`.

## Fences

You own `public/framework/ai/2026-09-20/start-here/**`, one line in that day page's `children:`,
and one append to its `day.jsonl`. Nothing else.

## Length budget

The page is one screen. Your landing `outcome` is the numbered list itself, in one line each — that
is what the mastermind will relay.
