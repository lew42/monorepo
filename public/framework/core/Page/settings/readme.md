# Settings — tabs that manage themselves, and a page's own nav switch

## What

Two small additions to `page.jsonl` (`core/Page/doc/jsonl.md` has the full format), both
read by `core/Page/Log.js`:

```
{"tab": {"name": "disabled", "disabled": true, "nav": false, "active": true, "order": 3}}
{"settings": {"nav": false}}
```

**A `tab` line is state for ONE CHILD**, written on the PARENT's own `page.jsonl`. A child
that already exists — a declared child, a `{"file": "kid/page.jsonl"}` line — is already a
tab the moment `Doc.bar()` or `tabs()` sees it; a `tab` line only adds `disabled` (greyed,
unclickable, still a real page), `nav: false` (missing from the strip, still a real page at
its own url), `active` (this is the tab a reader lands on when they visit the PARENT's own
bare url, instead of the first-declared one) or `order` (breaks a tie) on top of that.

**A `settings` line is a whole PAGE's own preference**, written on ITS OWN `page.jsonl` (or
a sibling `settings.jsonl` for a `page.js` folder — the same rule `weight.jsonl` uses). The
first and only setting is `nav`: "does this page appear in its parent's navigation?" — the
right drawer's Settings tab has an "Appears in navigation" checkbox for whichever page
you're looking at, and it writes exactly this line.

## One nav rule, read in one place (2026-09-29 fix round)

Three different readers used to ask "does this appear in navigation?" three different
ways — the rail (`core/Sidebar/Sidebar.js`), the tab strip (`Doc.bar()`/`tabs()`) and the
drawer's own checkbox (`page_settings()`, `settings.js` beside this file) — and only the
drawer's own read the child's own `settings.jsonl`/weight for a `page.js` page. Unticking
the box on a `page.js` page (like `/framework/ux/Dictate/`) did nothing to the rail or the
tabs, because nothing ever loaded its settings.

Now all three read the same two `core/Page/Log.js` methods, `tab_visible(name)` (fast,
synchronous, cached — what the rail and the tab strip use while rendering) and
`nav_ready(name)` (the real, awaited answer — what the rail's own first paint awaits, so it
never flashes a tab that a moment later disappears), and both ask `page_settings()` the
exact same question the drawer's checkbox always asked. The rule, unchanged: an explicit
`tab` line on the parent wins outright (`nav: false` hides, `nav: true` — new, and how
`ext/Doc/Doc.js`'s own Overview/API/Docs/Files chrome stays pinned visible with no fetch —
always shows); otherwise a `{"settings": {"nav": false}}` line on the CHILD's own log wins;
otherwise a page whose weight (`core/Page/weight/`) is below 1 is out of nav.

## Live — a `tab`, `file` or `settings` line while the page is open

Appending one of these three lines to a log someone already has open redraws the tab strip
(and, because it bubbles all the way to the site's own root page, the rail too) with no
reload — `nav_redraw()`, `ext/tabs/tabs.js`, called by `core/Page/Log.js`'s own
`Reader.changed()`. The drawer's checkbox used to force a full `location.reload()` on every
click; it doesn't anymore.

## Try it

The three tabs above (Normal, Disabled, Hidden) are `core/Page/settings/`'s own children —
this whole page IS the demo (its own readme, right above the tabs). Their only difference
is two `tab` lines on THIS folder's own `page.jsonl`, shown above.

To see the `settings` line work: open Disabled or Hidden, open the ☰ drawer's Settings tab,
and untick "Appears in navigation" — the tab you just visited drops out of this page's own
strip immediately, no reload (`nav_ready()`/`tab_visible()`, `core/Page/Log.js`). Tick it
back to bring it home.

## Watch out

⚠ `nav: false` and `disabled` only ever affect the STRIP — the bar of clickable links. The
page itself is never gone; its url still works, typed or linked from anywhere else.

⚠ A page nobody ever set `nav` on defaults to visible, UNLESS its own weight
([`core/Page/weight/`](/framework/core/Page/weight/)) is below 1 — `settings.js`'s own
fallback.

## More

The code: [`Log.js`](/framework/core/Page/doc/jsonl/)'s `tab()`/`settings()`/`tab_visible()`/
`nav_ready()`; [`ext/Doc/Doc.js`](/framework/ext/Doc/)'s `bar()`/`section()`;
[`ext/tabs/tabs.js`](/framework/ext/tabs/)'s `tabs()`/`nav_redraw()`. The one reader every
path above ends at — the drawer's checkbox, `tab_visible()`'s background check, and the
rail's own first paint: [`settings.js`](./settings.js) (`page_settings()`), which checks
the dev server's own file list (`/directory.json`, the same tree `ext/files/fs.js` and
`core/Page/Markdown.js` already read) before fetching, so a page with no settings of its
own costs no real request at all.
