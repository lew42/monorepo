# core/Page readme: claim-by-claim check

Budget: $4. Load the `minion` skill first. Read-only: you edit NO file except this folder's `task.jsonl` (through `node .claude/hooks/append.mjs`) and `claims.md`.

**The method** (the `documentation` skill, "Verifying a readme: one claim at a time"): take ONE claim below, read only the code it needs, decide "is this statement correct?", write one log line, then the next claim. Never review the readme as a whole. Prove a thing is missing before you say so (grep for it).

The readme: `public/framework/core/Page/readme.md` (line numbers below are its lines). Already checked by script, skip: every link target exists, `Page.class.js` is 722 lines (the readme says 721: fine), `expert.json`, `inbox.jsonl`, `Page.css`, `tools/links.mjs`, `Server/layout-check.mjs --bands`, `Server/doc/directory-off.md`, `Servex/agents/page_tools.js` exist.

## Claims

1. (line 1) A folder with a `page.js` OR a `page.jsonl` is a page.
2. (9-18) This `page.js` works as written: `import { Page, h1, p } from "/app.js"`, `new Page({ meta: import.meta, title, content(){ h1(); p(); } })`. Check `/app.js` exports those three names.
3. (20) "A page nobody declares is a 404: nothing crawls." Check `Page.child()` in `Page.class.js` (about lines 361-397): does an undeclared child folder with a `page.js` still load (by `route()`, the parent's listing, or `Page.load()` importing `page.js`)? Answer for a plain `page.js` parent with no `route()`.
4. (23) `ask_expert core/Page` works: find the `ask_expert` tool in `Servex/` and say whether it resolves `core/Page` to `public/framework/core/Page/expert.json`.
5. (25-27) A List has events built in; an Item has an icon, a title and is saved. (`core/List`, `core/Item`.)
6. (34) Appending a line to a `page.jsonl` redraws every open tab with no reload. Trace: server tail → socket → the page's reader → redraw. File:line for each hop.
7. (35) `files.jsonl` is the folder's own file list, kept by the dev server.
8. (37) `doc/server.md` describes a Page whose data lives in node, loaded on first use, unloaded when idle: does that code exist (name the file)?
9. (44) `page_set(path, delta)` and `page_read(path)` exist as agent tools and change/read any page. Where are they defined?
10. (49) The load order is: memory → a declared `page.jsonl` → `md/`/`fs/` → `route()` → `page.js` → a bare `.md` file → not found. Compare with the real order in `Page.child()`; list any step the readme omits or misorders.
11. (56) A `create_page` tool exists and makes a page's files. Where?
12. (57) `./audit/` lists the layouts the site uses, most-used first, each with its opt-in call.
13. (71) `doc/architecture.md` describes agents changing pages through `page_set` in `Servex/agents/page_tools.js`.
14. (73) "tasks and sessions hold a page by reference, not by extending it". Check `public/framework/ai/AISession/AISessionDetail.js` (about line 23) and the task page class.
15. (79) `doc/words.md` names six page words.
16. (79) `page.js` in this folder is "the palette"; `Page.css` holds every `.page-*` rule (grep the repo for `.page-` rules defined in other CSS files: a count is enough).
17. (79) `./doc/` is a page: "every method, property and topic in full, on its own tab". The folder has no `page.js`; how is `/framework/core/Page/doc/` served?
18. (90-100) Each "Also here" line matches what the folder's `page.js`/`readme.md` says it is (one line per folder; 11 folders).
19. Missing, not wrong: list the `.js` files in `core/Page/` (23) that the readme never names. One line.

## Output

- One `log` line per claim in `task.jsonl`: `{"log":{"at":"NOW","claim":N,"verdict":"correct|stale|wrong|unclear","evidence":"file:line …","fix":"the corrected readme text, if any"}}`.
- Then `claims.md` in this folder: one table, `| # | claim | verdict | evidence | suggested fix |`, nothing else. That is the deliverable; cut the evidence prose first if long.
- Never kill or restart the dev server, never drive the owner's tabs, never stash (diff, don't stash). Do not commit; the mastermind commits.
