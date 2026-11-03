# Sidebar.js — design and architecture notes

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

## Class structure and styling

The Sidebar class extends View and manages:
- Brand header: logo and title
- Toggle button for mobile (hamburger)
- Filter (ux/Filter) with search functionality over the tree
- Tree navigation (ux/Tree) that walks page children lazily
- Persistent footer with optional mode toggle
- Resize grip for adjusting width

## FILTER implementation

`ux/Filter`, composed with no segments — this rail has one fact to narrow by (a title), not a category, so the segment row `ux/Filter` would otherwise draw never gets a second button and stays empty. `search_field: "text"` reads straight off a `ux/Tree` node (`{ text, href, children }`), so `filtered()` can hand the tree's own nodes to the predicate with no reshaping. `changed(predicate)` is the one wire (`ux/Filter/readme.md`) — Filter never touches the tree itself.

`chrome: false` and `.darken-2` are the two halves of ONE look: the Filter stops drawing its own `.surface.pad` card (a card inside a rail reads as a broken box), and framework's `.darken-2` gives the bar its ground AND the `--field-bg` that turns the field white on it. Neither is a local override — both are words the system owns, so a second UI bar anywhere gets the same pair. The owner's direction, 2026-09-19; Sidebar.css says the rest.

`-2` (16%), not `-1` (8%), and that was decided by looking at both: at 8% the bar barely read as a band, and the field's own 32% hairline was DARKER than the ground it sat on, which is backwards. At 16% the bar is plainly a bar and the white field is the brightest thing on it, which is the whole point of the pair.

## Tree navigation  

`root`: the live thing, walked lazily by `ux/Tree` — a branch's children fetch the first time it opens, so a fifty-page section costs one row until you ask. `pages`: the same shape flattened ahead of time, for a caller with no real Page (a demo, a hand-typed list). Either way this is the ONE place rows get built — `group()`/`link()` are gone, `ux/Tree` draws every row.

## Tree update on child changes

The live-update half of nav() above: same tree, redrawn in place, no reload. `draw()` throws every row away and rebuilds closed — reveal() after it is not optional, or a redraw that lands mid-cold-load silently erases whatever the COLD LOAD's own reveal() had already opened, with nothing to put it back. Same two-step nav() itself always takes: draw, THEN reveal.

## Visibility rules

"Appears in navigation" (core/Page/settings/) means the RAIL too, not only ext/Doc's tab strip — a child whose own `tab` line says `nav: false`, or whose own settings says so, skips the tree here the same way `Doc.bar()` already skips it there. Both read the SAME rule (core/Page/Log.js's `nav_ready()`/`tab_visible()`) so the two can never disagree about what "hidden" means. The child is still real, still reachable at its own url — this only drops it from the list.

ASYNC, on purpose: the real answer for a page.js child needs a fetch (page_settings()), and this whole call already sits inside a `.then()` in nav()/refresh_nav() — awaiting the REAL answer (`nav_ready()`) here, once, before the first paint, is what keeps the rail from ever flashing a tab that a moment later disappears. `tab_visible()` (the same rule, cached and synchronous) is for callers that render synchronously and correct themselves later instead — Doc.bar(), tabs().

Tree.nodes_of(page) builds `nodes` from `[...page.children.keys()]`, same order, so zipping the two by index is exact — `ux/Tree` is consumed here, never edited, so the filter runs on ITS OUTPUT instead of inside it.

A deeper branch opens LAZILY — `node.children` is a function ux/Tree calls the first time a reader expands it (`Tree.grow()`), not now — so the same filter is wrapped around that function too, one level at a time, or a hidden grandchild would still show the moment its parent branch opened.

## Search index

A query swaps the tree for a flat list of results taken from the WHOLE site: `index()` walks every branch of the live page tree, loaded or not, once. The tree itself is never touched, so clearing the box puts back exactly what was open. The query lives in the url (`?q=`), so a reload keeps it.

Every page under the root as { text, href, trail } — memoised. Branches are opened through ux/Tree's own lazy `children()`, so hidden pages stay hidden.

## Resize and storage

`ext/grip`, shared with `/layouts/shell/`'s own rail — pointer capture, so the drag survives leaving the strip, and a double-click resets. `write` sets the token only (`false` — see `size()`); `done` saves the ONE width the pointer let go of, not every frame of the drag. The clamp lives in CSS (`clamp(12rem, var(--sidebar-w), 50%)`), never here, so it stays right when the WINDOW changes size mid-drag rather than the width that was last asked for. `from: "start"` — this rail is docked at the screen's start and drags its own INLINE-END edge.

One key, shared by every Sidebar on the site: it is one piece of persistent chrome, not a per-page setting, so resizing it on one topic remembers for all of them. `Page.prefs()` is keyed on a PAGE's own url; `id: "sidebar"` is the seam `Page.Prefs` gained for exactly this — the same `lew42:sidebar` key this file always wrote, now with no second copy of the read/write/JSON-parse/catch it takes to get there.
