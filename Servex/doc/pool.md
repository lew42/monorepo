# The worktree pool

**A quick fix goes into a worktree that is already warm.** Servex always keeps
one worktree ready. It is branched from `michael/dev`, its own dev server is
answering, a page watcher is on, and git knows who you are. Any agent — a
minion, a mastermind, an assistant — takes it with one tool call and can start
writing the same second.

Why: making a worktree from nothing (branch, `npm ci`, boot a server) costs time
on every fix. The owner, 2026-09-25: *"if you have a quick fix you send it off to
an existing one, it's built immediately and smoke tested immediately, and once it
seems to work, within a few seconds you merge it in and my website updates."*
No agent manages the pool. It is one class, `Servex/Pool.js`, one JSON file,
and a sweep every ten minutes.

## The two tools

**`take_worktree()`** answers at once (about 50 ms) with:

```json
{ "id": "qf-1", "path": "C:/Code/lew42/worktrees/qf-1", "branch": "worktree/qf-1", "url": "http://127.0.0.1:63416/" }
```

It fast-forwards the worktree to `michael/dev` first, so you start from the
latest. Then you write your fix into `path`, commit, and land it with
`node Server/merge.mjs <path> <pages>` (smoke test, then a serialized merge into `michael/dev`). Servex starts preparing the next ready worktree in
the background (about 6–20 s). If none is ready when you ask, the call waits
while one is made. If all three are taken, it answers an error naming who holds
each one.

**`return_worktree({ id })`** hands it back. This works only when the worktree is
clean and everything on its branch is already in `michael/dev` (you never used
it, or you merged). Servex then fast-forwards it and marks it ready for the next
agent. Uncommitted files or unmerged commits are **refused, with the list** —
nothing is ever thrown away. If two are now ready, the extra one is removed.
When the main tree had uncommitted edits to the same files, `Server/merge.mjs` does
not merge: it applies the branch's diff to the working tree and records the branch
head in `.merge-landed.json`. A worktree whose head is listed there counts as merged;
it is removed instead of fast-forwarded, and a fresh one is prepared
(proof: `ai/2026-09-25/quickfix-worktrees/landing/`).

## The numbers

- **K = 3.** At most three worktrees exist, taken or not.
- **N = 6 hours.** A ready worktree idle longer than that is removed, except the
  one kept ready. A taken worktree is never removed automatically.

## Where the state lives

`.worktree-pool.json` at the main repo's root, beside `.worktrees.json`
(⚠ it needs a `.gitignore` line like that one's — not added yet). Each slot is `{ id, path, branch, url, port, state, taken_by,
taken_at, idle_since }`, where `state` is `preparing`, `ready` or `taken`. The file
survives a Servex restart: at start Servex adopts the slots whose worktree still
exists, replaces a ready one whose server stopped answering, and finishes any
removal a restart interrupted (the file's `leaving` list).

`GET /api/worktrees` (Servex's dashboard port, CORS open like `/api/system`)
answers `{ K, N_hours, slots: [...] }`. The AI 2 Live card reads it.

## Good to know

- **A fresh worktree is not quite clean.** Its dev server's `PageFiles` plugin
  appends, at boot, the `page.jsonl` lines `michael/dev` has not committed yet.
  The pool records those files and their contents as the slot's *baseline*.
  A return ignores them only while they are unchanged. When the slot is removed,
  its server is stopped first and only those unchanged files are put back.
  Anything an agent changed still counts as the agent's work.
- **Slots are made with `Server/worktree-up.mjs` and removed with
  `worktree-down.mjs`**, both run from the main checkout. That is what makes a
  slot branch from `michael/dev` even when Servex runs from a worktree. One runs
  at a time.
- **Each slot's page watcher gets a temp dir of its own.** `Server/health.mjs`
  allows one copy per machine through a lock file in the temp dir; without its
  own, a slot's watcher would see the owner's and quit.
- **Every process is hidden.** The watcher is launched through PowerShell
  `Start-Process -WindowStyle Hidden`, so its Playwright children inherit a hidden
  console.
- Switches: `SERVEX_NO_POOL=1` (off), `SERVEX_POOL_PREFIX` (default `qf`; a
  private Servex uses `qfp`), `SERVEX_POOL_FILE` (another state file).
- The proof, on a private Servex: `ai/2026-09-25/quickfix-worktrees/pool/`
  (`proof.mjs`, `proof.txt`).


**Known limit.** A pool worktree is branched from *committed* `michael/dev`. Work that sits uncommitted in the main tree is not in it, so a quick fix to an uncommitted file cannot be made there. Commit `michael/dev` often. (2026-09-25: `Pool.js` and `merge.mjs` themselves were not yet in `qf-1`.)

## A holder that stopped (salvage)

When the pool needs a slot and its holder has stopped, the slot is handed back if it is clean. If it still holds work, `salvage()` stops the slot's server and watcher first, then commits the work to `salvage/<slot>-<date>` (never merged, never deleted), moves the slot back to `michael/dev`, and removes it so a fresh one is made. The holder's card gets one line naming the branch. A dev server's own logs (`page.jsonl`, `files.jsonl`, `.claude/skills/clarity/flags.jsonl`) are its noise: a return treats them as clean, and salvage puts them back before it commits, so they never ride into a salvage branch. The reaper's sweep runs this check every 5 minutes, so a full pool no longer waits for someone to ask. By hand: `node Servex/Lifecycle.js --salvage qf-2`. Why and how: [lifecycle.md](lifecycle.md).

**A recorded pid is checked before it is killed.** Windows reuses pids; on 2026-09-29 qf-4's old watcher pid belonged to `whisper-server.exe`. `kill()` now reads the process's command line first and skips it unless it is the slot's own server (`.worktree-logs/<slot>.log`) or a health watcher.

## Slot names free themselves (2026-09-30)

Names run `qf-1` to `qf-9`. A name held only by a leftover (a merged `worktree/qf-N` branch with no worktree, or an empty folder) is cleared and reused; before this, leftovers filled all nine and `take_worktree` failed with "No worktree could be made ready". A slot missing from `.worktrees.json` is removed with plain `git worktree remove` + `git branch -d`.
