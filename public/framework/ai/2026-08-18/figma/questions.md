# Questions for the owner — collected, not blocking

From the pilot (`51:1477`). Each one states the assumption the pilot shipped with, so nothing
stalled. Ordered by how much the answer changes for the other 18.

## 1. A fluid track that is twice its neighbour — do we add the word? ⭐

> **ANSWERED by the mastermind, 2026-08-18 — shipped as `--grow`, not `--weight`.**
> `.flex.auto > * { flex: var(--grow, 1) 1 var(--column) }`. Default 1, so every existing caller
> is byte-identical; verified clean on six pages at 400 and 1920. Named `--grow` to pair with
> `--basis` and to name the exact property it sets. **The name is still yours to overrule** —
> one line plus the callers in `styles/layouts/`. Reason recorded in `styles/doc/decisions.md`.

**The one real vocabulary gap.** Every flexible class sets `flex-grow: 1`, so free space is
always split evenly: `.flex.auto`, `.all-1`, `.three`, `.flex-1` all do. `.basis` is fixed.
Nothing expresses *two-thirds, and still fluid* — and two of these eight layouts (bento,
dashboard) are built on exactly that seam. Both ship with an inline `flex: 2 1 30em`.

Measured alternatives are in
[`layouts/wire/doc/bento.md`](/framework/styles/layouts/wire/doc/bento.md). The recommendation
is one token on the class we already have:

```css
.flex.auto > * { flex: var(--grow, 1) 1 var(--column); min-width: 0; }
```

Backwards compatible (`--grow` defaults to 1), same shape as `--gap`/`--pad`/`--basis`, and
it holds the ratio at every width. **Assumed: inline `flex` for now**; `framework.css` was
fenced for this task and a new layout word is your call, not a minion's.

Bento grids appear on at least four more designs on the list. Worth deciding before tier B/C
fans out.

## 2. Should there be a `.tint` class?

> **ANSWERED by the mastermind, 2026-08-18 — yes, shipped.** `.tint { background: var(--tint) }`,
> beside `.wash`. Census first: nothing in the repo used `tint` as a class, so it cannot change
> an existing render. The general lesson is the bigger one — **a token without its class is a
> trap that never throws**, and it cost the pilot a whole build-and-measure cycle.

`--tint` is a real token — "one step down from a surface" — but only `.surface` and `.wash`
are classes. Typing `div.c("tint")` **paints nothing and throws nothing**; it cost the pilot
one build-and-measure cycle. The Figma's greyscale wireframes use a three-step ladder and we
have two.

**Assumed: two tones, `wash` and bare.** It reads fine. But every remaining wireframe design
on the list will want the same third step, and a one-line class in `framework.css` would give
it to all of them.

## 3. Promote `400/entry.js` to `layouts/entry.js`?

Eight generic lines that turn one spec into a twin card with a bare `/full/` url. `wire/` is
now its second caller, which is this tier's own stated bar for promoting a helper. **Assumed:
imported across the seam** (`import entry from "../400/entry.js"`) — promoting it is a rename
in a directory this task did not own, and CLAUDE.md says ask first.

## 4. Is `Reference` the right band for these?

`wire` sits with `model fit flex grid 400 space` — "things you consult, not copy". These are
arguably things you *do* copy. `400` is already there and is the same kind of page.
**Assumed: Reference.** One word in `BANDS` to move it.

## 5. Six of the eight already exist as real layouts — is that a problem or the point?

`Holy Grail` → `shell` (this tier already deleted a `holy-grail` for exactly that reason),
`Dashboard` → `dashboard`, the two sidebars → `sidebar`/`docs`, `Hero + Grid` → `hero`,
`Header + 3 Col + Footer` → `document`. **Assumed: the overlap is the answer, not a
duplication** — so `wire/` demonstrates the *strings* and links to the real layout beside each
one, rather than adding eight sibling directories. If you would rather have the eight as
first-class pages, it is a cheap change; say so before the fan-out.

## 6. A wrapped `.basis` rail keeps its basis and leaves a gutter

At 400 the `left` rail takes its own line and stays 14em (224px of a 400 screen) because
`.basis` is `flex: 0 0 …`. Its neighbour fills. Not obviously wrong — a fixed rail is what
`.basis` is for — but "full width once it is alone on a line" may be what you actually want on
a phone. It falls out for free from question 1's `--grow` fix. **Assumed: left as is, and
measured** in [`doc/measured.md`](/framework/styles/layouts/wire/doc/measured.md).

## 7. There is no word for "stretch one line, hug many"

