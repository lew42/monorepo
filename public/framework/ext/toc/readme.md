# toc — design record

**question → options → weighing → verdict**, as everywhere.

---

## 1. Declared list, or scan the page?

`children` is a declared string and this repo argues for that everywhere: nothing
crawls the filesystem, a page nobody named does not exist. So why does this scan?

**Because the failure modes are opposite.** A declared child that drifts is a page
that isn't in the menu — invisible, and it stays wrong forever. A declared
*heading* that drifts is a nav entry pointing at a section that no longer exists,
or missing one that does, **on a page the reader is looking at while it is wrong**.
And unlike a child page, the headings are already in the DOM: there is nothing to
crawl, nothing to fetch, and no laziness to protect.

**Verdict: scan.** The rule that reconciles it: *declare what costs a network
request, derive what is already in your hand.*

---

## 2. When does it scan? The capture problem

`toc()` is called at the top of `content()` so it renders at the top of the page —
and at that moment there are no headings.

| option | why not |
|---|---|
| call `toc()` last | it then renders last, and a nav below the content it indexes is not a nav |
| `toc(() => { …all content… })` | wraps every page's whole body in a callback to buy a scan; the call site pays for the implementation |
| scan in `activated()` | runs after paint — one frame of an empty rail, every navigation |
| `requestAnimationFrame` | same, worse: a whole frame later |
| **place now, fill in a microtask** | ✓ |

**Verdict: place synchronously, fill in a microtask.** This is the framework's
blessed shape for late content — the container is captured while the captor is
correct, and the filling names its target explicitly rather than trusting an
ambient captor that is long gone.

The timing is the part worth knowing: a microtask runs when the current task's
stack empties, which is after `Page.render()` returns and after `activate()`
appends it, but **before the browser gets to paint**. So there is no frame in which
an empty rail is on screen. Same argument `ext/highlight` makes for patching
`html_unsafe` instead of sweeping the document afterwards.

---

## 3. `position: fixed`, not `sticky`

`sticky` is the obvious choice and it does nothing here.

**THE REGION SCROLLS, NOT THE PAGE** (see `Page.css`). A `position: sticky`
element sticks relative to its nearest scrolling ancestor — and inside a `.page`,
that box never moves, so the rail scrolls away with the prose.

`fixed` takes it out of the scrolling box entirely, which is what a rail is. It
also needs no layout surgery: a `.page` is `max-width: 60em` centred in a wider
region, so the rail occupies gutter that nothing else was using. No page has to
become a flex row, and no page has to opt in.

The cost: `fixed` doesn't know how much gutter there is, so the rail is **hidden
below `82em`**. A rail overlapping the prose is worse than no rail.

---

## 4. Rejected: `IntersectionObserver` for the spy

The textbook answer, and it is wrong for this specific job. An observer fires when
a heading crosses the viewport edge — so between two widely spaced headings,
**nothing is intersecting**, and the honest reading of the callbacks is "no section
is current." That is never what a reader wants, and every workaround (remember the
last one that left, add a tall `rootMargin`, observe sections instead of headings)
is reintroducing "the last heading above the line" by a longer route.

**Verdict: ask the geometry directly.** One `scroll` listener, `passive`, and a
loop over an array that is almost always under twenty items. It is exact at every
scroll position, including the top and the bottom, and it is six lines.

---

## 5. `current`, not `active`

`Router.mark_links()` owns `.active` and `.in-path` on every in-app anchor, and it
**skips `#` hrefs** — a fragment link is a scroll, not a destination. So it would
never clear an `.active` this ext had set. Two owners for one class is exactly how
a stale highlight happens, so the spy uses its own word.

---

## 6. A gallery of live components defeats the skip list

Found while building `styles/components/`, and worth knowing before someone hits it
again.

`fill()` collects `h2, h3, .h2, .h3` and excludes anything inside
`.demo, .md-details, .toc, .files, .tab-bar, .sidebar, .page-previews`. That list
works because **every example on this site is inside a `demo()`** — a rendered
heading is always part of an example, and an example is always skipped.

A **gallery** breaks that assumption: it renders real components directly on the
page, outside any demo. The components index's rail read
*View · 3 · 0 · 16 · Delete branch?* — a card's `h3`, a stat tile's `.h2`, a panel's
`.h3` — above the four headings that were actually sections.

**Options.** (a) Add a `.gallery` class to the skip list — the ext learns about a
docs-page concept it has no business knowing. (b) Use `.page-previews` for the
gallery so the existing skip covers it — borrowing a class for a side effect, which
is the naming rule inverted. (c) Don't call `toc()` on a gallery page.

**Verdict: (c), for now.** One page, one line not written, and the rail was the least
useful thing on a page that is itself an index. Recorded rather than fixed because
the right fix depends on how many galleries there turn out to be: **at two, it
belongs in `toc()`** — and the honest shape then is an explicit opt-out on the
container (`div.c("toc-skip")`), not another guess at what docs pages look like.

## 7. Open

- **No `h4`.** The scale's `h4` is an uppercase annotation, not a section, and
  including it made the rail read as a list of labels. If a page ever wants three
  levels, the filter is one string.
- **Nothing re-scans.** A page renders once and is cached, so a `content()` that
  appends a heading later (from a promise) is not in the nav. `md.file()` is the
  realistic case — a readme rendered as page content. Fixable with a
  `MutationObserver`, at the price of the thing §4 rejected; not worth it until a
  page actually wants it.
- **One listener per toc, never removed.** A page is built once and kept, so this
  is bounded by the number of pages visited, not by navigations. Measured as
  nothing; written down in case a future `Page` starts discarding views.
