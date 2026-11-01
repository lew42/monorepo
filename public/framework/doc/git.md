# Git: branches, merging and deploying (proposal, 2026-11-01)

**In one line:** worktree branches land in `main`, `main` is pushed after every landing, and a separate `production` branch is moved up to `main` only when the owner says so (option B below). Today's setup (`michael/dev` → `main`) is option A.

This is a proposal from the owner's dictation of 2026-11-01 (cloud session `e3fd9043`), thought through with the facts checked that day. It is not settled; the open decisions are at the end. The older rules for people joining the repo are in the [root readme](../../../readme.md#new-dev-onboarding).

## Git in one minute (what a branch really is)

- **A branch is a label on one commit**: a tiny file holding one commit id. Each new commit on the branch moves the label forward. A **tag** is the same kind of label, but it never moves (used to mark releases, like `v1.2.0`).
- **A merge commit records its two parent commits, not their branch names.** The only trace of a branch's name is the text of the merge message (`Merge branch 'worktree/qf-5' into michael/dev`).
- **Deleting a merged branch deletes only the label.** Every commit stays in history, because the branch it merged into still reaches it. Commits that were never merged anywhere are cleaned up by git after a while (weeks, locally).
- **Reusing a deleted name is safe:** the new branch is a new label; nothing old points at the name.
- **Branches don't make the repo bigger;** files and their history do. Deleting branches doesn't shrink it.
- **We merge, we don't squash:** a normal merge keeps every commit of the branch; a squash collapses them into one and loses the steps.

So a branch name is a convenience while the work is open. What should survive is the merge message: say what the work was there.

## Which branch deploys where (checked 2026-11-01)

- `wrangler.jsonc` has no custom domain. The Worker is `monorepo`; **its production address is https://monorepo.lew42.workers.dev/**, and that is the live site today.
- **The production branch is a Cloudflare setting** (Workers → monorepo → Settings → Build → Branch control). It defaults to the repo's default branch, `main`, and can be changed to any branch. A push to it runs the build and the deploy.
- **Every other branch gets a preview build** (a checkbox, "Enable Preview Builds", turns these off), at `<branch with / turned into ->-monorepo.lew42.workers.dev`. A preview never touches production.
- **GitHub's default branch** (the one shown when someone opens the repo) is a separate setting: Settings → General → Default branch. Most open-source projects show their latest work there and mark releases with tags; package managers install the tagged releases.

## Where things stand (checked 2026-11-01)