`align-content: stretch` is right when a wrapping row does not wrap and wrong the moment it
does. The pilot's rule — `start` when the wrapped lines are uneven, the default on peers — is
a judgement call made per layout, three times in eight. Lower priority than question 1: it has
not actually broken anything, it just cannot be automated. Recorded, not proposed.

## Not a question — a note on the Figma

`get_variable_defs` on this node returns `{}`. **The file binds no variables**, so there are no
design tokens to map; every colour and size is a raw value on a frame. If the other 18 are the
same, the "map their tokens to ours" step can be dropped from every brief.

## 8. Anatomy (`181-1457`) — a finding, not a question ⭐

**Minion B, 2026-08-18.** The seven children (Burger, 3x Burgers, Burger with Columns,
Burger with Columns with Burger, Columns, Columns with Burger, 3x Columns) collapsed to
exactly two class strings — `flex v` (a Burger) and `flex auto` with `--grow: 2` on the centre
(Columns) — composed, never a new one. Shipped as one page,
[`/framework/styles/layouts/anatomy/`](/framework/styles/layouts/anatomy/), not seven
directories, following `wire/`'s own precedent. No question here needs an answer, but two
things are worth the owner's eyes:

- **`--grow` (shipped hours before this task) reads truer than the pattern it replaces.**
  [shell](/framework/styles/layouts/shell/) and [sidebar](/framework/styles/layouts/sidebar/)
  predate it and use a fixed `basis` rail plus an inline `flex: 1 1 24em`/`26em`. Every Columns
  shape in `anatomy/` uses `--grow: 2` instead — one token, no inline `flex` anywhere in the
  file — and it is a closer read of this Figma's own ratio (≈1:2.07:1) than a fixed rail would
  be, since none of its three tracks look like a rail that refuses to grow. Worth revisiting
  `shell`/`sidebar` to use `--grow` too, next time either changes.
