# Git and deploying: how code gets from a worktree to production

**Decided in principle (the owner, 2026-11-01):** the PC's work lands on its own branch (`compliance/dev`, today `michael/dev`), which goes into `main`. `main` is staging: anyone may push to it, and its address shows the newest checked code. A separate `production` branch is what the public site (`lew42.com`) serves, and it moves up to `main` only when the owner says so.

Words used here: **production** is the public site (`lew42.com`, later). **Staging** is `main`'s address. **Preview** is any other branch's address. Only production is "live" for visitors. This comes from two of the owner's dictations on 2026-11-01 (cloud session `e3fd9043`), with every fact checked that day. Nothing is built yet: the steps are at the end. The older rules for people joining the repo are in the [root readme](../../../readme.md#new-dev-onboarding).

## The branches

| Branch | What it is | Who moves it |
|---|---|---|
| `compliance/dev` (today `michael/dev`) | The PC's long-lived branch, named after the machine (why not plain `compliance`: below). The dev server serves it; `merge.mjs` lands every worktree into it and pushes it to GitHub as a backup. | `merge.mjs`, after each landing |
| `main` | Staging, and GitHub's default branch. The newest checked code. Pushed to directly: no pull request. | Any agent, once the work is checked |
| `production` | What the public site serves. Lives only on GitHub; nobody needs a local copy. | Only on the owner's word |
| worktree branches (`worktree/qf-5`, task worktrees) | One per fix or task, local, merged into `compliance` | `merge.mjs` |

**After every push to `main`**, the push step also brings the PC's local `main` up to GitHub's (a fast-forward), so it never falls behind.

## Git in one minute (what a branch really is)

- **A branch is a label on one commit**: a tiny file holding one commit id. Each new commit on the branch moves the label forward.
- **A tag is a label that doesn't move** (moving one takes force). Projects use tags to mark releases, like `v1.2.0`. GitHub lists them under Tags and Releases.
- **A merge commit has two parents:** the branch it landed on, and the last commit of the branch that was merged. Following that second parent walks back through every commit of the merged branch. It records commit ids, not branch names; the only trace of a name is the merge message's text.
- **Deleting a merged branch deletes only the label.** Every commit stays in history. Commits that were never merged anywhere are cleaned up by git after a while.
- **Reusing a deleted name is safe:** the new branch is just a new label.
- **Branches don't make the repo bigger;** files and their history do.
- **We merge, we don't squash:** a normal merge keeps every commit of the branch; a squash collapses them into one.

**The `/` in a branch name is a real folder, not just a GitHub convention.** Git keeps each branch as a small file inside `.git/refs/heads/`: branch `main` is the file `.git/refs/heads/main`, and branch `compliance/fix` is the file `fix` inside a folder `.git/refs/heads/compliance/`. (Git sometimes packs them all into one file, but it keeps the same rule.)
- **What you can lean on:** grouping, and commands that take a pattern: `git branch --list 'fix/*'` lists them, `git push origin 'refs/heads/fix/*'` pushes the group, and some desktop git apps show the folders. GitHub's branch list doesn't fold them; it's a flat list with a search box.
- **The one limit:** a name can't be both a branch and a folder. If branch `compliance` exists, `compliance/fix` would need a folder with the same name as that file, so git refuses (checked with git 2.43: `cannot lock ref 'refs/heads/compliance/fix': 'refs/heads/compliance' exists`). Names that only share a beginning are fine: `compliance/dev` and `compliance/dev-1` live side by side.
- **So, two shapes:** `compliance/dev` for the PC's long-lived branch with fixes as `compliance/<slug>` (today's `michael/dev` shape), or `dev` with fixes as `fix/<slug>`.

## How Cloudflare serves this site

- **The site is files, not code.** `wrangler.jsonc` has only an `assets` block. On each deploy, every file in `public/` (minus `.assetsignore`) is uploaded to Cloudflare's storage for Worker assets and served from its edge. Cloudflare says requests to these files are free and unlimited, and they never run Worker code. It doesn't say what the storage is built on (R2 may well be underneath). What matters for us: **these files are read-only between deploys**, and a version holds at most 20,000 files on the free plan (we upload about 11,400).
- **Every deploy is a version.** Dashboard → Workers & Pages → `monorepo` → Deployments lists them; "Promote deployment" serves a chosen one; a rollback picks an older one.
- **Workers Builds is the GitHub hookup.** A push to the Worker's *production branch* (a setting: Settings → Build → Branch control; it defaults to `main`) builds and deploys to the Worker's own addresses. A push to any other branch builds a *preview* at `<branch>-monorepo.lew42.workers.dev`.
- **Why hyphens, not dots, in preview addresses:** a security certificate for `*.lew42.workers.dev` covers exactly one level of name. `main.monorepo.lew42.workers.dev` would be two levels and need its own certificate, so Cloudflare joins the names with a hyphen.
- **A deploy hook** is a secret address on Cloudflare's API, not a Worker. Sending a POST to it starts a build of one chosen branch: a "deploy button" a script can press.
- **A custom domain** (`lew42.com`, `framework.lew42.com`) is added under the Worker's Settings → Domains & Routes; the domain has to be on Cloudflare (`lew42.com` is: it already carries a tunnel subdomain). Cloudflare then answers that domain with the Worker. Check first what serves `lew42.com` today; the owner thinks it's a separate repo. Afterwards the `workers.dev` address can be switched off (`"workers_dev": false`) so the site isn't online twice.

