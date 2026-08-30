# Blogx — eight blog shells, judged at 3440 first

What a blog looks like on a wide monitor. All eight render the same eight posts, so the only
variable on screen is the layout. Every card, row and chip is a real link; every url cold-loads.

Open [/imagine/blogx/](/imagine/blogx/) and click a card.

## Use

```js /imagine/blogx/front/page.js
import { Blog } from "../Blog.js";

export default new Blog({
    meta: import.meta,
    title: "Magazine front",
    rail(){ return this.sections_rail(); },      // rail() aside() — declare what you have
    aside(){ return this.topics_rail(); },
    content(){ this.hero(lead); this.wall(rest); },
    finding: "the one line this candidate is for",
});
```

## The verdicts, ranked for a real blog

1. **[Magazine front](/imagine/blogx/front/)** — hero + wall + two rails. The strongest
   above-the-fold overview: at 3440 the first screen is the lead plus seven linked posts,
   every topic and every series, nothing scrolled, no measure over 42em.
2. **[Two-level rail](/imagine/blogx/rail/)** — sections over posts. The right rail for an
   archive under about forty posts; `active` and `in-path` are free.
3. **[Parts as columns](/imagine/blogx/parts/)** — a four-part post read side by side.
   **252 + 4 × 720 = 3132px of live text at 3440**, and not one column over the measure.
4. **[Dynamic rail](/imagine/blogx/dig/)** — one rail, three contents, by depth. What the
   two-level rail becomes when the archive outgrows one screen.
5. **[Parts in place](/imagine/blogx/swap/)** — a persistent part strip over a region that
   swaps. The only treatment here that works unchanged at 400.
6. **[Columns](/imagine/blogx/finder/)** — a front and an archive in one shell, but never
   both on screen at once.
7. **[Dashboard front](/imagine/blogx/board/)** — four ways in beats one; with every region
   equally loud there is nothing to read first.
8. **[Deck front](/imagine/blogx/deck/)** — the best composition and the worst overview: a
   shut rail means zero navigation above the fold.

## The findings

- **The measure is never spent on width.** Every reading column stops at 42em at every
  size. A wide screen is filled with **more columns**, never a wider one — which is
  [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns/)'s own measured rule.
- **One post cannot fill a 3440 monitor honestly**, and that is not a layout fault: one
  article is not one screen's worth of content. Two things fix it and neither is a wider
  paragraph — put the post's PARTS beside it, or its neighbours.
- **A post needs one address, `<section>/<post>/`.** A flat `/<post>/` url has no ancestor
  for `in-path` to find, so a section heading can never light up: the file structure IS
  the active state. Both marks are then `Router.mark_links()`'s and nothing is computed.
- **The blog's rail replaces the site's**, it does not sit beside it. Two rails saying
  different things is the first thing a reader has to resolve. Every candidate wears
  `hides-nav` for that reason.
- **An empty grid slot paints the grid's background.** Seven cards never fill a wall of
  two, three or five columns; `gap: 1px` over a `--line` field drew those leftovers as
  grey holes. The seams are an inset `box-shadow` on the cells instead.
- **A grid can be the right height with a content-sized row.** `min-height: 100%` and
  `align-content: start` together left 54% of a 1080 screen white under a composition
  that had already fitted. [`doc/decisions.md`](/imagine/blogx/doc/decisions.md)

## Watch out

- A blog shell is **not a column**. `/imagine/` is a columns host and `column_host()`
  returns the *shallowest* columnar ancestor, so a page here renders as a column of that
  row unless it draws itself — `Blog.js` overrides `container()` and `render()`, and
  `demo.app()` is the only way to put a real row back inside one.
- **`card` is a core field, not a free name.** A `card()` method on a Page is read back by
  `nav()` and handed to `.ac()`, which called `.split` on a function: every preview on the
  index died. Same family as `opens` shadowing `opens()` in core.
- `a` is a **factory** — `a.c("x", text).href(url)`, never `a.href(url)`.
- A `hug` column is its **max-content** width, so it hugs a list and gives prose a 24em
  note. The section columns in [`finder/`](/imagine/blogx/finder/) carry no `content()`.
- A demo tree's root **title is its address**. Titled `Notes` it would have shipped anchors
  to the site's real `/notes/` that only JavaScript was stopping; it is `Blogx Notes`.

## More

- [`doc/decisions.md`](/imagine/blogx/doc/decisions.md) — every measurement, what was rejected, and
  what is left for the owner
- Files: `Blog.js` (the class, the shared pieces, the three depth classes), `blogx.css`
  (the one grid, the three tones), `posts.js` (the corpus), one `page.js` per candidate
- Related: [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md) ·
  [`/imagine/shells/`](/imagine/shells/) (the 3×3 chrome grid this borrows) ·
  [`/imagine/screens/`](/imagine/screens/) (display type sized off its own block)
