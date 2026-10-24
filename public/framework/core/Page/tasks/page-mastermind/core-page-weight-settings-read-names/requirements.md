Budget: $2

# core/Page: weight, ai_cost and settings ask the folder's names, not the old directory.json

Load the `minion` skill first, then `code`. This task's log is `session.jsonl` in this folder; findings go there as `log` lines (`node .claude/hooks/append.mjs <file> <json-array-file>`).

**Why:** three files keep their own copy of `has_file(page_url, name)`, and each reads `/directory.json`, a 6.8 MB file the dev server built on 2026-10-09 (gitignored, never rebuilt since):

- `public/framework/core/Page/weight/weight.js` (around line 36),
- `public/framework/core/Page/weight/ai-cost.js` (around line 30),
- `public/framework/core/Page/settings/settings.js` (around line 45).

Two failures follow from that:

1. **On the live site,** a folder made after 2026-10-09 is not in the tree, so `has_file` answers `false` and that page's weight, AI cost and settings are never read.
2. **In a worktree,** there is no `directory.json` at all, so `has_file` answers `undefined` and every page probes `weight.jsonl` and `page.jsonl` blind. That is about 860 404s per page in the console sweep (`$TEMP/claude-scratch/after.json`, 82 pages, 88,221 404s). It is also the last 5 `run-1/page.jsonl` 404s left after the fetch_listing fix (traced to `ai-cost.js:25`).

## What exists (read these, nothing wider)

- The three `has_file` copies above, and their header comments: they were copied rather than shared "for cycle risk".
- `public/framework/core/Router/listing.js`: `names(dir)` gives a folder's file names from `/api/folder-names`, live, cached for 3 s, and `null` off the dev server. It imports only `core/Item/Store.js`, so importing it causes no cycle (the fetch_listing fix already does, in `Page.class.js`). It is SYNCHRONOUS; `has_file` is async.

## Do, one commit each

1. **Count before:** `node public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/console-sweep/pagecheck.mjs <your worktree url, no trailing slash> $TEMP/claude-scratch/weight-before.json`. Log the total 404 count and the count ending in `weight.jsonl`, `settings.jsonl` or `page.jsonl`.
2. **One `has_file`:**
   - Add an async form to `core/Router/listing.js`: `export async function fetch_names(dir)`. It uses the same cache and the same null rules as `names()`, but calls `fetch` instead of a blocking XHR. Use one cache, never a second.
   - Make a new file, `public/framework/core/Page/weight/has-file.js`, exporting `has_file(page_url, name)`:
     - `fetch_names(page_url)`; when it returns an array, answer `listed.includes(name)`;
     - when it returns `null` (the static site), answer exactly what today's `directory.json` walk answers. Move that walk here and keep it.
   - The three files import it, and their own copies and `directory_tree()` go. Rewrite their header comments to one line pointing at `has-file.js`.
3. **Prove it:**
   - `node --check` every changed file.
   - `node public/framework/core/Test/TestRunner.mjs public/framework/core/Page`, before and after (log both counts).
   - Run the same sweep after (`weight-after.json`) and log the same two counts. The weight, settings and page.jsonl count should fall by thousands.
   - On the live site (`http://monorepo.localhost`, read only), pick one page made after 2026-10-09 that has a `weight.jsonl` or an `ai_cost` line:
     - find one with `git log --diff-filter=A --since=2026-10-10 --name-only --format= -- "public/**/weight.jsonl"`, or grep `"ai_cost"` in a recent `page.jsonl`;
     - in your worktree, show that `weight(url)` or `ai_cost(url)` now returns a value where it returned `null` before. A headless `page.evaluate` that imports the module is enough; log both values.
   - Smoke from the main tree: `MSYS_NO_PATHCONV=1 node Server/smoke.mjs <your worktree> /framework/core/Page/ /framework/core/Page/parts/types/ /framework/core/Events/ /framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/run-1/readmes-page/`, FAIL count before and after.
4. **Doc:** `public/framework/core/Page/weight/` has a readme or doc. Add one sentence there saying `has_file` asks the live folder names first and uses `directory.json` only off the dev server.

Log `ready: <branch> at <sha> <404s before → after; the recovered value; tests; smoke>`.

## How

- Work in the worktree named in the message that hands you this brief. Commit after each step.
- Never kill or restart the dev server or Servex. Headless only, never the owner's tabs. Never `git stash`. If `files.jsonl` churn shows in `git status`, leave it and commit only your files.
- Leave `core/Page/Markdown.js` (its own `directory.json` reader, a different job) and every other `directory.json` reader outside these three files alone. Log one line naming them.
- **Resolve, don't park.** Log anything left open, with the reason.
