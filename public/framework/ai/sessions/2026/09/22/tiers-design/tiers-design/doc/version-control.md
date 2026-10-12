# Version control — where work happens, and who is allowed to commit

**The short version.** Small work happens in the main tree and is never committed by an agent.
Multi-file or risky work happens in a worktree the task mastermind created, on a branch of its
own, where that mastermind **may** commit. The main branch stays the owner's, always.

## Main tree or worktree — the rule in five lines

The main tree is `C:/Code/lew42/monorepo` on `michael/dev`, and it is the site the owner is
looking at right now.

1. **A single-page edit, a doc pass, a log append, a card, a brief** — main tree. Most minions
   never see a worktree.
2. **Multi-file work, anything that touches a shared module, anything risky** — a worktree.
3. **Two teams on one task, for comparison** — two worktrees, one each.
4. **A worktree is created by the task mastermind, never by a minion**, and every minion on that
   task gets the same one. Not every minion needs a worktree; every *team* does.
5. **A worktree lives outside the repo** — `C:/Code/lew42/wt-<slug>/`, a sibling directory. It is
   never a sub-directory of the checkout, because anything under `public/` is picked up by the dev
   server's file watcher and by the `directory.json` builder, and a second copy of the site would
   appear on the live site as pages.

`Server/worktree-up.mjs <slug>` already does the whole thing in one command: `git worktree add -b
worktree/<slug>` into a sibling dir, a free port found by binding to port 0, that worktree's own
`node server.js` started on it, a real HTTP 200 polled for before it claims success, and the
`{name, path, branch, port, pid}` recorded in `.worktrees.json` at the repo root.
`worktree-down.mjs <slug>` reverses it.

## What it actually costs — measured today

The sibling [`worktree-design`](../../worktree-design/) task measured this repo on this machine on
2026-09-22, and the numbers are much better than the previous estimate:

| | time | disk | files |
| --- | --- | --- | --- |
| full worktree | 3.1 s | 274 MB | 8,187 |
| sparse (`public/framework/ai` + `Server` + root) | 1.6 s | 159 MB | 3,002 |

The working tree is 826 MB but only 254 MB of it is tracked, and `git worktree add` copies tracked
files only — `public/notes/inbox` and the screenshot dirs are gitignored and no worktree ever sees
them. The 235 MB object store is **not** duplicated: a worktree's `.git` is a one-line text file
pointing back at the main one. Three parallel teams therefore cost about 0.8 GB, not the 2.4 GB
the earlier study implied. Take that task's rule where this one and it differ — it has the
measurements.

## Branch names

- `worktree/<slug>` — one team on one task. This is what `worktree-up.mjs` writes today, so it is
  what we keep.
- `worktree/<slug>-a`, `worktree/<slug>-b` — two teams on the same task.
- `worktree/<slug>` again, made fresh — where a judge cherry-picks the best of `-a` and `-b`.

## Who commits

**Today nobody does.** The owner commits, and that is a deliberate response to two days of loss: a
`git stash` in a shared tree took a sibling agent's uncommitted work with it, twice, and four
tasks spent a night rebuilding 1,389 files that were never actually gone.

**What changes: an agent may commit inside its own worktree branch, and nowhere else.** A worktree
branch is nobody's live tree. A commit there cannot reach the owner's site, is fully recoverable,
and is the only way a judge can compare two teams' work at all — you cannot diff two
uncommitted trees. The task mastermind commits; its minions do not.

**What stays exactly as it is.** No agent commits, merges, pushes, rebases or tags on
`michael/dev`. A task mastermind's landing hands the owner a **branch name and a one-line
diffstat**, not a merge. The owner decides when work becomes history.

## How a judge merges two teams

Two teams work `worktree/<slug>-a` and `worktree/<slug>-b`, each on its own dev server, each
committing as it goes. Then:

1. A **judge minion** (Opus) gets both branches read-only and the owner's own sentence. It never
   edits either.
2. It produces a **compare page**: what each team did, side by side, a picture of each, and a
   recommendation naming which half of each it would keep and why.
3. The **task mastermind** cherry-picks onto a fresh `worktree/<slug>`, boots that worktree's
   server, and loads every page the merge touched with zero failed requests.
4. It hands the owner one branch and the compare page.

**What is hard about it on this repo:** 81% of the tracked bytes are screenshots and generated
pages, so a plain `git diff` between two branches is almost entirely noise. The compare is scoped
to the files the two fences actually named — which both task logs already record, because the
PostToolUse hook writes a `file_touch` event for every write and edit.

## What a clean landing looks like, in git terms

1. Every `.js` the task wrote passes `node --check`, and every page it touched loads on the
   worktree's **own** server with zero failed requests. (Parsing is not booting, and a file that
   parses can still blank a page.)
2. The worktree branch has one commit per deliverable, each message naming that deliverable.
3. `git status` in the **main** tree shows nothing the task did not intend — for a worktree task,
   nothing at all.
4. `node Server/worktree-down.mjs <slug>` has stopped the server and removed the worktree, and
   `git worktree list` is back to what it was before.
5. The landing line names the branch, the commit count and the files.

## The never-list git has earned here

Each of these cost real work on a real day.

- **`git stash`** — it runs a `reset --hard` internally, so a stashed tree is indistinguishable
  from destructive loss in the reflog. ⚠ **A reverted working tree is a stash until `git stash
  list` says otherwise** — that check comes first, before `git fsck` and before reconstructing
  anything. Read a stash with `git show 'stash@{0}:<path>'`; never `pop`, `apply`, `drop` or
  `clear`.
- **`git checkout -- <file>`** — it does not restore a file to how you found it; it restores it to
  the last *commit*, throwing away every uncommitted append anyone made. It silently destroyed
  five days of shared samples in an attempt to undo one bad write, and the agent then reported the
  file "restored, confirmed clean" in good faith, because it looked clean. To undo your own write,
  restore from what you read before overwriting it, or say plainly that you cannot.
- **`git reset`** — the same shape, the same damage.
- **`git commit` / `push` / `rebase` on the main tree** — the tree is shared with agents in flight.
- **`git worktree remove --force`** on a tree you did not create — somebody else is working in it.
