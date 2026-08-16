## What this file is

The index for seventeen whole-page layouts, three vocabulary pages, two
instruments and the model page — as a **browser**: a filter rail beside a
grouped wall, both `ext/Panel` leaves, in a `full fill` page. Every card is a
live page, not a picture, and most show the same layout at 390px and 3440px at
once (`twin: true`, explained in `doc/twin.md`).

Until 2026-08-16 this was a `catalog()` rail with the whole layout model
written down the page beside it. Why that changed, and what the panel buys:
`readme.md`, "The index was a catalog, and is now a browser".

## The two panels, and the state between them

`content()` builds a two-leaf `Panel` tree — `filters` hugging, `wall` growing
— with a **private** two-entry vocabulary that rides the tree and never
serializes. `panel(seed)` rather than `workspace()`, so there is no saver and
nothing a visitor drags survives a reload.

Both leaves close over one `state` object and one `apply()`. The rail draws
first and the wall second, so `apply()` reads `$wall` **at call time** rather
than at draw time — a click handler built before the wall exists still finds
it, and still finds the *current* one after a re-draw.

## `tag()` and `sift()`

`previews()` emits one flat run — heading, its cards, the next heading — so a
card's group is the last heading above it, recorded once by `tag()` rather
than re-derived per keystroke. `sift()` hides in two passes: the cards answer
to the filter, then each heading answers to the run below it, because a
heading left standing over nothing reads as a section that failed to render.

⚠ Both write **inline `display`**. `.page-preview` declares `display: flex`,
which beats the UA's `[hidden]` outright, and this directory ships no
stylesheet to put a class in.

⚠ `tag()` indexes the card's **title, description and href** — never its
`textContent`. Most cards hold a live render of a whole fictional site, so
searching `mail` matched Stack (a form's email field) and Sidebar (a nav word).

## `rail()` reaches up, never sideways

```js
rail(){
	return [...this.children]
		.filter(([, page]) => page?.layout)
		.map(([name]) => this.nav_for(name));
}
```

Handed to whichever layout draws its own nav (`sidebar/page.js` is the one
that uses it) via `this.parent.rail()` — a child reaches UP through
`this.parent` rather than the index importing the child, because a mutual
import here would break deep reloads only (named as a trap in `readme.md`).

⚠ Not to be confused with the **filter** rail, which is `filters()`. One is
this page's nav contract with its children; the other is its own chrome.

## `render()` replaces the view rather than patching it

`Page.render()` emits the `h1` **outside** anything `content()` builds, and
`full` zeroes the gutter that would sit one anywhere sane — so a title band
would land flush against the region's left edge with no way to inset it from
here. This file overrides `render()` whole, the way `Doc.render()` does, and
the title rides the top of the filter rail instead. It is still an `h1`.

## Improvements

1. **The empty state and the filter rows are plain elements with no shared
   look.** Fine at two controls; a third kind of filter would want the
   `ext/layout` control vocabulary rather than a third hand-rolled row.
   *(medium, later)*
2. **The panel's axis is fixed at every width** — ext/Panel's documented
   stance. At 400 that is a ~220px rail beside a ~180px wall, which measured
   usable but tight. If a phone reader ever matters here, the answer is that
   module's, not this page's. *(medium, later)*
3. **Nothing else ranked** beyond what `readme.md`'s own "Open" section already
   names (media queries not following `zoom`, the two-pedagogy mix between the
   twin-screen layouts and the quarter-size ones).
