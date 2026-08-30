# The front, and the shell it sits in

`/blog/` is a **magazine front**: the lead post as display type, every other post as a
card beside it, and a rail of topics on the right edge. It was chosen by building eight
whole blog shells at `/imagine/blogx/` and judging them at 3440 first — this one put the
strongest overview above the fold, and nothing in it is over the reading measure.

## The shell is the site's, not the blog's

The blog draws `div.c("page topic flex fill blog-shell")` with a `core/Sidebar` and a
`.pages` region — **the same three lines `/framework/` uses.** That was the largest
decision in the build and it is worth naming:

- The two-level rail, the burger below 52em, `.active` / `.in-path`, the brand, the
  colour-scheme toggle in the footer: all already existed.
- The cards are `.page-previews` — Page.css's own wall, which the homepage and
  `/framework/` also use. The blog introduces **no second kind of card** to the site.
- What is left for `blog.css` is the composition: the hero, the wall's `--column`, the
  topics rail, and the reading page.

The lab's own shell was a hand-rolled four-region grid with ~150 lines of chrome CSS. It
was right for a lab, where eight candidates had to be identical except for the layout.
On the real site it would have been a second vocabulary for a rail.

One seam is reopened: `BlogNav extends Sidebar` overrides `group()` so a **section title
is a link**. A caption cannot carry `.in-path`, and the whole reason a post lives at
`<section>/<post>/` is that the section is then a real ancestor of it.

## The addressing

`/blog/<section>/<post>/`, and both nav states fall out of it:

| url | `.active` | `.in-path` |
|---|---|---|
| `/blog/` | the brand | — |
| `/blog/framework/` | Framework | Blog |
| `/blog/framework/hello-lew42/` | Hello, lew42 | Framework, Blog |

`Router.mark_links()` stamps both, from the address bar. Nothing computes a state and
nothing can be stale. A flat `/blog/<post>/` url has no ancestor, so a section heading
could never light up — **the file structure IS the active state.**

## The numbers

Measured headless with the dev rail closed.

| | 3440 × 1440 | 1920 × 1080 | 400 |
|---|---|---|---|
| rail | 274 | 243 | full-width bar |
| region | 3166 | 1677 | 400 |
| hero | 952 | 426 | 352 |
| wall | 1553 (3 cols) | 694 (2 cols) | 352 (1 col) |
| topics | 356 | 317 | 352 |
| front height | 1332 / 1440 | 984 / 1080 | scrolls |

Zero console errors and zero 4xx on all sixteen urls; the only scrolling box is `.pages`,
which is the region the SPA scrolls.

**The split is 0.95 : 1.55, and it was measured, not chosen.** At an even 1 : 1.3 the
wall fitted two card columns at 1920 and three at 1921 — one pixel deciding whether a
screen showed four posts or five.

**The card floor grows with the screen**: 17em, and 24em past 120em of row. At 17em a
3440 wall took five columns, so five posts made one row of 490px cells holding 120px of
type. Past a certain width more columns stop being the answer, because the archive — not
the screen — is the constraint.

## Centred, and why

Top-anchored, the whole front measured **403px of a 3440 × 1440 fold** — 72% of the
screen white *below* a composition that had already finished, which reads as a page still
loading. Six posts cannot fill a 1440-tall screen and no amount of stretching cards
changes that; what changes is where the finished thing sits. Centred it reads as a cover.

The mechanism is one declaration, and the wrong version of it was measured first:

```css
.page.blog-shell > .pages > .default { align-self: stretch; }
.blog-front { min-height: 100%; align-items: center; }
```

⚠ **`align-self` on the default block, never `align-items` on the region.** `.pages` is
`align-items: flex-start`, so its default block is exactly as tall as its content and a
percentage height inside it resolves against `auto` — nothing. Stretching the *region*
fixed the front and also pinned every post page to the region height with its prose
overflowing a 1440px box (measured 2382/1440 at 3440): a page that had been sized by its
own content until that rule touched it.

## Traps this page paid for

- **A display utility on the `.default` block wins by layer** over Page.css's
  `.pages > .default { display: none }`, so the front would have stayed on screen
  underneath every section and post. The `@layer util` arrangement contract only covers
  `.page` elements. The magazine is a box *inside* `.default`, not `.default` itself.
- **`.pages` caps its default block at `--measure`.** The token is the fix
  (`.page.blog-shell > .pages { --measure: none }`) — a declaration on the region beats
  one inherited from `.page.topic`, and (0,2,0) beats `.pages`, so there is no
  specificity game and no second number. A nested `.page` re-declares its own 40em.
- **No `#about` anchors in a rail.** They resolve to the page you are *on*, so
  `Router.mark_links()` marks them `.active` on every screen. A rail says only what it
  can point at.