- **"3× Burgers" is peers, not a `--grow` row.** The Figma's three burgers are equal width, so
  that shape is `flex three` (matching `wire/columns`'s "each column a `flex v all-1`"), not
  the Columns primitive. Two different "three things side by side" shapes live in one Figma
  frame and are not the same word — assumed equal Figma widths mean equal peers, unequal means
  `--grow`.

Verified: 7 shapes × 4 widths (400/1280/1920/3440), `scrollWidth === clientWidth` at all 28,
zero console errors, `.tint`/`--grow` confirmed live via `getComputedStyle` (scoped past the
Router's hidden sibling pages — an unscoped `document.querySelector` finds inline styles on
*other* mounted-but-hidden routes too, which cost one detour here). Record:
[`anatomy/doc/decisions.md`](/framework/styles/layouts/anatomy/doc/decisions.md).

---

# From Minion A — the homepage (`23-181` + `23-1144`), wave 1

Each states the assumption shipped with, so nothing stalled. Ordered by how much the answer
changes for the other designs.

## 8. `--grow: 2` is a 1.52 track, not a 2× one — fix the CSS or the sentence? ⭐

`.flex.auto > *` is `flex: var(--grow, 1) 1 var(--column)`, so **both tracks start at the same
basis and the weight only splits the leftover.** Measured on this page at four widths:
`--grow: 2` against a default 1 gives **1.39 / 1.52 / 1.52** at 1280 / 1920 / 3440 — flat,
which is the property that matters, but not 2. The vocabulary sentence *"a child with
`--grow: 2` is a fluid track twice its neighbour"* is false as written.

One line makes it true: `flex: var(--grow, 1) 1 calc(var(--column) * var(--grow, 1))` — the
basis scales with the weight, so the ratio is exact at every width *and* the wrap threshold
moves with the track. **Assumed: leave the CSS, tune the weights** (`framework.css` is fenced),
and the design landed anyway — 1.52 and 0.77 against the Figma's 1.40 and 0.78, with no number
from the comp typed anywhere. Detail:
[`layouts/home/doc/transition.md`](/framework/styles/layouts/home/doc/transition.md) §2.

## 9. A single fluid child with a real basis, on a plain wrapping row, has no word

The other half of the `--grow` hole. The nav in the header wants `flex: 1 1 22em`: share the
line at 1280, take its own line at 375. `--grow` only reaches `.flex.auto` children, and making
the row `.auto` would turn the brand and the button into fluid tracks and kill `split`.
`.basis` cannot shrink (overflows at 400); `.flex-1` has a zero basis (never wraps). **It is
the one inline `flex` on the page.**

Candidate, no new class: `.basis { flex: var(--grow, 0) 1 var(--basis, var(--column)) }` —
byte-identical for every current caller. **Assumed: inline for now.**

## 10. `.wash` and `.tint` are absolute; a band-relative surface has no word

`--wash` is keyed to the **colour-scheme**, not to the band. On the dark highlight card in
light mode `.wash` paints black on black — the picture placeholder shipped invisible and
nothing threw. This is the same family as the pilot's `.tint` finding, one level up. `.muted`
already solved it for *text* ("derived from the band's own ink, never a fixed grey"); there is
no background twin. **Assumed: `background: color-mix(in srgb, currentColor 10%, transparent)`
at the call site**, which inverts correctly on every tone in both modes. A `.veil` class would
retire it — but `.wash` has hundreds of callers and redefining it is not a minion's call.

## 11. Our `h1` is half the comp's hero — is that the convergence you want?

The page renders **4964px tall at 1920 against the Figma's 7350**, with nothing missing. The
comp's hero title is ~64px; `h1` is `1.9em` = 30px. Band padding is 120px in the comp and
`clamp(2.5em, 5vw, 5em)` here. That is standing rules 1 and 2 working exactly as written, and
it is the single biggest visual difference between the render and the comp. **Assumed: the
rules win, verbatim.** If you want comps to land closer, the lever is a `--h1-scale` token or a
`.display` level above `h1` — one decision that would reach all 19 designs, so worth making
before wave 2.

## 12. The desktop file has a SECOND `Services-Section` — alternate, or a real band?

`32:1277`: the same three cards, header left and cards stacked right. The mobile file has only
one Services band, which is why this reads as an alternate. **Assumed: not built** — it would
put the same three cards on the page twice. It is one word away (the header and the wall as the
two tracks of a `flex auto gap`, wall at `--column: 100%`), and it could be a `parts:` chip
instead if you would rather see both. Recorded in
[`layouts/home/doc/decisions.md`](/framework/styles/layouts/home/doc/decisions.md).

## 13. Three places the two drawings genuinely disagree — all shipped as the desktop reading

Not blocking, but they are the honest cost of "one class string per band", and each is a
deliberate deviation from the mobile comp:

1. **Nav at 375** — the Figma drops the five links (an implied burger); one wrapping row keeps
   them, so the mobile header is three lines. A burger is a component, not a layout.
2. **Philosophy heading** — the Figma's mobile interleaves heading *above* the picture, body
   below. One row cannot express it; the picture leads here.
3. **Portfolio CTA** — the Figma's mobile moves it to the bottom of the band, full width. It
   wraps under the heading here. Moving it would mean two DOM positions, which is two drawings.

**Assumed: all three deviate rather than gain a query.** Say the word and any one of them is a
`@media` in a file that currently has none.

## 14. Not a question — the survey undercounted this node

The brief said nine bands; the desktop is **eleven** top-level frames (the duplicate Services
above, plus a `Highlight-Section` nested inside an unnamed `Frame 14619`) and the mobile is ten.
`get_metadata` on both was ~11k tokens total and is where that came from — **count from the
metadata, not from the survey table**, for the remaining designs.

## 9. Wave 2 / Minion C (163-613, "sidebar-preview-3440/1920/400") — a finding, not a question

**Minion C, 2026-08-18.** The frame is not a sidebar in the `sidebar/`/`docs/` sense wave-2.md
assumed — it is a **component-library browser** (branded "LEW42"): a fixed category rail beside a
header, a toolbar, and a wall of cards. `layouts/gallery/` already draws exactly this — `basis` rail
(`site.menu()`) beside `grid gap auto` (`site.tiles()`) — "a filter rail beside a wall of tiles that
re-counts itself at every width," verbatim. No new directory built; the deliverable is this
demonstration plus the link: [`/framework/styles/layouts/gallery/`](/framework/styles/layouts/gallery/).
`sidebar/` is the same two-class idiom in the abstract (fixed panel, fluid content, no content
opinion); `gallery/` is the populated instance that matches this Figma's content, so both are worth
a reader's eyes but `gallery/` is the closer match.

**The 3440 finding.** The Figma's own mega and standard-desktop frames stretch **one** placeholder
card edge-to-edge across ~3160px of the content column, with a few thousand empty pixels below it —
the same drawing at 1920 and 3440, just wider dead space, not a considered "mega" layout. Consistent
with the owner's own verdict on this series ("not great on mega"). Did not reproduce the stretch:
`gallery/`'s existing `grid gap auto` already re-counts columns instead (three tiles across a phone,
thirty across a 3440 monitor per its own note) and needed no code — the framework's existing answer
is already better than the Figma's mega drawing.

**What the Figma genuinely adds — all three already exist, none built.** A breadcrumb
("Viewing > All Components") is `ui/crumbs`. A grid/list view toggle is the exact icon-button pair
`ui/toolbar`'s own demo shows (`button(() => icon("view_list"))` / `view_module`). Per-card badges
("Simple", view counts) are `ui/badge`. Composition of existing pieces, not a vocabulary gap — noting
it here rather than wiring it into `gallery/page.js`, which is a file no wave-2 minion owns.

