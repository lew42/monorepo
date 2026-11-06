Budget: $4 · Sonnet · worktree · I (mastermind-page-design) review and merge.

# Tabs page, round 3: the breadcrumb is the url; tab content has no padding of its own

Load the `minion` skill first. The plan this traces back to: [/live/plan/](/live/plan/) ("Url = folder; tabs = sub-pages; crumbs = the url").
Rounds 1–2: [../tabs-page/proof.md](../tabs-page/proof.md). Demo: `/live/demos/tabs-page/` (a plain `Page` with `navigation: "tabs"`).

## Deliverables (each ticked only with its proof in your task log)

1. **The url follows the tab.** Click each tab at `/live/demos/tabs-page/`; record `location.pathname` after each. If a click does not change the url, fix it in `ext/tabs`.
2. **A breadcrumb on a plain Page that equals `location.pathname`.** One part per path segment, each a link to that prefix, the last one `aria-current="page"`.
   - One of everything: `public/live/LivePage.js:242` (`LivePage.Crumbs`) already does this from `page.url`. Do not edit LivePage.js (live-page owns it).
     Build the crumb once in core (`public/framework/core/Page/`, e.g. `parts/PageCrumbs.js`, a View), drawn by a plain Page that sits under a tabs parent or deeper than one level. Say in your log how LivePage could switch to it later (one line); don't switch it.
   - Proof: at `/live/demos/tabs-page/alpha/`, the crumb text joined equals the pathname segments, and it changes when you click another tab.
3. **Transparent tabs.** At 400px, tab content sits at x=44 while the h1 is at x=16. The 28px are `.page-canvas { padding: var(--pad) }` (`core/Page/Page.css:1059`, `Frame.js:34 box()`) plus `.page-content-list`'s `--pad-well` and `--wash` background (`Page.css:854`). Under a tabs parent (`.page-nav-tabs`, added by `word_classes()`, `Page.class.js:286`) the tab content gets no padding and no background of its own: its left edge equals the h1's. Scope it to `.page-nav-tabs` only.
   - Proof: left x of the h1 and of the first content block, at 400 and 1200, before and after.
4. **Scrolling, proved.** "Alpha doesn't scroll" was because alpha is empty. Add long content to one demo tab (e.g. 30 `part-text` lines on `/live/demos/tabs-page/alpha/` via the item tool) and show it scrolls at 400 and 1200.
5. **Nothing else moves.** Run `C:/Users/mike/AppData/Local/Temp/probe-pages-scroll.mjs` (edit its `wt` host to your worktree url): every url except the tabs-page ones must say `same`. Shots of `/framework/core/Page/` and `/live/` at 400, before and after.
6. **Docs current in the same commit:** `public/framework/core/Page/doc/jsonl.md` (section "The Files button, and pages shown as tabs") and `core/Page/readme.md` if you add a class.

## Fence

You may edit: `public/framework/core/Page/**`, `public/framework/ext/tabs/**`, `public/styles.css` (only if needed), `public/live/demos/tabs-page/**`, this folder. Nothing else; ask me (`send_to_agent mastermind-page-design`) if you need more.

## Rules

- Take a worktree with `take_worktree` (retry once if it times out). Commit by exact path after each working step. Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`.
- Headless Playwright: `import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs")`. Scratch in `$LOCALAPPDATA/Temp/`, never the repo.
- Run the `core/Page` node tests and `node Server/smoke.mjs` before you report.
- Findings go in your task log as log lines; write the proof table to `proof.md` here. Report one screen: what changed, the proof numbers, the commits.
