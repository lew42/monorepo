# Audit: the file explorer, before any change

Two things loaded today, at 1920px wide. Both shots are in `shots/`, also at 3440px.

**`/framework/ext/files/`, the Overview tab:**

![The files overview page today, with the "Columns" example open, three visible toolbar rows above a two-panel browser](shots/before-files-1920.png)

**A Files tab (`ext/files/`'s own — every `ext/Doc` module page has one):**

![The Files tab today: a mode-switcher bar, then a second panel-management bar, then the tree and source](shots/before-doc-files-tab-1920.png)

## The three questions

**1. Is the tree real, or a flat list?** Real, but it never closes. `files.js`'s `nest()` groups the space-separated paths into real nested folders (see the second screenshot: `about/` holding `page.js`, `team/` holding its own `page.js`, both indented under `about`). It's a genuine tree, drawn by walking that nested object — it was just built, on purpose, to never collapse: `doc/tree.md` records the call as "these trees run three to six entries by construction," which stopped being true the moment `ext/files/fs.js` (minion B's half) can hand it a whole directory.

**2. Where does the toolbar come from?** There are **two** stacked toolbars, and neither is `files.js`'s own idea:
- The top row (**1 column / 2 columns / code + rendered**, in the first screenshot) is `panels.js`'s `files-bar` — a mode switcher for adding a second source or a rendered-preview column.
- The row under it (**+**, a fullscreen icon, a list icon, "workspace", "1", "all", "twin", a search icon, a live pixel-width readout — visible in both screenshots) isn't from this module at all. It's `ext/Panel`'s own `Workspace` class: every workspace `panels.js` asks for comes with this management bar bolted on, built for a general panel editor (`ext/editor`) — add a pane, go fullscreen, switch a size preset, zoom, watch the live width. None of it is a file-browser control. This is almost certainly the "very primitive toolbar... kind of strange" the owner meant.

**3. Where does "no readme found" come from?** Not literal text anywhere in the code today. `ext/Doc`'s Files tab wires `about: path => md.file(meta, "doc/file/" + path + ".md")`, and `ext/markdown`'s `md.file()` already has a 404 branch that shows **"Not written yet — doc/file/&lt;path&gt;.md"** instead of a raw error, worded on purpose to read as an invitation. That's what the owner remembered — the doc calling it a plain error trap (`doc/decisions.md`) is itself stale; the fix already landed, the doc didn't catch up. Fixed as part of this task's doc pass.

## Who uses `files()`

- **`ext/Doc`'s Files tab** (`Doc.js` → `browser()`) — every module doc page. Passes `about`.
- **`core/Page/Log.js` → `draw_folder()`** — a `page.jsonl` page's own folder, plain (no `about`). This is also what every **AI 2 card's** file list draws with, since AI 2 cards are built on `Page.jsonl`.
- **`framework/start/page.js`** — the "three real files" walkthrough. Plain, two columns.
- **`ext/files/page.js`** — this module's own demos (in my fence, updated with the rest).

## Left for a follow-up (outside this fence)

`ext/demo/page.js` calls `files(..., { columns: "render" })` and its prose describes the mode bar ("Choose 2 columns... shift-click to fill the second"). Step 2 deletes that bar and the `columns` option; the call itself won't error (an unused option is just ignored), but the page will silently render a plain two-column browser while its own words describe a feature that's gone. `ext/demo/` isn't in this task's fence — flagged on the card for a follow-up edit.
