Budget: $8

# ai/queue: the task queue page shows the real count, reads at a glance, and is linked where the owner looks

Load the `minion` skill first, then `page` (it sends you to the `/framework/design/` readme chain: layout, navigation, content, ui), then `code`. This task's log is `session.jsonl` in this folder; findings go there as `log` lines (`node .claude/hooks/append.mjs <file> <json-array-file>`).

**The owner (2026-10-24):** "There's 0 tasks queued on that ai/queue/ page, and it looks like shit anyway, and there's no link to it." The full ask is the task `task-queue-page-real-count-a-design-that` in [`../task.jsonl`](../task.jsonl) (its `expected` field); the card is [`/framework/ai/2026/10/24/task-queue-page-real-count-clearer-look/`](/framework/ai/2026/10/24/task-queue-page-real-count-clearer-look/). Three things, in this order. Each is a commit.

The page today: [`public/framework/ai/queue/`](/framework/ai/queue/) (`page.js`, `TaskQueueView.js`, `TaskQueueView.css`, `readme.md`). Rows come from the dev server's `taskqueue` query source (`Server/TaskQueue.mjs`, ranked by `core/Task/TaskQueue.js`). `node Server/TaskQueue.mjs --check` printed 133 queued tonight.

## 1. Never a false 0

**What I think happens (verify it, log what you find):** `TaskQueueView.ask()` sets `loading = false` on ANY answer, errors included (`no socket`, a 30 s timeout, `no source`), and `paint()` then draws "0 tasks queued" in the side column, because `rows` is empty. The source itself waits for `SessionIndex.load()` before it lists anything (`ext/Query/QueryServer.mjs` `ensure()`, `Server/TaskQueue.mjs` lines 30–33). So a cold dev server is slow, not empty, unless the 30 s timeout fires first.

**Fix (client side; do not change `Server/TaskQueue.mjs` unless you must, since a change there is live only after a dev-server restart):**
- Draw a count only from a successful answer.
- While waiting, after a timeout, or with no socket, say "Reading the task records…" and ask again, a few times with a growing delay. The client's `stale` callback already re-asks.
- If the error lasts, say what is wrong in plain words, with no number.

**Prove it:**
- Time the first answer on a cold source: restart ONLY your worktree's own server (Servex `restart_server` with its project name, or `node Server/worktree-restart.mjs <name>`), never the main dev server and never Servex.
- Take a headless shot within 2 s of the restart, which must show "Reading…" and no 0, and another after the answer arrives, which must show the real count. Log both times.
- Two numbers that must agree: the page's count against `node Server/TaskQueue.mjs --check` run from your worktree.

## 2. A design that reads at a glance

One screen at 1920 with no scroll for the first look. The reader should get, in this order:
1. **How many are queued**, as one big number with its per-big-thing split.
2. **The top few tasks (about 5–8) as previews:** a card each with the title, a one-line why, the estimated cost, the state and the big thing. A click opens that task's detail. Follow the navigation readme for how a click opens it (the task's own page is `r.url`; beside the list when wide, its own page on a phone, if the navigation rule allows it).
3. **Everything else one click down:** the full ranked list ("All 133"), and how the ranking works (the score formula, now in the side column).

Reuse what exists: the framework's card, preview and column pieces and the `tq-` classes. No new CSS prefix. Read the design readmes before you choose sizes.

**Shots:** 390, 1920 and 3440 wide, saved in this folder as `shots/<width>.png`. The deliverable is the 1920 shot. If you run short, cut the 3440 shot first.

## 3. Linked where the owner looks

Links already exist (the AI page's "Queue" pill and the AI tab bar), but the owner did not find them. Add one link in each of these three places, ideally showing the live count ("Queue · 133"):
- the **sidebar rail under AI**;
- the **session page** (for example [this session](/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/));
- the **day page** ([today](/framework/ai/2026-10-24/), beside its Ready to merge list).

Before you edit, find which file builds each one and log its path. Each edit is an **additive link only, a line or a few**: those pages belong to other work, so change nothing else in them. From each place, click through headless to the queue page and save the shot (`shots/from-<place>.png`).

## Done

- `node --check` every changed file.
- Smoke from the main tree shows no FAIL: `MSYS_NO_PATHCONV=1 node Server/smoke.mjs <your worktree> /framework/ai/queue/ /framework/ai/ /framework/ai/2026-10-24/ /framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/`.
- Bring `ai/queue/readme.md` current: what the page shows now, plus one "Watch out" line on the cold start.
- Log `ready: <branch> at <sha> <the count on the page vs --check; cold-start times; shots>`. Then stop. The mastermind reviews and merges.

## How

- Work in the worktree named in your first message. Commit after each of the three parts.
- Never kill or restart the main dev server or Servex. Headless only, never the owner's tabs. Never stash: diff, don't stash. If `files.jsonl` churn shows in `git status`, leave it and commit only your files.
- **Resolve, don't park.** Anything you leave out gets a log line with the reason.
