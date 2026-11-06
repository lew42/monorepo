Budget: $5 · Sonnet · worktree `pd-inspect` · I (mastermind-page-design) review and merge.

# Inspector: see what any page or card is made of, and how it got there

Load the `minion` skill first. The plan: [/live/plan/](/live/plan/), card "Settings: a page's own controls".

## The ask (the owner, relayed by voice-app, 2026-11-06)

For any page or item, show its class, where it is stored, its children, the methods you can call, and its change history (maybe a replay slider). Reachable from the settings page.

## What exists (reuse it; don't rebuild)

- **The settings page** (`<page>/settings/`, the gear in a live page's header): `LivePage.Settings` in `public/live/LivePage.js:451` already shows **Data from** (the file), **Class** and **Lines**, then the folder's files. Owned by mastermind-live-page.
- **Methods:** `public/live/design/ui/MethodMap.js` groups a class's methods (read it; reuse its walking of the prototype chain, or move that part into your class and have MethodMap use it).
- **Replay:** `Item.replay(lines)` (`public/framework/core/Item/Item.js:705`) rebuilds an Item from its lines. The replay lab (`core/Item/replay/`) shows the idea.

## Deliverables

1. **`public/framework/ext/Inspect/ItemInspector.js`**: a View given `{item}`. Three short sections: **Inside** (its content cards and sub-pages: id, type, title, one row each, each a link where it has a url), **Methods** (the ones a delta can call: own class first, then each parent class, collapsed; a method name and its first comment line if cheap), **Fields** (its saved keys and values, short).
2. **`public/framework/ext/Inspect/DeltaHistory.js`**: a View given `{url}` (a folder url with a `page.jsonl`). Lists every line (number, `by`, time, the delta in one line, truncated). A slider from 1 to N: moving it replays lines 1..N (`Class.replay` or `new Class(line1)` then `set()` each line, in memory, never written) and shows the result as a small summary: title, cards in order, sub-pages. Nothing is ever written to disk.
3. **On the settings page, two lines** in `LivePage.Settings` (I am proposing them to mastermind-live-page; make exactly these in your worktree): after the Files list, `new ItemInspector({ item: of })` and `new DeltaHistory({ url: holder })`, under `h4` headings "What it is made of" and "How it got here". The import is dynamic (`await import("/framework/ext/Inspect/…")`) so core never imports ext and `/live/` pays nothing until settings opens.
4. **Proof:** `/live/plan/settings/` and `/live/design/settings/` at 400 and 1200: the slider at line 1 shows only the title; at N it matches the live page's card count. No console errors. `node Server/smoke.mjs` clean.
5. **A node test** `ext/Inspect/Inspect.test.mjs`: replay the first N lines of a small fixture page, assert the card count per N; under 1 s.
6. **Docs in the same commit:** `ext/Inspect/readme.md` (what, files, how to use, one screen) and its line in `public/framework/readme.md`'s ext index if ext modules are listed there (check), plus a link from `public/live/readme.md` (one line).

## Fence

You may edit: `public/framework/ext/Inspect/**`, `public/live/LivePage.js` (the Settings lines only), `public/live/design/ui/MethodMap.js` (only to share the method walk), `public/live/readme.md` (one line), this folder.

## Rules

- Worktree `C:/Code/lew42/worktrees/pd-inspect` (branch `worktree/pd-inspect`; its url is in the main tree's `.worktrees.json`). Merge `compliance/dev` in before you report (live-page is editing LivePage.js too; never `-X ours`). `public/live/` is gitignored: `git add -f`. Commit by exact path after each step. Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`.
- `node --check` every file. Playwright: `import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs")`; scratch in `$LOCALAPPDATA/Temp/`.
- Proof table in `proof.md` here; report one screen: what changed, shots' paths, commits.
