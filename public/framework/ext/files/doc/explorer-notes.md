# PageFilesExplorer Notes

## What is PageFilesExplorer

v2 of the file explorer (v1 is `PageFiles` in `fs.js`). v1 is classic full-screen: no site chrome, one file at a time. v2 is roomier: the framework's left nav stays in place, everything to its right becomes the explorer.

Wide layout: a tree on the left, then one or more code columns on the right. Every tree row is a real link — plain click opens it (router does the work via `fs.js`'s `route()`). Small "open beside" button on each row opens it as an additional column without leaving the current one. Narrow layout: code fills the screen with a sticky header showing the file name as a dropdown to pick another file. Both use the same markup; `switcher.css`'s container query switches between them on resize.

Every file is a real routed URL (`file_link()`, `PageFiles.route()`, fs.js) — loads cold, back/forward work.

Design record: `readme.md`, `doc/decisions.md`. The `.switcher` responsive shell is generic; `doc/switcher.md` explains reuse.

## container() method design

Why it can't just override `render()`: Every other page mounts into its parent's named region first. For pages under `/framework/ext/Doc/fs/`, that region is the Doc's tab panel, leaving the explorer squeezed inside the Doc's title band (measured 2026-09-29, screenshots in task). v1 escapes via `position: fixed` but covers the whole viewport, hiding the left nav.

The fix: jump straight past the parent's region to the nearest ancestor that owns its own `$pages` — for `/framework/` pages, that's the framework section root, whose `$pages` sits beside the Sidebar. Tried jumping to `app.$pages` first; that skipped the sidebar too since it lives inside the framework root's layout, not the app's.

This works because `Page.css` already has a rule for leaf pages as siblings of their own ancestors: "an ancestor is replaced by a sibling." The Doc, still an ancestor in the chain, stops being shown when this sibling in the same container is active. This is also why `fs.js`'s `route()` can build a fresh page per file: both land in the same container, and the arrangement contract picks the right one.

## with_query() helper

Current URL with one query key set — used for the "Classic view" (`?v=1`) escape hatch drawn inside the first code column's toolbar, not the page head (which the site's fixed `.drawer-menu` covers at 1920 and 3440, found live from task screenshots). Plain `String.join()` would double a `?` already there; `URL` merges for free.

## explorer() function

Main tree and column renderer. Takes metadata, paths list, and selected file. Builds `.switcher` with `.switcher-nav` (tree) and `.switcher-panel` (code columns).

Every row is an ordinary link: plain click navigates via router (same as any site link), Ctrl/Cmd-click is left alone for browser "open in new tab." The one thing plain links can't do — open as an additional column beside the current one — gets a small button on the row instead of hijacking a modifier key.

State tracks `columns: [first]` — which files are open.

## mark() closure

Which rows are currently open, so `switcher.css` can show the "open beside" button. Owner's ask (2026-09-29): reveal button on hover/focus, and always on a row that is already open (phone has no hover; that row is the only one a touch reader sees the button on).

## open_beside() function

Opens a file as a new column without leaving the current one — the only way to more than one column now that Ctrl/Cmd-click is the browser's own. Reason: two versions section of readme explains why the owner prefers explicit buttons over modifier keys.

## column() function

One column: its own toolbar (path, copy, raw, close) and code block. First column also carries the "Classic view" (v1) escape hatch — one per explorer, not per column, since a column's toolbar is the only site area the fixed ☰ menu never covers (checked at 400/1920/3440).

`source()` is called once and both placed (`div.c(cls, () => drawn)`) and watched (`Promise.resolve(drawn).then(...)`), same split `ext/files/files.js`'s `draw_source()` uses. So `.code-line` gutter exists in DOM before `mark_lines()` searches for it.

## item_nodes() — tree to UI item shape

`nest(paths, cut)` produces `{ "a.js": "path", dir: {…} }` shape (ext/files, exported for this kind of second reader). This transforms it to `ui/item`'s `{ icon, name, href, end, children }` node shape.

File becomes a real routed link (`file_link()`) plus small "open beside" button (`end` slot, same as `item()`'s menu case — its `stopPropagation()` keeps button click from firing row's link). Folder becomes an `open` branch — every folder starts open, same default ext/files uses.

Context menu lookup: Real `<a href="file_link(path)">` leaves (native open/close, no click-routing script, unlike ext/files' hand-rolled tree). `contextmenu` needs the row's path, found by matching the clicked link's href back against every candidate rather than re-deriving `file_link()`'s URL shape twice.
