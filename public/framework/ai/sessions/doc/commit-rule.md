# What gets committed, what is ignored (decided 2026-10-12)

**The rule in one line:** a *record* is committed, a *cache* is gitignored, and nobody commits by hand: the log sweeper does it.

| File | Class | What happens |
|---|---|---|
| `task.jsonl`, `page.jsonl`, `spend.json`, `log.jsonl`, `words.jsonl`, `session.jsonl`, `day.jsonl` (in a task, session or day folder) | record | committed in batches by the sweeper |
| `files.jsonl` (folder listing the dev server regenerates) | record, noisy | committed by the sweeper, and kept committed: the static site reads them and has no build step to make them (decided 2026-10-13, [repo-size.md](../../doc/repo-size.md)) |
| `public/ai/*.jsonl` (voice logs), `.claude/skills/*/flags.jsonl` | record | committed by the sweeper |
| `ai/sessions/YYYY/MM/DD/<session>/index.json` | cache (rebuildable) | gitignored already (never swept) |
| `ai/sessions/YYYY[/MM[/DD]]/index.json` (day, month, year composite) | cache, but 31 are tracked | the sweeper commits the tracked ones when they change (a new, ignored one never appears) |
| `ai/usage.jsonl`, `ai/cards.jsonl` | record | committed by the sweeper; usage history is kept (184 KB; see `repo-size-plan` for any later archiving) |
| `public/framework/**/doc/files.jsonl` (outside `ai/`) | record, noisy | committed by the sweeper |
| `*.summary.json` next to a voice log | cache | gitignored |
| a screenshot (`png`/`jpg`/`webp`) anywhere under `public/framework/ai/`, outside a `doc/` folder (images inside a `doc/` folder stay committed) | output, too heavy for git | gitignored (2026-10-13): pictures were 84% of git history; they stay on disk; the 2,725 already tracked stay tracked until a scripted untrack ([repo-size.md](../../doc/repo-size.md)) |
| `owner-prompts.jsonl`, `sessions/transcripts/`, `.claude/prompts/` (the owner's own words, extracted from transcripts) | private, regenerable | gitignored, so the owner's words never leave this machine; one `owner-prompts.jsonl` (2026-10-12) is tracked and awaits the owner's call |
| code, briefs, readmes, docs | work | never swept: committed by the agent that wrote them |

## The sweeper

`Servex/LogSweeper.js` (a class, started by Servex; `SERVEX_NO_SWEEP=1` turns it off, `SERVEX_SWEEP_DRY=1` only reports, `SERVEX_SWEEP_MIN` sets the minutes, default 30).

- Every sweep takes only paths that match its allowlist (`LogSweeper.ALLOW`) and never one that matches `DENY` (code, markdown, `index.json`).
- It commits with `git commit --only --pathspec-from-file`, so another agent's staged work stays staged and uncommitted. Message: `servex: log sweep (N files)`.
- It skips while git is busy (`index.lock`, a merge, a rebase) or when the main tree is not on `michael/dev`.
- At most 400 files per commit; the rest wait. Nothing changed means no commit. It never deletes.
- Each sweep writes one line to Servex's `sweeper` log.
- Proof: `node Servex/LogSweeper.test.mjs` builds a throwaway repo and checks all of the above.

To add a log type, add one pattern to `LogSweeper.ALLOW`.

## Why agents do not always work in worktrees (decided 2026-10-13)

**Must write to the main tree:** Servex itself and anything the live site reads as it happens (`usage.jsonl`, `cards.jsonl`, `task.jsonl`, `page.jsonl`, the `day.jsonl` streams). These are appends, the site tails them (`live()`), and a worktree copy would be invisible until merged. They are records, so the sweeper commits them: that is why `git status` can be empty without a worktree.

**Should not:** any agent editing code, CSS, docs or briefs. Already enforced by: `main-site-is-production` (edit in a worktree, `check_page`, merge), `take_worktree` (a ready worktree per quick fix), `Server/merge.mjs` (locks, smoke-tests, refuses without a review) and the git-guard hook (blocks stash, reset --hard, clean, recursive deletes in the main tree).

**The gap:** nothing refuses an `Edit`/`Write` of a *code* file in the main checkout; the rules are only prose, and some briefs legitimately say "work in the main tree" (doc passes, one-page fixes). So a code edit there lands as uncommitted work that the sweeper (rightly) will not touch.

**Decision, not a one-line fix:** add a PreToolUse hook on `Edit|Write` that, for `.js/.mjs/.css/.html` under the main checkout, prints a warning naming `take_worktree` (warn first, block later once the briefs that need the main tree have been moved). Left unbuilt because a block would stall every agent whose brief says main tree; the warning needs a brief-level opt-out (`MAIN_TREE_OK=1`). Owner call: warn-only or block.

## Record files: append only, never reset (decided 2026-10-13)

**The rule.** A record file (`task.jsonl`, `page.jsonl`, `log.jsonl`, `day.jsonl`, `inbox.jsonl`) is only ever appended to, by `.claude/hooks/append.mjs` or `appendFileSync`, one line at a time. Nobody reads it, edits it and writes it back, and nothing resets, stashes, rebases or checks it out in the main tree, because the main tree is where every agent appends at once.

**What broke it.** A plain `git merge` in the main tree while it was dirty. On 2026-10-13 at 17:38:07 an agent ran `git merge --no-ff worktree/assistant-chain` after `Server/merge.mjs` had refused. Git parked the dirty tree (197 files) in a hidden commit, hard-reset it, and the merge was refused; git then tried to put the tree back, but a live writer had appended to a file in that gap, so the put-back failed (`Index was not unstashed. Merge with strategy ort failed.`). Every uncommitted line, including the landing lines for `figma-to-code`, `model-switch` and `session-dup-check`, now existed only in that hidden commit. Servex kept appending on top of the reset files, so nothing looked wrong. Committed history never lost a line (`task-log-race/loss-scan.mjs`: 0 windows in 42 files): the loss happens before the commit.

**What changed.**
- `.claude/hooks/git-guard.mjs` refuses `git merge` (not `--abort`/`--continue`/`--quit`, not `merge-base`/`merge-tree`/`merge-file`), `git pull`, `git rebase` and `--autostash` in the main checkout. Land with `node Server/merge.mjs <worktree dir>`.
- `Server/merge.mjs` no longer runs `git merge` at all. The no-overlap case used to; it now takes the same three-way write path as the overlap case (`threeWay()`, which also re-reads each live log at write time). It also refuses cleanly when its argument is a branch name instead of a folder.

**The test.** `node Server/task-log-race.test.mjs` builds scratch repos, makes a git smudge filter play the live writer inside the hard-reset window, and checks: (1) a plain `git merge` loses the lines, (2) `merge.mjs` lands the same branch and loses none, (3) a no-overlap `merge.mjs` leaves no hidden WIP commit, (4) the guard blocks the command. Case 3 fails against the old `merge.mjs` (`MERGE_UNDER_TEST=<old copy>`).

**If lines go missing anyway.** The hidden commit is not in the stash list. `git fsck --no-reflog` lists it as dangling; the task's `recover.mjs <commit>` prints the record lines it holds that the disk lacks and `recover-apply.mjs` appends them back (idempotent, append only). Pin a find with `git update-ref refs/salvage/<name> <commit>` so garbage collection cannot take it. The 2026-10-13 incident is recovered; the manifest is `lost-0283e997.applied.txt` in the task dir `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/task-log-race/`.

## Session files, untracked ones included (decided 2026-10-17)

57 session paths sat untracked because the sweeper's allowlist did not know them. One rule closes it: **a record is committed, a cache is ignored.**

| File | Class | Rule |
|---|---|---|
| `page.jsonl`, `prompts.jsonl`, `inbox.jsonl`, `essence.jsonl`, `review.jsonl`, `digest.json`, `session.jsonl`, `task.jsonl` in a session, task or module folder | record | committed |
| `files.jsonl` anywhere under `public/` (outside `ai/sessions/`, where it is ignored) | record, noisy | committed; the static site reads it |
| `cache.jsonl`, `index.json`, `index.tmp.json` | cache (rebuildable) | gitignored since 2026-10-12 (`.gitignore` lines 119-130) |
| `ai/ai/v-*.jsonl`, `v-*.summary.json` (voice logs) | machine output | gitignored (same as `ai/v-*`; added 2026-10-17) |

**Why `prompts.jsonl` is committed:** it holds the owner's dictations as refined cards; the committed repo is the one source of truth (CLAUDE.md law 5). The raw `owner-prompts.jsonl` and transcripts stay ignored. Alternative: ignore `prompts.jsonl` too; it wins only if the repo becomes public.

**Applied 2026-10-17:** one commit by path took the untracked session folders (`session-*`, 10/16) and the module `files.jsonl` / `inbox.jsonl` / `page.jsonl` records.

**Still open, handed to the Servex checkup:** `Servex/LogSweeper.js` `ALLOW` does not match `prompts|inbox|essence|review.jsonl`, `digest.json`, `page.jsonl` or `inbox.jsonl` outside `ai/`, or `files.jsonl` outside `ai/` and `doc/`; those stay modified or untracked until a person commits them. Add one pattern: `/^public\/.+\/(page|inbox|prompts|essence|review|files)\.jsonl$|^public\/framework\/ai\/sessions\/.+\/digest\.json$/` (needs a Servex restart; run `node Servex/LogSweeper.test.mjs`).
