# Minion brief: build the layout explorer

Load the `minion` skill first, then `page`, `code` and `css`.

**Read first, in this order:**
1. The owner's words: `public/framework/ai/2026/09/29/layout-explorer-3-columns-and-a-study-of/owner-words.md` (the first half is yours; the aside about the selected element is another task's).
2. The task brief: `public/framework/ai/2026-09-29/layout-explorer/requirements.md`.
3. The HTML study, and follow its recommendation: `public/framework/ai/2026/09/29/layout-explorer-3-columns-and-a-study-of/html-study.md`.

## Where you work

- **Worktree:** `C:\Code\lew42\worktrees\layout-explorer`, branch `worktree/layout-explorer`. Its server is `http://localhost:61596/`. Edit and commit only there, never in `C:\Code\lew42\monorepo`.
- **Your fence (write only here):** `public/layouts/explorer/` (new), one line in `public/layouts/page.js` (`children:` plus one link line in its content), and `public/layouts/readme.md` (one Use bullet). If you truly need to touch anything else (a shared module, `framework.css`), stop and say so in your final message instead.
- **Your log:** append to `public/framework/ai/2026-09-29/layout-explorer/task.jsonl` in the MAIN tree with `node .claude/hooks/append.mjs` (write the lines file with the Write tool, in the scratchpad). A `log` line when each deliverable works.
- Every process you start: `windowsHide: true`. No pop-up windows. Never drive the owner's browser tabs; use headless Playwright from the scratchpad.

## What to build: `/layouts/explorer/`, one page with three regions

1. **Left rail:** the current level's items (the selected item and its siblings), as small preview cards. At the top level, these are categories, most primitive first: one column, two columns, three columns, many (`n`), then scale groups (mobile, mega).
2. **Centre:** the selected item, LARGE: the real page view, scaled to fit (a responsive zoom or one of our responsive viewports).
3. **Right rail:** the selected item's children (its variants), as preview cards.
4. **Clicking a child shifts one level down:** the old right rail becomes the left, the child goes to the centre, its children fill the right. Clicking a left card selects that sibling. Every step has its own URL (`/layouts/explorer/two-columns/2-sidebar/…`), and back and reload land in the same place. A small breadcrumb above the centre lets you go up.
5. **Each item is a page with its own URL.** A preview card is that page rendered small, not a screenshot, and clicking it navigates.
6. **Every layout on the site sits in the tree:** the `/layouts/` ids (`layouts.json`), the core/Page width words, the approved five, `/layouts/decide/`, the sidebar variants (`/framework/core/Sidebar/variants/`), and the floating page. Put the tree in one data file (`explorer.json`: title, url, children), so adding a layout is one line.
7. **The ☰ drawer shows the selected item's properties** (title, url, description, child count), if `ext/drawer` offers a way to add content; otherwise show them in a small strip under the centre view and say so.

## Rules

- **Reuse before you build.** Find these first: the layout drawings in `public/layouts/Layout.js` (a real flex/grid drawing, shrunk with `zoom`), the page `preview()` in core/Page, the viewports in `public/layouts/shell/` and `framework/ext/Panel/Workspace/viewports.js`, and `/layouts/browse/`. Name what you reused in your final message.
- **Previews must stay fast.** A whole live page in an iframe for every card will crawl. Use an in-page drawing for a layout id, and a lazy iframe (loaded when visible, `loading="lazy"`) only for a whole page. The centre may be an iframe of the real page scaled to fit.
- **Minimal new CSS**, prefixed with the module's registered prefix (`std-`, or run the `new-css-class` skill for `lx-`), inside a layer. Hide the framework sidebar only on this page, if it shows at all (`/layouts/` is top level).
- Resolve URLs against `import.meta`. No DOM after an `await`.
- Check it at 1920 and 3440 (and 400: the rails stack). Save shots to the task dir: `explorer-1920.png`, `explorer-3440.png`, `explorer-deep-1920.png` (two levels down).
- Commit in the worktree when it works. Do not merge; the mastermind merges.
- Budget about $5 and 60 minutes. Page docs: a `readme.md` and `doc/` in `explorer/` (short: what it is, how to add a layout).

## Done means

In your final message: the URL, the three shots, one line per numbered deliverable above (worked / didn't, with proof), and what you reused.
