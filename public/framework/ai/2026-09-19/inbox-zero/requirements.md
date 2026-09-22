# inbox-zero — the board becomes an inbox the owner can clear

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Fastest working version first, then improve. A demo beats a description.
2. **Clear beats brief — by far.** Plain full sentences, basics first, for an overwhelmed newcomer.
3. **Prioritize.** The most important thing first.

## The owner's words, verbatim, 18:51 this evening

> I want a inbox style. Well, so that's AIV3 dashboard. is sort of like an inbox. But for each
> item, uh, you know, we need that approve or improve feedback system. I don't think we have that
> yet. And when they're approved, then they fall off the dashboard or just get filtered out or
> something. So that as I click through things, I can study things one at a time and try and get to
> zero inbox.

Read that again before you design anything. The goal is not "buttons on a card". The goal is **the
owner sits down, works through the board one item at a time, and gets it to empty.** Every decision
you make should be judged against whether it helps them reach zero.

## What already exists — reuse it, do not reinvent it

The owner says "I don't think we have that yet", and for V3 that is right. But the mechanism exists
one page over, and you should build on it rather than inventing a second one:

- **The day-audit page already has Approve / Needs work buttons.** They write
  `public/framework/ai/2026-09-19/day-audit/approvals.jsonl` straight from the browser through the
  dev server socket's `rpc:append` — one card line per press, merged by `id`, newest wins. Read
  that page's `page.js` and copy the pattern. Note the wording differs: it says "Needs work", the
  owner is now saying "Improve". Use the owner's word.
- **Append-only is the house rule and it is not negotiable.** Measured today: eight processes
  appending to one file at once lost nothing, while read-modify-write on one shared JSON file lost
  98.5% of updates *and the file still parsed*. So a press appends a verdict line. It never
  rewrites the board, and it never edits the card it refers to.

## The shape to build

**A verdict is a new line, not a change to the card.** The card stays exactly as posted; a verdict
line points at it by `id`. That keeps the whole history — what was said, what you decided, when —
and it means Approve is undoable by appending again.

**Approved items leave the view, and are not deleted.** The owner said "fall off the dashboard or
just get filtered out or something", so they have not fixed the mechanism — pick the one that best
serves reaching zero, and make sure nothing is ever lost. The default worth beating: an approved
card leaves the main list immediately, and a plain control (a count, a toggle — "12 approved")
brings them back. If a card can leave the screen with no way back, you have built the wrong thing.

**Improve must capture what to improve.** A bare "Improve" press tells nobody anything. The owner
should be able to say, in a sentence, what is wrong — and that sentence has to reach the mastermind
the same way their spoken words do, because otherwise it dies on the page. Look at how
`.claude/skills/every-prompt/say.mjs` puts a `relay` into the mastermind's inbox and use the same
road. An Improve with a note is a new request; treat it like one.

**One at a time is the actual feature.** "As I click through things, I can study things one at a
time" is a request about navigation, not decoration. Whatever you build, it must be possible to
move to the next undecided item without hunting for it — keyboard if you can manage it, a clear
next control if you cannot. Do not let this get lost behind the buttons; it is the half that makes
it an inbox rather than a list with buttons.

**The count is the point.** Somewhere plain and always visible: how many are left. That number
going down is the whole experience.

## Sequencing — you are second in a queue

A sibling minion (`v3-data`) is moving `board.jsonl` out of `public/framework/ai/v/3/` into one
shared store right now, and is changing every reader and writer of it. **Do not start editing until
it has landed** — check for `landed_at` in `public/framework/ai/2026-09-19/v3-data/task.jsonl`.
Read its brief and its log first; the path you must read and append to is whatever it decided, not
`v/3/board.jsonl`.

While you wait, do the reading: the day-audit page's button code, `say.mjs`, `v/3/page.js`,
`v/3/timeline.js`. Do not idle, and do not poll in a tight loop — check, read something, check
again.

## The live-site rules

- **Hold the reloads around your batch of writes:**
  `node Server/hold.mjs on "inbox-zero — building the approve/improve controls"`, write everything,
  prove it works, then `node Server/hold.mjs off "inbox-zero"`.
- **Never kill or restart the dev server.** Servers are up on port 80 (the owner's, they are
  looking at it) and 8123. Leave both alone.
- **Never drive the owner's open tabs.** Headless only.
- **Never `git stash`, never commit, never push.**
- **A file that parses can still blank a page.** Load `/framework/ai/v/3/` headless and look at it
  before you release the hold. One backtick inside a `css()` template kills every page on the site.
- Do not search from the filesystem root; scope every search to the repo.

## Prove it, do not describe it

Before you land, drive the real page headless with the `ui-test` skill and shoot it: the board with
items waiting, a press of Approve, the item gone and the count down by one, a press of Improve with
a note, and the note arriving in the mastermind's inbox. **A gesture you did not drive is not
working, it is untested** — say so plainly if you run out of time on one of them.

## Deliverables

1. **The working controls on the V3 board**, proven with the shots above.
2. **`page.js` in your task dir — one screen.** Top line, plain words: what the board does now that
   it did not before. Then the shots, in order, as the walkthrough. Then, briefly, where a verdict
   is stored and how to undo one. Detail one click down. Run the `new-page` skill for the shape and
   add the page to the day page's `children:` — nothing crawls.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "inbox-zero (in-process agent)"`. One `decision` line for how approved items leave
   the view, naming the alternative you rejected. Land with `finish-task`.

## Fences

You own: `public/framework/ai/v/3/**`, the board store wherever `v3-data` put it, and
`public/framework/ai/2026-09-19/inbox-zero/**`. You may add one line to the day page's `children:`
and append to that day's `day.jsonl`.

**You may not touch `say.mjs`** — read it, match its conventions, but `v3-data` owns it tonight.
If you need a change there, write it in your log as a finding with the exact lines, and say so in
your landing report.

If a skill misleads you or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`.

## Length budget

The page is one screen, and it is mostly pictures. Your landing `outcome` is a headline plus at
most five sentences with links.
