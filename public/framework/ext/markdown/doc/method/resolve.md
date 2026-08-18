`md.resolve(root, base)` rewrites every relative `a[href]` and `img[src]`
under `root` to resolve against **`base`**, then returns `root`. Called once,
internally, by [`md.file`](/framework/ext/markdown/api/file/) — most callers
never invoke it directly.

## The bug it exists to fix

A fetched file's links are the browser's problem the moment they're in the
DOM, and a browser resolves a relative `href` against **the document**. With
the SPA fallback the document url *is* the current route, so a relative link
that's correct in the file (`[base](base/)` in a readme) pointed somewhere
different depending on which page happened to render it — a link crawl once
found **40 broken routes** this way, every one correct in its source file and
wrong on the page. Full story: [Relative links](/framework/ext/markdown/doc/relative-links/).

## What it deliberately skips

Absolute urls, protocol-relative urls, and fragments — anything matching
`/^([a-z][\w+.-]*:|\/\/|\/|#)/i` — are left untouched. That set includes every
link this repo's own doc files should write when linking to another module's
*route* (see the trap on [`md.file`](/framework/ext/markdown/api/file/) about
why cross-links inside `doc/*.md` files must be absolute).

## `pathname`, not `href`

The rewritten `href` is `url.pathname + url.search + url.hash`, never
`url.href`. An absolute url (with an origin) would make
`Router.link_clicked()` treat the click as external and hand it to the
browser — a full reload for what should have been an in-app navigation.

## Not fixed by this, on purpose

A link to a real file (`[readme](../Page/readme.md)`) still resolves to that
file, and the Router still declines it (`/\.\w+$/` reads "not ours"), so the
browser does a real fetch. That's correct: a link to a file should open the
file.
