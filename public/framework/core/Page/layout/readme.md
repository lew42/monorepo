# Layout — design record

Ten whole-page layouts, one content object, and a card that shows each of them at
both extremes at once. `web.js` is the content, `twin.js` is the card, `detail.js`
is what every leaf page *is*, and the ten directories are class strings.

**No stylesheet in this folder, and there must not be one.** Everything is the
twelve layout words plus the four page shapes; the handful of `overflow` and
`position: sticky` declarations are inline because they are per-layout state, not
a look. If a rule ever feels necessary here, it belongs in `framework.css` as a
word — see the ladder in `code-architecture`.

## Decisions

**Where does the tab live?** As a **declared child of the `Page` classdoc** —
`children: "… flow layout"` in `core/Page/page.js`, and nothing else. `classdoc.page()`
already builds its bar as `["overview", …children, "api", "docs"]`, so a top tab
was one word in a list; the "smallest visible extension" the brief asked for turned
out to be no extension at all. Rejected: a parallel `layouts:` key on classdoc (a
second mechanism for a shape `children:` already has), and a view mode inside the
Overview (a url per tab was the requirement classdoc settled months ago).

**Two panes in one card, or two cards?** One card, two panes. The comparison *is*
the lesson — a phone beside a 3440 monitor, both live — and two cards would let a
wall put them on different rows. Each pane is fitted by measurement rather than by
a `zoom-25`-style rung: a rail card, a wall card and the `< 64em` strip are three
different widths, and a fixed rung is right for exactly one of them. The fit is
`ext/demo/stage.js`'s own `simulate()` and `watch()` — the same two calls
`demo.responsive` makes, so a card and a stage cannot drift about what a
simulated width means.

| | |
|---|---|
| fixed `zoom` rungs, panes sized in `em` | 312px of panes in a 326px card at 390 — overflows the one width that matters most |
| pure CSS: percentage width + `zoom` | fits, but the simulated width then *scales with the card*, so "390px" becomes a tablet on a wide wall |
| **fixed device widths, measured zoom** | ✓ the panes are always 390 and 3440, whatever the card is |

**A pane is as wide a share of the card as its device is wide a share of its own
height** (`flex: 390/844` beside `flex: 3440/1440`), so fitting both by width lands
them on one height with **nothing cropped and no dead space**. The first shape
cropped the phone to the monitor's height with `position: absolute`, and Mike's
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
chips live in the **`ext/Layout` right drawer** via `layout.context()`, registered
once on the exhibit's render — the same move `styles/sections`' tone chips make.
Weighed against a page per combination (2⁵ pages for the app shell alone) and
against a panel of this module's own (the brief's own rule: one control surface).
The payoff is that **the app shell with every box unchecked is the document
layout**, live, which no pair of sibling pages could show.

**A toggle re-runs the layout; it does not patch the DOM.** `layout(site)` is a pure
function of the page's state, so switching a part is `$view.empty(() => this.frame())`
on both panes — no state to keep and nothing to keep in sync. The panel survives it
because the registration sits on the render, which is emptied rather than replaced.

**`detail.js` extends `styles/layouts/detail.js`; it does not replace it.** Same
config-factory shape (`preview` / `content` / `frame` + `...config`), with
`demo.responsive()` where that one has `demo.stage()`, and `parts:` added. The two
are deliberately separate files: that one is a *shape* on a stage, this one is a
*page* at two widths, and merging them would mean an option deciding which.

**The stage is AUTO-HEIGHT: the tallest pane sets it, the short one grows to
meet it.** The first shape gave both panes a fixed 440px strip of screen, and Mike's
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

**The two-up's own code pane is removed.** `demo.responsive()` prints
`source(fn)` above its panes, and the `fn` an exhibit hands it is the two-line
wrapper that captures both renders — meaningless, and directly above the real
source the exhibit prints below. One `querySelector(…)?.remove()` in `two_up()`,
rather than a CSS rule: a stylesheet under `core/` may not style an `ext/` class,
and the alternative was letting the noise stand.

## Recommendation: two `web()`s

`ext/demo/web.js` exports `web(root)` — the fictional site as a **`Page` tree**, for
`demo.app()`. This folder's `web(config)` is the same fictional site's **page
content**. They are never imported into one file today, and `core/Page/nav/page.js`
imports one while `core/Page/layout/detail.js` imports the other — two doors down.

The name was specified in the brief, so it stands. If it is ever revisited, the
cheaper rename is `ext/demo/web.js` → `tree()`, since that one's whole job is the
*tree*: it touches three call sites. Same shape of collision as `ext/Layout` vs
`styles/layouts/Layout.js`, recorded for the same reason.

## Open

- **The `Docs` tab already has a note called `layout`** (`doc/layout.md`, the CSS
  record) — `/framework/core/Page/docs/layout/` beside `/framework/core/Page/layout/`.
  No collision in code or url, and the note's real subject is the stylesheet, so
  `notes: "declaring labels css"` + `doc/css.md` would read better than either. It
  changes a public url, so it wants Mike's word.
- **A two-up gets tall on a wide monitor.** `demo.responsive` does not cap its fit,
  so at 3440 the phone pane is ~525px wide and renders its 390px page at **135%** —
  which is why the exhibits measure 700–1070px at 1440 and 2000–3500px at 3440. The
  whole layout is visible either way; a cap at 100% belongs in `ext/demo`, where
  `stage.js`'s width presets already have one.
- **Only the wide pane is steerable.** `demo.exhibit()` steers one target, so the
  bar and the click-to-select region are the 3440 pane; the phone renders and
  re-renders but cannot be inspected.
- **Ten layouts, one content shape.** `web()` is a marketing/docs site, which flatters
  the reading layouts and stretches for Mail and Chat — those two spell out their own
  bubbles and headers. A second content object (`web({ topics: … })` is already the
  door) would be the honest fix if the list grows.