- **`main` is production** (https://monorepo.lew42.workers.dev/). A GitHub ruleset protects it: no direct push, no force push, no deletion. Changes come in only by pull request, and a pull request needs **0 approvals**. `main` was last updated 2026-08-07; `michael/dev` is about 7,800 commits ahead of it.
- **`michael/dev` is the PC's working branch** (the PC is named `compliance`). The dev server runs it, `Server/merge.mjs` lands every worktree into it and pushes it, so GitHub has it within minutes.
- **Every other branch on GitHub gets a preview**, at `<branch, with / turned into ->-monorepo.lew42.workers.dev`.
- **Worktree branches are local only.** The quick-fix pool's `worktree/qf-1`, `qf-2`, … and the task worktrees never reach GitHub ([worktrees](../../../Server/doc/worktrees.md), [quick fix](../ai/quick-fix/readme.md)).
- **12 branches on GitHub.** Already fully inside `michael/dev`, so safe to delete: `alex/page-route`, `castin/framework`, `claude/oop-streaming-research`, `claude/replay-tests` (its old name), `claude/web-crawler-design-analysis-og8s3r`, `integration/data-shapes-2`, `michael/echo-wire-format-fix`. Not inside it: `alex/update-working-dir` (5 commits), `edric/new-page` (2), and `research/persistence-sync` (8 snapshot commits of the research, replaced by `research/2026/10/29/persistence-sync/`; check, then delete).

## Today's setup, kept as option A

1. **`main` = production.** It takes changes only from a machine branch, by pull request.
2. **One long-lived branch per machine** (today `michael/dev`). The dev server runs it, worktrees land into it, and it's pushed after every landing, so GitHub is always current.
3. **Throwaway branches for each task or quick fix**, local only. `merge.mjs` merges them into the machine branch; then they're deleted, or reused (quick-fix slots).
4. **Cloud sessions and other people:** a short-lived branch from the machine branch (or `main`), merged in, then deleted from GitHub.

## Why option A needs the middle layer

The owner talked himself into this, and it holds as long as `main` is both protected and production. Move production to its own branch (option B) and the first two go away; the third is handled by pulling before pushing:
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
- **A branch that ends (a task, a cloud session, a feature):** deleting it after it merges is optional. It costs nothing to keep (a label), and deleting loses only the name, which the merge message should carry anyway. The cost of keeping them is a long branch list. Deleting on GitHub doesn't delete local copies; `git fetch --prune` clears the stale ones. GitHub's "automatically delete head branches" setting is off; turning it on would also try to delete a long-lived branch after a pull request, so it needs a no-deletion rule on that branch first.
- **Depth:** at most two layers below `main`. Branch from a branch only when the work needs unmerged work underneath (this session built on `integration/data-shapes-2`), and land the two together.

## Names

- **`/` groups branches** in git tools and GitHub's branch list, and turns into `-` in the preview URL.
- **A name can't be both a branch and a folder.** If `compliance` is a branch, `compliance/qf-5` can't exist: git keeps each branch as a file, and refuses with "cannot lock ref". That's why the PC's branch is `michael/dev`, not `michael`. So it's either `compliance` alone (worktree branches keep their own `worktree/` prefix), or `compliance/main` with `compliance/<task>` beside it.
- **Clashes:** git refuses to create a branch whose name exists ("already exists"). The worktree tools pick the next free name, and deleting merged branches keeps names free.
- **Local branches need no machine prefix,** because they never leave the machine. The quick-fix pool reuses fixed slot names on purpose: those worktrees are ready-made (`npm ci` already run), so a fix starts in seconds. **The description belongs in the merge commit, not the branch name.** Today `merge.mjs` writes `Merge branch 'worktree/qf-5' into michael/dev`; it should write the task's title, like `Merge qf-5: bold the session title`. A small change, listed in [framework tasks](../tasks/readme.md).

## Is the pull-request rule on `main` worth it?

The owner turned it on as protection. What it actually does here:
- **It stops accidents:** an agent that forgot to branch and runs `git push origin main` is refused.
- **It doesn't stop a determined agent:** the agents push with the owner's own GitHub login, so GitHub can't tell them apart from him. An agent that can open a pull request can also merge it (0 approvals needed).
- **It costs a step,** and the GitHub pull-request screen was confusing to use.

The real protection is to **keep production off the branch everyone pushes to**. Then `main` can be pushed freely, and only one deliberate step makes anything live.

## Three ways to set it up

| | Branches | What goes live, and how | Cost |
|---|---|---|---|
| **A. Today** | worktree → `michael/dev` → `main` (pull request) | `main` is production: merging the pull request deploys | A middle branch, a pull request per promotion, `main` drifts (3 months now) |
| **B. Production branch** (recommended) | worktree → `main` → `production` | Cloudflare's production branch set to `production`. Going live = moving `production` up to a checked `main` commit: `git push origin main:production`, a fast-forward, never a merge, so never a conflict | One Cloudflare setting; the PC's checkout and `merge.mjs` switch from `michael/dev` to `main` (one scripted change); the pull-request rule moves from `main` to `production` or goes away |
| **C. Machine branches** | worktree → `compliance` → `main` → `production` | as B | Only worth it when two machines work for weeks in parallel |

In B, `main` is the newest code (what GitHub shows, what every worktree starts from), `main-monorepo.lew42.workers.dev` previews it, and `production` is only ever moved on the owner's word. Our own promote step refuses unless the owner said so (the same way a quick fix records the owner's ask), because GitHub can't make that distinction for us.

## Avoiding merge conflicts

A conflict happens only when two branches change the same lines. The habits that keep them rare, so the owner never has to resolve one:
- **Start every worktree from the newest `main`** and land it within hours, not weeks.
- **Pull before pushing:** today `merge.mjs` pushes after each landing but doesn't pull first, and a refused push only prints a warning (`Server/merge.mjs`, "KEEP GITHUB CURRENT"). It should merge the newest remote first and push again when refused; that's part of option B.
- **One agent per file at a time** (task fences), and big moves done by script in one commit.
- **Moving `production` is never a merge**, so it can't conflict.

When a conflict does happen, the agent that hit it resolves it and says what it kept.

## Capital letters

Windows treats `Markdown` and `markdown` as the same name; Cloudflare and Linux don't. Git on Windows usually doesn't notice a rename that only changes case if it was made in Explorer or an editor, so git keeps the old name and the deploy breaks. Rules:
- **Change a name's case only with `git mv old New`** (or the move script), never by renaming the file by hand.
- **`node Server/deploy-imports.test.mjs`** fails when an import's case differs from the file's name as git has it.

## Later: a production site that installs only what it needs

A future production site might not clone the whole monorepo with its history; it could install a release (a tag, or a package) of only the modules it uses. Then "what's live" is a tagged release rather than a branch. Not needed yet.

## Open decisions (the owner's)

- **A, B or C** (above). B is the recommendation; it replaces the `michael/dev` vs `compliance` question, because the PC would simply work on `main`.
- **Keep the pull-request rule on `main`?** In B it moves to `production`, or goes away.
- **When to first bring `main` up to `michael/dev`.** The live site hasn't changed since 2026-08-07. The `michael/dev` preview was loaded in a real browser on 2026-11-01 (12 pages render).
- **Delete the merged branches listed above**, and decide about `alex/update-working-dir` and `edric/new-page`.
- **How often to promote:** after each checked batch, and at least weekly, so `main` never drifts three months again.
