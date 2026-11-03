Budget: $5

# core/Page: a folder with only a readme.md opens as a page

Load the `minion` skill first, then the `code` and `page` skills. This task's log is `session.jsonl` in this folder; findings go there as `log` lines (`node .claude/hooks/append.mjs <file> <json-array-file>`), never a findings file.

**Why:** plan step 6, [plan.md (b)](../plan.md) "Readmes become browsable pages". Today a folder that has a `readme.md` but no `page.js` or `page.jsonl` opens as a 404, though its readme is right there. 10 such folders exist under `/framework/` (2026-10-23), among them `/framework/core/Events/`, `/framework/log/`, `/framework/ext/CSSDoc/`, `/framework/ai/rail/`, `/framework/core/Page/overview/`. The rule the owner chose: readmes first, pages second. The readme gives a folder its content; a `page.js` or `page.jsonl` added later takes over and nothing moves.

## What exists (read these, nothing wider)

- `public/framework/core/Page/Page.class.js:391-411`, `child()`: the listing (`Page.listing`, `Page.loaded_listing`) is read, a `page.jsonl` child loads, then `Page.load(url, 0)` probes `page.js`, and on a miss `child_md(name)` looks for a sibling `<name>.md`. Nothing looks inside the child folder for its own `readme.md`.
- `public/framework/core/Page/Markdown.js`: `PageMarkdown`, the Markdown Explorer at `<page>/md/` (lists every `.md` beside the readme), and `Page.file()` (renders one file).
- `public/framework/core/Page/Listing.js`: what a folder's listing knows (`pages`, `folder(name)`, `files`).
- `public/framework/core/Page/parts/PageFile.js`: the `part-file` card (a markdown file rendered in place), landed 2026-10-23. Reuse it or `Page.file()`; build no third markdown renderer.
- `public/framework/core/Page/doc/subpages.md`: how children are found.

## Do, one commit each

1. **Shoot before:** `/framework/core/Events/` and `/framework/log/` at 400 and 1920 on your worktree (headless; `import { browser, close } from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs"`). Save as `shots/before-<name>-<width>.png`.
2. **Build:** in `child()`, after the `page.js` probe misses and before giving up: if the child folder's own listing has a `readme.md`, the child opens as a page of that folder showing the readme as its content, titled from the readme's first heading (else the folder name). Its `.md` siblings are reachable through the `md` tab (`md_tab()` in `ext/Doc/Doc.js`); check that tab shows on such a page. Use the listing to decide, so a folder without a readme makes no extra request. Keep the change small and in `core/Page`; if the cleanest home is a new small class, name it in your log before writing it.
3. **Shoot after:** the same two pages, plus one more from the list, at 400 and 1920 into `shots/after-…`. Then open a page that HAS a `page.js` (`/framework/core/Page/`) and one with a `page.jsonl` (`/framework/core/Page/parts/types/`) to prove they are unchanged.
4. **Doc:** one paragraph in `core/Page/doc/subpages.md` on the new step in the order, and flip the ⬜ line in `core/Page/readme.md` if one names this.

## Prove it

- `node --check` every touched JS file. Run the core Page tests in your worktree: `node public/framework/core/Test/TestRunner.mjs public/framework/core/Page` and log pass counts before and after.
- Smoke from the main tree: `MSYS_NO_PATHCONV=1 node Server/smoke.mjs C:/Code/lew42/worktrees/readme-pages /framework/core/Events/ /framework/log/ /framework/ext/CSSDoc/ /framework/core/Page/ /framework/core/Page/parts/types/`. Log the FAIL count before your first change and after your last; the three readme folders should go from FAIL to PASS.
- Log `ready: worktree/readme-pages at <sha> <one line>` on this task, and send `mastermind-page` one line (if `send_to_agent` refuses, the log line is enough).

## How

- Your worktree is `C:/Code/lew42/worktrees/readme-pages` on branch `worktree/readme-pages`, made from michael/dev. Its server is http://localhost:54097/. Commit after each step.
- Never kill or restart the dev server or Servex. Never drive the owner's tabs: headless only. Never `git stash`. Edit nothing in the main tree except this folder.
- If `git status` in the worktree shows `files.jsonl` churn, leave it; commit only your own files.
- **Resolve, don't park.** Log anything left open with the reason.

**Deliverable:** the branch, the before and after shots, and one log line with the two smoke counts. If time runs out, cut step 4's readme line first.
