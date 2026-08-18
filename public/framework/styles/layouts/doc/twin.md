# `twin` — a card that is two screens

The long form behind `twin: true`: ten of the layouts render **one** content object
(`web.js`) and each card shows the layout at both extremes at once — a 390 phone
beside a 3440 monitor, both live. Split out of `readme.md`; the pages this was
written for lived at `core/Page/layout/` for a week before the catalogs merged.

**Two panes in one card, or two cards?** One card, two panes. The comparison *is*
the lesson — a phone beside a 3440 monitor, both live — and two cards would let a
wall put them on different rows. Each pane is fitted by measurement rather than by
a `zoom-25`-style rung: a rail card, a wall card and the `< 64em` strip are three
different widths, and a fixed rung is right for exactly one of them. The fit is
`ext/demo/stage.js`'s own `simulate()` and `watch()` — the same two calls the
two-up makes, so a card and a stage cannot drift about what a simulated width
means. The card itself is `ext/demo/twin.js` now, where `demo.layout({ twin: true })`
reaches for it.

| | |
|---|---|
| fixed `zoom` rungs, panes sized in `em` | 312px of panes in a 326px card at 390 — overflows the one width that matters most |
| pure CSS: percentage width + `zoom` | fits, but the simulated width then *scales with the card*, so "390px" becomes a tablet on a wide wall |
| **fixed device widths, measured zoom** | ✓ the panes are always 390 and 3440, whatever the card is |

**A pane is as wide a share of the card as its device is wide a share of its own
height** (`flex: 390/844` beside `flex: 3440/1440`), so fitting both by width lands
them on one height with **nothing cropped and no dead space**. The first shape
cropped the phone to the monitor's height with `position: absolute`, and the owner's
review named it exactly: *"they don't render correctly — the cards are cutting
content."* The geometry does what a second measured pass would otherwise have to,
and the cost is an honest one — a phone really is 16% as wide as a 3440 monitor is
tall, so its pane is narrow. The **rail is what pays for it** (below), not a crop.

Rejected on the way: full pages rather than full viewports in a card. A phone page
is roughly ten times its own width, so an aspect-proportional phone pane would be
**26px** on a 430px card. A card is a picture of a *screen*; the stage is where the
whole page lives.

**The card jumped, visibly, on every load.** Measured, at 1600: the first card's
thumb was **1440px tall with no zoom at all**, then 344px at a zoom fitted to a
card the rail had not yet narrowed, then 79px settled — three layouts, ~300ms
apart. Two causes, one mine:

| | |
|---|---|
| the render was IN FLOW, so an unzoomed 1440px viewport sized the pane | mine. `aspect-ratio` on the pane and `position: absolute` on the render: the pane's height now comes from its own width, and no unzoomed frame can ever size it |
| the first fit measured a card the stylesheet had not reached yet | `View.stylesheet()` links are async, so *every* live card on the site re-fits when its rail settles. Not mine to fix, and now invisible: with the height on the pane it is the same re-flow any card does |

**`visibility: hidden` until the first fit**, because a card is built **detached** —
`clientWidth` is 0, so no synchronous measurement is possible at build time and one
frame of a layout painted at 1:1 is the whole remaining artefact. `fit()` still runs
synchronously first, for the case where a card *is* already live (a re-render).

