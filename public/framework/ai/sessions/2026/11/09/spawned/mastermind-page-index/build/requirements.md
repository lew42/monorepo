# Build: a parent lists its children from their files.jsonl lines (page index MVP)

Budget: $8. Model: Sonnet. Load the `minion` skill first, then the `code` skill.

## What and why

The owner (2026-11-09, voice): pages load too much; a folder should have a small index that a parent reads instead of loading every child. Measured: every page imports ~150 other `page.js` files (its ancestors' children, two levels deep, `load_all_children`, `public/framework/core/Page/Page.class.js:717`) only to learn their titles; `/framework/` makes 1078 requests (711 scripts).

**The plan is the spec; read it whole first:** `public/framework/core/Page/doc/index-jsonl.md`, section "The MVP" (steps 1–6) and "Decisions". It was reviewed against the code; follow it. If the code proves a step wrong, do the simplest thing that works and log why in your task log.

## Where

- Worktree: `C:\Code\lew42\worktrees\page-index` (branch `worktree/page-index`), its own server at `http://localhost:53305/`. Work and commit only there, by exact path, after each working step.
- A change under `Server/` needs that worktree's server restarted: `node Server/worktree-restart.mjs page-index` (run from the main repo `C:\Code\lew42\monorepo`). Never restart or kill the main dev server or Servex.

## Deliverables (each ticked in your task log with its proof)

1. `Server/PageNav.mjs`, `class PageNav`: `PageNav.of(dir)` → `{title, icon, description}` (keys only when found) read from text: a `page.jsonl` (fold its plain top-level `title`/`icon`/`description` keys, latest wins), else literal `title:` / `icon:` / `description:` string literals in `page.js`, else `readme.md`'s `# Title — description` heading. CLI: `node Server/PageNav.mjs [dir]` dry run prints what it would write; `--apply` writes. `Server/PageNav.test.mjs`: one temp folder per source kind, under 1 s.
2. `Server/plugins/PageFiles.js`: a child page's line carries `nav` (`{"file":"core/page.js","nav":{…}}`); a new line is written when a child's `page.js`, `page.jsonl` or `readme.md` changes **and only if its nav differs** from the latest line (session `page.jsonl` files change many times a minute). Keep every existing line shape and reader working.
3. `GET /api/index?dir=/framework/&depth=2` (a small plugin beside `Server/plugins/FolderNames.js`, registered in `Server/run.js`): one JSON object of each child's name, kind and nav, and at depth 2 their children's, read from the `files.jsonl` / `page.jsonl` listings; cached until one of those files changes.
4. Browser: `public/framework/core/Page/Listing.js` keeps each child's `nav` (e.g. `listing.navs`, a Map). `load_all_children` puts the nav fields on a still-unloaded placeholder (`{id, name, stub: true}`, `core/Page/Children.js:25`) and imports nothing for it; `nav_for` (`Page.class.js:697`), preview cards (`core/Page/Previews.js`), tabs and the sidebar (`core/Sidebar/`) read a placeholder's fields where they read a page's. Opening the child (the Router's `child(name)`) still does the full load and `add()` replaces the placeholder. On the dev server use the aggregate (one request); without it (a static host) fetch the child listings. A child with no nav line loads as today. `Page.from_index` (default true; `?index=0` in the url sets it false) switches it all off.
5. The check: a page that loads fully compares its `nav()` with its listing line and writes one `console.warn` per difference (once per page).
6. Measure with `node public/framework/ai/sessions/2026/11/09/spawned/mastermind-page-index/measure.mjs http://localhost:53305 <urls>` for `/framework/`, `/framework/ai/sessions/`, `/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/`, `/framework/core/Page/`, each with and without `?index=0`. Write the raw output to `measure-after.txt` beside this brief, at the same relative path inside the worktree, and commit it there. The decisive numbers: requests and page.js imported.
7. Nothing visibly broken: screenshots of `/framework/`, `/framework/core/` and `/framework/ai/sessions/` at 400 and 1920, with and without `?index=0`, saved in `shots/` beside this brief (same relative path in the worktree); the sidebar, tabs and preview cards show the same titles and icons both ways. `node Server/smoke.mjs C:/Code/lew42/worktrees/page-index /framework/ /framework/core/ /framework/ai/sessions/` shows no FAIL.
8. Docs in the same commits: `core/Page/readme.md` (the `files.jsonl` row and "How a url becomes a page": a parent reads nav lines), the "Status" of `doc/index-jsonl.md` (built, with the commit), the PageFiles comment block. Tests: `PageNav.test.mjs`, and extend `core/Page/Listing.test.mjs` for `nav`.

## Do not

- Commit the `files.jsonl` lines the backfill or your server's watcher writes: commit code, tests, docs, measurements and shots only; before you report, `git checkout --` the generated `files.jsonl` / `page.jsonl` changes in your worktree (the mastermind runs the backfill in the main tree at landing).
- Merge. Report and the mastermind merges.
- Kill or restart the main dev server or Servex, drive the owner's browser tabs, or `git stash`.
- Touch the sessions store's `index.jsonl` files or `ai/index.jsonl` (other systems' streams).

## Report

Your task log (`task.jsonl` beside this brief), then one screen in your reply: what works, the before/after numbers (requests, page.js imported, bytes, quiet ms), anything that does not, commits.
