# toc — design record

This page's own headings, as a nav, with the current one marked. Nothing is declared
and nothing is registered: adding a section adds it to the rail.

## Decisions

**Declared list, or scan the page?** Scan. `children` is a declared string because a
child costs a network request; a heading is already in the DOM. And the failure modes
are opposite: a drifting `children` entry costs a **menu entry**, quietly and forever,
while a drifting *heading* list points at a section that doesn't exist **on the page
the reader is looking at**. The rule that reconciles them: **declare what costs a
network request, derive what is already in your hand.**

**When does it scan?** `toc()` is called at the top of `content()` so it renders at the
top of the page — and at that moment there are no headings.

| option | why not |
|---|---|
| call `toc()` last | it then renders last, and a nav below the content it indexes is not a nav |
| `toc(() => { …all content… })` | wraps every page's whole body in a callback to buy a scan; the call site pays for the implementation |
| scan in `activated()` | runs after paint — one frame of an empty rail, every navigation |
| `requestAnimationFrame` | same, worse: a whole frame later |
| **place now, fill in a microtask** | ✓ |

**Verdict: place synchronously, fill in a microtask** — the framework's blessed shape
for late content. The container is captured while the captor is correct, and the
filling names its target rather than trusting an ambient captor that is long gone. The
timing is the part worth knowing: a microtask runs when the current task's stack
empties, which is after `render()` returns and after `activate()` appends it, but
**before the browser gets to paint**. There is no frame in which an empty rail is on
screen. (Same argument `ext/highlight` makes for patching `html_unsafe` instead of
sweeping the document afterwards.)

**Rejected: `IntersectionObserver` for the spy.** The textbook answer, and wrong for
this job: between two widely spaced headings **nothing is intersecting**, and the
honest reading of the callbacks is "no section is current" — never what a reader wants.
Every workaround (remember the last one that left, add a tall `rootMargin`, observe
sections instead of headings) reintroduces *"the last heading above the line"* by a
longer route. **Ask the geometry directly:** one `passive` scroll listener and a loop
over an array almost always under twenty items. Exact at every scroll position,
including the top and the bottom, in six lines.

**`current`, not `active`.** `Router.mark_links()` owns `.active` and `.in-path`, and
it **skips `#` hrefs** — a fragment link is a scroll, not a destination — so it would
never clear an `.active` this ext had set. Two owners for one class is how a stale
highlight happens.

**`sticky` in a grid track, not `fixed`.** It shipped as `fixed`, because the obvious
`sticky` did nothing: **the region scrolls, not the page**, so a sticky element inside
a `.page` sticks to a box that never moves. `fixed` worked and reserved no space, so
the rail and the prose were placed by two unrelated numbers and overlapped on the way
to the breakpoint that hid it. The rail is a **real column** now — a grid track with
`position: sticky` and `align-self: start`, because a *stretched* grid item is already
as tall as its track and has nothing to stick within. `fixed` is recorded in `toc.css`
as the bug, not the fix.

## Traps

- **⚠ A hidden page measures every rect at 0,0**, so every heading reads as "above the
  line" and the LAST one wins — which is how the rail first shipped showing the bottom
  section selected on arrival. `offsetParent` is null exactly when an ancestor is
  `display: none`, which is the whole of the case.
- **⚠ The scroll listener has to be on `.pages`, not `window`.** Same cause as the
  sticky bug, third symptom. All three are silent.
- **⚠ `toc.css` is ASCII only, comments included.** A host that serves CSS with no
  charset decodes UTF-8 as Windows-1252; this file once shipped double-encoded
  em-dashes in every heading.

## A gallery of live components defeats the skip list

`fill()` collects `h2, h3, .h2, .h3` and excludes anything inside `.demo, .md-details,
.toc, .files, .tab-bar, .sidebar, .page-previews`. That list works because **every
example on this site is inside a `demo()`** — a rendered heading is always part of an
example, and an example is always skipped.

A **gallery** breaks the assumption: it renders real components directly on the page.
The components index's rail read *View · 3 · 0 · 16 · Delete branch?* — a card's `h3`,
a stat tile's `.h2`, a panel's `.h3` — above the four headings that were actually
sections.

**Options.** (a) Add a `.gallery` class to the skip list — the ext learns about a
docs-page concept it has no business knowing. (b) Reuse `.page-previews` for the
gallery so the existing skip covers it — borrowing a class for a side effect, which is
the naming rule inverted. (c) Don't call `toc()` on a gallery page.

**Verdict at the time: (c)**, with a pre-committed trigger — *at two galleries it
belongs in `toc()`, as an explicit opt-out on the container, not another guess at what
docs pages look like.*

**The second one arrived, so `.toc-skip` exists.** `/framework/versus/` renders the
stat tile from [`framework/ui/stats/`](/framework/ui/stats/) — five real tiles, not a
demo of one — and a tile's value is an `.h2` because it is big. The rail read
**`714 · 21 KB · 0 · 0 · 0`** above the seven real sections. Unlike the components
index, that page *wants* a rail, so (c) was unavailable and the verdict came due
exactly as written: one word in `skip`, and the opting-out visible at the call site
that causes it.

```js
div.c("grid gap auto toc-skip", () => stats());
```

**A pre-committed verdict has now worked twice** (`.cols` in `Page.css` was the other):
the decision was made while the trade-off was fresh, and the second reader only had to
recognise the trigger. Worth reusing on anything held back for a threshold.

## Open

- **No `h4`.** The scale's `h4` is an uppercase annotation, not a section, and
  including it made the rail read as a list of labels. If a page ever wants three
  levels, the filter is one string.
- **Nothing re-scans.** A page renders once and is cached, so a `content()` that
  appends a heading later (from a promise) is not in the nav. `md.file()` is the
  realistic case. Fixable with a `MutationObserver`, at the price of the thing the
  spy rejected; not worth it until a page wants it.
- **One listener per toc, never removed.** Bounded by pages visited, not by
  navigations. Measured as nothing; written down in case a future `Page` starts
  discarding views.
