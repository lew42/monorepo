The offending element itself, twice, at its own size — broken on the left,
fixed on the right. The whole-page before/after (`twin.js`) answers "is it
different"; at 0.5× on a 1280px screen the difference is a few pixels
somewhere. This file answers *what exactly is wrong, and what exactly fixes
it* — see [Addressing](../../docs/addressing/) for why that's possible at all.

```js
mirror(issue, { root });                          // the live element, now
mirror(issue, { url, width, root_path });         // reload the page, find it again
```

## ⚠ `:scope >`, or the chain floats

`root.querySelector(path)` does not anchor `path` at `root`.
`Element.querySelector` matches against the whole tree and only then keeps
descendants, so a bare `:nth-child()` chain finds the first element of that
shape *anywhere* under the root. Five of 209 live findings on this site
resolved to the wrong element that way — including the top one on
`/framework/`, which rendered the site's sidebar in both panes and captioned it
a padding fault on `div.panel-workspace`. `:scope > ` fixes all five, and it is
the whole of `locate()` — which now lives in `address.js`,
because `highlight.js` resolves the same addresses and two copies of this
one-liner is two chances to write one of them without the `:scope >`.

An empty path is not a miss: the analysis root is its own address, so
`locate()` returns the root itself.

## A live `root` beats a url

The dev rail measures the document it is sitting in, so it has the analysed
element and hands it over. Resolving against it is exact, costs nothing, and
shows the element in the state the reader is actually looking at.

Only a caller with nothing but a url reloads: the audit page reports on frames
that were removed minutes ago. That path has to reconstruct the root from
`root_path` and hope the second document is the first — a race with whatever
else `<body>` collects (the dev rail mounts there too, as a sibling of `.app`).
`root_of()` falls back to `.app` and then `<body>` when the path misses, which
also covers `root_path` being empty — `""` is not nullish, and the `??` this
replaced returned the empty string as if it were an element.

## Clones render as themselves only because they're same-origin

A cloned node dropped into `$stage.el.innerHTML` picks up the stylesheets
already loaded in *this* document — the only reason a detached node still looks
like itself. The url path adds a second requirement: the iframe must share this
origin for `contentDocument` to be readable at all. `frame()` and `twin.js`
share that assumption.

⚠ The clone lands wherever the report was built, which for the dev rail is
inside `.dev-bar` — outside `.app` and outside its theme. A finding whose path
is empty therefore clones the entire `.app` into the rail, class and all, and
any later bare `document.querySelector(".app")` finds the copy first, because
the rail is `<body>`'s first child.

## The fix is applied inline, not as a stylesheet rule

A rule would need a selector that matches only the clone, and `div.page-preview`
is a label `probe.js` generated for a report — it is not guaranteed to be
unique, or even a valid CSS selector on its own. `clone.style.cssText += ...`
sidesteps the whole question.

## Improvements

1. **The url path hard-codes a 400ms settle delay**, independently of
   `frame()`'s own 350ms in `LayoutTool.js` and `twin.js`'s load-driven
   approach. Three slightly different numbers for "has this iframe finished
   rendering" is the same open question noted in the readme — worth a single
   shared constant the day one of them needs to change. *(simple, useful.)*
2. **A failed resolve (`missing()`) offers no path forward beyond "re-measure
   live"** — there's no button to actually do that from within the mirror
   panel; the reader has to leave and click the page's own re-run control.
   *(simple, useful.)*
3. **Nothing stops an empty-path finding from cloning `.app` into the rail**
   (see the trap above). Scoping the rail's own `.app` lookup, or refusing to
   mirror the root, would close it. *(simple, useful.)*
