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
(proof: `ai/sessions/2026/09/25/quickfix-worktrees/landing/`).

## The numbers

- **K = 6.** At most six worktrees exist, taken or not (was 3 until 2026-10-23, when two masterminds held all three and three minions queued for 5+ min; each slot costs about 50 MB of server).
- **N = 6 hours.** A ready worktree idle longer than that is removed, except the
  one kept ready. A taken worktree is never removed automatically ([below](#a-taken-worktree-stays-taken)).

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
- The proof, on a private Servex: `ai/sessions/2026/09/25/quickfix-worktrees/pool/`
  (`proof.mjs`, `proof.txt`).


**Known limit.** A pool worktree is branched from *committed* `michael/dev`. Work that sits uncommitted in the main tree is not in it, so a quick fix to an uncommitted file cannot be made there. Commit `michael/dev` often. (2026-09-25: `Pool.js` and `merge.mjs` themselves were not yet in `qf-1`.)

## A taken worktree stays taken

**A worktree someone took is never reclaimed while anyone works in it, and never deleted while it holds work.**
"Taken" is saved in `.worktree-pool.json` with who took it, so it survives a Servex restart.
Every 5 minutes (and when the pool is full) `reclaim()` hands a taken slot back only when all three are true:

1. Its holder is `stopped` or `gone` in the Servex registry. A holder the registry doesn't know (a CLI session, a person) is never reclaimed.
2. No live agent works in the slot (its cwd is inside it), no spawn waiting at the memory gate (`spawn-queue.json`) will start in it, and no live agent descends from the holder. A minion often writes into the slot from a different cwd.
3. `git status` shows nothing of the slot's own, and its branch has no commits outside `michael/dev`.

Otherwise the slot is kept, and the Servex log says why in one line (once, and again only if the reason changes): `pool: qf-9 is held by stopped X but kept — minion-Y (working) works in it`. A kept slot has no timeout. It is seen when the pool is full: `take_worktree`'s error names every kept slot and its reason, and whoever needs the slot decides whether to salvage it. A holder the registry doesn't know (a person, a CLI session) is never reclaimed; that slot waits for `return_worktree`.
`Server/worktree-prune.mjs` follows the same rule for worktrees outside the pool: a changed file or an unmerged branch is skipped and named. `--only <name>` checks one worktree. `--salvage` commits a merged worktree's leftovers on its own branch, then removes it. `--idle-hours <n>` leaves alone anything touched in the last n hours. `qf-N` names are left to the Pool.

**Where worktrees should live, why `qf-N` slots were not being reused, and why 51 piled up (2026-10-13):** [worktrees.md](../../public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-cleanup/doc/worktrees.md).

Why: on 2026-09-30 the sweep salvaged qf-9 twice (12:53 and 13:23), because its holder, a task mastermind, showed `stopped` while its minion was still writing there. Proof: [ai/sessions/2026/09/30/pool-taken/pool-taken/proof.txt](/framework/ai/sessions/2026/09/30/pool-taken/pool-taken/proof.txt).

**Salvage is by hand only.** `node Servex/Lifecycle.js --salvage qf-2` stops the slot's server and watcher, commits its work to `salvage/<slot>-<date>` (never merged, never deleted), moves the slot back to `michael/dev` and removes it. A dev server's own logs (`page.jsonl`, `files.jsonl`, `.claude/skills/clarity/flags.jsonl`) are its noise: a return treats them as clean, and salvage leaves them out. So does every other tracked `*.jsonl` a live log writes to (`ai/board.jsonl`, a task's log): its diff is saved as a patch in `.worktree-logs/` and the file goes back to `michael/dev`, so another agent's churn never rides into a salvage branch (it did in `salvage/qf-6-2026-09-30-2`). A new `*.jsonl` the task created is its own work and is committed. Proof: [proof-salvage.txt](/framework/ai/sessions/2026/09/30/pool-taken/pool-taken/proof-salvage.txt). More: [lifecycle.md](lifecycle.md).

**A recorded pid is checked before it is killed.** Windows reuses pids; on 2026-09-29 qf-4's old watcher pid belonged to `whisper-server.exe`. `kill()` now reads the process's command line first and skips it unless it is the slot's own server (`.worktree-logs/<slot>.log`) or a health watcher.

## Slot names free themselves (2026-09-30)

Names run `qf-1` to `qf-9`. A name held only by a leftover (a merged `worktree/qf-N` branch with no worktree, or an empty folder) is cleared and reused; before this, leftovers filled all nine and `take_worktree` failed with "No worktree could be made ready". A slot missing from `.worktrees.json` is removed with plain `git worktree remove` + `git branch -d`.

## A minion the spawn gate admits but the pool refuses waits, not fails (2026-10-01)

`Agents.spawn()`'s own minion-to-pool redirect (above) can still find no slot ready the instant a
queued minion spawn reaches the front of the spawn gate's queue. That used to drop the spec
outright, with nobody told. It is re-queued at the head instead, with its held messages, and the
pool is asked to top itself up: [`../never-lose-a-wake.md`](../never-lose-a-wake.md).

## When a slot is freed (2026-10-17)

**Look first: `node Servex/pool-status.mjs`.** One line per slot: holder and its state, branch, commits ahead of `michael/dev`, uncommitted files, and the verdict `reclaim()` gives it (`FREE` or `KEPT`, with the reason and the branch). It frees nothing.

A taken slot is freed at once, with no grace wait, when its holder is `stopped` or `gone` (or a `dormant` one idle 12 h), nobody works in the slot, and either:

- the branch has **no commits ahead** of `michael/dev` and the tree is clean; or
- the commits ahead are **already on `michael/dev`**. `merge.mjs` lands a branch as a diff, so its commits are not ancestors. The test is by content: every file the branch changed must read the same on `michael/dev`, and a `.jsonl` log counts when every line the branch added is somewhere in the base's copy (a log only grows).

Nothing is thrown away. The slot's folder goes, and its commits stay on `landed/<slot>-<date>-<sha>`. A slot that truly holds unmerged commits or uncommitted files stays held, and its line names the branch (`1 unmerged commit(s) on worktree/qf-3`); after its holder has been stopped 30 minutes it is salvaged to `salvage/<slot>-<date>` as before.

**A stale hold lets go.** `fixer-1` held `qf-8` with `hold()` for days after it was `gone`. A hold now stops counting once its holder has been `stopped` or `gone` for 12 h. A holder that vanished minutes ago (a registry blip) still holds.

**More ways a slot lets go (2026-10-20).** A `dormant` holder whose task has landed (its task log ends `complete`) is done at once, not after 12 h; rules 2 and 3 still protect any work. A hold by a holder the registry has no row for lets go once the slot is 12 h old. `public/framework/ai/board.jsonl` (written by the slot server's own health watcher) is server noise, like `page.jsonl`: return restores it from HEAD.

**What still keeps a slot** (the measurement of 2026-10-17, in [the task log](../../public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/pool-reclaim/task.jsonl)): a holder that is only `dormant` (a mastermind that may wake and write there). That is the case where a human or the holder calls `return_worktree`. Test: `node Servex/Pool.test.mjs`.

## A page watcher per taken worktree (2026-10-19)

**While a slot is taken, [`WorktreeWatch.js`](../WorktreeWatch.js) tells its holder within a minute when a page it saved breaks.** `Pool.take` starts one (`page_watch`); `give_back` and `remove` stop it; `adopt` restarts it after a Servex restart. It listens to the slot's own dev server (the `changed` frame, no second `fs.watch`), waits 2 s, runs `Server/layout-check.mjs` at 400, 1200, 1920 and 3440, and on a break sends one `send_to_agent` line (page, width, measurement, shot path) and writes one task-log line; at most one message per page per 10 minutes, and a recovery is one `clear` log line. Shots go to `<task dir>/shots/` (git-ignored). Design and the rejected re-check timer: [plan.md](../../public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-watch/plan.md); proof timings: [proof-run.txt](../../public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-watch/proof-run.txt). Test: `node Servex/WorktreeWatch.test.mjs`. Limit: layout-check reports a missing file only as "Failed to load resource ... 404" with no url, so the one favicon 404 per width is ignored and a second one is the break.

**The same watcher runs tests (2026-10-23).** A `.js` or `.mjs` save (its own 2 s timer; data writes like `files.jsonl` run nothing) runs the tests near it with `TestRunner.mjs --near`: its folder's tests plus the ones that import it directly. At most 3 test processes run at once across all slots (a shared queue; a new save replaces that slot's waiting run), each file with the runner's 60 s timeout. Only a real pass-to-fail change is sent to the holder, one line naming the test and its first failing line. A fail-to-pass and a first-ever failure (no earlier result) are a task-log line only; a timeout is no result. Result lines go to `public/framework/core/Test/save-results.jsonl` (git-ignored, `trigger:"save"`, with the slot id in `worktree`), so a save never dirties the tracked `results.jsonl`. Test: `node Servex/WorktreeWatch.test.mjs`. Readme: [core/Test](../../public/framework/core/Test/readme.md).

## How often it is reused (measured 2026-10-24)

The pool writes no event log (`logs/pool.jsonl` is empty), so this was counted from other records: `take_worktree` and `return_worktree` calls in the agents' Servex logs, and the merge commits in `git log --first-parent michael/dev`, from 2026-09-25 to 2026-10-24.

- **Slots are reused.** 381 `take_worktree` calls and 191 `return_worktree` calls over 30 days, spread over only nine slot names (`qf-1` to `qf-9`): about 40 takes per name. Each name landed 3 to 25 merges (103 merges from `worktree/qf-N` branches in all).
- **But the pool is not where most work lands.** 447 merges came from `worktree/*` branches; 344 of them (77%) were from worktrees made for one agent or task (`worktree/systems`, `worktree/session-class5`, ...), not from a pool slot.
- **It is going cold.** Takes per day were 22 to 53 in the last days of September, 5 to 11 on a normal day in the second half of October. Today `.worktree-pool.json` holds one slot (`qf-5`, taken 2026-10-23 20:25 by `mastermind-page`, so held about a day), though K is 6.
- **Not measurable from the records:** how many worktrees were made new, because creations are not logged. Fix, if the number matters: have `Pool.take`, `give_back`, `remove` and `prepare` each write one line to `pool.jsonl`.
