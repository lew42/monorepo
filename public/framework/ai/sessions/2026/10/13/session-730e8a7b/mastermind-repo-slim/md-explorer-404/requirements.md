# The Markdown Explorer lists markdown files only: no probing of subfolders, no same-origin 404s

Budget: $3. Sonnet. Load the `minion`, `code` and `page` skills. Your log is this dir's `task.jsonl`.

**Why:** the Markdown Explorer landed on 10-19 (d7cca2099, `core/Page/Markdown.js`: `/<module>/md/` is a Browse with the readme in the pane and every `.md` listed; `../markdown-explorer/plan.md`). The mastermind's `check_page` on `/framework/core/Page/md/` at 08:14 shows four same-origin 404s that `/framework/core/Page/` itself does not have: `layout-check/files.jsonl`, `layout-check/page.jsonl`, `overview/tasks/files.jsonl`, `overview/tasks/page.jsonl`. The explorer's listing walks into subfolders (or hands them to the page loader, which probes each folder for `files.jsonl` and `page.jsonl`). CLAUDE.md: a same-origin 404 is always a FAIL at the merge gate. The explorer must list markdown files (the module's `readme.md`, sibling `*.md`, `doc/*.md`) and nothing else; a subfolder that is a module of its own is not a markdown file.

## Deliverable

1. Find where the four requests come from (`Markdown.js`: the listing step, `Page.loaded_listing`, `load_all_children`; the console of `check_page` names the urls) and make the explorer build its list from the folder listing's `.md` files only, never from folder children, with no fetch per folder. A `decision` line with the alternative (filter the 404s in the loader; rejected because the loader is shared).
2. `check_page` on `/framework/core/Page/md/`, `/framework/ux/Dictate/md/` and `/framework/ext/Mention/md/` at 400 and 1200: zero `http_errors`, zero `failed`; the list still shows the readme and every doc; the pane still renders; the back button still returns. `Server/smoke.mjs` clean.
3. Worktree, `node --check`, `merge.mjs` (`--no-review` naming your review if the gate cannot see this 2026-10-13 task dir), a `finish` line with the three pages' error counts (all 0) checked with `tail -1`, `git status` clean for your paths. Never restart servers; never drive the owner's tabs.

Fence: `core/Page/Markdown.js` (and `Markdown.css` if needed), this task dir. Not `Page.class.js`, not `ext/Doc`.
