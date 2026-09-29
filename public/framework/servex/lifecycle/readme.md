# Lifecycle — how much is left running

The owner asked: *"How many things are created that are never finished, how many servers are
started that are never shut down properly, and how many worktrees get orphaned and are just
sitting there?"* This page is the count.

## What it shows

- Four numbers, top of the page: tasks never landed, servers never stopped, worktrees orphaned,
  agents left idle.
- A bar chart of what's left running, by kind, in MB.
- A table of the 10 worst cases.
- The stuck quick-fix pool (`qf-2`, `qf-3`, `qf-4`): why three worktree slots stay stuck even
  after the owner rescued their uncommitted work by hand.

## Use

`data.json` next to this page is a copy of
[`ai/2026-09-29/lifecycle/study/counts.json`](/framework/ai/2026-09-29/lifecycle/study/count.mjs); refresh
it by re-running `node public/framework/ai/2026-09-29/lifecycle/study/count.mjs` from the repo
root and copying `counts.json` here as `data.json` again. How each number is counted:
[Docs → counting](/framework/servex/lifecycle/doc/counting/).

## Watch out

- This is a **snapshot, not a live view** — the system keeps starting and stopping things while
  you read it, so a re-run a minute later gives slightly different numbers. That is expected,
  not a bug in the count.
- **The reaper is live now.** It closes a task's own leftovers on landing, and sweeps everything
  else on the heartbeat. What it does and what it never touches: `Servex/doc/lifecycle.md`.
