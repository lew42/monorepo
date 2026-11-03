# Minion B — notes

## The route

`Page.child()` gets one new branch, right beside the existing `md` one (`core/Page/Page.class.js`):

```js
if (name === "fs" && known === undefined) return this.add(name, await this.fs_folder()).load_all_children(levels);
```

`fs_folder()` lazily imports `ext/files/fs.js` and builds one `PageFiles` page, addressed at `folder`
(the same directory `md_dir()` already points at). So **any** page — a plain `page.js`, a `page.jsonl`
card, an `ext/Doc` module — gets a working `/fs/` child for free, with no `page.js` anywhere on disk.
Net new lines in `Page.class.js`: 4 (the `child()` branch) + 5 (`fs_folder()`), plus the separate
"Folder" link (see below).

## Trailing slash

**Both work, and land on the same content.** `Router.load_segments()` does
`url.split("/").filter(Boolean)`, so `/x/fs` and `/x/fs/` produce the identical segment list —
the trailing slash was never significant to the walk. Checked directly: both
`/framework/ext/files/fs` and `/framework/ext/files/fs/` return the same 19 files.

The one asymmetry: `Router.go()`'s `history.pushState` keeps whatever the *clicked link* wrote to
the address bar (with a slash, since `Page.move()` always writes `url + name + "/"`), but a page
typed or loaded **without** the slash keeps that shape in the bar too — nothing redirects it,
because `redirect()` was deliberately backed out of this router (`core/Router/doc/backed-out.md`).
Not a new problem: every route on the site already behaves this way; `/fs/` doesn't add one.

## Full screen — what actually removes the sidebar

`core/Page/words.js` says `` `full` is `.page.solo` ``, and the brief pointed at that word. Checked
before building: **nothing paints `.page-w-full` today** — zero CSS rules for it anywhere on the
site (`words: "full"` alone is currently a no-op class). What *does* remove the site's own left
sidebar is `.page.layout-full` (`styles/layouts/layouts.css`) — `position: fixed; inset: 0;
z-index: 20` — already worn by `styles/layouts/full.js` and `ext/Panel/playground`. `fs.js`
overrides `render()` the same way `full.js` does: `.page.layout-full` + a `.layout-close` (×)
button, no title/h1. Screenshots below show it working — no sidebar, no page padding, just the
file browser and the close button.

This is a real gap between the words.js doc comment and the current CSS, not something this task
fixes (out of fence — `Page.css` isn't in it). Worth a line on `core/Page`'s own board sometime.

## Production fallback

`PageFiles.list()` walks the same `/directory.json` tree `PageMarkdown.node()`/`.tree()` already
read (`core/Page/Markdown.js`), reused rather than duplicated. Tested by faking `window.fetch` so
`/directory.json` 404s into the SPA fallback (real production shape — html, not json): `list()`
returns `null`, and `/fs/` shows "This server has no file list … only works on the dev server" —
no crash, no console error.

## The Folder link (deliverable 5)

A small "Folder" link (`folder_open` + "Folder") right after the `h1.page-title` in
`Page.class.js`'s `render()` — the one place core draws a page's own header — pointing at
`this.url + "fs/"`. Guarded on `this.url` being set. **Doesn't reach `ext/Doc` module pages**:
`Doc` overrides `render()` completely (its own `well()`/`tabs()` shape), so this code path never
runs there — that's what deliverable 6's own link is for instead (see below), which fits the
Doc shape better anyway since those pages already dedicate a whole tab to files.

**Loose end, not chased further**: two INACTIVE, off-screen pages in the site's preloaded nav
tree (found via a DOM query for `.page-fs-link`, not by looking at anything visible) show a
`page-fs-link` with `href="null"` despite the `if (this.url)` guard passing. Never visible, never
the active page, zero console errors either way — I spent real time on it (see task.jsonl) and
stopped once it was clear it can't affect what a reader sees. A fresh agent chasing it: start from
`Page.naming()`'s three `url` fallbacks and whatever builds the sidebar's dormant subtree.

## The Files tab link (deliverable 6)

`ext/Doc`'s Files tab **does** load the widget automatically (`files_section()`'s `render()` calls
`doc.browser()` with no user action). Measured at 1920 on `/framework/ext/files/`: the file
browser is **1531px inside a 1920px window** (≈80%) — the tab panel, page padding and site
sidebar together cost about a fifth of the screen. The full-screen `/fs/` route recovers
essentially all of it (see `fs-framework-ext-1920.png`).

Added a small "↗ Open full screen" link above the browser, to the module's own `fs/` (not the
tab's `files/` sub-url). First attempt put it as a second flex-row sibling of the tree/about/source
panels and squeezed it into a stretched 34×473px sliver — `.doc-files` is a flex ROW built for
exactly one child. Fixed by wrapping both the link and the browser in one column div, styled
inline only (`Doc.css` isn't in this fence).

## Console errors

Zero on `/framework/`, `/framework/ext/fs/`, `/framework/ext/files/files/` (the Files tab), and
after clicking through to `/framework/ext/files/fs/`. `/framework/ai2/` has **one pre-existing
404** — `framework/ai/usage.json` doesn't exist in this worktree (it exists in the main tree; a
usage-refresh script writes it there and was never run in this checkout). Confirmed unrelated to
this task: same 404 appears on pages that never touch `md`/`fs` at all, and `usage.json` isn't in
this task's fence to create.

## Shots (1920, headless Playwright, scratchpad script `fe-b-probe*.mjs`)

- `shots/fs-framework-ext-1920.png` — `/framework/ext/fs/`
- `shots/fs-framework-1920.png` — `/framework/fs/` (the whole site's file tree)
- `shots/doc-files-tab-1920.png` — the Files tab, link + browser, after the layout fix
- `shots/fs-from-files-tab-1920.png` — after clicking "Open full screen" from the Files tab
- `shots/folder-link-1920.png`, `shots/doc-files-tab-top-1920.png` — earlier debug crops
