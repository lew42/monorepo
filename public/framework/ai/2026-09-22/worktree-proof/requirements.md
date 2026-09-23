# worktree-proof — one real task, in one worktree, reachable through the proxy, then removed

Minion: Sonnet, effort high. Session id `9a6277ea-2fc0-4e78-ba3d-34df662d8e70`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then phase-2 item
**7** in [`../tiers-design/doc/phases.md`](../tiers-design/doc/phases.md) and the rule on
[`../worktree-design/`](../worktree-design/)'s page. Load the `code` skill.

## What exists

`Server/worktree-up.mjs <name>` (fixed today by `server-fixes`: `npm ci` instead of a
junction, its log outside the worktree) makes `C:/Code/lew42/worktrees/<name>/` on branch
`worktree/<name>` and boots a dev server on a free port; `worktree-down.mjs <name>` removes
all of it. Servex is RUNNING (proxy `http://<name>.localhost:8080/`, registry at
`%LOCALAPPDATA%/lew42/servex/ports.json`; `Servex/readme.md`) — it scans `C:/Code` for
projects, so a worktree under `C:/Code/lew42/worktrees/` is not a project it knows yet.

## Deliverables — a proof, with the numbers

1. **`node Server/worktree-up.mjs proof-1`** — log the wall time and the size on disk of the
   worktree (`du -sh`, or PowerShell `Measure-Object` over the tree); compare to
   worktree-design's 3.1 s / 274 MB.
2. **Through the proxy.** Make the worktree's dev server reachable at
   `http://proof-1.localhost:8080/framework/` — the smallest change that does it: either
   `worktree-up.mjs` registers the worktree with Servex (`POST` to a route you add? no — Servex
   is not your fence; read `Servex/readme.md` for `append_log`/`list_servers` and whether the
   registry file or an existing route can take a name→port entry; if nothing can, log exactly
   what Servex needs — one route, one line — as a `log` line and prove the direct port instead).
   Prove with a curl and a headless load, zero console errors.
3. **A real task inside it.** In the worktree, on its branch: fix the days-view follow-up the
   mastermind logged — the row headline should lead with the task's name (bold slug, then the
   sentence), and the "working" rows must not render as links — in
   `public/framework/ai/v/3/timeline.js`/`page.js`/`v3.css` (read the `days-view` task first).
   Prove it headless on the worktree's own server at 1280 and 400, shot into your task dir
   (`shots/` in the MAIN tree, not the worktree). Commit it **inside the worktree only**
   (`git -C C:/Code/lew42/worktrees/proof-1 commit -am "Days rows lead with the task name"`)
   — the version-control doc allows an agent to commit on its own worktree branch and nowhere
   else. Never commit, stash or reset in the main tree.
4. **Bring it home the way the design says.** Log a `decision`: cherry-pick the one commit
   onto the main tree's working files WITHOUT committing there (`git cherry-pick -n <sha>` in
   the main tree, behind the reload hold, then headless-load `/framework/ai/v/3/?view=days`
   on your private server **8099** to prove it), or copy the files — say why. The main tree
   stays uncommitted, as it always is.
5. **`node Server/worktree-down.mjs proof-1`** — prove `git worktree list` is one entry, the
   branch is gone (or say why it should stay), the directory is gone, the registry entry is
   gone. Log the total elapsed for the whole cycle.
6. **The page — `ai/2026-09-22/worktree-proof/page.js`:** one screen — the six numbers (up
   time, size, proxy reachable yes/no, task proven, cherry-pick proven, down time), the two
   shots, and one paragraph on what a task mastermind will do by hand vs what should be one
   command. Link it from `ai/2026-09-22/page.js` `children:`.

## Fence

Your task dir; `ai/2026-09-22/page.js` `children:`; inside the WORKTREE, `public/framework/ai/v/3/**`;
in the main tree, only the cherry-pick of those same v/3 files (behind the hold). Nothing under
`Servex/` or `Server/`. Append-only to `.jsonl`.

## Length

Landing report: eight sentences with the six numbers.
