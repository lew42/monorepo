# timing-audit-2 — measure how long it actually takes for a word to become a change

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.
You are **read-only over the repo** except your own task dir. You measure; you fix nothing.

## The three laws, short

1. **Less is more.** Measure the real path, not a synthetic one.
2. **Clear beats brief — by far.** Plain full sentences, basics first, for an overwhelmed newcomer.
3. **Prioritize.** The single end-to-end number first. The breakdown second.

## Why this exists

The owner asked for this today and it was never started. Their words, from the audit:

> Measure timing end to end — prompt arrival, echo, card, relay, mastermind pickup […]

It matters because "everything is slow" is the complaint they have made most often, in several
forms: *"changes arrive slowly; a one-line change should never queue"*, and *"this is taking way too
long to get an update … keep the log fresh, I want to see exactly what the current state is."* Right
now nobody can say where the time actually goes, so nobody can fix the right thing. **A number
replaces an argument.**

## What to measure

The path a single sentence from the owner travels, stage by stage:

1. **Said → arrived.** The owner speaks or types; when does the text exist somewhere on disk?
2. **Arrived → echoed.** When does it appear verbatim in the dev bar log the owner watches?
3. **Arrived → carded.** When does a card for it appear on the board at `ai/board.jsonl`?
4. **Carded → relayed.** When does it reach the mastermind's inbox as a `chat` line?
5. **Relayed → picked up.** When does the mastermind actually act on it — its first log line or card
   naming that request?
6. **Picked up → something the owner can see.** When does a page, a shot or a landing exist?

**Measure from the record, not from a stopwatch.** Today produced a large, real, timestamped
dataset and you should mine it rather than staging a synthetic run:

- `public/framework/ai/board.jsonl` — every card, with `at`, `id` and `author`.
- `public/framework/ai/2026-09-17/mastermind-layout-browser/task.jsonl` — 53 `chat` lines, the
  owner's verbatim words from 15:36 to 17:21.
- `public/framework/ai/2026-09-19/mastermind-sonnet-run/task.jsonl` — this evening's run: dispatches,
  landings, `agent` lines with outcomes.
- `public/framework/ai/2026-09-19/*/task.jsonl` — every task's own launch and landing times.
- Claude's own session transcripts at
  `C:/Users/mike/.claude/projects/c--Code-lew42-monorepo/*.jsonl` — read-only, and the ground truth
  for when a prompt actually arrived. There are 49 from today. **Do not paste transcript content
  into your page or your log** — timestamps and counts only; they hold the owner's private words.

⚠ **Two honest limits you must state rather than paper over.** First, the verbatim chat record only
begins at 15:36 today, because the relay was built mid-afternoon — anything earlier cannot be timed
end to end and you should say so. Second, a card's `at` is stamped when it is written, which is not
when the owner spoke; where you are inferring rather than measuring, say which.

## What to produce

**One number, then the breakdown.** The headline is the median time from the owner saying something
to them being able to see a result — and the range, because a median hides the case they complain
about. Then each stage, so the slow one is obvious.

Then the question that actually matters: **which stage should be attacked first?** Not the biggest
absolute number necessarily — the one with the best ratio of time saved to effort. Say it plainly,
in one sentence, with the evidence.

Two numbers that must agree, as a check on your own method: the count of owner messages you
measured, against the count of `chat` lines in the record for the same window. If they differ,
explain why before you report anything else.

## What you must not do

- **Fix nothing.** Read-only outside your own task dir.
- **Never kill or restart the dev server** (port 80 is the owner's, they are on it; 8123; the health
  watcher; whisper-server). **Never drive the owner's open tabs.** Headless only.
- **Never `git stash`, never commit, never push.** Do not search from the filesystem root.
- **Never quote the content of a session transcript.** Timestamps and counts only.
- Do not stage a synthetic end-to-end run to get a cleaner number. A real median from a messy day is
  worth more than a clean number from a rehearsal, and the rehearsal would not include the queueing
  that is the owner's actual complaint.

## Deliverables

1. **`timing.jsonl` in your task dir** — one line per measured hop:

       {"hop": {"from": "<stage>", "to": "<stage>", "n": <samples>, "median_s": <n>,
         "p90_s": <n>, "worst_s": <n>, "measured": true|false, "note": "<why, if inferred>"}}

2. **`page.js` in your task dir — one screen, and this one should be mostly a picture.** The top
   line is the headline number in plain words. Then the stages as something you can *see* — a simple
   bar per stage beats a table, because the point is which one is long. Then the one sentence saying
   what to attack first. Everything else one click down. `new-page` for the shape; add it to the day
   page's `children:` — nothing crawls.

3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "timing-audit-2 (in-process agent)"`. Land with `finish-task`.

## Fences

You own `public/framework/ai/2026-09-19/timing-audit-2/**`, may add one line to the day page's
`children:`, and may append to its `day.jsonl`. Nothing else, anywhere. Scratch files go in the
session scratchpad, named after this task so a sibling cannot overwrite them.

If a skill misleads you or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`.

## Length budget

One screen, mostly the chart. Landing `outcome`: the headline number and at most five sentences.
