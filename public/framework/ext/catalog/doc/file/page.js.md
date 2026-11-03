This module's own doc page, and — because there is no class here — also its
main demonstration: a `Doc` whose `subject` is `Page` and whose one listed
method is `catalog`, so the API tab shows the real patched source rather
than a paraphrase of it.

## Why `subject: Page`, not no subject at all

Most `ext/` modules that patch a method onto `Page.prototype` (this one,
[`tabs`](/framework/ext/tabs/)) have documented that method on the page that
*declares* the class, because core owns what a page is. That doesn't work
here: core never imports an ext, so `core/Page/page.js` cannot list
`catalog` among its methods without importing this module into core. Naming
`subject: Page` on *this* page instead is the fix that costs nothing —
`Doc.declaration()` reads whatever is on the live prototype at render time,
regardless of which file put it there, and `patched()` (`util/source`)
detects the anonymous-function assignment and labels it "replaced at
runtime" automatically. The API tab becomes the one place `catalog`'s real,
current source lives, and it needed no new code to get there.

## The comparison is built, not quoted

The "wall vs rail" section renders two live `demo.app()` boxes side by side
rather than describing the difference in prose, per the skill's own rule for
showing a variant: the effect first, side by side, with the one differing
line of code underneath rather than a heading naming each box. Both boxes
share `ext/demo/sample.js`'s tree so the comparison isn't confused by two
different trees looking different.

## Improvements

1. **The site table (`## On the site`) is hand-typed and will drift.** A
   caller list is exactly the kind of thing that goes stale silently — a
   ninth `initialize(){ this.catalog(); }` added elsewhere updates neither
   this table nor the readme's copy of it. Low cost today (eight rows,
   findable by grep), but the readme's own caller section is the one this
   audit re-derived from a framework-wide search — if a future audit does
   the same, both copies should be checked, not just one. *(medium,
   important — no fix that doesn't add a build step; recorded so it isn't
   assumed current forever)*
2. **No `overview:` key, on purpose, and that's worth saying explicitly
   somewhere a reader passing through will see it** — this page shows the
   method by calling it directly in `content()`'s demos rather than
   splitting into sibling `overview/` directories, because there is exactly
   one method and no natural set of variants to browse. A reader who has
   just read the skill's "use `overview:`" guidance might reasonably expect
   to see it used here of all places, and wonder why not. *(simple, useful)*