Verified: `layouts/gallery/`'s existing shape at 400/1280/1920/3440, `document.querySelector(".page").scrollWidth === clientWidth`
at all four (probed via `.active-page .demo-render`, since this page has no `/full/` route and so no
`.layout-full` to scope to — same trap wave 1 hit, same fix), zero console errors. Screenshots:
`figma/shots/gallery-sidebar-1920.png`, `gallery-sidebar-400.png`.

## 10. Wave 2 / Minion D (163-615, "tabbed-toc-3440/1920/400") — a finding, not a question

**Minion D, 2026-08-18.** `163-615` is not the tabbed-toc design wave-2.md described — its
children are `miller-columns-3440/1920/400` (a drill-down browser, Minion C's actual sibling
node's neighbour, unrelated to tabs or a toc). The real `tabbed-toc-*` frames are one node
over, at `163-616` — confirmed by content match: top category tabs, a right-hand "On This
Page"/"Sections" rail with a current marker, footer prev/next between categories, exactly as
briefed. Both wave-2 node-ids were off by one from the live file (`163-614` is Minion C's
`sidebar-preview-*`, not `163-613`) — worth checking whether the survey's node-ids drifted
file-wide, or just these two, before wave 3 trusts them.

**Both halves already existed — composed, not reimplemented.** Built at
[`/framework/styles/layouts/toc-studio/`](/framework/styles/layouts/toc-studio/). The right
rail **is** the real `toc()` (`ext/toc`) — it scans the page's own `h2`s and marks the current
one itself, unmodified. The top strip reuses `ext/tabs`'s own CSS (`.tabs .tab-bar .tab`)
verbatim, but as static markup rather than a live `this.tabs()` call — `tabs()` mutates the
Page it is called on (`this.regions`, `this.default_tab`), and a `demo.layout()` frame renders
three times over on one Page instance (the wall's own thumbnail, then twice for the twin's two
live widths), which corrupts a second call. Not a new finding about the design, but worth
recording as a boundary of what `this.tabs()` can compose into: safe inside a real routed
Page's own `content()`, unsafe inside anything that re-invokes the same builder function on the
same `this` (every `styles/layouts/` page). `toc()` has no such state — it is safe.

**The Figma disagrees with itself between widths, and only one reading was kept.** At 3440 the
rail is styled exactly like a table of contents (thin left rule, small text, a dot for
current); at 1920 the same five names are styled as filled/pill sidebar rows instead — two
different visual treatments for what is supposed to be one rail. Shipped the toc treatment
everywhere (the real module's own CSS), not the 1920 variant.

**Not reproduced: the Figma's mobile-only chip row.** At 400 the Figma drops the tab strip and
the rail for a three-chip filter row and item-level "4 of 12" pagination — a third drawing, not
a reflow of the first two. Kept the one responsive row instead (`flex wrap`, no query, same
move as `hero/page.js`): the tab strip now genuinely overflows a 400px viewport (708px of tabs
in a 400px box) and hard-cuts at both edges, since the edge-fade mask was removed tonight
(`ext/tabs/doc/overflow.md`) — this is the trap the brief asked to watch for, confirmed live.
The toc rail wraps below the content at 400 rather than disappearing, same "wrapped `.basis`
rail" shape already logged in question 6.

**What the Figma genuinely adds:** the footer's category-level Previous/Next has no existing
framework word — built as a plain `flex split` row, not a new component.

Verified: `document.documentElement.scrollWidth === clientWidth` at 400/1280/1920/3440 (zero
overflow at all four, including the overflowing tab strip itself, which scrolls rather than
grows the page), zero console errors, `toc()`'s live scan confirmed (5 real `h2`s → 5
`.toc-link`s) via `getComputedStyle`/DOM read scoped to `.active-page`. One observation, not a
bug: the scroll-spy's `.current` mark occasionally isn't set on the very first paint in headless
timing (a `queueMicrotask` + single `requestAnimationFrame` race already implicit in `toc.js`'s
own code comments about "a page built while still off-screen") — settles on any later read or
real scroll; not reproducible through normal navigation.

---

# Minion A, reopened — one defect fixed, one rule for the queue

## 15. `page full fill` is wrong for any content-heavy design — please confirm the rule ⭐

**The homepage shipped broken and my acceptance test could not see it.** At 1440: nav → hero
truncated mid-paragraph → footer, with **4549px of content inside a 284px `.flex-1` (16.0x)** —
seven of ten bands in the DOM and unreachable, and the document itself not scrolling at all.

The class string was not the culprit: `landing`, `document` and `hero` use the identical
`page full fill flex v` and are clean at the same viewport. **The difference is content
volume.** In a `full` (100vh) `fill` shell the middle gets whatever the header and footer
leave — this footer carries three link columns, so 1000 − 110 − 600 ≈ 284 — and the rest
scrolls inside a box instead of growing the page.

**Fixed:** `page full flex v`, no `flex-1`, no `overflow-y` — document scroll. Verified at
400 / 1280 / **1440** / 1920 / 3440: horizontal clean, and no `overflow-y: auto` box anywhere
in the layout exceeds its own client height.

**The rule I am proposing, and it reaches the whole queue:** `fill` is a claim that the layout
*fits one screen*. Right for an app shell (`shell`, `mail`, `chat`, `dashboard`, `split`) where
the chrome is fixed and one pane scrolls. Wrong for anything whose bands can exceed a viewport
— a marketing page, an article, a long form. **`landing`, `document`, `docs` and `stack` all
wear `fill` today and none is broken, because none holds enough content to collapse. Each is
one longer demo away from this.** Assumed: one line each in `layouts/doc/decisions.md` rather
than changing four working layouts — say the word if you want them changed.

**Two measurement notes worth keeping**, both already in
[`.claude/skills/layout/improvements.md`](/framework/styles/layouts/home/doc/transition.md):
`scrollWidth === clientWidth` is horizontal only, and on a `fill` page the "page height" you
reach for is the *inner scroller's* — both read healthy throughout. And **test 1440**; it sits
between the two widths everyone tests and is where this was found.

## 16. `--grow` fix confirmed — and it changed what a weight *means*

Question #8 shipped (`flex: var(--grow,1) 1 calc(var(--column) * var(--grow,1))`). Re-measured
here after retuning to the Figma's own seams: **exactly 1.40 and 0.80 at 1280 / 1440 / 1920 /
3440**, flat, against the comp's 1.40 and 0.78. Thank you — it is now the width ratio it says.

⚠ **One behaviour change worth broadcasting before wave 2 ports any weights.** The basis scales
with the weight now, so a weight also moves the **wrap threshold**: a row breaks when
`--column × --grow` *summed over its tracks* no longer fits. My first retune used `4`/`5` for a
0.8 seam — harmless under the old shared-basis formula — and it stacked at **every** width
(16em × 9 = 144em of basis). **Express a weight as a number near 1** (`0.8`, `1.4`), never as
the smallest integer pair.

---

# Minion E, wave 3 (node `181-1456`) — a finding and one dilemma, not blocking

**Minion E, 2026-08-18.** `get_metadata` on `181:1456` returned exactly the seven names the
survey claims — `home`, `profile`, `settings`, `homepage`, `landing-page`, `about-page`,
`contact-page` — no shift, unlike the 163-series. Worth recording as the counter-example: the
survey's naming problem is real but not universal.

**Four of the seven collapse into three existing layouts, no new code.** `homepage` and
`landing-page` are two different frames that are both
[landing](/framework/styles/layouts/landing/)'s existing shape; `about-page` is
[document](/framework/styles/layouts/document/)'s; `contact-page` is, almost line for line,
[stack](/framework/styles/layouts/stack/)'s existing form demo. Linked from
[`screens/page.js`](/framework/styles/layouts/screens/), not rebuilt.

**The other three (`home`/`profile`/`settings`) are a phone-width app with no existing
layout of that shape** — a header, a scrolling card stack, a fixed bottom tab bar — built as
[`screens/`](/framework/styles/layouts/screens/), the new directory wave-3.md flagged as
conditional. All three from vocabulary already in the framework, plus one existing `ui/`
component (`.ui-avatar`).

## Dilemma: no toggle-switch class

The Figma's `settings` frame draws a pill toggle switch; the vocabulary has none (it's a leaf
control, not a layout primitive, and outside this survey's list of what does and doesn't
exist). **Assumed:** a native `<input type="checkbox">`, already themed by `framework.css`'s
`accent-color` — zero new CSS, reads as a checkbox rather than a pill. A `.ui-toggle`
CSS-only component (same shape as `.ui-badge`) would close this for every future mockup that
wants one — logged in
[`screens/doc/decisions.md`](/framework/styles/layouts/screens/doc/decisions.md), not built
(`ui/` is fenced off this task).

