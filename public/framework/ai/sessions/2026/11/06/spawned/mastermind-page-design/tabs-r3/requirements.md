Budget: $4 · Sonnet · worktree `pd-tabs-r3` · I (mastermind-page-design) review and merge.

# The /live/ demos become live pages: header, breadcrumb, gear, no Files button

Load the `minion` skill first. The plan this traces back to: [/live/plan/](/live/plan/).

## The ask (the owner, relayed by voice-app, 2026-11-06)

On `/live/demos/tabs-page/` the "Files" button is not what was asked for. Every page under `/live/` uses the LivePage class (or a subclass): the small breadcrumb, the settings gear, the tab row. Files belong on the gear's settings page, not on the page. Children get the class automatically.

**Already done by mastermind-live-page (its merge comes first; start only after it, I'll tell you the commit):** every `page.jsonl` sub-page under `/live/` is built as a LivePage automatically, whatever its line 1 names (`LivePage.child`, `LivePage.log_class` in `public/live/LivePage.js`). Your job is the demos' data and the proof, not LivePage itself.

## Deliverables (each ticked only with its proof in your task log)

1. **Merge `compliance/dev` into your worktree first** (it must include live-page's merge). Never `-X ours`.
2. **Every page under `/live/demos/`** (list them: `ls public/live/demos/*/page.jsonl` and the sub-folders) draws as a LivePage: `.live-page` present, a breadcrumb, the gear, no `.page-files-toggle-btn`. One table row per url, at 400 and 1200.
3. **The breadcrumb equals the url:** for each url, the crumb links' hrefs are exactly the prefixes of `location.pathname`, the last one `aria-current="page"`.
4. **Each demo still shows what it demonstrates.** Some lines were written for the plain Page and may draw nothing on a LivePage (`{"tab":…}` lines, `{"place":…}`, `navigation:"tabs"`, `columns`). For each demo: does its point still show? If not, rewrite its data to the LivePage way (sub-pages are the tab row; read `public/live/readme.md`) or, if LivePage cannot show it, log one line naming what LivePage lacks (I take that to live-page; don't edit LivePage.js). Retitle `"Tabs (plain Page)"` to what it is now.
5. **Scrolling, proved:** put 30 `part-text` lines on `/live/demos/tabs-page/alpha/` (in your worktree's file) and show the page scrolls at 400 and 1200.
6. **Nothing else moves:** shots of `/live/`, `/live/design/` and `/live/lab/is-page/` at 400, before and after; `node Server/smoke.mjs` clean.
7. **Docs in the same commit:** `public/live/doc/page-features.md` (the demos' state) and `public/framework/core/Page/doc/jsonl.md`'s "The Files button, and pages shown as tabs" section: one line saying pages under `/live/` show files on the gear's settings page instead.

## Fence

You may edit: `public/live/demos/**`, `public/live/doc/page-features.md`, `public/framework/core/Page/doc/jsonl.md` (that one section), this folder. Not `LivePage.js`, not `core/Page/*.js`: ask me (`send_to_agent mastermind-page-design`).

## Rules

- Worktree `C:/Code/lew42/worktrees/pd-tabs-r3` (already made: branch `worktree/pd-tabs-r3`; its url is in `.worktrees.json` of the main tree, or `node Server/worktree-up.mjs pd-tabs-r3` prints it). `public/live/` is gitignored: `git add -f`. Commit by exact path after each step. Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`.
- Playwright: `import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs")`; scratch in `$LOCALAPPDATA/Temp/`.
- Proof table in `proof.md` here; report one screen: what changed, the table, commits.
