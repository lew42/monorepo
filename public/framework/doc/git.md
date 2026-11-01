# Git: branches, merging and deploying (proposal, 2026-11-01)

**In one line:** `main` ← one long-lived branch per machine ← throwaway worktree branches that never leave the machine. Two layers below `main`, no more.

This is a proposal from the owner's dictation of 2026-11-01 (cloud session `e3fd9043`), thought through with the facts checked that day. It is not settled; the open decisions are at the end. The older rules for people joining the repo are in the [root readme](../../../readme.md#new-dev-onboarding).

## Where things stand (checked 2026-11-01)

- **`main` is production** (https://monorepo.lew42.workers.dev/). A GitHub ruleset protects it: no direct push, no force push, no deletion. Changes come in only by pull request, and a pull request needs **0 approvals**. `main` was last updated 2026-08-07; `michael/dev` is about 7,800 commits ahead of it.
- **`michael/dev` is the PC's working branch** (the PC is named `compliance`). The dev server runs it, `Server/merge.mjs` lands every worktree into it and pushes it, so GitHub has it within minutes.
- **Every other branch on GitHub gets a preview**, at `<branch, with / turned into ->-monorepo.lew42.workers.dev`.
- **Worktree branches are local only.** The quick-fix pool's `worktree/qf-1`, `qf-2`, … and the task worktrees never reach GitHub ([worktrees](../../../Server/doc/worktrees.md), [quick fix](../ai/quick-fix/readme.md)).
- **12 branches on GitHub.** Already fully inside `michael/dev`, so safe to delete: `alex/page-route`, `castin/framework`, `claude/oop-streaming-research`, `claude/replay-tests` (its old name), `claude/web-crawler-design-analysis-og8s3r`, `integration/data-shapes-2`, `michael/echo-wire-format-fix`. Not inside it: `alex/update-working-dir` (5 commits), `edric/new-page` (2), and `research/persistence-sync` (8 snapshot commits of the research, replaced by `research/2026/10/29/persistence-sync/`; check, then delete).

## The proposal

1. **`main` = production.** It takes changes only from a machine branch, by pull request.
2. **One long-lived branch per machine** (today `michael/dev`). The dev server runs it, worktrees land into it, and it's pushed after every landing, so GitHub is always current.
3. **Throwaway branches for each task or quick fix**, local only. `merge.mjs` merges them into the machine branch; then they're deleted, or reused (quick-fix slots).
4. **Cloud sessions and other people:** a short-lived branch from the machine branch (or `main`), merged in, then deleted from GitHub.

## Why the middle layer is needed

The owner talked himself into this, and it holds:
- **`main` can't be pushed to;** it needs a pull request. Agents land many small merges a day, and each one can't be a pull request.
- **`main` is production.** The machine branch is "what works on the PC"; it goes to `main` after a check, in batches.
- **Two machines can't both merge into `main` at once** without one of them failing to push. Each machine owns its own branch, and `main` takes one pull request at a time.

## Getting to `main` needs no browser

A pull request needs 0 approvals, so an agent can promote in two commands:

```
gh pr create --base main --head michael/dev --title "Promote michael/dev" --body "What's in it, and the preview checked"
gh pr merge <number> --merge
```

Then merge `origin/main` back into the machine branch, which changes nothing if nothing else landed on `main`. Load the machine branch's preview first. Not tried yet: one ruleset option ("extra approval for unattributed changes") may still ask for a review; the first promotion will show. A small `promote` script could do the check, the pull request and the merge, but only as part of `merge.mjs` or next to it, never a second merge system.

## Long-lived or throwaway

- **A branch that stays (one per machine):** keep it, and merge `main` into it often. That gives the same result as deleting it and branching again from `main`, with less work.
- **A branch that ends (a task, a cloud session, a feature):** delete it once it's merged; the agent that merged it runs `git push origin --delete <branch>`. GitHub's "automatically delete head branches" setting is off. Turning it on would also try to delete the machine branch after every promotion, so it needs a no-deletion rule on that branch first.
- **Depth:** at most two layers below `main`. Branch from a branch only when the work needs unmerged work underneath (this session built on `integration/data-shapes-2`), and land the two together.

## Names

- **`/` groups branches** in git tools and GitHub's branch list, and turns into `-` in the preview URL.
- **A name can't be both a branch and a folder.** If `compliance` is a branch, `compliance/qf-5` can't exist: git keeps each branch as a file, and refuses with "cannot lock ref". That's why the PC's branch is `michael/dev`, not `michael`. So it's either `compliance` alone (worktree branches keep their own `worktree/` prefix), or `compliance/main` with `compliance/<task>` beside it.
- **Clashes:** git refuses to create a branch whose name exists ("already exists"). The worktree tools pick the next free name, and deleting merged branches keeps names free.
- **Local branches need no machine prefix,** because they never leave the machine. The quick-fix pool reuses fixed slot names on purpose: those worktrees are ready-made (`npm ci` already run), so a fix starts in seconds. **The description belongs in the merge commit, not the branch name.** Today `merge.mjs` writes `Merge branch 'worktree/qf-5' into michael/dev`; it should write the task's title, like `Merge qf-5: bold the session title`. A small change, listed in [framework tasks](../tasks/readme.md).

## Open decisions (the owner's)

- **Rename `michael/dev` to `compliance`, or keep it?** The name matters less than the rule. A rename touches `merge.mjs`, Servex, the docs and every PC session, so it's one scripted change with a manifest or none at all.
- **When to promote `michael/dev` to `main` for the first time.** Production hasn't moved since 2026-08-07. The `michael/dev` preview was loaded in a real browser on 2026-11-01 (12 pages render).
- **Delete the merged branches listed above**, and decide about `alex/update-working-dir` and `edric/new-page`.
- **How often to promote:** after each checked batch, and at least weekly, so `main` never drifts three months again.
