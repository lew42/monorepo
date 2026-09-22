# health-quiet — nine lines and two rule exceptions silence 850 of 861 warnings

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** This is a small job. Keep it small.
2. **Clear beats brief — by far.** Plain full sentences, basics first.
3. **Prioritize.** The three real bugs first; the rule exceptions second.

## Why this exists

A sibling minion triaged tonight's page-health log: **1,040 lines, which collapse to 11 distinct
things, and zero pages are actually broken right now.** Its ranked findings, with file and line for
each, are in `public/framework/ai/2026-09-19/health-triage/triage.jsonl` — **read that first, it is
your work order.** Its one-screen summary is at `/framework/ai/2026-09-19/health-triage/`.

The point of this task: a warning log that cries wolf 861 times gets ignored, and then the one real
breakage is invisible in the noise. Almost all of tonight's noise comes from **nine malformed lines
in four files** and **two rules missing an exception they already grant elsewhere**. That is a very
cheap silence.

## What to fix, in order

**1. Nine malformed JSONL lines in four task ledgers (740 of the 861 warnings).**

- `public/framework/ai/2026-09-19/page-health/task.jsonl` — lines 3, 4, 5, 10, 11, 12 are missing a
  closing brace. 185 warnings.
- `public/framework/ai/2026-08-21/pg-tree/task.jsonl` — line 2 is plain text, not JSON. 185 warnings.
- `panel-pad-gap` and `imagine-mag` task.jsonl files — a legacy top-level `step` key. 370 warnings.

These are historical ledgers, so two cautions:

- **A malformed line is already unreadable**, so repairing it loses nothing — but repair it, do not
  delete it. Recover the intended content from what is there and make the line parse. If you cannot
  tell what a line meant, say so and leave it; an honest "line 4 is unrecoverable" beats inventing
  content into a permanent record.
- **The legacy `step` key was knowingly left alone by an earlier task tonight.** Find that decision
  before you touch those two files — search the day's task logs for it. If that task had a reason,
  respect it and say so; if it simply ran out of time, fix it. Do not overrule a recorded decision
  without naming it.

**2. Two rules that cry wolf (about 107 warnings).** Both are in `Server/health.mjs`, and the fix in
each case is an exception the rule already grants to something else:

- `row-pitch-over-40px` (43 hits) fires on activity and task lists where each "row" is a multi-line
  card. A 150–220px pitch there is correct, not cramped.
- `padding-under-8px` (64 hits) re-flags the same sitewide inline-code-chip and table-cell styles on
  every page that uses them. The rule already excuses buttons and inputs for exactly this reason and
  never added `code`, `th` and `td` to that list.

⚠ **`Server/health.mjs` is the one Server file you may edit, and only these two rules.** Saving under
`Server/` can bounce the live site, and the owner is on it — so: make both edits in one batch behind
a reload hold, and **the health watcher must be running again when you finish**. A supervisor
(`Server/health-supervisor.mjs`) restarts it automatically when it dies, which is your safety net,
but confirm it yourself: `public/framework/ai/health/heartbeat.json` should be under a minute old and
its restart count should make sense. If you cannot bring it back, say so loudly — it was dead for
most of today and that is the exact failure we just fixed.

## Prove it

The decisive number is the warning count. Note how many lines today's
`public/framework/ai/health/<date>.jsonl` has before you start. After your fixes, let the watcher run
a few minutes over the same pages and count the new warnings of each fixed kind. **They should be
zero, or you have not fixed it.** Put the before and after numbers in your log. Two numbers that must
agree: the count of malformed lines you repaired and the count of files that now parse clean end to
end (check every line of each file you touched with a parser, not by eye).

## What you must not do

- **Never kill or restart the owner's dev server on port 80**, the mastermind's on 8123, or
  whisper-server. Editing `health.mjs` and letting its supervisor cycle the watcher is allowed and
  expected; nothing else is.
- **Never drive the owner's open tabs.** Headless only.
- **Never `git stash`, never commit, never push.** Do not search from the filesystem root.
- **Do not touch** `public/framework/ai/v/3/**` or `public/framework/dev/DevBar/**` — two other
  minions own those right now. If a warning points there, leave it and say so.

## Deliverables

1. **The fixes**, with the before and after warning counts.
2. **`page.js` in your task dir — one screen.** Top line, plain words: how many warnings there were
   and how many there are now. Then what was actually wrong, in a short list. That is the whole page;
   the detail belongs in your log.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "health-quiet (in-process agent)"`. Land with `finish-task`.

## Fences

You own: the four task.jsonl files named above, `Server/health.mjs` (those two rules only), and
`public/framework/ai/2026-09-19/health-quiet/**`. One line in the day page's `children:`, one append
to its `day.jsonl`.

If a skill misleads you or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`.

## Length budget

One screen. Landing `outcome`: a headline plus at most five sentences with links.
