# Git and deploying: how code gets from a worktree to the live site (proposal, 2026-11-01)

**In one line:** agents land their work on the PC's branch (`compliance`, today `michael/dev`), which is pushed to GitHub after every landing; it moves into `main` once it's checked; and the live site changes only on the owner's word.

Nothing here is settled; the open decisions are at the end. It comes from two of the owner's dictations of 2026-11-01 (cloud session `e3fd9043`), with every fact below checked that day. The older rules for people joining the repo are in the [root readme](../../../readme.md#new-dev-onboarding).

## Git in one minute (what a branch really is)

- **A branch is a label on one commit**: a tiny file holding one commit id. Each new commit on the branch moves the label forward.
- **A tag is a label that doesn't move** (moving one takes force). Projects use tags to mark releases, like `v1.2.0`.
- **A merge commit records its two parent commits, not their branch names.** The only trace of a branch's name is the text of the merge message.
- **Deleting a merged branch deletes only the label.** Every commit stays in history. Commits that were never merged anywhere are cleaned up by git after a while.
- **Reusing a deleted name is safe:** the new branch is just a new label.
- **Branches don't make the repo bigger;** files and their history do.
- **We merge, we don't squash:** a normal merge keeps every commit of the branch; a squash collapses them into one.

So a branch name helps while the work is open. What survives is the merge message, so it should say what the work was.

## How Cloudflare serves this site

- **The site is files, not code.** `wrangler.jsonc` has only an `assets` block: on each deploy, every file in `public/` (minus `.assetsignore`) is uploaded to Cloudflare's storage for Worker assets (not R2) and served from its edge. A request for a file never runs any Worker code, and those requests are free and unlimited. A Worker script could be added later for "magic routes"; there is none today.
- **Every deploy is a version.** Dashboard → Workers & Pages → `monorepo` → Deployments lists them. "Promote deployment" makes a chosen version live; a rollback picks an older one.
- **Workers Builds is the GitHub hookup.** A push to the *production branch* (a setting: Settings → Build → Branch control; it defaults to `main`) builds and deploys. A push to any other branch builds a *preview* (if "Enable Preview Builds" is on) at `<branch, / turned into ->-monorepo.lew42.workers.dev`, which is never live.
- **Deploy hooks:** a secret URL; a POST to it starts a build of one chosen branch. It's a "deploy button" a script can press.
- **Addresses:** there is no custom domain in `wrangler.jsonc`, so the live site is https://monorepo.lew42.workers.dev/. To serve `lew42.com` or `framework.lew42.com` from it, add it under the Worker's Settings → Domains & Routes (the domain has to be on Cloudflare). Then the `workers.dev` address can be switched off (`"workers_dev": false`), so the same site isn't online twice. Whether `lew42.com` is on Cloudflare today wasn't checked from here.

## Three ways to make something live

| | Going live | A last look before it's live | Notes |
|---|---|---|---|
| **1. `main` is live** (today) | Anything that lands on `main` deploys at once | Only a branch's own preview, before it merges | Simplest. The pull-request rule on `main` is the only brake |
| **2. A `production` branch** (recommended) | Set Cloudflare's production branch to `production`; going live = moving `production` up to `main`'s commit | `main`'s preview, `main-monorepo.lew42.workers.dev` (staging) | Cloudflare's normal git flow; works from a script; the branch records what's live |
| **3. A button** | Set the production branch to one nobody pushes; every `main` push makes a preview version; going live = "Promote deployment" on that version in the dashboard (or `wrangler versions deploy`) | the same preview | No extra branch, but git doesn't record what's live. Not tried yet: whether a version made by a preview build can be promoted |

**Is the `production` branch just a trigger?** Mostly, yes. Cloudflare needs something to start a deploy: a push to the production branch, a deploy hook, or a click in the dashboard. The branch adds two things a button doesn't: a record anyone can read of which commit is live (GitHub shows it), and an easy rollback (move it back, or use Cloudflare's rollback).

## `git push origin main:production`, explained

- It means "make GitHub's `production` label point at the commit my `main` points at." It's not a merge, and no files change.
- **It can't move `production` backward by accident:** GitHub refuses a push that isn't a step forward, unless it's forced.
- **The risk:** if my `main` is behind GitHub's `main`, `production` gets an older commit than meant. The safe form sends exactly GitHub's `main`: `git fetch origin`, then `git push origin origin/main:production`.
- **A promote script** would: fetch, check the `main` preview loads, require the owner's say-so (agents push with the owner's own GitHub login, so GitHub can't tell them apart), push, and log one line. It belongs beside `merge.mjs`, not as a second merge system.

## The PC's branch: `compliance` (the owner's leaning)

