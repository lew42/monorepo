Budget: $4 · Sonnet · worktree · I (mastermind-page-design) review and merge.

# Code card for /live/: a code block with syntax highlighting, its own class

Load the `minion` skill first. Why: the owner wants to see more code and data flow on the live screen. The plan it traces back to: [/live/plan/](/live/plan/) (its cards already show code as plain fenced blocks; this makes code a card of its own).

## Deliverables

1. **`public/live/LiveCode.js`**: `class LiveCode extends Item`, registered as type `live-code` (`Item.register(LiveCode, "live-code")`, the way `public/live/LiveButton.js` and `LiveLight.js` do it; read those first and copy their shape, including `static example`).
   Fields: `lang` (js, json, css, html, sh; default js), `code` (string), `title` (optional), `caption` (optional, one line of markdown under it).
   Its View draws the title, then the code highlighted, then the caption. A long line scrolls inside the block; the page never scrolls sideways at 400px.
2. **Highlight with what exists:** `public/framework/ext/highlight/` (read its readme). Do not write a second highlighter. If a language is missing there, add it there, small.
3. **A test:** `public/live/LiveCode.test.mjs` (node): replay a `live-code` line, check the fields; under 1 s.
4. **Registration needs two lines in `public/live/LivePage.js`** (owned by mastermind-live-page; I have proposed them to it): `import LiveCode from "./LiveCode.js";` beside the other Live imports (line ~11), and `"live-code"` added to `static card_types` (line 59). Make exactly those two edits in your worktree; nothing else in LivePage.js.
5. **A demo:** in your worktree, add three code cards to a new page `/live/demos/code-card/` (pages.add on `/live/demos/` through the item tool, pointed at your worktree's files if possible; if the tool only writes the main tree, write the page.jsonl lines by hand in the worktree): one js, one json, one css. Shots at 400 and 1200.
6. **Docs in the same commit:** the delta in `public/live/readme.md`'s list of card types (one line: `{"content":{"add":{"type":"live-code","lang":"js","code":"…"}}}`), and the `static example`.

## Fence

You may edit: `public/live/LiveCode.js`, `LiveCode.test.mjs`, `public/live/LivePage.js` (the two lines only), `public/live/LivePage.css` or a new `LiveCode.css`, `public/live/readme.md` (one line), `public/framework/ext/highlight/**` (only to add a language), `public/live/demos/code-card/**`, this folder.

## Rules

- Your worktree: `C:/Code/lew42/worktrees/pd-code-card` (branch `worktree/pd-code-card`, url `http://127.0.0.1:53343`). Commit by exact path after each working step (`public/live/` is gitignored: `git add -f`). Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`.
- Playwright: `import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs")`; scratch in `$LOCALAPPDATA/Temp/`.
- `node --check` every file; run the test and `node Server/smoke.mjs` before you report. No console errors on `/live/` and the demo page.
- Proof table in `proof.md` here; report one screen: what changed, shots' paths, commits.
