# What gets committed, what is ignored (decided 2026-10-12)

**The rule in one line:** a *record* is committed, a *cache* is gitignored, and nobody commits by hand: the log sweeper does it.

| File | Class | What happens |
|---|---|---|
| `task.jsonl`, `page.jsonl`, `spend.json`, `log.jsonl`, `words.jsonl`, `session.jsonl` (in a task or session folder) | record | committed in batches by the sweeper |
| `files.jsonl` (folder listing the dev server regenerates) | record, noisy | committed by the sweeper (2,800 are already tracked; untracking them is a later, scripted step) |
| `public/ai/*.jsonl` (voice logs), `.claude/skills/*/flags.jsonl` | record | committed by the sweeper |
| `ai/sessions/YYYY/MM/DD/<session>/index.json` | cache (rebuildable) | gitignored already |
| `ai/sessions/YYYY/MM/DD/index.json` (day composite) | cache while the day is open | gitignored; `git add -f` once when the day closes (29 are tracked) |
| `*.summary.json` next to a voice log | cache | gitignored |
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