**Checkboxes, not variants.** A layout's regions (`header rail aside toc toolbar
footer sticky cta`) are declared as `parts:` and read with `this.shows(name)`; the
chips live in the **`ext/layout` right drawer** via `layout.context()`, registered
once on the exhibit's render — the same move `styles/sections`' tone chips make.
Weighed against a page per combination (2⁵ pages for the app shell alone) and
against a panel of this module's own (the brief's own rule: one control surface).
The payoff is that **the app shell with every box unchecked is the document
layout**, live, which no pair of sibling pages could show.

**A toggle re-runs the layout; it does not patch the DOM.** `layout()` is a pure
function of the page's state, so switching a part is `$view.empty(() => this.frame())`
on both panes — no state to keep and nothing to keep in sync. The panel survives it
because the registration sits on the render, which is emptied rather than replaced.

**REVERSED — the two `detail.js` files merged (2026-08-12, same day).** This one
was written as "extends `styles/layouts/detail.js`; it does not replace it": same
config-factory shape, with the two-up where that one has `demo.stage()`, and
`parts:` added. Two near-copies of one factory did not survive the read that
followed. Both are now `demo.layout(config)` in `ext/demo/layout.js`, and the whole
difference between a specimen that is a **screen** and one that is a **shape** is
`twin: true` — the card is a phone beside a monitor, the stage is the two-up, and
the frame paints a ground. The option deciding which is the honest cost, and it is
one word on ten pages.

**The stage is AUTO-HEIGHT: the tallest pane sets it, the short one grows to
meet it.** The first shape gave both panes a fixed 440px strip of screen, and the owner's
verdict was the plain one — *"we lose half the site."* A layout page is not 440px
tall at 390 wide, and a preview that hides most of it is not a preview.

| | |
|---|---|
| keep a device viewport per pane and scroll inside it | truest to a browser, and it hides the thing the reader came for behind a scroll gesture inside a zoomed box |
| pure auto height, page grows, no floor | nothing hidden — but the short pane then leaves hundreds of px of the stage's board under it, which is what a fixed strip was trying to avoid |
| **auto height + a `min-height` floor from the tallest pane** | ✓ nothing hidden, and the room that is left is a page's own rather than the board's |

**Verdict: page growth, not scroll-within-pane, and a floor rather than a
height.** `level()` clears both floors, measures each pane's own box times the zoom
the fit wrote, and gives every page `min-height = tallest ÷ its own zoom`. A floor
**can only add**, so no width can ever crop anything; and because what absorbs the
extra is each layout's own `flex-1` band, the footer, the status bar and the
composer still land on the bottom edge — the pinning lesson survives the change
that was supposed to cost it. Re-run on a width change and after every toggle.

**What it costs, stated plainly:** at the default 75/25 split the wide pane is three
times the phone's width, and the same words stack roughly four times taller at 390 —
so the phone sets the height and the monitor's page is floored to something no real
monitor is (5044px on `document`). The room under its content is genuine — a
3440 × 5044 window really would look like that, footer on the bottom edge — but it
reads as empty, and dragging the handle to the middle is what closes it. Reopen this
if the two-up ever learns to stack its panes.

**So `web()`'s prose is short on purpose, and that is the real lever.** Every
sentence costs the stage about four of its own lines, because the height that wins
is always the phone's. Cutting `blurb` to one sentence, `sections()` to one
paragraph each, and the per-layout counts by a third took the exhibits from
**1880–2310px down to 1020–1160** with nothing hidden at either width. Volume was
never the lesson; arrangement is.

**`frame(height)` takes its height from the caller, because the two surfaces
simulate different things.** A card is a picture of a *screen*, so it passes
`"100%"` and the layout fills a device viewport. The stage is the *page*, so it
passes nothing and the layout takes the height it needs.

**`frame()` paints a ground.** A browser paints one behind every page; without it
a layout's unpainted bands showed the stage's transparency board straight through,
on the card and on the stage both. One declaration, in the one place that knows it
is simulating a screen — not ten layouts each remembering to.

**The rail is `26em`, set as a token on the page.** A card here is two screens side
by side and wanted more room than a rail of single thumbs does. `--rail` is already
`ext/catalog`'s own knob (`.page-catalog > .page-previews { flex: 0 0 var(--rail,
19em) }`), so the whole change is one `render()` override declaring it — no rule in
`catalog.css`, and no second page affected. Weighed against a `catalog(width)`
argument (an option is API surface forever, for one call site) and against widening
the default (nine other rails would pay for this page's cards). Measured at 1600:
the rail goes 295px → 404px and the thumbs 79px → 134px.

**The two-up's own code pane is gone, and so is the removal.** The old
`demo.responsive()` box printed `source(fn)` above its panes, and the `fn` an exhibit handed it was the
two-line wrapper that captures both renders — meaningless, and directly above the
real source the exhibit prints below. This folder deleted it with a
`querySelector(…)?.remove()`; the fold into `demo.stage.two()` deleted the pane
itself, so a stage has no code in it to remove.

## Closed — there is one `web()` now

There were two: `ext/demo/web.js`'s fictional site as a **`Page` tree**, and this
folder's `web(config)` — the same fictional site's **page content**. The rename
recommended here was `tree()`; it turned out to touch seven call sites, two of which
call `demo.tree()` in the same file, so the tree one became **`sample()`**
(`ext/demo/sample.js`) instead. `web` now means page content, and only that.

## Open

- **A two-up gets tall on a wide monitor.** The two-up caps its fit at 1:1 but not
  its height, so at 3440 the phone pane is ~525px wide and renders its 390px page at
  **100%** — which is why the exhibits measure 700–1070px at 1440 and 2000–3500px at
  3440. The whole layout is visible either way.
- **Only the wide pane is steerable.** `demo.exhibit()` steers one target, so the
  bar and the click-to-select region are the 3440 pane; the phone renders and
  re-renders but cannot be inspected.
- **Ten layouts, one content shape.** `web()` is a marketing/docs site, which flatters
  the reading layouts and stretches for Mail and Chat — those two spell out their own
  bubbles and headers. A second content object (`web({ topics: … })` is already the
  door) would be the honest fix if the list grows.
