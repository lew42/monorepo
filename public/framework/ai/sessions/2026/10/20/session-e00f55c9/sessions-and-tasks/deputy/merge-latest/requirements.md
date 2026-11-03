# Merge page: no dead ends

Budget: $6. Load the `minion` skill first, then the `ui` skill. Start from the module readme, [`public/framework/ai/merge/readme.md`](/framework/ai/merge/).

## Why

The owner opened `/framework/ai/merge/` and could not merge anything.

- Both cards (roles-class and qf-3) were greyed out: "the branch moved after it was marked ready".
- Before that, the page sat on a loading state that did not say why. It probably timed out during a Servex blip at 22:23.
- vscode-mastermind relayed this on 2026-10-23 at about 22:35; the prompt hook logs the owner's words.

## What to do

1. **Stale is not a dead end.** A branch that moved past its `ready:` sha is the normal case: agents keep committing after they mark ready.
   - In `Server/ReadyToMerge.mjs`, a stale row checks its current head with the review gate. `node Server/review.mjs --status` (or the function behind it) answers whether the newest review still covers the head.
   - If the head passes, the card offers **Merge latest (<short sha>)**, and `mergeBranch` accepts that head.
   - If it does not pass, the card says in plain words what is missing (no review of the new commits, unanswered findings, …) and who would fix it (the agent that marked it ready).
   - This is the computed version of the fix. The alternative is that agents re-mark ready after every commit, which depends on every agent remembering. Name that alternative in a `decision` line.
2. **The loading state says why.** The page distinguishes three states: "loading", "Servex isn't answering at <url> (retrying)", and an error from Servex with its text. Give the fetch a timeout of a few seconds, with a retry the reader can see.
3. Keep `Server/ReadyToMerge.test.mjs` passing, and add a case for each of the following:
   - a stale row whose head passes (Merge latest is offered);
   - a stale row whose head fails (the reason is given);
   - a refusal by `mergeBranch` of a head that fails.

## Check it

- The page reads Servex on the main tree, which runs the old code until a Servex restart. So prove the page's states headless with Playwright routes that answer `/api/ready-to-merge` with each shape: a stale row that passes, one that fails, Servex down, and slow.
- Take one shot per state at 400 and 1920 into `merge-latest/shots/`.
- `Server/` changes go live only after a Servex restart. Don't restart it; the deputy does that after the merge, through `node Servex/sustain.mjs --restart`.

## Deliverable

- A branch, `worktree/merge-latest`, made with `node Server/worktree-up.mjs merge-latest`. Commit at every working step.
- Then log one `show:` line naming the shots and the test count.
- Then log `ready: worktree/merge-latest <sha> <one line>` and stop.

## Fences

- **Yours:** `public/framework/ai/merge/*`, `Server/ReadyToMerge.mjs` and its test.
- **Only if it's really needed:** the `/api/ready-to-merge` and `/api/merge` routes in `Servex/Servex.js`. Say so in a log line if you edit them.
- **Not yours:** the dashboard and the session page, which another minion is linking at the same time.

## Never

Never kill or restart the dev server or Servex. Never drive the owner's tabs. Never `git stash`. Run `node --check` on every file you touch. Findings go in your `session.jsonl` as `log` lines.
