# toc architecture — read the page, don't declare it

`toc()` builds a "On this page" nav from the headings already on the page you are reading, and marks the section you are in. It is one function in [`toc.js`](../toc.js), styled by [`toc.css`](../toc.css), and called as the first line of `content()`. Usage and the opt-out are in the [overview](/framework/ext/toc/) and the [readme](../readme.md).

## Scan the page, don't declare the list
**Decided:** the nav is derived from the `h2`, `h3`, `.h2` and `.h3` nodes already inside the page.
**Why:** a declared list drifts quietly, and a drifted entry points at a section that is not on the page the reader is looking at. A heading is already in hand; a network-costing child list is not.
**Instead:** a declared `children`-style list, which costs a menu entry forever when it goes stale.
**Detail:** [decisions.md](./decisions.md)

## Place now, fill in a microtask
**Decided:** `toc()` appends its empty `nav` synchronously, then `queueMicrotask(() => fill($toc))` adds the links.
**Why:** `toc()` runs on the first line of `content()`, so no headings exist yet. A microtask runs after `render()` and `activate()` have added the node, but before the browser paints, so no empty rail is ever on screen.
**Instead:** calling `toc()` last (the nav lands below the content it indexes), wrapping the body in a callback, or scanning in `activated()` or `requestAnimationFrame` (both paint one empty frame).
**Detail:** [decisions.md](./decisions.md)

## The current section is the last heading past a line
**Decided:** on each scroll, the spy marks the last heading whose top is above the scroller's top plus 90px. It does this with one passive listener and a loop over the headings, not an `IntersectionObserver`.
**Why:** between two widely spaced headings nothing intersects, so an observer reports "no section" where the reader expects the last one they passed.
**Instead:** `IntersectionObserver` with `rootMargin` tricks, which reintroduce the same "last heading above" logic by a longer route.
**Detail:** [decisions.md](./decisions.md)

## Listen on the region, and skip hidden pages
**Decided:** the scroll listener is on `page.closest(".pages")`, and `update()` returns early when `page.offsetParent` is null.
**Why:** the region scrolls, not `window`, so a window listener never fires. A hidden page measures every rect at 0,0, so every heading would read as "above the line" and the last one would win.
**Instead:** a `window` listener, which never fires here.
**Detail:** [decisions.md](./decisions.md)

## The current link is `.current`, not `.active`
**Decided:** the spy toggles `.current` on the nav links.
**Why:** `Router.mark_links()` owns `.active` and `.in-path`, and it skips `#` hrefs, so it never clears an `.active` set by the toc. Two owners for one class leave a stale highlight.
**Instead:** reusing `.active`, which the router would never clear.
**Detail:** [decisions.md](./decisions.md)

## Wide screens get a sticky grid track, not a fixed box
**Decided:** at 82em and up, `.page:has(> .toc)` adds a real rail column, and the rail is `position: sticky` with `align-self: start`. Below 82em it is `display: none`.
**Why:** the region scrolls, not the page, so a sticky element inside `.page` sticks to a box that never moves. A `position: fixed` rail reserved no space and overlapped the prose on the way to the breakpoint.
**Instead:** `position: fixed`, which overlapped the prose.
**Detail:** [decisions.md](./decisions.md)

⚠ The rule matches `.page:has(> .toc)` at any depth, with no `.pages >` prefix and no `:not(.standard)` guard. `decisions.md`'s "Traps" section still says a `Doc` with `overview:` no-ops, citing the old `.pages >` selector. The current selector suggests it no longer does, but this is not checked in a browser here.

## The rail restates the page's tracks, never replaces them
**Decided:** the rail template redeclares every track of the page shell: bleed gutter, wide, main, the rail, and the trailing gutter.
**Why:** a page's left and right padding are its first and last grid tracks. Replacing the template dropped both gutters above 82em, so the `h1` sat flush against the sidebar.
**Instead:** a template with only `main` and the rail, which loses the gutters.
**Detail:** [decisions.md](./decisions.md)

## Skip the headings that are not sections
**Decided:** headings inside `.demo, .md-details, .toc, .files, .tab-bar, .sidebar, .page-previews` and anything with `.toc-skip` are not indexed.
**Why:** every example on the site sits in a `demo()`, and galleries and stat tiles render real `h2`/`h3` that are values or titles, not sections. The selector covers the common cases; `.toc-skip` is the opt-out for the rest.
**Instead:** declaring headings by hand (drifts), or a `.gallery` class, which teaches the ext about docs pages.
**Detail:** [skip-list.md](./skip-list.md)

## Only zero headings hides the rail, and only h2 and h3 count
**Decided:** a page with no indexed headings removes the rail. There is no minimum count, and `h4` is never indexed.
**Why:** a two-heading page still draws a useful nav. An `h4` is an uppercase annotation on this site, and listing it made the rail read like a list of labels.
**Instead:** a minimum of three headings, which the code never did.
**Detail:** [decisions.md](./decisions.md)

## The scan runs once per render
**Decided:** `fill()` runs once. A heading appended later, such as from a promise or `md.file()`, is not in the nav.
**Why:** pages render once and are cached. A `MutationObserver` would fix it, but it costs the same kind of always-on watching the spy rejected, and no page needs it yet.
**Instead:** a `MutationObserver` on the page.
**Detail:** [decisions.md](./decisions.md)

## `toc.css` stays ASCII
**Decided:** `toc.css` is ASCII only, comments included.
**Why:** a host that serves CSS without a charset decodes UTF-8 as Windows-1252, which double-encodes any non-ASCII character.

⚠ Not true today: `toc.css` has non-ASCII bytes in its comments (the `⚠` markers, among others). Either the comments change to ASCII markers, or the rule is kept only where the host has a charset. Left as written here, pending a fix outside this fence.
