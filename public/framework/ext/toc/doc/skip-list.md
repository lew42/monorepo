# The skip list

`fill()` collects `h2, h3, .h2, .h3` and excludes anything inside `.demo, .md-details,
.toc, .files, .tab-bar, .sidebar, .page-previews, .toc-skip`. That list works because
**every example on this site is inside a `demo()`** — a rendered heading is always part
of an example, and an example is always skipped.

## A gallery breaks the assumption

A **gallery** renders real components directly on the page, not examples of them. The
components index's rail once read *View · 3 · 0 · 16 · Delete branch?* — a card's `h3`,
a stat tile's `.h2`, a panel's `.h3` — above the four headings that were actually
sections.

**Options weighed.** (a) Add a `.gallery` class to the skip list — the ext learns about
a docs-page concept it has no business knowing. (b) Reuse `.page-previews` for the
gallery so the existing skip covers it — borrowing a class for a side effect, which is
the naming rule inverted. (c) Don't call `toc()` on a gallery page.

**Verdict at the time: (c)**, with a pre-committed trigger — *at two galleries it
belongs in `toc()`, as an explicit opt-out on the container, not another guess at what
docs pages look like.*

## The second one arrived, so `.toc-skip` exists

`/framework/versus/` renders the stat tile from [`framework/ui/stats/`](/framework/ui/stats/)
— five real tiles, not a demo of one — and a tile's value is an `.h2` because it is big.
The rail read **`714 · 21 KB · 0 · 0 · 0`** above the seven real sections. Unlike the
components index, that page *wants* a rail, so (c) was unavailable and the verdict came
due exactly as written: one word in `skip`, opting out visible at the call site that
causes it.

```js
div.c("grid gap auto toc-skip", () => …);   // framework/stats.js
```

**A pre-committed verdict has now worked twice** (`.cols` in `Page.css` was the other):
the decision was made while the trade-off was fresh, and the second reader only had to
recognise the trigger. Worth reusing on anything held back for a threshold — a third
gallery gets a class, not a redesign.
