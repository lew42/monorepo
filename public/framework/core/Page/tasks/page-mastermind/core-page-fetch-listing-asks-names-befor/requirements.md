Budget: $2

# core/Page: fetch_listing asks names() before probing files.jsonl and page.jsonl

Load the `minion` skill first, then `code`. This task's log is `session.jsonl` in this folder; findings go there as `log` lines (`node .claude/hooks/append.mjs <file> <json-array-file>`).

**Why:** `Page.fetch_listing(url)` (`public/framework/core/Page/Page.class.js`, about line 225) fetches `files.jsonl` and then `page.jsonl` without knowing whether either exists, so a folder with neither logs two 404s in the console. The deputy's console sweep of the 81 record pages under `session-e00f55c9` found its last 8 errors there: every `process-system/run-1/readmes-page/` page asks for `run-1/files.jsonl` and `run-1/page.jsonl`, and `run-1` holds only `session.jsonl` and `readmes-page/`. The sweep script and its before count are in `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/console-sweep/`.

## What exists (read these, nothing wider)

- `Page.class.js`, `Page.listing()` and `Page.fetch_listing()` (about lines 211-236).
- `public/framework/core/Router/listing.js`: `names(dir)` gives the file names in one folder from the dev server's `/api/folder-names`, cached for 3 s. It returns `null` off the dev server (the static site), and the caller then keeps its own probe. It is synchronous on purpose (the header comment says why); the router already calls it for the same folders, so it is usually a cache hit.

## Do

1. **Count before:** `node <console-sweep>/pagecheck.mjs <your worktree's server url, no trailing slash> $TEMP/claude-scratch/before.json` (it loads every record folder under `session-e00f55c9` and writes each 404 per page). A worktree has other 404s the live site does not (no `sessions.json`), so count only the lines ending in `files.jsonl` or `page.jsonl`, and log that count.
2. **Build:** at the top of `fetch_listing`, `const listed = names(url)`. When `listed` is an array, keep only the files in `order` that it contains; when it contains neither, `return null` with no request. When `listed` is `null`, today's code runs unchanged. Import `names` from `../Router/listing.js`. Watch for an import cycle (`core/Router` may import `core/Page`): if there is one, import it lazily, the way `tasks_folder()` imports `TasksPage`, and say so in a comment.
3. **Count after:** the same sweep, plus `/framework/core/Page/` and `/framework/core/Page/parts/types/` (a page.js page and a page.jsonl page) to prove listings still load. The target is 8 errors down to 0.
4. **Doc:** one sentence where `doc/decisions.md` (or the doc `listing()`'s comment points to) describes the listing order.

## Prove it

- `node --check` the file; `node public/framework/core/Test/TestRunner.mjs public/framework/core/Page` before and after (log both counts).
- Smoke from the main tree: `MSYS_NO_PATHCONV=1 node Server/smoke.mjs <your worktree> /framework/core/Page/ /framework/core/Page/parts/types/ /framework/core/Events/ <one readmes-page url from the sweep>`.
- Log `ready: <branch> at <sha> <one line with the before and after counts>`.

## How

- Work in the worktree you are told in the message that hands you this brief. Commit after each step.
- Never kill or restart the dev server or Servex. Headless only, never the owner's tabs. Never `git stash`. If `files.jsonl` churn shows in `git status`, leave it and commit only your files.
- **Resolve, don't park.** Log anything left open with the reason.
