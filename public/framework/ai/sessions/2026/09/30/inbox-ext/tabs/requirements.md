# Tabs are detected, not hand-listed: /framework/ai/

Load the `minion` skill first. Your parent is task-mastermind-inbox-ext. The card is `2026/09/30/ai-page-becomes-the-ai-2-inbox`.

## The owner's ask (relayed by vscode-mastermind, 2026-10-01)

> **Tabs are DETECTED, not hand-listed.** Today `TABS` in ai/overview.js is a manual array, and new subsystem pages (local, images, models, tests) need someone to remember to add them. Instead, derive the tabs from the page's own index: the `{"file": "x/page.jsonl"}` lines in ai/page.jsonl, plus page.js children. Keep only children that say they are tabs, e.g. a `{"settings": {"tab": true}}` line in the child's own page.jsonl, so the 40+ date folders stay out. Order them by the child's `weight` (default 1), with Inbox pinned first.
>
> This is still "declared, not crawled": the index is written by the watcher or the create-file tool. Document it on the System tab.

## Facts I checked (2026-10-01)

- A folder's file index is now `files.jsonl`, not page.jsonl (`Server/page-files-migrate.mjs` moved it). `public/framework/ai/files.jsonl` has lines like `{"file":"audits/page.js"}` and `{"file":"collab/"}`. Read the index the way core/Page already does (`log_of()`; see `Server/page-files-backfill.mjs`). Don't write a second parser.
- core/Page already reads `{"settings": {...}}` lines from a page's page.jsonl (`core/Page/Log.js` line 34, `core/Page/settings/settings.js`). Use that: `tab` and `weight` are new settings keys.
- Today: `overview.js` line 12 `export const TABS = ["inbox", "log", "system"]`; `page.js` line 106 routes them with `tab_page(this, name)`. Inbox and Log have no folder; `ai/system/` exists. `ai/tests/` exists (AITest.js). `local`, `images` and `models` don't exist yet (`ai/system/models` does).
- A shell write that names a .jsonl file is blocked by a hook. Create a new page.jsonl with the Write tool, or with `node .claude/hooks/append.mjs <file> <array.json>`.

## Deliverables

1. Remove the hand-written `TABS` array. The tab list comes from the children that declare `{"settings":{"tab":true}}` (optional `"weight"`, default 1) in their own page.jsonl. Order is ascending weight, then name, with Inbox always first. Date folders, and anything else without `tab:true`, are never tabs.
2. Inbox, Log and System keep working exactly as today, including every URL (`/framework/ai/`, `/framework/ai/log/`, `/framework/ai/system/`, `?min=0`) and the v1 Log switch. If a built-in tab needs a folder only to hold its page.jsonl declaration, add the folder. Its content still comes from `tab_page`.
3. Proof that adding a tab is one file: declare `tests` as a tab (`ai/tests/page.jsonl` gets `{"settings":{"tab":true,"weight":5}}`) and show it appears with no change to overview.js or page.js. Show it at 1920, and check the tab bar still fits on one row at 400.
4. Document it on the System tab (`overview.js`): one short heading plus 2–3 sentences saying how a page becomes a tab (the settings line, weight, Inbox first) and that this is declared, not crawled. Update `ai/readme.md` with one line.
5. Shots at 400, 1200, 1920 and 3440 of /framework/ai/, /framework/ai/log/ and /framework/ai/system/, before and after (`node Server/layout-check.mjs <urls> --widths 400,1200,1920,3440`, worktree server http://localhost:51490).

## Fence

- Work in the worktree `C:/Code/lew42/worktrees/inbox-ext` (branch worktree/inbox-ext, server :51490), and commit there after each piece.
- You may edit `public/framework/ai/overview.js`, `ai/page.js`, `ai/readme.md`, and new `ai/<tab>/page.jsonl` files. You may also edit `core/Page/settings/` only if a reader for `tab`/`weight` must live there (say why in your log).
- Never write task-dir files on the branch: your log and shots go in the MAIN tree at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/09/30/inbox-ext/tabs/`.
- Use headless Playwright only. Give every process windowsHide. Don't link node_modules. Stop any server you start other than :51490.

## Report

Send your parent the commit hash(es), the shot paths, and anything you left open. Keep it to one screen.