**Copy rewritten as instructed.** The three new screens' checklist rows, stat numbers and
settings counts are true sentences about this framework (build steps, core classes, tokens,
layout/UI component counts) — the stat numbers are copied verbatim from
[ui/stats/page.js](/framework/ui/stats/) rather than re-typed, so the two pages can't drift.

Verified: 3 screens × 5 widths (400/1280/1440/1920/3440),
`document.documentElement.scrollWidth === clientWidth` at all 15, the scrolling band's
`scrollHeight / clientHeight` exactly 1.00 at all 15, zero console errors.

---

# Minion F, wave 3 (node `54-1055`) — a finding, not a question

**Minion F, 2026-08-18.** `survey.md` called this node "Layout (×5), wrapper sections."
`get_metadata` shows **six** top-level frames (`54:980`, `54:994`, `54:1040`, `61:1251`,
`61:1271`, `65:1306`), and every one of them is literally named `Layout` — no `-3440` /
`-1920` / `-400` suffix, no distinguishing label, nothing the survey could have transcribed
differently. Screenshot confirmed the same reading. The owner's own words on this node:
*"this could be worked up as one set"* — so one page, not six directories, and the six turn
out to need nothing new.

**All six are the same two primitives `wire/` and `anatomy/` already built and measured
tonight, for two sibling Figma frames.** `54:980` (header + three equal cards) is
`flex three` — [Wire → Three Full Columns](/framework/styles/layouts/wire/columns/). The
other five are a rail, a centre twice its width, a second rail — `flex auto` + `--grow: 2` —
[Anatomy → Columns](/framework/styles/layouts/anatomy/columns/), differing only in whether a
full-width band wraps the row (`flex v` nesting, already
[Anatomy → Burger with Columns](/framework/styles/layouts/anatomy/burger-columns/)) and what
sits in the centre track (three stacked cards, or — `54:994` — two side by side, the same
"nesting has no floor" finding Minion B logged for `181-1457`). Shipped as one page,
[`/framework/styles/layouts/set/`](/framework/styles/layouts/set/): two live `demo.stage()`
renders (not just prose) plus a table mapping all six frames to what already exists. Zero
new CSS, zero new directory, one word in `layouts/page.js`'s `BANDS.Reference`.

