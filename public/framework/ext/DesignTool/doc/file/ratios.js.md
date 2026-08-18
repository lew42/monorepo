The geometry every rule asks for, derived once per model. Pure arithmetic on
`probe.js`'s flat array — nothing here reads the DOM or decides whether
anything is wrong, which is the seam that keeps `rules.js` and `polish.js`
testable without a browser.

## `boxed()` is the one predicate six false positives collapsed into

A non-replaced `inline` element reports `clientWidth: 0`; `display: contents`
has no box at all. Both make every child read as escaping a zero-width
parent — hundreds of findings from highlighted code and one `contents`
wrapper before this existed.

⚠ **It applies at both ends of `spill()`.** A `display: contents` child reports
a 0×0 rect at the origin, which reads as its parent's entire gutter escaped —
the same class, one relationship over, and it survived until a corpus case was
written for it.

## `crops()` — a box cropping on purpose, by either of the two ways

`max-height` was the whole test, and `-webkit-line-clamp` sets no `max-height`:
every inline `<code>` landing past a two-line clamp reported as content cut off.
`crops()` is the pair, and the clamp is read as a plain fact in `probe.js`.

## `region()` and `text_chars()` answer "is there anything here"

`text_chars()` is the same one-pass reverse walk as `text_bounds()`, summing
characters instead of geometry. `region()` picks the box the reader's content
lives in: the **shallowest** vertical scroller at least 60% of the root's width,
or the root. Shallowest and not largest — a `pre` scrolling 2200px of code
outgrew the page region containing it and was measured as the page.

## `text_bounds()` propagates bottom-up in a single reverse pass

Nodes are pushed in preorder, so a child always has a higher index than its
parent — walking the array backwards once gives every ancestor the union of
its descendants' text bounds with no second pass. Two traps make this correct
rather than merely fast: a text block contributes its **content** box, never
its border box (or every padded element reads as touching its own frame), and
bounds are **clamped to a clipping ancestor** before they propagate (or a
scrolled region hands its parent the extent of everything it hides).

## `overlap()` exempts negative margins on purpose

A negative margin is a request to overlap — stacked avatars, a pulled-up card.
Reporting those as collisions cried wolf on the one case that repeats
deliberately across the site.

## Improvements

1. **`region()` is derived twice per `analyze()`** — once by the `empty` rule
   and once by `metrics()` — and `text_chars()` with it. Both are a single
   linear pass, so the cost is noise; a derivation cache on the model would
   remove the duplication and the temptation to pass one into the other.
   *(simple, speculative.)*
2. **`union()`'s `near()` helper re-derives which side is nearer via a passed
   comparator (`Math.min`/`Math.max`) rather than a plain branch** — correct,
   but the indirection costs a re-read to confirm it's not a bug. A named
   `nearer_x0(a, b)` / `nearer_x1(a, b)` pair would read faster for the same
   four call sites. *(simple, speculative.)*
