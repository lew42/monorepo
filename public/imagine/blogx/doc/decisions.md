# Decisions — the blogx lab

Every candidate was judged at **3440 first**, then 1920, then 400, with an above-the-fold
crop at each (a viewport screenshot IS the fold). Shots and the measurement sweep:
`/framework/ai/2026-08-30/blog-layouts/`.

## Measured at 3440 (headless, 3440 × 1440, dev rail closed)

| candidate | rail | paper | aside | inside the paper |
|---|---|---|---|---|
| Magazine front | 270 | 2846 | 324 | hero 0.95fr / wall 1.55fr, wall 3 × 26em |
| Dashboard front | 270 | 3170 | — | lead spanning, then 5 regions of 30em |
| Deck front | **0** | 3440 | — | one centred block, 4 links on the floor |
| Columns | 270 | 3170 | — | **252 + 2918** — rail + one `fill` column |
| Two-level rail | 270 | 2846 | 324 | a wall of every post |
| Dynamic rail | 270 | 3170 | — | a 42em article, rail changes by depth |
| **Parts as columns** | 270 | 3170 | — | **252 + 720 + 720 + 720 + 720 = 3132** |
| Parts in place | 270 | 3170 | — | a strip that never moves, a region that swaps |

**Zero console errors and zero unwanted scrolling boxes** at 1920 and 3440 on all nine
urls; at 400 every scroller is one that was asked for (the document, the two rail strips,
the lab strip). No horizontal document scroll at any width.

## The one number this lab exists for

`252 + 4 × 720 = 3132` in a 3170px row. A four-part post fills a 3440 monitor with **four
40em reading columns**, and not one of them is over the measure. That is the whole answer
to *"I don't like the narrow center column of text centred on my 3440 monitor"*: the fix is
not a wider column, it is a second, third and fourth one.

At 1920 the same row is `224 + 4 × 364` — four columns still, but each at 22.75em, which is
under a comfortable measure. Below about 1600px of row the columns start scrolling sideways
and the swap treatment becomes the better one.

## Rejected, with the reason

- **A wider article at 3440.** Tried in reasoning and refused for the same reason
  `core/Page/doc/columns.md` refused "let the last column absorb the rest": it trades a
  readable line for a full screen and does not even close the numbers.
- **A lab bar at the TOP of each candidate.** It costs the one band all eight compositions
  compete for. The switcher is a floor instead — ~2% of a 1440-tall screen, always visible.
- **`gap: 1px` over a `--line` background for the wall and the board.** Correct until a
  grid has empty slots, and seven cards never fill two, three or five columns: at 1920 one
  grey hole, at 3440 three, and the board showed a 640px grey block at the right end.
  Replaced with `box-shadow: inset -1px -1px 0 var(--line)` on the cells, which is drawn by
  the cells that exist.
- **An "Elsewhere / About / Feed" group in the rail**, written as `#about` anchors. Those
  resolve to the page you are ON, so `Router.mark_links()` marked all three `.active` on
  every screen — three permanent false actives beside the one real one. A rail says only
  what it can point at.
- **`min-height: 100%` on the `fill` column's prose.** It made the prose the body's full
  height and the column HEAD's 51px was then added on top: `scrollHeight` 1407 against a
  `clientHeight` of 1356, a scrollbar nobody asked for on the one screen that must not have
  one. The body is the flex column and the prose takes what is left.
- **One rule for every column in the demo stage.** `height: 100%` and a flex column around
  `.page-column-prose` is right for the wall column and wrong for the prose ones, where a
  paragraph that no longer fits would be squashed rather than scrolled. `classes` is
  additive on a column, so the page asks for it by name (`blogx-latest`).

## Two numbers that were measured, not chosen

- **The front's split is 0.95 : 1.55.** At an even 1 : 1.3 the wall got 863px of a 1920
  paper and `auto-fill` at 19em fit TWO columns by 3px — a 1920 screen showed four posts
  above the fold where the same layout showed five at 1921.
- **The board's region floor is 30em.** At 24em, six regions in a 3170px paper produced
  SEVEN tracks and one 640px grey slot. At 30em a 3440 paper is exactly five tracks and a
  1920 one is three.

## The dynamic rail — how it is honest

Every depth is already a different class, built by the Router as you walk down, so *what
does the rail show here* is answered by which class you are standing in. One `rail()` per
class and nothing computed:

| url | the rail |
|---|---|
| `/dig/` | the three sections |
| `/dig/framework/` | that section's four posts, and a way back up |
| `/dig/framework/layout-generators/` | this post's four PARTS, then its neighbours |
| `…/why-generate-at-all/` | the same rail, with part 1 marked `.active` |

Proven at three depths in `shots/dig-level{1,2,3}-1920.png`.

⚠ **A static part is inherited, but only down its own branch.** `Dig.Section extends
Blog.Section`, so its `.Post` still resolved to `Blog.Post` and the third rail would
silently have been the second one. `Dig.Section.Post = Dig.Post` is the line that puts
Dig's own classes back in the chain.

## Persistent vs swapping — the verdict

**Columns (persistent + additive)** wins when the parts are *compared*: you can read part
four with part one still on screen, and at 3440 all four fit. It costs a sideways scroll
below ~1600px of row.

**Swap (persistent nav, swapping region)** wins when the parts are *read in order*: one
place to look, no sideways scroll, and it is the only treatment here that works unchanged
at 400. It cannot show two parts at once.

The swap's strip is persistent for real, not redrawn: the parts mount in `this.$pages`, a
region belonging to the post, because core's `container()` walks up to the nearest ancestor
holding one. Navigating between parts renders the part and nothing else, and
`Router.mark_links()` slides `.active` along a strip that was never touched. The overview is
a plain div wearing `page … default`, stood down by one rule of the same shape `Page.css`
uses for a default column.

## Open — the owner decides

- **Does the blog get its own rail, or the site's?** Every candidate here hides the site
  strip on the argument that two rails is one too many. If the site rail stays, subtract
  ~270px at 3440 from every number above and the magazine front loses a wall column.
- **How many posts before the two-level rail stops working?** It shows the whole archive;
  at forty posts it needs its own scrollbar and the dynamic rail is the answer. The
  crossover is a judgement, not a measurement.
- **Should the front's wall have an "everything" cell?** Seven cards leave one to three
  empty slots at every width. They are paper now rather than holes, but a trailing
  "All 8 posts →" cell would fill the last one and add a real link.