**Not a question, an observation:** `layouts/readme.md`'s "Reference" line in the `## Use`
section still lists only `model fit flex grid 400 space` — it was never updated for `wire`,
`anatomy`, `set`, or (this evening) `screens` either. Not touched here (a shared file no
wave-3 minion was told to own beyond the one `BANDS` word); worth a pass once the wave lands.

Verified: 400/1280/1440/1920/3440, `document.documentElement.scrollWidth === clientWidth` at
all five, `.active-page`'s `scrollHeight === clientHeight` at all five (a plain reading page,
no `fill`/`flex-1` region to collapse), zero console errors. `--grow: 2` probed live:
`flexGrow: 2`, `flexBasis: 384px` (12em × 2 — the corrected scaled-basis formula). `.tint`
probed live: a real paint, not a silent no-op. All six linked urls (`wire/columns`,
`anatomy/columns`, `anatomy/columns-burger`, `anatomy/burger-columns`, `docs`, `shell`)
return zero 404s and mount their real titles. Screenshots:
`figma/shots/set-1920.png`, `set-400.png`, `set-columns-1920.png`, `set-table-1920.png`.

---

# Minion H, wave 4 (node `71-2459`) — dark mode was the test, not a question

**Minion H, 2026-08-18.** `get_metadata` confirms the survey's guess for once: the real frame is
`bold-editorial-wrapper` (71:2459, 2040×3364), four `row-heading-*` strips over `editorial-*`
bands — `editorial-hero`, `editorial-services`, `editorial-stats`, `editorial-footer` — every
name matching the brief. No shift this time.

**Built, not just tested.** No existing layout matched (a bordered-band document with a numbered
services grid, a stat banner and a newsletter footer, all under one measured column) — new dir:
[`/framework/styles/layouts/bold-editorial/`](/framework/styles/layouts/bold-editorial/full/).
Zero hex values in the file: every "dark" pixel is `.tint`/`.wash`/`--prim-ink`, the same
elevation ladder `sections/` and `home/` already use, so the page needs no media query to answer
in both colour schemes.

**Repeated the `fill` mistake question #15 already named, before I'd read this file closely
enough.** First draft used `page full fill flex v` on a four-band document — the exact shape
that folded the homepage into a 284px box. Caught it before shipping by adding the `/full/`
route (`full.js`, same three lines `home/page.js` uses) and measuring for real: fixed to `page
full flex v`, no `flex-1`, no `overflow-y`. **This makes three separate minions independently
reaching for the same three-line `/full/` route helper tonight** (question #3's `entry.js`,
`home/page.js`, this one) — worth promoting.

## Confirmed, independently: question #10's finding is real, and now it's measured

Built two adversarial nestings live on this page (`getComputedStyle`, both colour schemes, no
repo file touched) and screenshotted them:

