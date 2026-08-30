# The un-centered reading page

> I don't like the narrow center column of text centered on my 3440 monitor, it feels
> like a waste. — the owner, 2026-08-30

## What is actually wrong

The site's pages are not centered — `Page.css` puts every shape on one left edge on
purpose. The waste is the other half of the sentence: a prose page keeps its 40em
measure and spends **nothing** on the rest of the screen.

Measured at 3440, headless, dev rail closed:

| page | rightmost ink | dead to the right |
|---|---|---|
| `/framework/ext/drawer/` — an ordinary prose page | 1174px | **2266px** |
| a hypothetical centered 40em column | 2080px | 1360px each side |
| `/blog/how-this-blog-works/` | 3340px | **100px** |

The 100px is the page's own `--gutter-x`. There is nothing left to reclaim.

## The shape

Three regions, and the middle one is the idea.

```
  gutter │ read (40em, fixed) │ exhibit (everything left over) │ rail (15em) │ gutter
```

- **read** — the measure, hard left. It does not move, does not re-center when a figure
  appears, and is the same `--measure` every other page uses. The eye returns to one
  left edge at every window size.
- **exhibit** — anything wider than prose: screenshots, demos, code listings, tables.
  Uncapped on purpose. A screenshot of a 3440 screen is 3440 pixels wide; at 3440 the
  track is 2171px and the picture gets to be that size.
- **rail** — the framework's own `.rail`, holding the post's parts and `ext/toc`'s
  headings with the current section marked. **It is always there**, which is what stops
  a post with no figures from looking abandoned.

Measured widths (read / exhibit / rail, px):

| | 400 | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| read | 344 | 602 | 640 | 720 |
| exhibit | — (inline) | — (inline) | 812 | 2171 |
| rail | 344 (below) | 203 | 216 | 243 |
| ink to the right edge | 7 | 61 | 87 | 100 |

No horizontal document scroll and an empty console at all four widths.

## Floats, not a grid — and that is a measurement

The first build was a two-column grid, `[read] min(--measure, 100%) [exhibit] minmax(0, 1fr)`,
with auto-placement doing the anchoring: a paragraph takes (row *n*, read), a figure
written straight after it lands at (row *n*, exhibit), beside the text it belongs to,
with no ids and no JavaScript. It is a lovely mechanism and it has one fatal property.

**Both columns share a row.** A figure taller than the paragraph next to it sets the
row's height, so the *next paragraph starts below the figure* — a ~300px hole in the
reading column at every exhibit, worst at 1920 where an exhibit is 813px wide and
therefore tall. Reading down a column of prose punctuated by 300px voids is worse than
the dead space it was fixing.

A float is out of flow. The prose runs unbroken at exactly its measure, and because the
text (0–640px) and the figure (683–2954px) never overlap horizontally, the paragraphs'
line boxes are not shortened either — they do not know the figure is there.

```css
.blog-prose { display: flow-root; }
.blog-prose > *:not(.blog-exhibit) { max-width: min(var(--measure), 100%); }

.blog-exhibit {
	float: right;
	clear: right;
	width: calc(100% - min(var(--measure), 100%) - var(--blog-gap));
}
```

`flow-root` or the floats escape the bottom of the post. `clear: right` or two figures
in a row overlap. `:not(.blog-exhibit)` on the measure cap, or the figure is capped too
— its width computed to 2171px and `max-width` clamped it silently back to 720, so the
float shrink-wrapped its own code block and sat in the far corner.

## Down to 400

One container query, and it measures the row rather than the window — `.blog-body` is
already the `page` container because `Page.css` makes any box with a direct `.rail`
child into one. So the breakpoint sees window minus sidebar minus dev rail minus drawer,
which every `@media` in a component gets wrong by exactly that much.

- **< 84em**: exhibits stop floating and take the full width. 84em is arithmetic:
  40em of prose + 15em of rail + two gaps leaves the exhibit under 24em below it, and a
  300px code listing is worse than a full-width one.
- **< 38em** (`Page.css`'s own): the rail becomes a full-width strip.

One override on that second one. Page.css sends every collapsed rail to `order: -1`,
which is right for a rail of filters over a wall of cards and wrong for a post —
measured at 400, the parts list, the ToC and "All posts" filled the whole fold and the
title was below it. A post reads first and navigates after, so `.rail.blog-rail` takes
`order: 1`.

## The other traps this cost

- **Two adjacent line-name groups are a parse error.** `[read-end] [exhibit-start]` in a
  track list is invalid — a `<track-list>` allows exactly one `<line-names>` between two
  track sizes — and an invalid track list is dropped in **silence**. The grid still
  rendered, because `grid-column: read` fell through to implicit lines: track 1 measured
  0px, every paragraph sat in track 2 at full width, and nothing was logged. Write
  `[read-end exhibit-start]`.
- **`margin: 0` on a float resets its inline margins too.** `margin-block: 0`.
- **`ext/toc` cannot be called at render time here.** A part's prose is a fetch away, so
  `toc()` finds no headings and removes itself. `Post.after_prose()` refills the rail
  from a `setTimeout` — a macrotask, because the markdown is appended by
  `View.append_promise` in a microtask queued *after* any microtask scheduled here.
- **`ext/toc` hides itself** outside its own page-grid layout (`.toc { display: none }`),
  so a rail has to say `display: block` back.
- **Every part stays in the DOM**, so `toc()` listed part one's headings above part
  two's. The closed ones wear `.toc-skip`, ext/toc's own opt-out — decided from the
  *classes*, not from `offsetParent`, because a page is built detached and on a cold
  load every part measures as hidden, including the one on screen.
- **Moving between parts does not re-run `content()`.** The view is already built, so
  the rail needs `activated()` *and* `deactivated()` — going up to the post activates
  nothing, which is the lesson `Page.deactivate()` already records for columns.

## Open

- **A post with no exhibits still leaves ~2000px at 3440** — the rail holds the right
  edge, but the middle is empty. The honest answer is that a post about software should
  have figures; the layout makes room for them rather than inventing filler. Whether
  something else belongs there (related posts, a persistent index) is a design question,
  not a layout one — `/imagine/blogx/` is where that is being explored.
- **A tall figure and a short section still drift apart**, because `clear: right` pushes
  the next figure below the last one. Two figures in quick succession end up further
  down than their paragraphs.
- **The lead picture is the `og:image`.** Convenient, and it means the top-of-post
  picture is chosen for a social card. Fine so far; may not stay true.
