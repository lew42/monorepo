`demo.page(name, fn, config)` turns a function into a demo page: the entry a
catalog rail needs when a page has enough examples that scrolling to find one
stops working. The card is the render at half size, drawn **fresh per call** —
never cached, because a cached render would be stolen out of the card the moment
the reader opens the page.

## Three arguments, not one config object

Unlike `demo.tree()` and `demo.layout()`, which take a single config object and
build a whole page with no `name` of their own, `demo.page()` takes a triple:
`name` (the child map key and the url segment), `fn` (the specimen), `config`
(spread last, so it can override `preview` or `content` if it ever needs to).
That's because `demo.page()` is meant for `children: [...]` — a list of siblings
under one parent — while the other two are meant for `new Page(demo.tree({…}))`,
standing alone. Reaching for the wrong one is a real seam to know about before
you need it; see the audit's take on whether it should be one.

## `children:` inside `config` makes it recursive

A `demo.page()` can itself carry `demo.page()` children, which turns it into the
category for its own variants — the same mechanism `demo.exhibit({ page })`
gives any page, arrived at automatically once `content()` calls the exhibit with
`page: this`.

## `file:` is worth adding whenever the function is worth reading in place

It's not required — `def` alone gives the reader the function's body — but a demo
whose function lives in its own module (rather than being written inline for the
demo) is more useful with the "whole file" link the exhibit's summary grows when
`file` is present.

## Improvements

1. **The name/config split reads as inconsistent next to `demo.tree()` and
   `demo.layout()`.** Someone who has used one will guess wrong reaching for
   the other. See the audit's recommendation on merging the two config-only
   forms — this one is the odd shape out and the reason a full merge is more
   than a two-line change. *(medium, useful.)*
2. **No collision check on `name`.** Two `demo.page()` calls with the same
   `name` inside one `children:` array silently let the second overwrite the
   first in the `Map` — the same failure mode `Doc.docs()` guards against for
   notes with an explicit `console.warn`. *(simple, useful.)*
