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
  ([the cause](/framework/ai/sessions/2026/09/29/8e50318b-7bf9-4e51-bedd-b91580b96caa/node-modules-guard/cause/)).

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

The proof of each guard, run on scratch copies: [guards/proof.md](/framework/ai/sessions/2026/09/29/8e50318b-7bf9-4e51-bedd-b91580b96caa/node-modules-guard/guards/proof.md).

## Tell the worktree which task it is for

`node Server/worktree-up.mjs <slug> --task <task dir>` (or `LEW_TASK=<task dir>`) writes `worktree` into that task's `task.jsonl`. When the task lands, `Server/on-landing.mjs` uses it to stop the worktree's server. Without it, the landing matches the task's folder name or branch against `.worktrees.json`. Everything a worktree starts is also recorded in Servex's creation log: [Servex/doc/lifecycle.md](../../Servex/doc/lifecycle.md).

## A merge never rewrites a live log

An append-only `*.jsonl` (a `task.jsonl`, `cards.jsonl`) can gain a line while `merge.mjs` runs, for example the landing line of the task being merged. When the main tree has uncommitted edits, `merge.mjs` plans each file first and writes it afterwards. At write time it reads every `.jsonl` again and keeps any line that was appended in between, and it never deletes a live log. Proof: `node Server/jsonl-keep.mjs --proof`. Why: on 2026-09-29 a merge reset readme-chain's `task.jsonl` and lost its landing line.

## Clear out landed worktrees: `node Server/Worktrees.mjs`

`--plan` prints one line per worktree that is not a `qf-*` pool slot (the pool frees its own, see `Servex/doc/pool.md`): path, branch, commits ahead of `michael/dev`, whether `git diff michael/dev...<branch>` is empty, and uncommitted files counted as *regenerated* (`files.jsonl`, `index.json`, `cache.jsonl`, `*.png`, `shots/`, `layout-check/`) or *real*.

- **REMOVE:** its work is on `michael/dev` (nothing ahead, an empty diff, or the same file contents there, the test `Pool.landed()` uses) and nothing *real* is uncommitted.
- **KEEP:** unmerged commits, a real uncommitted file, a live agent in it, a lock, a detached head with commits, or Servex not answering. The line names the branch so a person can look.
- **`--apply`** runs `git worktree remove` on each REMOVE (`--force` only when every uncommitted file is regenerated, and the line says so), then `git worktree prune`. It never touches a KEEP and never deletes a branch.
- **Manifest:** each removal is one line in `public/framework/ai/sessions/worktree-removals.jsonl` (`path`, `branch`, `sha`, `at`, `why`, `restore`).
- **Recreate one:** `git worktree add <path> <branch>` (or `git worktree add --detach <path> <sha>`); the `restore` field holds the exact command. Test: `node Server/Worktrees.test.mjs`.

## Worktrees close with their task (2026-10-22)

A worktree is never left to pile up (8.4 GB of 36 folders by 2026-10-22). Closing a worktree means: its leftover files are committed to its own branch, the folder is removed, the branch is kept. Nothing is deleted; `restore` in the manifest brings the folder back.

| When | Who | What happens |
|---|---|---|
| a task lands | `Server/on-landing.mjs` (`worktree-close:` line in the task log) | an **unmerged** branch is kept for review (`Worktrees.on_landing()`); otherwise `node Server/Worktrees.mjs --apply --archive --now --path <worktree>`. A live agent still inside keeps it for now. |
| every 10 min | `Servex/Worktrees.js` `tick()` | closes a worktree whose task landed, once its branch is merged; an unmerged one waits for the merge, or 48 quiet hours (`SERVEX_WORKTREE_CLOSE_HOURS`), the backstop for any worktree |
| by hand | `node Server/Worktrees.mjs --apply --archive` | same, for every worktree quiet for 2 hours (48 for an unmerged branch) |

**Hold until merge (2026-10-28):** a landed task's unmerged worktree stays so the owner can look before merging, and a task that asks for a preview gets its server on the home Wi-Fi with a phone link: [Servex/doc/worktree-preview.md](../../Servex/doc/worktree-preview.md).
| a crashed `git worktree add` | `Servex/Pool.js` `unlock_crashed()` | a pool slot stuck "locked initializing" for 15 minutes is unlocked, so the pool can recycle it (it blocked qf-1 and qf-5 for 10 days, so spawns failed "No pool worktree is ready") |

**Unmerged commits** (and the leftover commit itself) become one line in `public/framework/ai/sessions/ready-to-merge.jsonl` (`branch`, `sha`, `unmerged`, `leftover_files`), the list the owner merges from ([priority.md](/framework/ai/priority.md) 3b). Every close is also one line in `worktree-removals.jsonl` with `committed` and `unmerged`.

**Never closed:** a pool slot (`qf-*`, the pool frees its own), a locked worktree, one with a live agent, one touched in the last 2 hours (git, or any changed file). Folders git no longer lists as worktrees: `node Server/worktree-leftovers.mjs --apply` (removes only those whose every file is already in git).
