`demo.app(page, { nav, urls })` plays App and Router for **one** in-memory tree, inside
a box: a url strip that's also a breadcrumb, an optional rail, and the region
the pages mount in. Renamed from `mini_app()` (2026-08-12) — the box was never
*mini*, it's this tier's whole app, and every other entry point already used the
`demo.` namespace.

## Nothing is fetched

`go(url)` walks `page.child(name)` the way the real Router does, except every
`child()` call resolves from an in-memory `Map` — there's no network, and a name
string in `children:` would probe the real server for a `page.js` that doesn't
exist. Object children only, always.

## Clicks never reach the real Router

A `click` listener on the box calls `preventDefault()` before the real
`link_clicked` handler ever sees the event, and only urls that start with the
demo's own root are walked at all — a link to the *real* site written inside a
demo tree stays real and leaves the box.

## `urls: false` is the default — a demo tree's urls are names, not addresses

A demo tree is built in memory, so its urls address nothing on the server. A root
titled `Web` gives its children `/web/html/`, `/web/css/` … and those *look* like
links: left-click works, because the box intercepts it. Middle-click,
open-in-new-tab, copy-link and every crawler get the app's own "nothing matches"
404 instead — which is how the site's homepage came to advertise four dead urls
from its highest-authority page ([the critique](/framework/ai/2026-08-30/critique-blog/)).
An audit of all 91 call sites on the site found none that wanted a real href
([ai/2026-08-30/demo-urls-audit/](/framework/ai/2026-08-30/demo-urls-audit/)), so
this is the default now, not an opt-in.

By default the address stays off `href` and on `data-demo-url`. `followed()`
reads either one, `Enter` is wired by hand because an element with no `href` is
not a link any more, and `app.css` puts the pointer back. `unlink()` runs from
`mark()` rather than from `rail()` and `crumbs()`, because a page in here draws
its own `previews()` and those cards carry real `href`s too — and it skips any
anchor pointing *outside* the root, which is a real link to the real site.

Pass `urls: true` when the tree mirrors a page that genuinely exists — `scope:`
a real page, as `page.demo()` (ext/demo/shell.js) always does — then the href is
the truth, and stripping it would break the one thing that should navigate.

## `shown(page)` is the one hook out

The single seam a toolbar built around this box can use: `show()` calls
`this.shown?.(page)` every time the visible page changes, which is what lets
`demo.exhibit()`'s layout bar (via `demo.tree()`'s `steer`) stay pointed at
whatever the reader last clicked, not just the page the box opened on.

## Marks with `aria-current`, never `.active`

There's no Router in a demo app, so `Router.mark_links()` never runs inside it —
but it *does* run over the real page around it, and would wipe a borrowed class
like `.active` on every real navigation. `aria-current="page"` / `"location"` is
the same two-answer scheme `mark_links()` uses for the real site, read by the
same CSS selectors, so a demo app looks selected the way the real thing does
without sharing a class the real Router could clear.

## Improvements

1. **`mark()` walks the whole DOM tree on every navigation**
   (`querySelectorAll(".demo-app-pages .page.default")`, then every anchor) —
   fine at a nine-child sample tree, and worth a note that it doesn't scale the
   way the real Router's targeted diff does, if a much larger tree ever lands
   in a box. *(simple, speculative.)*
2. **The `default` clearing loop and the mark loop are two separate DOM
   walks that could be one.** Not worth doing until a demo app is provably slow.
   *(simple, speculative.)*
