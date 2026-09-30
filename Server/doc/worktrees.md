# Worktrees

A worktree is a second checkout of this repo, in its own folder on its own branch, so an agent can
work without touching the main tree. Make one with `node Server/worktree-up.mjs <slug>` (or the
Servex `take_worktree` tool), and remove it with `node Server/worktree-down.mjs <slug>`. To clear out every finished one at once (branch merged, no live or queued agent there, only server logs changed): `node Server/worktree-prune.mjs --dry`, then without `--dry`.

## node_modules: never a junction

**The rule.** A worktree has its own real `node_modules`, installed by `npm ci`. It never has a
junction or symlink into the main checkout's `node_modules` (or into anything else in the main tree).

**Why.** Twice, deleting a worktree deleted the main tree's `node_modules` *through* such a link:

- **2026-09-22:** worktree-up.mjs itself made `node_modules` a junction. `git worktree remove`
  followed it, and 68 packages vanished from the main tree.
- **2026-09-29, 13:46:** an agent made the junctions by hand (`mklink /J`), then ran
  `git worktree remove --force` by hand. The main `node_modules` was emptied, and Servex
  crash-looped for an hour on `Cannot find package 'express'`
  ([the cause](/framework/ai/2026-09-29/node-modules-guard/cause/)).

Deleting a worktree, running `rm -r` on it, or running `npm ci` / `npm install` inside it all go
through a link as if it were a plain folder.

**What now refuses:**

| Guard | Where | What it refuses |
|---|---|---|
| Script guard | `Server/junction-guard.mjs`, called by worktree-up (before `npm ci`), worktree-down (before `git worktree remove`), worktree-sweep, Pool.js and merge.mjs (before a recursive delete) | Any of those, when the target folder holds a link into the main checkout. The message names each link. |
| Hook | `.claude/hooks/junction-guard.mjs`, a PreToolUse hook on Bash and PowerShell | A hand-typed delete or `npm` command while any worktree holds a link into main. It also blocks making a link (`mklink /J`, `New-Item -ItemType Junction`) into main, always. |
| Keeper | `Servex/sustain.mjs` via `Servex/ensure-deps.mjs` | Restarting Servex into a missing `express` or agent SDK. It runs `npm install` first, at most once per 10 minutes per folder. |
| Pool | `Servex/Pool.js` `reclaim()` | A full pool held by stopped agents. Their clean slots are handed back, so nobody has to hand-make a worktree. |

**If you are refused:** remove the link only, never its contents, then retry.
In PowerShell, run `(Get-Item <link>).Delete()`. In cmd, run `rmdir <link>` without `/s`.

**Check every worktree:** `node Server/junction-check.mjs` lists every link under
`C:/Code/lew42/worktrees` and `.claude/worktrees`, and exits 1 if any lands in the main checkout
(`--json` for JSON, `--deep` to also look inside real `node_modules`). worktree-up runs it and
prints a warning.

The proof of each guard, run on scratch copies: [guards/proof.md](/framework/ai/2026-09-29/node-modules-guard/guards/proof.md).

## Tell the worktree which task it is for

`node Server/worktree-up.mjs <slug> --task <task dir>` (or `LEW_TASK=<task dir>`) writes `worktree` into that task's `task.jsonl`. When the task lands, `Server/on-landing.mjs` uses it to stop the worktree's server. Without it, the landing matches the task's folder name or branch against `.worktrees.json`. Everything a worktree starts is also recorded in Servex's creation log: [Servex/doc/lifecycle.md](../../Servex/doc/lifecycle.md).

## A merge never rewrites a live log

An append-only `*.jsonl` (a `task.jsonl`, `cards.jsonl`) can gain a line while `merge.mjs` runs, for example the landing line of the task being merged. When the main tree has uncommitted edits, `merge.mjs` plans each file first and writes it afterwards. At write time it reads every `.jsonl` again and keeps any line that was appended in between, and it never deletes a live log. Proof: `node Server/jsonl-keep.mjs --proof`. Why: on 2026-09-29 a merge reset readme-chain's `task.jsonl` and lost its landing line.
