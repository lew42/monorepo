# What emptied node_modules at 13:46: `git worktree remove --force` went through a junction

**Proven, not ranked.** At **13:46:47** the `servex-docs-tab` task mastermind (Claude session
`6ba7761f-91ad-4c62-a59e-9f66a03a6138`) cleaned up its worktree with this command:

```
cd C:/Code/lew42/monorepo && git merge --no-edit worktree/servex-docs-tab 2>&1 | tail -10 && git worktree remove ../worktrees/servex-docs-tab --force 2>&1 && git branch -d worktree/servex-docs-tab 2>&1
```

That worktree's `node_modules` and `Servex/node_modules` were **junctions into the main tree**,
hand-made 21 minutes earlier with `cmd /c mklink /J`.

Git for Windows (2.47.1) deletes a worktree folder by folder. Instead of unlinking the junctions,
it went *into* them and emptied the main tree's `node_modules`. It then stopped partway through
`Servex/node_modules`: `error: failed to delete 'C:/Code/lew42/worktrees/servex-docs-tab': Invalid argument`,
most likely on a locked `claude.exe`.

Nothing broke right away, because the running Servex already had `express` loaded in memory.
The crash loop began at **13:53:25**, when another session (`7eedf4fd…`, chip-context-fix)
called `restart_servex`. The new Servex process could not find `express`.

None of the five old junction worktrees in the brief did this. Neither did worktree-up, Pool.js,
merge.mjs, ExitWorktree or npm. The junction was made by hand, outside every script. So the
guard has to check at deletion time. Checking only when a worktree is created would not have
caught this one.

## Timeline

| time (09-29) | what | source |
|---|---|---|
| 13:24:53 | `take_worktree` refuses: all 3 pool worktrees are taken | transcript `6ba7761f…jsonl` |
| 13:24:59 | the agent skips `worktree-up.mjs` ("starts node server.js, isn't what I need") and runs `git worktree add` by hand | same |
| 13:25:03 | `git worktree add -b worktree/servex-docs-tab ../worktrees/servex-docs-tab HEAD` | same |
| 13:25:17 | `cmd /c mklink /J …\servex-docs-tab\Servex\node_modules` → `…\monorepo\Servex\node_modules` | same (result: "Junction created") |
| 13:25:21 | `cmd /c mklink /J …\servex-docs-tab\node_modules` → `…\monorepo\node_modules` | same |
| 13:40:00 | first merge of worktree/servex-docs-tab into michael/dev | `git reflog michael/dev` |
| 13:40:20 | Servex restart (still healthy: node_modules intact) | `%LOCALAPPDATA%\lew42\servex\restart-1790707218131.log` |
| **13:46:47** | **`git worktree remove ../worktrees/servex-docs-tab --force`**, exit 255, `failed to delete … Invalid argument` | transcript + `git reflog`: `66050a2d michael/dev@{2026-09-29 13:46:47}` |
| 13:46:52 | `cmd /c rmdir` on both junctions, too late: "The system cannot find the file specified" | transcript |
| 13:46:56 | leftovers in the worktree dir are `Servex`, `Users…png`, `worker`, `wrangler*`, everything that sorts after `Servex`. The delete ran in name order and died inside `Servex/` | transcript `ls` result |
| 13:47:00 | `rm -rf` of the leftover dir: "Device or resource busy" | transcript |
| 13:52:56 | chip-context-fix's junction removed **safely** with `rmdir`; `monorepo\Servex\node_modules\express`… Test-Path True (wrong dir, express lives at the root) | transcript `7eedf4fd…jsonl` |
| 13:53:23 | `restart_servex` by session 7eedf4fd, after its chip-fix merge | transcript; `restart-1790708003709.log` "18:53:25 sustain: restart asked for" |
| 13:53 → 15:02 | Servex crash-loops: "Cannot find package 'express'", then the agent SDK | brief |
| 14:59:18 | root `node_modules` restored (every child dated 14:59:18) | mtimes |
| 15:01:27–29 | `Servex/node_modules` repaired: only `.bin`, `.package-lock.json`, `@anthropic-ai/claude-agent-sdk`, `@anthropic-ai/sdk` and `which` are new. The rest still date from 09-22 14:53, so the damage there was partial | mtimes |
| ~15:20 | five old junctions unlinked by mastermind-servex-4 | brief |

## The suspects from the brief, closed

- Five old junction worktrees (live-card-wide, live-preview, live-reply, servex-crash, servex-monitor): **0.02.** No command touched them 13:25–13:56 in any transcript.
- chip-context-fix / ExitWorktree: **0.01.** Its junction was unlinked with `rmdir`, not followed. ExitWorktree then refused ("No-op"), and the `git worktree remove` at 13:53:08 ran after the junction was gone.
- worktree-up / npm ci / npm install: **0.01.** The only npm call nearby was `npm install` in `worktrees/prompt-refine/Servex` at 13:37:31. That tree had no junction, and the main tree was still healthy at 13:40.
- Pool.js, merge.mjs, check-consensus, recursive-pairs: **0.01.** They show up nowhere in the command stream.
- Six Servex/node_modules junctions found at 16:27 (assistant-layers, concurrency, helper-fixes, servex-crash, servex-monitor, task-loop): **0.03** for the Servex damage.
  - No transcript from 12:00–15:00 shows npm, rm, rmdir, Remove-Item or `worktree remove` aimed at any of their `node_modules`. Their only delete anywhere was a doc folder (task-loop, 13:26:06).
  - The Servex damage matches the 13:46:47 delete instead: git reached `Servex/` last and died there, so only the first entries in name order are missing.
  - These six were a loaded gun, not the shot.
- **Hand-run `git worktree remove --force` through a hand-made junction: 0.95** (the 0.05 is only that git's own error log does not name the file it followed into).

## What the guards need (for the parent)

1. Any worktree deletion, including a raw `git worktree remove`, must first unlink every reparse point inside the tree with `rmdir` / `fs.rmdirSync`. Guard 1 in the scripts covers the scripted route. The hand route needs its own guard, a line in the `minion` skill's never-list, or both. "Never `git worktree remove` a tree with a junction in it; run `node Server/junction-check.mjs` first."
2. Agents make junctions by hand when `take_worktree` has none free. A better answer from the pool, a shared node_modules via `NODE_PATH`-free resolution, or a sanctioned `worktree-up --no-server`, would take away the reason to do it.
3. The crash surfaced 7 minutes after the damage, on the next restart. `sustain.mjs --restart` running Guard 2's resolve check *before* it kills the healthy Servex would have refused the restart.

Sources: `C:\Users\mike\.claude\projects\c--Code-lew42-monorepo\6ba7761f-91ad-4c62-a59e-9f66a03a6138.jsonl` (13:24–13:47) and `…\7eedf4fd-044f-49b9-ae35-8ed667240d78.jsonl` (13:52–13:54). Extracted with the scratch scripts `scan.mjs` / `session.mjs` in this session's scratchpad.