| | light scheme | dark scheme |
|---|---|---|
| `sections/tone.js`'s `dark`-tone band (`background: var(--ink)`) | `rgb(63,63,63)` — correctly dark | `rgb(230,230,230)` — **inverts to LIGHT**, by design |
| a `.wash` inset inside that band | `rgb(242,242,242)` — a light hole in the dark band | `rgb(23,23,23)` — a dark hole in the now-light band |
| the same inset, `color-mix(in srgb, currentColor 10%, transparent)` (the shipped fix) | a soft grey a shade OFF the band, not a hole | a soft grey a shade OFF the band, not a hole |

`.wash` reads the page's colour-scheme, never the element it's actually sitting on — confirmed
with real numbers instead of the earlier "paints nothing" description, because lew42's tokens
are opaque now (not the translucent rgba framework.css still ships bare): the inset is not
*invisible*, it is *backwards* — a highlight where a recess belongs. The `currentColor`
workaround (already shipped by the homepage minion) is the right fix and reproduces correctly
in both modes. Screenshots: `figma/shots/theme-probe-light.png`, `theme-probe-dark.png`.

## New: a `dark`-tone band inverts a SECOND time when the site is already dark

Not previously tested — every existing caller of `sections/tone.js`'s `dark` tone (the
homepage's footer, its highlight card) was measured against a light page. Ask what happens when
the SITE's own mode is also dark: `--ink`/`--surface` swap again, so a `dark`-tone band —
built to always contrast with its page — now paints **light** on an already-dark page. The
screenshot above shows it: a cream card floating in the middle of a black page, with a dark
square punched into it. Readable (nothing is invisible), but it is the opposite of what
"bold editorial dark mode" wants, which is to STAY dark regardless of the visitor's own
preference.

This page avoids the whole class of bug by never using the inverting `dark` tone — every band
here is `.tint` (page-following, not page-opposing), which is why it holds up in both screenshots
in this task's own shots directory. **Assumed: page-following tokens are the right choice for a
whole-page dark-mode design; the inverting `dark` tone is for a single accent band on an
otherwise-light page** (a CTA, a footer), which is the only shape it has been used in tonight. If
the owner wants a band that stays visually dark NO MATTER which mode the visitor is in — not
"opposite of the page," but "always this one specific look" — that is a genuinely new primitive
(an un-inverting surface), and neither `dark` tone nor `.wash`/`.tint` is it. Not proposed as a
`framework.css` change; flagging the gap.