## Staging at `monorepo.lew42.workers.dev`: one Worker or two

In plain terms: one Worker has exactly one "production" slot. Its own address (`monorepo.lew42.workers.dev`) and any domain attached to it (`lew42.com`) always show what's in that slot, and the slot is filled from one branch, the production-branch setting. Every other branch only gets a `<branch>-monorepo` preview address. Today the slot is fed by `main`, which is why `monorepo.lew42.workers.dev` shows `main`. So:

- **One Worker:** set its production branch to `production`. Then `lew42.com` *and* `monorepo.lew42.workers.dev` are production, and staging moves to `main-monorepo.lew42.workers.dev`.
- **Two Workers on the same repo** (keeps the clean staging address, which the owner prefers): `monorepo` keeps `main` as its production branch, so `monorepo.lew42.workers.dev` is staging; a second Worker (say `lew42`) has `production` as its production branch and owns `lew42.com`. Not tried yet: the second Worker's build has to deploy under its own name (for example a deploy command of `npx wrangler deploy --name lew42`), because `wrangler.jsonc` names `monorepo`.

Either way, nothing changes until a custom domain is added: today only `monorepo.lew42.workers.dev` exists, and it follows `main`.

## The PC's routine: work on a dev branch, never check out `main`

The owner's worry (2026-11-01): if the PC works directly on `main`, a pull can land on top of its own unpushed merges and conflict, and `main` is no longer a clean copy of GitHub's. Answer: the PC never checks out `main` at all.
1. **Work lands on the PC's dev branch** (`compliance/dev`, today `michael/dev`), through `merge.mjs`, and is pushed to GitHub as that branch after each landing, as a backup.
2. **To publish to `main`,** on the dev branch: `git fetch origin`, then `git merge origin/main` (any conflict happens here, on the branch where the work is, and the agent that did the work resolves it), then `git push origin HEAD:main`. That last push is a plain step forward, because the dev branch now contains all of GitHub's `main`.
3. **If GitHub refuses the push** (someone published in between), repeat step 2.
4. **The local `main` label** can be moved up without switching to it: `git fetch origin main:main`. Nothing needs it, though.

Rules: always commit (never stash); never commit on `main` locally; never force-push `main`; `production` moves only on the owner's word.

## Moving `production`, and moving it back

- **The command:** `git fetch origin`, then `git push origin origin/main:production`. Read it as `git push <to GitHub> <this commit>:<that branch>`: "set GitHub's `production` to the commit GitHub's `main` is at." `origin/main` is my copy of GitHub's `main`, refreshed by the fetch. It's not a merge; no files change anywhere.
- **Why not `main:production`:** that sends *my local* `main`. If it's behind GitHub's, production gets an older commit than meant. `origin/main` avoids that.
- **GitHub refuses to move a branch backward** unless the push is forced. A forward move is always safe.
- **Rolling back** means forcing `production` to an older commit, or using Cloudflare's rollback. Either way the site then serves exactly that commit's files: files added since disappear, files deleted since come back. Git does the same to tracked files when you check out an older commit, and leaves untracked files alone. **Data written while the site runs is not in git and is not rolled back**; if its shape changed, old code meets new data. That's the database-migration problem, and the reason to keep data formats backward-compatible (append-only JSONL helps: old code can skip lines it doesn't know).
- **A promote step** (beside `merge.mjs`, not a second merge system) would fetch, check staging loads, require the owner's say-so, push, and log one line. GitHub can't tell agents from the owner (they push with his login), so the say-so check is ours.

## The pull-request rule on `main` goes

The ruleset on `main` today (GitHub → Settings → Rules → "Rule 1") blocks direct pushes and requires a pull request with 0 approvals. With `main` as staging, the rule only adds a step (an agent can open and merge its own pull request anyway). **Plan:** drop "Require a pull request"; keep "Block force pushes" and "Restrict deletions". Safe as soon as nothing public serves `main` (true today: only `monorepo.lew42.workers.dev` follows it).

## Fix branches on GitHub: an open choice

