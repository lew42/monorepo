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