- **Why not work on `main` directly** (the owner's reasons, and they hold): `main` stays a clean copy of GitHub's `main`, so anyone's work can be pulled into it at any time without touching the branch the dev server is serving; and nothing reaches `main` before it's checked.
- **The flow:** a worktree branch → merged into `compliance` by `merge.mjs` (the dev server serves `compliance`; it's pushed to GitHub after each landing, as a backup) → when checked, merge GitHub's `main` into `compliance` first (the agent that did the work sorts out anything that clashes), then `git push origin compliance:main`, which is then a plain step forward.
- **A name can't be both a branch and a folder.** If `compliance` is a branch, `compliance/qf-5` can't exist (git refuses: "cannot lock ref"). That's why today's branch is `michael/dev`, not `michael`. So either the fix branches use another prefix (`fix/<slug>`, `qf/<n>`), or the PC's branch is `compliance/dev`.
- **Renaming `michael/dev`** touches `merge.mjs`, Servex, the docs and the PC's checkout, so it's one scripted change, done with the owner's go.

## Should every fix branch go to GitHub?

- **The time machine already exists without them.** Every commit can be browsed on GitHub as the whole repo stood at that moment (`github.com/lew42/monorepo/tree/<commit>`), and each merge commit lists the fix's own commits. A pushed branch only adds a name.
- **The cost:** a name exists once on GitHub, so hundreds of fix branches pile up in one long list and their names can't be reused unless the old one is deleted. GitHub's branch list is flat with a search box; it doesn't fold `/` into folders (some desktop git apps do).
- **Recommendation:** don't push fix branches. Give every merge a unique, descriptive message (`Merge fix/bold-title: bold the session title`). If a moment deserves a name later, a tag can mark it.
- **Quick-fix slots** (`worktree/qf-1`, `qf-2`, …) reuse their names on purpose: those worktrees are ready-made (`npm ci` already run), so a fix starts in seconds. Today `merge.mjs` writes `Merge branch 'worktree/qf-5' into michael/dev`; it should write the fix's title ([framework tasks](../tasks/readme.md)).

## GitHub's default branch

- It's what GitHub shows first (Settings → General → Default branch). Every other branch is still at `github.com/lew42/monorepo/tree/<branch>`, and the branch picker switches.
- `npm install` takes releases from the npm registry, not from GitHub's default branch. Libraries usually show their newest work on `main` and mark releases with tags.
- For this repo, `main` as the newest checked code is fine. A stable branch shown by default would matter once other people install releases of it.

## Avoiding merge conflicts

A conflict happens only when two branches change the same lines. The habits that keep them rare, so the owner never has to resolve one:
- **Start every worktree from the newest code** and land it within hours, not weeks.
- **Pull before pushing.** Today `merge.mjs` pushes after each landing but doesn't pull first, and a refused push only prints a warning (`Server/merge.mjs`, "KEEP GITHUB CURRENT"). It should merge GitHub's copy first and push again when refused.
- **One agent per file at a time** (task fences), and big moves done by script in one commit.
- **Going live never merges** (option 2 or 3), so it can't conflict.

When a conflict does happen, the agent that hit it resolves it and says what it kept.

## Capital letters

Windows treats `Markdown` and `markdown` as the same name; Cloudflare and Linux don't. Git on Windows usually misses a rename that only changes case if it was made in Explorer or an editor, so git keeps the old name and the deploy breaks.
- **Change a name's case only with `git mv old New`** (or the move script).
- **`node Server/deploy-imports.test.mjs`** fails when an import's case differs from the file's name as git has it.

## Where things stand (checked 2026-11-01)

- **`main` is live**, last updated 2026-08-07; `michael/dev` is about 7,800 commits ahead of it. A GitHub ruleset on `main`: no direct push, no force push, no deletion, changes only by pull request with **0 approvals** needed.
- **`michael/dev` is the PC's working branch** (the PC is named `compliance`). The dev server runs it; `Server/merge.mjs` lands every worktree into it and pushes it.
- **Worktree branches are local only** ([worktrees](../../../Server/doc/worktrees.md), [quick fix](../ai/quick-fix/readme.md)).
- **12 branches on GitHub.** Already fully inside `michael/dev`, so safe to delete: `alex/page-route`, `castin/framework`, `claude/oop-streaming-research`, `claude/replay-tests` (its old name), `claude/web-crawler-design-analysis-og8s3r`, `integration/data-shapes-2`, `michael/echo-wire-format-fix`. Not inside it: `alex/update-working-dir` (5 commits), `edric/new-page` (2), `research/persistence-sync` (8 snapshot commits of the research, replaced by `research/2026/10/29/persistence-sync/`; check, then delete).

## Later: a production site that installs only what it needs

A production site might not clone the whole monorepo with its history; it could install a release (a tag, or a package) of only the modules it uses. Then "what's live" is a tagged release. Not needed yet.

## Open decisions (the owner's)

- **How things go live:** option 1, 2 or 3, and which address is live (`monorepo.lew42.workers.dev` today; `lew42.com` or `framework.lew42.com` later).
- **The PC's branch:** rename `michael/dev` to `compliance` (fix branches then need another prefix) or `compliance/dev`, or keep it.
- **The pull-request rule on `main`:** it's the only brake in option 1; with option 2 or 3 the brake moves to going live, and the rule can go.
- **When to first bring `main` up to `michael/dev`.** The live site hasn't changed since 2026-08-07. The `michael/dev` preview loaded in a real browser on 2026-11-01 (12 pages).
- **Delete the merged branches** listed above, and decide about `alex/update-working-dir` and `edric/new-page`.
