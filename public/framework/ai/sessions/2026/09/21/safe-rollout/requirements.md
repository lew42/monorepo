# safe-rollout — a minion never edits the live tree again, and the watcher can see a dead page

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Two scripts and one rule change. Do not build a CI system.
2. **Clear beats brief — by far.** Another agent has to follow this without asking anyone.
3. **Prioritize.** The watcher blindness first — it is one bug and it is why nobody caught today's
   outage. Then the worktree workflow.

## What happened this morning, because it is the whole reason for this task

At 11:14 the mastermind hand-edited `public/framework/ai/v/3/page.js` on the **live tree** and
wrote `a.attr("href", …)`, which is not how anchors are built here. `/framework/ai/` threw
`a.attr is not a function` and rendered nothing but a Page Load Error. The owner saw it. It was
fixed about three minutes later.

Two separate failures, and **you are fixing the second one**:

1. An agent edited the live site directly. A reload hold was on, but its 300s default expired
   mid-edit and the owner's tab picked up the broken file.
2. **The page-health watcher never noticed.** `public/framework/ai/health/2026-09-21.jsonl` for
   that whole window contains nothing but `row-pitch-over-40px` layout warnings. Not one entry
   says a page failed to load. Read that file and confirm it for yourself before you start.

The owner, just now:

> we should never be breaking the dashboard. Like this shouldn't happen. We should be using work
> trees to roll test and roll out new features without breaking the actual site. And then when
> they've been finished and approved and at least a smoke test — you can merge in a work tree
> that's incomplete as long as we're sure it doesn't break anything, but you should be running
> separate work trees with their own servers on their own ports and have some sort of watcher
> mechanism that just automatically reports what happens on the site. Didn't we have that set up?

The answer to their last question is **half**: the watcher exists and runs; worktrees do not
exist at all (`git worktree list` shows one checkout).

## Fix 1 — the watcher must report a page that does not load. This is the priority

`Server/health.mjs` and `Server/health-supervisor.mjs` are the watcher; the heartbeat is
`public/framework/ai/health/heartbeat.json` (alive, pid 34924, 0 restarts) and findings land in
`public/framework/ai/health/<date>.jsonl`.

Find out **why a page throwing on load produced no finding** — read the code, then reproduce it:
introduce a deliberate break in a scratch copy or a worktree (never the live tree), point the
watcher at it, and show what it does and does not log. My guess, which you should verify rather
than trust: it measures layout on whatever rendered and has no separate check for "did this page
render at all / did the console carry an uncaught error". If the real cause is something else,
say so — a correct diagnosis that refutes me is worth more than agreeing.

Then make it report:

- **An uncaught console error on any watched page is a finding**, at a severity that stands out
  from a layout warning. A page-load failure is not the same kind of thing as a 44px row pitch and
  must not read like one.
- **Out of band.** A finding that a page is dead must reach the owner somewhere that is not the
  broken site — `node .claude/skills/every-prompt/say.mjs` writes a file the assistant tab reads,
  and that is the pattern (the mastermind skill's own warning: "a warning that rides the failing
  system is not a warning"; on 2026-09-19 a blank site was logged 84 times and reached nobody).
- **Prove it recovers from the states it exists to catch, and anything else you can think of**:
  a page that throws on load, a page that 404s, a page that renders empty, the watcher's own
  target server being down. That list is a floor, not a ceiling.

⚠ The running watcher (pid 34924) is on **old rules** — it predates today's changes. Do not kill
it; killing it is on the owner's list. Say in your log what has to happen for your change to take
effect, in one sentence they can act on.

## Fix 2 — a worktree with its own server, as one command

Build the thing the owner described. Keep it to **one script** an agent runs and one that tears it
down, in `Server/` or `.claude/`, your judgement which.

- `git worktree add` a new tree off the current branch, named for the task.
- Boot a server in it on a **free port**, chosen by probing rather than hardcoded — the repo
  already has the convention that minions use `809x` and the mastermind uses 8123, and
  `netstat -ano | grep LISTENING` is how ports in use are listed. The server takes `PORT` from the
  environment (`server.js`).
- Print the url the agent should test against, and the path it should edit.
- A teardown that stops the server and removes the worktree.

**Run it yourself end to end** before you write a word about it: create a worktree, boot it, load a
page on it, break a file in it, watch the watcher report it, tear it down, and prove the live tree
never moved (`git status --porcelain` before and after, same output).

⚠ **`git worktree` is not on the never-list, but everything around it is.** `git stash`,
`checkout --`, `reset`, `restore`, `add`, commit, push, and `stash@{0}` all remain forbidden. A
worktree is created and removed with `git worktree add` / `git worktree remove` and nothing else.
If removing one would discard work, leave it and say so.

## Fix 3 — write the rule down where agents will read it

One short section in `.claude/skills/minion/SKILL.md`: **a change to a page the owner is looking
at is built in a worktree and smoke-tested there first.** Name the script, link nothing that does
not exist yet.

Keep it to a few sentences. The owner, 2026-09-17: suggestions, not laws — write it as *should*,
not *always*, except where today's evidence earns the harder wording. Do not restate the reload
hold; link it.

Put the same two-sentence version in `.claude/skills/mastermind/SKILL.md`, because the agent that
broke the page today was the mastermind.

## What you must not do

- **Never kill or restart the dev server on port 80** — it is the owner's and they are working on
  it. Do not stop whisper on 8178 or the health watcher (pid 34924).
- **Never drive the owner's tabs.** Headless only.
- **Never write to `public/framework/ai/board.jsonl` or `verdicts.jsonl`.**
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**; do not touch
  `stash@{0}`.
- **Stay out of `public/framework/ai/v/**` and `public/framework/framework.css`** — another task
  is queued there.
- Search scoped to the repo, never `find /`.

## Deliverables

1. **The watcher reporting a dead page**, proven by breaking one in a worktree and showing the
   finding — plus the out-of-band notice actually arriving.
2. **The worktree scripts**, proven by the end-to-end run above.
3. **The rule** in the two skills.
4. **`page.js` in your task dir — one screen**, led by the before/after of the watcher on a broken
   page: what it logged before (nothing), what it logs now. `new-page` for the shape; add it to
   `public/framework/ai/2026-09-21/`'s `children:`.
5. **`task.jsonl`**: append only, `"group": "ai-ops"`, `"worker": "safe-rollout"`. One `log` line
   with the real cause of the watcher's blindness. One `decision` line on where the scripts live.
   Land with `finish-task`.

## Fences

You own `Server/health.mjs`, `Server/health-supervisor.mjs`, any new script you add under
`Server/` or `.claude/`, the two `SKILL.md` sections named above, and
`public/framework/ai/2026-09-21/safe-rollout/**`, plus one line in the day page's `children:` and
one append to its `day.jsonl`.

⚠ You also need `public/framework/ai/2026-09-21/page.js` and `2026-09-21` in `ai/page.js`'s
`children:` to exist for your page to be visible. **Check first** — another task may have created
them. If they are missing, create them (clone `2026-09-20/page.js`) and say so in your log.

## Length budget

One screen. Landing `outcome`: what the watcher now catches that it did not, the one command that
makes a worktree, and at most five sentences.
