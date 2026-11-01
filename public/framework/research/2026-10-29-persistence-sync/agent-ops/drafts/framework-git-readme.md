# git: branches, landing, staying current

How every agent and person works with git in this repo, on any machine. AGENTS.md has the one-line version of each rule; this page has the why and the how.

Home: `public/framework/git/readme.md`. Linked from the root `readme.md`, the framework index and AGENTS.md.

## The rules

1. **One trunk: `michael/dev`.** It is written only on the owner's PC: by `node Server/merge.mjs <worktree>` (which pushes it after each landing) and by the log sweeper.
2. **Push only your own branch.** From a cloud session or any other machine, never push `michael/dev` or `main`.
3. **`main` is production.** Cloudflare deploys it. Only the owner updates it, by a pull request from `michael/dev`.
4. **One worktree per agent, one branch per worktree.** Never edit code in the shared main tree.
5. **Fetch often, merge rarely, never automatically.** Servex fetches for everyone and tells you when the trunk moved. You integrate at a safe point.
6. **Rebase your own branch; never rewrite a shared one.** `git rebase michael/dev` on your branch is fine. Never force-push `michael/dev` or `main`.
7. **Test first.** For a fix or a behaviour change: commit the failing test, then the fix, as two commits. Don't squash them.
8. **Small commits that each pass.**
9. **Land with `merge.mjs` only.** It locks, reviews, smoke-tests and writes the merge without `git merge`.

## Branch names

| Who | Branch |
|---|---|
| Trunk | `michael/dev` |
| Production | `main` |
| A local Servex agent | `worktree/<slug>` (made by `node Server/worktree-up.mjs <slug>`) |
| A quick-fix pool slot | `worktree/qf-<n>` |
| A cloud session | `claude/<slug>-<id>` (the harness picks it) |
| Another tool or model | `<tool>/<slug>`, e.g. `codex/readme-audit` |
| Several builds tested together | `integration/<name>` |
| A person | `<name>/<slug>`, e.g. `alex/page-route` |

Cloudflare turns `/` into `-` for preview URLs (`alex-page-route-monorepo.lew42.workers.dev`), so keep slugs short.

## A safe point to integrate

When Servex says "michael/dev moved", finish your current step first. Then:

1. Commit what works.
2. `git rebase michael/dev` (on the PC) or `git fetch && git rebase origin/michael/dev` (elsewhere).
3. Re-run your tests.

Before landing, do it once more. Never pull or merge into a tree someone else is working in: the shared main tree is protected by `.claude/hooks/git-guard.mjs` for that reason.

## How you hear about pushes

Nothing merges into your tree by itself. Merging under a working agent makes its view of the files stale and can lose uncommitted work (this repo lost record lines that way on 2026-10-13).

- **On the PC, `git status` shows it.** Each worktree's branch tracks the local `michael/dev`, so `git status -sb` prints `[behind N]` the moment a landing moves the trunk.
- **Servex `GitSync`** fetches `origin` when GitHub sends a push webhook (to `servex.lew42.com/hooks/github`, through the Cloudflare tunnel), every 2 minutes as a backstop, and at boot. It writes each worktree's ahead and behind counts to its state, and sends one `updates` line to each agent in a worktree that fell behind. It never touches a working tree.
- **A cloud session** runs `git fetch` in its SessionStart hook and prints how far behind `origin/michael/dev` it is. Fetch again before your final push.

## Landing work from elsewhere

A branch pushed from a cloud session or another machine lands on the PC like any other:

1. Servex lists it on the Merge page as a new branch.
2. `node Server/worktree-up.mjs <slug> --from origin/<branch>`.
3. Review, then `node Server/merge.mjs <that worktree>`.

## A new machine

1. `git clone https://github.com/lew42/monorepo`, then `git switch michael/dev`.
2. `npm ci` at the root and in `Servex/`.
3. `node Server/git-hooks/install.mjs` (the post-commit hook).
4. `git config remote.pushDefault origin`, `git config push.default current`, `git config fetch.prune true`.
5. Claude Code 2.1.277 or later. Check `/context` lists `CLAUDE.md` and `AGENTS.md` under Memory files.
6. On Windows, for Servex: `node Servex/sustain.mjs`, then open `http://monorepo.localhost/`.
7. Landing machine only, the webhook: install `cloudflared`; a Cloudflare token with Tunnel Edit and DNS Edit in `cloudflare.env`; `node Server/TunnelNamed.mjs setup`, then `node Server/Tunnel.mjs down` and `up`; a GitHub webhook (event `push`, URL `https://servex.lew42.com/hooks/github`) whose secret is saved in `%LOCALAPPDATA%\lew42\servex\`. Secrets never go in git. Other machines skip this; Servex polls there.
8. No Servex (not Windows, or a cloud VM)? Then no voice, no Servex tools, no `*.localhost`. Work on your branch and push it.
9. Run `node Server/portability-check.mjs` and fix what it lists.

## What ties the repo to the owner's PC

- Paths under `C:/Code/lew42/` in Servex and some Server scripts.
- Windows process tools (`powershell.exe`, `Get-CimInstance`) in Servex.
- `.mcp.json` points at `servex.localhost` and `monorepo.localhost`.
- Voice, Whisper and Dictate need the local Whisper server.
- Per-machine state in `%LOCALAPPDATA%\lew42\servex\` and `~/.claude/projects/`.

## Files

- `Server/merge.mjs`: the one way to land.
- `Server/worktree-up.mjs`, `worktree-down.mjs`: make and remove a worktree.
- `Servex/Pool.js`: the quick-fix worktree pool.
- `Servex/Worktrees.js`: cleans up finished worktrees.
- `Servex/GitSync.js`: fetches and tells agents (planned).
- `.claude/hooks/git-guard.mjs`: blocks risky git in the shared main tree.
- `Server/git-hooks/`: the shared post-commit hook.
