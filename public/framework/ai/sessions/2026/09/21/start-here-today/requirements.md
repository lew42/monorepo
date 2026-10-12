# start-here-today — the owner's landing page is a day stale, and one item on it is now wrong

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** This is a rewrite of an existing one-screen page, not a new one. It should
   come out the same length or shorter.
2. **Clear beats brief — by far.** Plain sentences for someone who has been away all day.
3. **Prioritize.** That is literally the deliverable: a correct order.

## Why this exists

[`ai/2026-09-20/start-here/`](/framework/ai/2026-09-20/start-here/) is the owner's own "what do I
do first" page, written yesterday. **It is now linked from the V3 head row as "Start here"** — so
the front door points at it, and it is a day out of date.

One of its four items is not merely stale, it is **actively wrong**, and following it would not
do what the page promises.

## The corrections — these are measured, use them

**Item 2 is wrong as written.** It says `Stop-Process -Id 34924 -Force`, "then let it come back on
its own." Today's [`safe-rollout`](/framework/ai/2026-09-21/safe-rollout/) found two things that
change this:
- The process that needs restarting is the **supervisor**, whose pid is `supervisor_pid` in
  `public/framework/ai/health/heartbeat.json` (34636 at 18:15 today, but **read it, never
  hardcode it**). 34924 is the child.
- The supervisor's own watch on `health.mjs` was broken — a single-path `fs.watch` that Windows
  orphans on an atomic write — which is *why* the watcher has kept running old rules and why
  `restarts` has sat at 0. So killing the child alone does not pick up the new rules.
- The honest instruction is: stop the supervisor by the pid in that file, then start
  `node Server/health-supervisor.mjs` again.

**Item 3 is superseded, not wrong.** It points at two separate sets of instructions. There is now
one consolidated, verified block covering both entries:
[`ai/2026-09-21/arm-the-hooks/settings-block.md`](/framework/ai/2026-09-21/arm-the-hooks/settings-block.md).
Point at that instead. Both were driven with real hook payloads today, so "written and ready to
paste" is now "written, armed on our side, and tested".

**Item 1 grew a second reason.** The commit decision now also blocks the worktree workflow the
owner asked for: a worktree contains only *committed* files, and with 359 modified and 115
untracked paths a fresh one has no V3 in it at all. Proven by running it today.

**Item 4 is unchanged.** The 22 files still need their decision.

**"What got done since yesterday" is a day behind.** Today landed seven tasks — all in
[`ai/2026-09-21/`](/framework/ai/2026-09-21/). Read that day's `task.jsonl` files for what each
one actually did rather than trusting this list: `ai-front`, `safe-rollout`, `live-select`,
`v3-ways-out`, `traps-consolidate`, `head-mobile`, `front-door-today`.

## What to build

**Update the existing page at `public/framework/ai/2026-09-20/start-here/page.js`** — do not make
a new one. Its url is linked from the V3 head row and from the handover; a second page would
split the owner's attention, which is the opposite of what it is for.

- Keep its shape: what to do first, what got done, what is still broken.
- Correct the four items as above. **Re-rank them if your reading says the order changed** — and
  say so in your log if you do.
- Replace the "what got done" section with today's, grouped so it scans. Not a changelog: a
  handful of plain sentences, each linking to the thing itself.
- ⚠ **Say when it was last updated**, somewhere the reader sees it. The whole failure this task
  fixes is a page that looked current and was not.

## Prove it

- Load it at **1920 and 400** and shot both.
- Click every link on it and confirm each resolves 200. A stale link on this page is the same bug
  again.
- **Then read your own shot as someone who has been away since this morning: can you tell in ten
  seconds what to do first?** If not, cut until you can, and say in your log what you cut.

⚠ **Your shell will probably refuse `node`, `git` and `node --check`** — it has for every minion
today. Try, and report each refusal individually, naming the command and what you would have
checked. Do not describe a shot you could not take. The mastermind runs the proofs at harvest.

## What you must not do

- **Never write to `public/framework/ai/board.jsonl` or `verdicts.jsonl`**, and never post a card
  authored `owner`.
- **Never kill or restart the dev server**, the whisper server on 8178, or the health watcher —
  including the supervisor this page tells the OWNER to restart. Writing the instruction is your
  job; running it is theirs.
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**; do not touch
  `stash@{0}`.
- **Stay out of** `public/framework/ai/v/**`, `public/framework/framework.css`, `.claude/**` and
  `public/framework/dev/DevBar/**`.
- Search scoped to the repo, never from the filesystem root.

## Deliverables

1. **The updated page**, with the four items correct and today's work on it.
2. **`task.jsonl`**: append only, `"group": "ai-ops"`, `"worker": "start-here-today"`. One `log`
   line naming anything you re-ranked or cut, one naming any link you found already broken. Land
   with `finish-task`.

No new task page — the deliverable IS a page, and a second one about updating it would be the
wall this repo keeps trying to stop writing.

## Fences

`public/framework/ai/2026-09-20/start-here/**` and
`public/framework/ai/2026-09-21/start-here-today/task.jsonl`, plus one append to
`public/framework/ai/2026-09-21/day.jsonl`.

## Length budget

The page stays one screen. Landing `outcome`: what changed on it, and at most three sentences.
