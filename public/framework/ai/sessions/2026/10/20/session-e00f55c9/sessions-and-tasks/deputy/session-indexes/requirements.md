# Sessions: every session is listed, and each scope has its own index.jsonl

Budget: $6. Load the `minion` skill first. You work in your own worktree (take one with `node Server/worktree-up.mjs session-indexes`), committing at every working step. The deputy (`mastermind-deputy`) reviews and merges.

**The owner's words:** the session-is-a-task brief, part 3, item 12c: [requirements.md](../../session-is-a-task/requirements.md). The plan is in [slow-write.md, 12c point 3](../../session-is-a-task/slow-write.md#12c-the-owners-model-against-what-exists).

## 1. This session is missing from the Sessions list (fix first)

**What is wrong:** the owner's VS Code tab is session `e00f55c9-bad4-4ee2-899e-d629ea1eede6`. It has run since 2026-10-20 and is active today. It does not appear on the AI page's Sessions tab (`/framework/ai/sessions/`), whether at the default scope, at `?scope=2026-10` or at `?scope=2026-10-24`. It is in no day's `index.json`: `sessions/2026/10/20/index.json` and `2026/10/24/index.json` mention it only inside other rows' text. Its page opens fine by url: `/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/`.

**Where to look:**
- The day snapshots are written by `AISessionIndex` (`public/framework/ai/AISession/AISessionIndex.mjs`). It files a session under `day_of(snap)` = its last activity.
- The list is read by `AISessionsPage.js` in the same folder, from the day `index.json` files through `AISessionLive`.
- Find why this session has no row. It may be filtered out, skipped as a tab, have its transcript in another project directory, or something else. Prove the cause with one command and its output, then fix it.

**Proof:** a headless shot at 1920. Start at `/framework/ai/`, click the Sessions tab, then click this session's row; it lands on its page. Check at least one other VS Code tab session too, so the fix is not special-cased to one id.

## 2. One index.jsonl per scope

Today, `DatedFiles.sessions` (`Server/DatedFiles.mjs`) appends one `session` row to `YYYY/MM/DD/index.jsonl` per folder, on its start day. Nothing lists the days of a month, the months of a year, or the years.

- **Build:** when a day's `index.jsonl` gets its first row, append `{"day":"YYYY/MM/DD"}` to `YYYY/MM/index.jsonl`. On a month's first day, append `{"month":"YYYY/MM"}` to `YYYY/index.jsonl`. On a year's first month, append `{"year":"YYYY"}` to `sessions/index.jsonl`. Use the same append path DatedFiles uses now.
- **Backfill:** a node script, `Server/SessionScopes.mjs`, that writes those lines for the folders that exist. It is a dry run by default and prints a manifest of every line it would write; `--apply` writes them. Never rewrite an existing line; appending is the only write. Run `--apply` in your worktree to prove the counts, but do not commit the files it wrote: the live server appends to the same index files, so the deputy runs `--apply` on the main tree after the merge.
- **Leave alone:** the rolled `index.json` totals (`AISessionIndex.roll`). They carry totals; the `.jsonl` files are the lists.
- **Docs:** add the structure (which file, which writer, which reader) to `public/framework/ai/sessions/readme.md`, verified against the code.

## Never

Kill or restart the main dev server or Servex, `git stash`, drive the owner's browser tabs, or edit outside your worktree. Write records only through `node .claude/hooks/append.mjs`.

## Report (one screen, as your task's `complete` outcome)

- The cause of item 1, with its proof line.
- The shot.
- The dry-run line count against the `--apply` line count; the two must be equal.
- Your commits.