Verified: 400/1280/1440/1920/3440, `document.documentElement.scrollWidth === clientWidth` at all
ten (five widths × two colour schemes), zero console errors, `.layout-full`'s own
`scrollHeight / clientHeight` between 1.72 and 3.12 at every width (a real multi-screen document,
scrolling as itself — not a collapsed pane: `rootClientH` stayed a real viewport height, never
the homepage bug's 284px). Screenshots:
`figma/shots/bold-editorial-{light,dark}-{400,1920}.png`, `bold-editorial-dark-footer.png`.

---

## `109-369` — apidoc (minion G, wave 4)

**The node is FIVE frames, not four, and two of them share one name.** `app-class-overview`
(1440x1316), `app-class-api-reference` (1440x1624), `app-class-source-code` (1440x1200), and
`app-class-tabbed` **twice** — `119:543` and `121:434`, both 1920x1336. The difference between the
two is the whole point: `119:543` runs its content full width (1520 in a 1640 column), `121:434`
caps it to 1200 and centres it. Both mark `page-header` `hidden="true"`, so the design never shows
the breadcrumb and the capped column together.

It is **this framework's own documentation site** — branded LEW 42, rail reading *Framework:
Overview / API Reference / Source Code* and *Core Classes: App / View / Component / Router / Store*.
`ext/Doc` already renders exactly that shape live, so every rail row in the build links into the
real one.

**Questions**

1. **Three orange CTAs.** The Figma's Key-Concept cards each carry a dark filled button. The
   closest thing that exists is `.btn.prim`, which is `--prim` orange — three of them in a row is
   louder than the comp. Assumed `.btn.prim` (standing rule 1: pick what exists). Should a dark
   filled button exist, or should these be plain bordered buttons?
2. **Traffic lights.** The source frame's window chrome is red / amber / green. The token set has
   one accent and no traffic-light palette, so all three dots are `--subtle`. Confirm?
3. **`--measure: 64em`.** The Figma's content column is 1013px at 1440 and 1200px at 1920 — two
   different answers. Took the first (63em → 64em) for both widths. Confirm, or should the cap
   grow with the viewport?
4. **`ui.table()` cannot fill its column.** `framework.css` gives every `table`
   `display: block; width: max-content; max-width: 100%` (so a wide one scrolls itself — measured
   at 390px, and it works). The side effect: `.ui-table { width: 100% }` widens the *block* box
   while the anonymous table inside it still shrink-wraps, so a small table sits at ~80% of its
   column where the Figma spans it. Left as-is — `ui/table/` is not this task's file. Is the
   shrink-wrap wanted, or should `.ui-table` push the inner box too?

**Dilemmas**

- **The chips are checkboxes, and this design wants one radio.** `demo.layout`'s `parts:` is a set
  of independent toggles. The Figma's tabbed frames show *one* body under the strip; the
  reassembled page shows all three, with each tab lit for the body that is on. That is the
  reassembly the owner asked for and it is honest — but it is not literally what frame 4 draws.
  A "choice" part does not exist. Worth adding one?
- **The whole node is one page split three ways and then put back.** Rather than three sibling
  layouts, it is built as one layout whose `parts:` chips reproduce each frame exactly
  (`tabs` off + one body = frames 1–3, `header` off = frame 4, `+ measure` = frame 5). Verified:
  all five render clean. If the owner wanted five separate specimens, this is the wrong call and
  is cheap to split.
- **`doc/decisions.md` got no entry.** The verdicts above belong in
  `styles/layouts/doc/decisions.md`, which was outside this minion's fence with eight agents live.
  Someone should fold them in.

---

## Minion I — `80:2916` `layout-documentation-system` (→ `styles/layouts/spec/`)

Frame name **verified correct** in `survey.md` for this node. 2128 × 8659, four wrappers, fourteen
spec rows. Built as **one page, no sub-minions** — see the report line below.

**Questions**

- **Two of the Figma's own spec values are self-contradicting.** The tablet tier (800px cards)
  declares `stacking-breakpoint: < 960px`, so every card it annotates is already below its own
  breakpoint. The accordion declares `collapsed → height: auto`, which is the *open* state, while
  its own guideline column beside it says "hides long answers using overflow hidden bounds".
  Both are reproduced verbatim in the audit tables with the contradiction named. **Does whoever
  owns that Figma want to hear about these?** Assumed yes, but nothing was changed in Figma.
- **The Figma's spacing scale is 16 / 20 / 24 / 40px across its four tiers, and it disagrees with
  itself:** the same column gap is `grid-gap: 20px` in the pricing row and "standard 24px column
  gap" in the card-grid row. Standing rule 2 says converge on one, two or three. **Proceeded on
  the existing tokens unchanged** (`--pad` 1em, `--gap` 1em, `--column` 14em, `--measure` 40em) and
  logged every divergence in the tables rather than adding a value. Confirm that is the call.
- **`Container: max-width 1200px`** has no equivalent here — `.page` declares `--measure: 40em`
  for prose and hands a wall `wide`. **Assumed: no 1200px is wanted.** If a "site container" width
  is actually desired, it is one token and this is where it would be argued for.
- **The stage's width buttons are 390 / 810 / 1440 / 3440; the Figma's tiers are 400 / 800 / 1440
  / 1920.** Close enough that the page tells the reader to use them, but nothing here documents
  1920 specifically and 3440 is past every tier the design considered. Leave as is?

**Dilemmas**

- **The hamburger.** The Figma's mobile nav is a full-screen overlay opened from a burger.
  `sections/navbar.js` **wraps** instead — links fall under the mark and stay in the page. Ours
  needs no open state, no focus trap, no scroll lock; theirs keeps the viewport clear.
  **Shipped the wrap**, with `core/Sidebar` (which collapses to a burger bar itself) named as the
  overlay answer. Worth the owner's call — it is the one place we did not draw what was drawn.
- **Live bands, or grey wireframes?** The Figma's cards are wireframes. Eleven of the fourteen
  already existed as real `styles/sections/` bands, so this page **runs the real thing** — which
  proves the reuse claim but makes a spec sheet a heavy page (12 live bands, 10 tables, ~14000px).
  The alternative was fourteen grey rectangles that prove nothing. Reversible either way.
- **No sub-minions, against the owner's suggestion.** The node is tall, not complex: ~10 shapes
  drawn 4× each. Three functions were new (12, 10 and 14 lines). Four sub-agents would each have
  needed ~15k of priming to write ~80 lines, and would have produced four voices in one document.
  **If the owner wanted the fan-out itself demonstrated, this is the wrong call** — say so and it
  can be re-run that way.
- **`doc/decisions.md` got no entry**, same fence as minion E: the audit verdicts above belong in
  `styles/layouts/doc/decisions.md`, which was outside this minion's fence. Someone should fold
  them in.