- **Keep them local** (today): GitHub stays tidy. Every commit can still be browsed as the whole repo stood then (`github.com/lew42/monorepo/tree/<commit>`), and each merge commit leads to the fix's commits; a clear merge message (`Merge fix/bold-title: bold the session title`) is how you find them.
- **Push them too** (the owner's leaning, 2026-11-01): each fix is findable by name in GitHub's branch list, which is how people usually navigate. The cost: GitHub's branch list is flat (it doesn't fold `/` into folders), so hundreds of fix branches become noise nobody can read, and a name can't be reused until the old one is deleted.
- **Tags for the milestones:** a tag on the merge commit of a major piece of work gives it a lasting name without a branch.
- **Quick-fix slots** (`worktree/qf-1`, `qf-2`, …) reuse their names on purpose: those worktrees are ready-made (`npm ci` already run), so a fix starts in seconds. To push them, each needs a unique name first (`fix/<slug>`).

## GitHub's default branch

It's what GitHub shows first (Settings → General → Default branch); every other branch is at `github.com/lew42/monorepo/tree/<branch>`. `npm install` takes releases from the npm registry, not from GitHub. Libraries usually show their newest work on `main` and mark releases with tags. Here `main` (staging) is the default.

## Avoiding merge conflicts

A conflict happens only when two branches change the same lines. Habits that keep them rare, so the owner never resolves one:
- **Start every worktree from the newest code** and land it within hours, not weeks.
- **Pull before pushing.** Today `merge.mjs` pushes after each landing but doesn't pull first, and a refused push only prints a warning (`Server/merge.mjs`, "KEEP GITHUB CURRENT"). It should merge GitHub's copy first and push again when refused.
- **The one who made the changes merges them**, because they know what they did: the agent bringing `compliance` into `main` first merges GitHub's `main` into `compliance`.
- **One agent per file at a time** (task fences), and big moves done by script in one commit.
- **Moving `production` never merges**, so it can't conflict.

## Capital letters

Windows treats `Markdown` and `markdown` as the same name; Cloudflare and Linux don't. Git on Windows usually misses a rename that only changes case if it was made in Explorer or an editor, so git keeps the old name and the deploy breaks.
- **Change a name's case only with `git mv old New`** (or the move script).
- **`node Server/deploy-imports.test.mjs`** fails when an import's case differs from the file's name as git has it.

## Writing files while the site runs: not now

Today the site only reads files; every change goes through git. Writing at runtime (appending JSONL, uploading images into the site's folders) would need a Worker script and storage like R2, and raises git sync, per-environment separation and the fact that R2 objects can't be appended to. Recorded with the hosting ideas: [research/…/ideas/hosting-tunnels-and-cloud-files.md](../research/2026/10/29/persistence-sync/ideas/hosting-tunnels-and-cloud-files.md#writing-files-on-the-hosted-site-the-owner-2026-11-01).

## Where things stand (checked 2026-11-01)

- **`main` was last updated 2026-08-07;** `michael/dev` is about 7,800 commits ahead. `monorepo.lew42.workers.dev` follows `main`; no custom domain is attached.
- **`michael/dev` is the PC's working branch** (the PC is named `compliance`). Worktree branches are local only ([worktrees](../../../Server/doc/worktrees.md), [quick fix](../ai/quick-fix/readme.md)).
- **12 branches on GitHub.** Already fully inside `michael/dev`, so safe to delete: `alex/page-route`, `castin/framework`, `claude/oop-streaming-research`, `claude/replay-tests` (its old name), `claude/web-crawler-design-analysis-og8s3r`, `integration/data-shapes-2`, `michael/echo-wire-format-fix`. Not inside it: `alex/update-working-dir` (5 commits), `edric/new-page` (2), `research/persistence-sync` (8 snapshot commits of the research, replaced by `research/2026/10/29/persistence-sync/`; check, then delete).

## Steps, in order (none done yet)

1. **Drop the pull-request rule on `main`** (keep no-force-push and no-deletion). A 30-second change in GitHub's settings, or an agent with the owner's go.
2. **Bring `main` up to `michael/dev`** (`git push origin michael/dev:main`, a step forward). Staging then shows today's code; it hasn't moved since 2026-08-07.
3. **`merge.mjs`:** pull before push; after a push to `main`, fast-forward the local `main`; name the work in the merge message.
4. **Rename `michael/dev` → `compliance`** (or `compliance/dev`, if fixes will be `compliance/<slug>`): one scripted change to `merge.mjs`, Servex, the docs and the PC's checkout.
5. **When `lew42.com` should serve this repo:** create `production` at `main`, pick one Worker or two (above), attach the domain, and add the promote step.
6. **Decide about fix branches on GitHub**, and delete the merged branches listed above.
