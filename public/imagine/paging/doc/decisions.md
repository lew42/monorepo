# Decisions — the record

Rebuilt 2026-09-05 (`/framework/ai/2026-09-05/paging-v3/`), then fixed the same day after
two more critics read it (`.../paging-fix-2/`). The record below is from 2026-09-04 and
earlier, kept because most of its traps are still live. Every verdict here is revisable;
the ⚠ ones were found by measuring rather than by thinking.

---

# 2026-09-05, later — the fix pass

Two critics went back over the rebuild: a newcomer at 1280 and 3440
(`/framework/ai/2026-09-05/paging-audit-2/`) and a designer reading the code
(`.../paging-audit-2b/`). They found four things broken, and this is what was done.

## A control may not cover the thing it controls

The bar was `position: absolute` over the stage's top edge, revealed on hover. On the
realm's own front page it was drawn exactly on the demo's tab strip — so moving a mouse
toward a tab made the bar appear on the tab, and the headline gesture of the realm could
not be clicked at any width. A Playwright click on **Pricing** timed out at 1280 and at
3440, twice, before and after.

**The bar is now a sibling above the stage and it reserves its height.** It also stopped
being five native `<select>`s (80–111px wide, clipping their own values) and became the
drawer's labelled chip groups, which was the better control language all along.

## The box reserves its height, so the caption is a measurement

The realm's first demo said **THE BOX DID NOT MOVE** directly above a line reading *the
box is 335px shorter*. Both were drawn by the same click.

`nav-stability`'s [reserved height](/imagine/paging/navigation/reserved/) rule was lifted
into `paging.css`: every panel is drawn, all of them in one grid cell, and the ones you
are not reading are `visibility: hidden` — hidden, but still measured. The caption now
reads *The box did not move: still 2847 × 609px* at 3440 and *927 × 476px* at 1280.

⚠ **Only for the STABLE navigation words** (`tabs`, `rail`, `rail-right`). `columns` and
`takeover` exist to move things, so their child opens beside the box or over the whole
stage and the caption reports the pixels it really moved (decision 5, above).

## A full-screen stage takes the screen, never the rail

`.paging-room-full` was `position: fixed; inset: 0`, so at 1280 the takeover preset
painted straight over the rail and — once you opened a child — had no exit of any kind.
Browser Back was the only way out.

**The FRAME goes fixed now**, starting at `--paging-rail-w`, with the bar at the top of it
and the stage under the bar; the rail carries `z-index: 36` over the stage's 35. And
`taken()` draws the exit chip as well as the crumb, so a takeover always has two doors.

⚠ **Found while fixing it:** `columns` and `takeover` drew no child list at all — both
presets rendered a box with nothing to click, so neither gesture could be reached. The
children are listed inside the box for both words now.

## The configuration lives in the url

Seven words spanning about 100,800 pages, of which the realm could SEND 43. Every change
now writes itself into the address with one `history.replaceState` (`url.js`), and the
drawer has **Copy this link** beside **Make this a page**.

⚠ **The guard is the PAGE'S OWN url.** Two other guards were tried and measured wrong:
*first stage to ask* fails because the app's home page is built on every cold load even
when a deep child is what you opened (it is hidden by CSS, not skipped), so the hub's
invisible stage ate the query; *`location.pathname`* fails because core loads the next
page and pushes its address afterwards, so mid-navigation it is still the page you left
and every page you clicked to inherited the previous one's words.

## One vocabulary, one schema

`navigation` had **five** live definitions and `surface` five more. `blocks.js` is the one
list now; `build/words.js` imports it and adds only the two keys a `page.json` stores
(`kids`/`mech`), which is a translation, not a second vocabulary.

Make wrote `style`/`content`/`mech`/`kids` while the drawer on the same page wrote the
seven words — and the reader preferred the seven, so clicking a chip in Make changed a key
nothing was reading. `config_of()` (`make/tabs.js`) is the one reader and migrates old
nodes on the way in; `edit_at()` migrates a node before it changes it.

⚠ **`navigation` and `arrangement` may not both say "Left rail".** A navigation rail lists
*this page's children*; an arrangement panel is anything else beside the content. The
arrangement pair is **Panel left / Panel right**.

## Small, and measured

- The hub's wall is twelve **live miniatures**, seven across at 3440. The first screen was
  58% bare grey; it is 32%, and the row beside the stage went from 1785px to 90px.
- The rail lost its seven section notes and fits a 1440 fold at 3440 (it was 2205px tall).
- **37 class names** left `paging.css` — every one with no JavaScript writing it — along
  with `axes:` on sixteen pages and `width:` on sixteen, which had no consumers at all.
- Skin has three words and now three urls: `/skin/surface/`, `/skin/background/`,
  `/skin/type/`. `background` and `type` had a control and no link.
- Two pages called Stage became one: the navigation demo is
  [Reserved height](/imagine/paging/navigation/reserved/).

---

# 2026-09-05 — the rebuild

Two critics walked the realm first: an overwhelmed newcomer at 3440
(`/framework/ai/2026-09-05/paging-audit-1/`) and a systems designer reading the code
(`.../paging-audit-1b/`). Their two verdicts are the input to everything below.

## The handful — six building blocks, and nothing else

The owner: *"i want the paging system to have a small handful of concrete building blocks
… and i want to be able to see examples of them, and explore alternatives, either by
generating, or configuring, or whatever."*

**One box, and five words over it.**

| block | one line | its page |
| --- | --- | --- |
| **Stage** | the box a click changes the inside of; it never moves | `/stage/` |
| **Navigation** | what a click on a child does, and how children are drawn | `/navigation/` |
| **Content** | what is in the box | `/content/` |
| **Room** | how much of the screen the box gets | `/room/` |
| **Arrangement** | where the page's other parts sit around the box | `/arrangement/` |
| **Skin** | the colours and the type size | `/skin/` |

This is the designer critic's list, adopted whole, with two changes said out loud:

- **Skin has three knobs, not one** — content surface, page background, type size. The
  owner asked for exactly that (*"card gives the content a bg, whereas the other colors
  change the whole column. i think we want the ability to switch either one to any
  color"*), so pretending skin is one control would have been tidier and wrong.
- **The stage is not a word you set.** It is the box the other five act on, so its page
  has no control of its own — it is the box, holding still, while you click inside it.

`blocks.js` is the one place these live and it imports nothing, so a page, a rail tile, a
toolbar chip, a dropdown, a url and a doc all read the same lists.

## The realm is an app, not a directory of pages

**Decided:** `/imagine/paging/` mounts in `app.$pages` as its own screen (the same line
`/imagine/shells/Shell.js` uses), draws a persistent left rail, and hands its middle to
`this.$pages`. Core's `container()` walks up for the nearest `$pages`, so **every page in
the realm mounts in that middle with no page knowing anything about it.**

`Paging.column_host()` returns `undefined` — the one line that takes the realm out of
/imagine/'s columns row.

**Why:** the owner's report was *"a lot of links launch 2 columns at once … quite
jarring"*, and the newcomer critic hit it on his second click ("The real swap" opened
Mechanisms **and** Swap). In one region the arrangement contract shows the deepest page and
hides its ancestors, so **a link three levels down still changes exactly one thing**.
Measured in the ui-test: three presets picked in a row, `visible: 1` every time, the rail's
rect `x: 0, width: 240` unchanged throughout.

**What it cost:** `launch` and `takeover` can no longer be shown as real core columns
inside the realm, because the realm is not a columns row any more. They are demonstrated
inside the stage instead, and each page links to the real thing (`/imagine/` is the biggest
columns row on the site). That is decision 5 of 2026-09-05 — *the paging realm runs on
stable navigation; dynamic mechanisms are demonstrated inside a stable frame.*

**Dead space at 3440, measured before and after** (headless, 3440×1440, the rightmost
right-edge of anything that draws text or a picture on the first screen):

| | before | after |
| --- | --- | --- |
| the hub | 1551px used — **54.9% dead** | 3350px used — **2.6% dead** |

The newcomer critic independently measured 54% on the same page, by a different method.

## One renderer, and every page is a configuration of it

`stage.js` is the only thing in the realm that draws a page. A preset is a configuration; a
block page is a configuration with one word highlighted; the hover toolbar edits one; the
drawer prints one as JSON; "make this a page" writes one to disk. There is no second
renderer and no second vocabulary.

**Merged away** (all three were written out two or three times before):

- navigation — `words.js` MECHANISMS, `make/tabs.js` KIDS and `build/words.js` NAVS were
  one control in three vocabularies. `blocks.js` `NAVIGATION` is the one that survived.
- surfaces — three copies (`words.js`, `build/words.js`, `imagine/layouts/system.js`) plus
  a fourth translation in `families.js`. One list now, read by **both** colour controls.
- arrangement — five vocabularies. `/imagine/layouts/` owns the numbered layouts and each
  arrangement value names the number it compiles to rather than restating it.

**Deleted:** `explorer/` (55 lines of prose about a thing that did not exist), `center/`
(an alignment, not a width), `transitions/` (crossed two blocks; the four swap visuals live
on the swap page), `examples/`, `rightnav/` (a right rail is one value of the navigation
word), `samples.js` and the `xs`–`xl` content axis (one canned sample at five heights,
which the owner read as a content switcher because that is what it was), and the thirteen
one-value directories under `styles/` `sizes/` `toolbars/` — one `route()` gives all of
them urls, which is what the designer critic proposed.

**Kept, and why:** `templates/` (eleven real running pages — the only page the newcomer
critic understood by looking), `make/` and `build/` (the two editors, and the only things
that save), `demos.js`'s four miniatures (a gesture you can click before reading anything),
`mechanisms/swap/swap.js`'s four swap visuals. `critique/` and `inventory/` are site
surveys rather than paging blocks and the designer critic voted to delete them — they are
**delisted instead**: twelve links to them exist in other realms and in the task logs, and
a 404 is a worse defect than an unlisted page. They are linked from Docs and nowhere else.

**Six old urls answer instead of 404ing.** `route()` on the hub turns `styles`, `sizes`,
`center`, `transitions`, `explorer`, `examples` and `rightnav` into a one-line page saying
where each went. Delete a row when nothing points at it any more.

## Demos never persist

`Paging` no longer writes its mode to storage at all, and `lede()` no longer draws the
modified mark. A refresh puts every demo back to the page it is. Only Make and Build save,
and `baseline.js`'s mark shrank from a bordered, filled, 3px-edged strip with two sentences
to **a dot and four words on one line** — the owner's report was *"the modified and reset ux
is too bulky, it's a massive alert box."* Proven in the ui-test: colours changed on a
preset, page reloaded, `paging-surface-card` and no nest — back to what it ships as.

## No telling before showing

Deleted: the hub's *"Every page on this site is three things: an icon, some content, and a
list of children"*; the swap page's *"Nothing on this page navigates"* and its three
children **Same box**, **Same width**, **One way back**; every matter-of-fact blockquote in
the realm. The owner: *"Yes, if you show me some examples, I'll just see and know that. If
I'm capable of understanding that statement, I don't need you to tell me."*

Where a page needs words it is **one sentence saying what to do** — "Click Pricing on the
page below, then Docs. Watch the white box." A caption under the stage says what just
changed and what it did to the box, in pixels: *"Prim — the box did not move: still 760 ×
355px."* Never a conclusion.

## ⚠ Four traps found by measuring, in one afternoon

1. **A View's class name IS a CSS class.** `View.classify()` walks the constructor chain
   and adds each name lowercased, so a class called `Stage` wore the framework's own
   `.stage` layout word — `container-type: inline-size; overflow: hidden` — and
   **shrink-wrapped itself to 307px inside a 1546px frame** with nothing thrown. A View's
   class name goes through the same `new-css-class` check as a hand-written selector:
   `PagingStage` → `.paging-stage`, `PagingToolbar` → `.paging-toolbar`.
2. **Set a View's fields before `super.initialize()`.** `View.initialize()` IS the render
   (`append(this.render)`), so a field assigned after it is assigned to a view that has
   already drawn — `render()` threw on an undefined `pages` list.
3. **A field shadows a method, for the third time in this realm.** A hub method named
   `card()` is read by core's `Page.nav()` as the card CLASS, handed to `.ac()` as a
   function, and every preview on the site's own wall throws. (`opens`, `chosen` and
   `nested` were the earlier three.)
4. **`container-type: inline-size` + `align-self: start` = 0px.** A container-query element
   may not be sized by its own contents in the inline axis, so `blog.css`'s `.blog-hero`
   collapsed to 0px inside the stage's flex column while holding a whole hero, silently.
   `.paging-canvas > * { align-self: stretch }`.

Plus one layout finding: `auto-fill` leaves empty tracks a four-card wall never fills —
1816px of them at 3440. `auto-fit` with a 24em ceiling collapses them and keeps a card a
card (the layout skill's "every track needs a floor and a ceiling").

## What is still open

- **`room/` still reads 29% dead at 3440**, and that is on purpose: its stage opens on the
  `reading` word because that word is what the page is about. Changing the dropdown to
  `wide` fills the row.
- **Two dead links in `navigation/findings.js`** point at `/imagine/paging/styles/` and
  `/imagine/paging/sizes/`. That file belongs to the `nav-stability` task, so this one did
  not edit it; the `route()` redirect above means both now land on a page that says where
  they went rather than 404ing, and the rows should be repointed at `/skin/` and `/room/`
  when that task next touches the file.
- **`paging.css` still carries the older machinery's rules** (~250 lines) for the three
  places that still use them: the editors' chips, the hub's four miniatures and the swap
  page's four visuals. Nothing applies the dead half; the tidy is a later pass.

---

# The record before 2026-09-05

Built 2026-09-04 (`/framework/ai/2026-09-04/paging-core/`). Most of the traps below are
still live; the pages some of them name were merged or deleted in the rebuild above.

## ⚠ The layout axis derives its default from the page's own `width`

`dress()` restamps the column class from the layout axis. A page that declared
`width: "full"` and got the axis default `column` therefore had its declaration silently
undone — `mechanisms/takeover/` rendered as a **241px column at 1280 instead of the whole
row**, with nothing thrown and no console error. The fix is one line, and it is derivation
rather than a second rule to keep in step:

```js
layout: { full: "full", large: "wide", fill: "wide" }[this.declared()] ?? "column",
```

The general shape: **two ways to say one thing must be one expression, not two defaults.**

## ⚠ A chip is a span, not a `<button>`

`.theme-lew42 :is(button, .btn)` is (0,2,0), in the same layer as any component sheet and
loaded later — so a `<button class="paging-chip">` came out as a 0.8em uppercase CTA with
1.4em of padding whatever `.paging-chip` said. Confirmed by reading `textTransform` back from
computed style, not by inference.

The answer is the one the styles docs already reached for a tree toggle glyph (2026-08-19):
**a clickable span, not a heavier selector.** `press()` in `paging.js` restates the keyboard
half — `role="button"`, `tabindex="0"`, and Enter/Space — which is the only thing the element
was giving us for free.

## One seam, not one method per axis

The brief sketched `this.style("card")`-shaped calls in the code tab. Shipped instead:
`pick(axis, value)` — one method, four axes. A chip click and a line of code call the *same*
seam, which is what lets the code child append `page.pick("style", "card")` **live** as you
click in the column beside it. Four alias methods would have been four more names on a class
that already has a word for it, and the code tab would have shown a call the toolbar does not
actually make.

## The trees are five directories, not twenty pages

Content × layout is 5 × 4. Twenty near-identical modules is a wall nobody reads, so the
toolbar is the twenty and the directories exist for the variants worth a url:
`mechanisms/<word>/`, `styles/<word>/`, `sizes/<layout>/`. The owner's own instruction —
*"using a toolbar to switch its mode is the best way to explore slight variants, but create
trees of example pages"* — is that split exactly.

A demo child inside a tree is `leaf()`: a `Paging` declared in its parent's module rather
than a directory, so a three-item tree costs one module and no server probe, and `takeover`
can still hand one of them the whole row.

## `index: true` by default

`Paging.column()` sets `this.index ??= true`. The page's own `items()` has already drawn its
children carrying their mechanism icons; core's rail below would say all of it a second time
(`layout` Q4: a page shows each thing once). A page that draws none of them says
`index: false` and gets the rail back.

## Rejected

- **A `takeover` mode / shell / fixed positioning.** It is one width word. Anything more
  would break the crumb strip, the `×` and every url, which is the trade `/imagine/screens/`
  already measured and refused.
- **Urls for `expand` and `swap`.** See [`mechanisms.md`](/imagine/paging/doc/mechanisms.md) — a state of one
  page is not a place. If it deserves a link it deserves a column.
- **A second list on the hub.** The walk *is* `items()`, overridden — so it lives inside the
  stage and the style chips repaint it with everything else. A separate `walk()` beside the
  stage would have been a third thing to keep in step.
- **A `.paging-*` rule that out-specifies core.** `:where(.page-column-body)` paints the
  ambient floor at specificity zero precisely so a recipe wins with one class. Nothing here
  needs more, and the arrangement contract in `@layer util` may not be fought at all.

## Open — the owner decides

- **Should a mode be shareable?** It is `localStorage` per url today, which is honest (nothing
  in the address can be stale or wrong on another machine) but means a look you like is not a
  link you can send. A query string would fix it and would be the first thing on this site to
  put state in a url.
- **Should `content` and `layout` chips appear on every page?** Today each page names its own
  `axes:`, so a 241px column is not asked to carry eighteen chips. The alternative is one
  universal toolbar that scrolls.
- **`transitions/` is a picker, not a matrix.** 5 × 5 × 4 = 100 cells was refused as a wall
  nobody clicks. If the owner wants to *see* the matrix rather than run it, that is a
  different page.

## What this task left

- **The mode toolbar's placement** is fixed (top, inside the stage). Top/left/right/bottom ×
  inside/outside is `paging-toolbars/`, wave 2. *(landed — see below.)*
- **Dark mode of the whole site** is untested against these five styles — `.paging-dark` is an
  always-dark island, so in a dark site it is the one style that does not change. Worth a look.

---

## Wave 2 (`paging-toolbars`, 2026-09-04) — the fifth axis: where the toolbar sits

`toolbar` joins `style`/`content`/`layout`/`mech` as a fifth value in `VALUES`, eight words
(`top-inside` … `bottom-outside`), same `pick("toolbar", value)` seam. Default is
`top-outside` — the exact shape every existing page already had (a sibling of `.paging-box`,
drawn first) — so a page silent on `toolbar` in its `axes:` is byte-for-byte unchanged; proved
by re-running the hub + all four factor pages (mechanisms/styles/sizes/center) at
400/1280/1920/3440, zero console errors, same as `paging-core` measured.

**`inside` nests, `outside` doesn't — one DOM decision, not eight.** `build()` puts the
`Toolbar` either as `.paging-box`'s own first flex child (`inside`) or as `.paging-box`'s
sibling on the stage (`outside`); `dress()` restamps `paging-side-*`/`paging-place-*` on
`.paging-stage`, and CSS does the rest with two properties, `flex-direction` and `order`, on
whichever element is the arranger (the stage for `outside`, the box for `inside`). Nothing
writes a `top` rule at all — it's the order everything already had.

⚠ **`inside` only shares a visible frame on `card`.** The other four styles paint their
background on the OUTER column body, not on `.paging-box`, so `inside` vs `outside` on
`plain`/`tint`/`prim`/`dark` differs only in flow order, not in a frame the reader can see —
still a real, measurable difference (`.paging-box`'s rect either contains the toolbar's or it
doesn't), just a quiet one. Confirmed by reading both rects back with Playwright, not by
looking: all four `-inside` values reported `contained: true` against `.paging-box`, all four
`-outside` values `false`, at 1280 and 3440 (`/framework/ai/2026-09-04/paging-toolbars/shots/`).

**Left/right toolbars restack rather than wrap.** `.paging-side-left/right .paging-toolbar`
switches the toolbar itself to `flex-direction: column` — each axis GROUP still wraps its own
chips, but the groups stack instead of the whole row wrapping into a wide ribbon. Without it a
left/right placement would have been a toolbar as wide as its longest group, defeating the
point of putting it on the side.

**At 400, nothing overflows — but left/right are the tightest.** Measured on `toolbars/`,
`card` style, all eight: `top`/`bottom` keep the full 376px card and only add height
(82–110px); `left`/`right` claim ~151px (38% of the 400px viewport) for the chip stack,
leaving a 213px card (`outside`) or a 191px content column (`inside`). `overflowX: 0px` for
all eight — nothing breaks — but the four side placements are visibly the most cramped.
**Left as an open call**: no CSS fallback to `top` under a width breakpoint shipped this wave
— the brief asked for the axis itself and the measurement, not a forced degrade, and adding
one is a five-minute follow-up (`@container (width < Xpx)` on `.paging-stage`) once the owner
picks a threshold.

## The exit chip — `full` pages grow a way out, one `<a>`, no new axis

`Paging.Toolbar.render()` adds a `close_fullscreen` chip whenever `this.page.at("layout") ===
"full"` — true for a page **declared** `width: "full"`, one **forced** full by a
takeover-mode parent (`column()`'s existing rule), or one whose **layout chip** was picked to
`full`, because all three already flow through the same `layout` axis default. It is a real
`<a href="…parent.url…">`, the same shape as core's own column-close
(`Page.class.js`, `.href(this.parent.url)`) — a link, not a click handler, so middle-click and
"open in new tab" work for free.

⚠ **A `full` page now gets a `Toolbar` even with zero mode chips** — `build()`'s gate is
`this.chips().length || this.at("layout") === "full"`. Every full page in this program
declares at least one chip today, so this only ever ADDS behaviour; it is there so a future
`width: "full"` page with no `axes:` still gets the one exit that matters.

**Proved** (`ui-test`, hub → `mechanisms/takeover/` → click the chip, 1280 and 3440): the
hub's own walk collapses 2 visible columns to 1 on takeover; the exit chip appears
(`href="/imagine/paging/mechanisms/"`); clicking it lands on `mechanisms/` with 3 columns
visible again — the rail, the hub, and Mechanisms — identically at both widths, zero console
errors. **One exit pops one level**, not to the shallowest full ancestor — a leaf opened
*under* a takeover-mode parent still has its own, closer, `.paging-exit` (its `at("layout")`
is `full` too, forced by `column()`), and clicking it lands on ITS parent, which may still be
`full` itself (e.g. a leaf under `mechanisms/takeover/` pops back to `mechanisms/takeover/`,
not all the way to `mechanisms/`) — a second click finishes the job. Matches the brief's
literal spec (navigate to `this.page.parent.url`, nothing cleverer); a "pop to the shallowest
non-full ancestor" would be a different, larger seam and is not what was asked.

## `toolbars/` — the tree, and why the hub carries all eight

`toolbars/page.js` mirrors `styles/page.js`: one hub with `axes: "toolbar style"` so a reader
switches all eight placements × five surfaces from one page with no navigation (the owner's
"top toolbars, left toolbars, right toolbars, bottom toolbars, both in the card, and outside
the card", answered on one screen). `toolbars/{top,left,right,bottom}/` are the four stops
worth a url — each lands `<side>-inside` on `card` (the more legible of the two states to
land on cold) and stays fully switchable via the same two chip groups, same as
`styles/card/page.js` lands on `card` but keeps `mech` live.

---

# The clarity rebuild (`paging-clarity`, 2026-09-04)

The owner's report, verbatim: *"the imagine/paging/ system is a little confusing. simplify,
make it clearer how to use it… the size toggle buttons seem to switch content, rather than
affect size?… some of the Switch pages areas are sort of confusing… tabs are a good visual for
switching… i want to see example configurations, so as i click through the first few examples,
i SEE how it works."*

Six things changed. Each one below says what it was, what it is, and how it was checked.

## The hub teaches; it no longer demonstrates

**Was:** the hub carried the mode toolbar and a five-stop "walk" of bare links, and its first
sentence was *"Four mechanisms, five styles, two size axes."* A reader met five chip groups and
three counts before meeting a single word they could act on.

**Is:** no toolbar and no stage at all. It opens with the shape of a page in plain words, then
the four mechanisms **each shown by a live miniature you click right there** — `swap` as a tab
set (`ext/tabs`' own strip), `launch` as a pane appearing beside a list that keeps its track,
`expand` as a `ui/accordion`, `takeover` as three panes collapsing into a crumb strip. Then
three numbered steps saying where to go, then the reference sections.

**Why a miniature and not the real thing.** The real `launch` and `takeover` are core's columns
— they need the whole row to show, and a reader who has not met the row yet cannot see what
changed. A 200px frame teaches the *shape* of the gesture in one click; every miniature links
to the full-size page underneath it.

**Proved** (`ui-test`, 1280): the tab panel's top-left is **identical** before and after a tab
click (532/246 both times) while its text changes; the launch list goes 1 pane to 2 with its own
track unchanged; takeover goes 3 panes to 1 filled + 2 crumbs, and a crumb click restores 3; the
accordion opens one row at a time.

⚠ **The launch miniature's first pane is a fixed track (`paging-mini-keep`), not a share.** The
first version let both panes flex, so opening one **halved the list** — the exact opposite of the
sentence above it ("the page you clicked from stays exactly where it was"). Measured: 873px to
433px. A real column keeps its width and the ROW scrolls.

## ⚠ The content axis grows one sample; it no longer swaps five

This was the owner's stated bug, and it was real. **Both halves were measured live, in the same
browser session, on the same page** — the shipped `sample()` was reinstalled on
`Paging.prototype` and driven, then the new one restored and driven again (1920, `sizes/`):

| chip | BEFORE — height, and the first words in the box | AFTER |
|---|---|---|
| `s` | 231px · "One line, and a way out of it." | 270px · "What does a click do? Four answers, and every item…" |
| `m` | 255px · "A page is an icon, some content…" | 412px · "What does a click do? Four answers…" |
| `l` | 359px · "Sizes A page is an icon…" | 631px · "What does a click do? Four answers…" |
| `xl` | 471px · "01 A wall is what a column word is FOR…" | 928px · "What does a click do? Four answers…" |

**Does the `s` line survive into the higher rungs?** Before: `m` no, `l` no, `xl` no. After:
yes, yes, yes. The old axis replaced the text at every rung, so the chips genuinely *were* a
content switcher — the owner read the page correctly.

The rule now, in `samples.js`: **every rung keeps everything the rungs below it showed.** Going
up adds a row; it never replaces one. `words.js`'s `RUNGS` says what each one adds, and the
caption on the page reads the same list, so a chip and its explanation cannot drift.

## Every demo box says what just changed, in pixels

`pick()` measures the box before the repaint and again after — `getBoundingClientRect()` flushes
layout synchronously, so these are real numbers — and writes a caption under the box:
*"content: s → l. The box grew from 270px tall to 631px — 361px more, same width. Nothing was
taken away: l is s with four cards added."* One sentence per axis, so the number always has a
meaning beside it. The caption is refilled on its own rather than by a second repaint.

Layout chips read the same way: *"layout: column → full. The box went from 674 × 954px to
1858 × 804px."*

## The walk became Examples

`examples/` — five pages, each with **the result and the code that made it side by side**. Each
example changes exactly ONE word from the one above it, so "what does this word do" is
answerable by comparing two pictures. Nothing is behind a tab.

**The code is derived from the live page, never typed twice.** `config_text()` and `pick_text()`
read each example's own current mode off the page object, so the snippet cannot disagree with
the picture beside it — including after a reader opens an example and changes a chip.

The picture is `Paging.still()` — the page's own box, drawn without its column and without its
toolbar, reusing `shown()` and `items()`. So an Example shows the real page, not a mock of one.

⚠ **The 2:3 split is set inline, and has to be.** `.cols` and `.cols > *` live in
`@layer util`; `paging.css` is `@layer theme`, which loses to it **at any specificity** — a
`--cols-w` written in the sheet read back as 364/364 at 1920. An inline custom property outranks
every author layer. With the weights inline: 291/437, and **zero** horizontal overflow on all
ten snippets. (`.cols`' stacking floor is a width of the ROW, not of a track, so the pair sits
side by side from 1920 up and stacks at 1280 and 400 — correct at each, and nothing overridden.)

## Real things as content

The `l` and `xl` rungs are things the site already built: `l` is four cards in the `ui/` card
template **verbatim**, `xl` adds the blog's own posts in core's own `page-previews` card wall.
A table on the hub lists which built part shows up where, with a link to each.

⚠ **The blog's MANIFEST is imported, its `Post` class is not.** `Post.js` loads `blog.css` as an
import side effect, and that sheet sets `--column` on `.page-previews` — it would quietly
re-size every card wall on any page that imported it. `samples.js` draws the two classes itself.

## Dynamic pages: `make/`, and the CRUD decision

`make/` builds real pages at runtime — real urls, the real Router, core's columns — from one
string of text, stored in the browser. Create (a name + Add), read (click the title, it opens as
a column), update (click one of its three words and it cycles; or edit the whole tree as text),
delete (×, which takes the subtree with it). Nesting is `+` on a row.

**Proved** (`ui-test`, 1920): Add "Reading list" gave a sixth row at
`/imagine/paging/make/reading-list/`; a word click turned `Notes: card m launch` into
`Notes: tint m launch`; `+` nested a child under Notes; `×` on Notes removed it and its three
children (7 rows to 3). Every step read back out of `localStorage`.

### The decision: CRUD is a PART on the spec, not an `EditablePage extends Page`

The owner asked, in as many words: *"maybe we extend Page? EditablePage?"* The answer is no, and
the reason is that **the thing being edited is not a page.**

A page's identity here is its url, and its url is derived from where it sits in the tree
(`naming()` / `move()`). So "edit this page" is never a change to one object — it is a change to
the TREE, which is the text. The page generator reached the same conclusion first and states it
as a rule: *"a control edits the SPEC, never a live column"*, which is what makes a switched tree
a link, a reload land on it, and every regrow reproducible.

`EditablePage extends Page` would put persistence and an editor on **every** page in the tree to
serve an operation that belongs to the tree's owner, and would still have to write back to the
text to survive a reload — so the subclass would be a second place the truth lives. Weighed
honestly against the `code` skill's "parts are static subclasses": a part is right here because
there is exactly one editor and it edits one string. `Make` is that part, on the page that owns
the string; every page it grows is a plain `Paging`.

**What is reused, and what is ours.** The nesting parser and writer are the generator's own —
`spec.js`'s `parse()` and `serialize()`, imported, not copied. Only the LINE format differs,
because the words differ: it says `wall large cols=3`, we say `Title: card m launch`.
`read()`/`write()` in `make/page.js` are that one difference, six lines each.

### The store contract a CRUD minion builds on

```
lew42:paging:<page url>      one record per page — its mode, and (on make/) its `spec` text
```

- **create** — `add_under(spec, path, write({ title, style, content, mech }))`; `path` is `[]`
  for a top-level page, or a row's index path to nest under it.
- **update** — `edit_at(spec, path, { style: "card" })`; the change is merged into that one line.
- **delete** — `remove_at(spec, path)`; the node's whole subtree goes with it.
- every one of them ends in `save(text)`, which is `store().patch({ spec: text })` then
  `regrow()` then `redraw()`. **One seam**, so the list, the text box and the live tree can never
  show three different answers.
- **`patch`, never `set`** — the page's own mode record lives under the same key.

Indices, never names, for the generator's own reason: a page is named after its title, so a
rename would break a name path the moment it landed.

Everything else — the key shapes, the reset, what it cannot do — is
[`persistence.md`](/imagine/paging/doc/persistence.md).

## Every page opens with its takeaway sentence

`Paging.lede()` draws `takeaway:` as the first thing on the page, marked with a prim rule down
its left edge. Twenty-six pages got one; the four plain `Page`s in the realm (`rightnav`,
`explorer`, `inventory`, `critique`) say the same sentence as an `md().ac("paging-lede")`.

## ⚠ A field named `on` shadowed `View.on()`

`Paging.Item` was given `on: true|false` to mark the selected row. `View.on()` is the event
binder — so `press()` called `this.on("keydown", …)` and threw *"this.on is not a function"*
three frames away, on the PARENT page, with the item itself looking fine. The field is `chosen`
now. This is exactly the shadowing trap the `code` skill names (`text`, `toggle`, `show`,
`hide`, `html`, `click` are the others); `on` was not on that list and now is.

## Checked

148 page-widths — the hub and every page in the realm at 400 / 1280 / 1920 / 3440 — **zero**
console errors, **zero** horizontal document overflow, and no Material Icons name that rendered
as its own word. Every page carries a `.paging-lede`.

---

# The stage, and swap that is not tabs (`paging-mechanisms-v2`, 2026-09-05)

The owner's report, in his words: *"the paging swap method — it's basically just tabs, but we
should then just call it tabs? can you make other non-tab-like visual swapping? make sure the
stage they're swapping on is visually evident … the current underline tabs don't really
illustrate their tab content area, it's transparent … there's no visual boundary between
them."* And on the mechanisms: *"the launch demo only goes 1 level deep, and it's contained in
that demo area … clicking Launch changed the url to ./launch/, and expand does not … i don't
think we have to route expandos. i think we're ok to route takeovers."*

## ⚠ THE DESIGN RULE OF THIS REALM — the stage is always visible

> **A click changes what is inside a rectangle you could already see; the rectangle stays.**

Say it before the click, not after: a reader must be able to point at the box that is about to
change. That is the whole of why tabs feel easy and why the old swap demo did not — a
transparent area with no edges gives the eye nothing to hold, so every click becomes *"what
went where, and why?"* The owner's general form of it: **any click that triggers a massive
shift is more for the brain to process**; a subtle shift, or a clearly bounded area that swaps
its contents, is much easier.

Where it is written down in code:

| where | what it does |
|---|---|
| `paging.css`, `.paging-box:has(.paging-items-swap) .paging-shown` | any page whose mechanism is `swap` frames what its box holds — a surface, a 1px edge, an 8em floor |
| `paging.js`, `shown()` | wraps what the box holds in `.paging-shown`, so there is something to frame; `holds()` is the old body |
| `paging.css`, `.paging-swapper-stage` | the four-visual stage on `mechanisms/swap/` — the same frame, with a **fixed height** |

⚠ **The generic stage takes a `min-height`; the swap page's stage takes a `height`.** They are
different promises. The generic box also holds the content ladder (`xs` → `xl`), and a fixed
height would clip the `xl` wall — so it is framed and floored, and the caption underneath
reports the pixels it actually became. The four-visual stage *claims* its rectangle never
moves, and four visuals have to be measured against one rectangle, so there it is fixed and a
long panel scrolls inside it. A claim you can measure is worth one scrollbar.

On `card` the stage steps **down** to `--tint` rather than up to `--surface`: the box is
already white, and a white rectangle on a white card has no edge.

## Tabs that show their panel — four classes, and why they are ours

`ext/tabs`' default strip is a label, a hairline under the set and a 2px mark under the
selected one. Its panel has no edges at all, so a tab does not visibly open onto anything.
`.tabs.block` gets halfway — folder tabs — but still leaves the panel unpainted.

The fix here is four classes in `paging.css`: `.paging-tabs` `.paging-tab-bar` `.paging-tab`
`.paging-tab-panel`. The selected tab wears the panel's surface, its own left/right/top edges,
and **a bottom edge painted in the panel's colour instead of in the rule** — that one missing
line is the whole of "these two are one box". The strip's remaining bottom borders (plus an
`::after` that carries the rule past the last tab) ARE the panel's top edge, so the panel
declares `border-top: none`.

⚠ **Own classes, not `ext/tabs`'.** `.tabs.block > .tab-bar > .tab.active` is (0,4,0) inside
`@layer theme`, and `paging.css` is in the same layer — joining a panel to it would mean
out-specifying another module's sheet from ours, and every future edit there would silently
land here. The site-wide version is written as a proposal, with the diff, in
[the task log](/framework/ai/2026-09-05/paging-mechanisms-v2/); nothing in `ext/` was touched.

Used in three places, so the shape is one thing: the hub's swap miniature, the `tabs` visual on
`mechanisms/swap/`, and a made page whose children are tabs.

## Swap is a mechanism; tabs is one way to draw it

`mechanisms/swap/` now carries one stage and four visuals — **tabs · card-in · cross-fade ·
flip** — with a caption that names the panel that arrived and measures the stage before and
after. So the answer to *"should we just call it tabs?"* is on the page rather than in a doc:
tabs is the picker most people know; the mechanism is *the stage stays, the content changes*.

- **tabs** and **cross-fade** move nothing — the quiet ones.
- **card-in** carries a direction, worth its 220ms when the panels are a sequence.
- **flip** says *the other side of the same thing*, loudly enough to be wrong for anything you
  switch often.

Motion is 180–240ms and `prefers-reduced-motion` cuts every one to 1ms. ⚠ The outgoing panel is
removed on a **timer, not on `animationend`** — with the animation reduced to 1ms the event may
never be observed, and a panel that never left would cover the new one forever.

## Honest routing, said in each page's first sentence

The owner's ask was that the mechanisms be shown on the site's real machinery rather than
inside a demo frame, and that the url story be told rather than discovered. So:

| page | what a click does | url |
|---|---|---|
| [`mechanisms/launch/`](/imagine/paging/mechanisms/launch/) | opens a real child column — **three levels are prepared** | **changes**, every level |
| [`mechanisms/expand/`](/imagine/paging/mechanisms/expand/) | grows a panel under the row, in place | **never changes** |
| [`mechanisms/swap/`](/imagine/paging/mechanisms/swap/) | changes what is inside the bounded stage | **never changes** |
| [`mechanisms/takeover/`](/imagine/paging/mechanisms/takeover/) | fills the row; every ancestor becomes a crumb | **changes** (arriving IS the takeover) |

Every one of those four pages says that in its takeaway, before the reader clicks anything. The
verdict the owner gave stands: **expandos are not routed, takeovers are.**

## ⚠ "The real X, at full size" promised something three of the four do not do

The hub's four miniatures each carried the same link text. Only `takeover` is full size; the
other three open as an ordinary column of the row. The link now says what its page does, per
mechanism (`says` in `demos.js`), and each sentence is the landing page's own first words.

Everything else on the hub was crawled the same day: 31 distinct links, every one lands where
its sentence says. Two findings that are **not** this realm's:

- `/imagine/paging/readme/` logs a `404` for `readme/page.js` before falling back to the
  markdown. **Every** `readme/` route on the site does — `/framework/ext/tabs/readme/`,
  `/imagine/mag/readme/` — so it is core's probe order, and a proposal rather than a fix here.
- `/framework/core/Page/generator/` lands with its `default` child open beside it, which is
  core's arrangement working, not a wrong link.

`/imagine/paging/doc/` itself had no `page.js` and 404'd, so every record beside it was reachable
only by a direct `.md` url. It is a page now — `route()`-based rather than declared, because
four markdown records as declared children would be four 404s in the console of every page in
the realm (the blog's `doc/` learned that first).

## Tabs on a page you made — a tab is a child page

The owner: *"what's the ux for adding tabs to a page? what's the ux for configuring tabs?"*

**A tab is not a new kind of thing.** It is a child page drawn as a tab instead of as a column,
so there is nothing new to create, name or delete. One word on the PARENT decides which
presentation its children get, and it lives in the parent's own `page.json` beside the three it
already had:

```json
"mode": { "style": "card", "content": "m", "mech": "launch", "kids": "tabs" }
```

| you want to | you do |
|---|---|
| make a page use tabs | click its fourth word until it says `tabs` |
| add a tab | `+ tab` on its row — the same button says `+ page` on a `columns` page |
| rename a tab | the pencil on the tab's row: in place, Enter to keep, Escape to drop |
| reorder the tabs | the up/down arrows on the tab's row; tabs appear in the order the parent lists its children |
| remove a tab | the `x` — a tab is a page, so this deletes the page |

⚠ **A rename changes the title, never the directory.** `made/notes/page.json` stays where it is
whatever the page is called, so a url somebody saved keeps working. The trade is that the
address and the title can drift apart; the file is the page and the url is its address, and
moving files under a reader is the worse of the two.

⚠ **Tabs do not route.** A tab strip is `swap`, so the panel changes and the address bar does
not — you cannot link to a tab or reach one with the Back button. Every panel therefore carries
a link that opens the same child as a column, which does. If a child deserves an address, leave
the parent on `columns`.

The controls are `make/tabs.js`; they own no storage and never write a file — each one builds a
new tree and hands it to `Make.apply()`, the one write seam
([persistence](/imagine/paging/doc/persistence/)).

## Checked

Headless, 2026-09-05, against a private server:

- The four visuals driven at 1920: the stage read `[1428, 792, 446, 174]` before and after every
  swap in `tabs` and `cross-fade` — identical x, y, w and h — and the caption named the panel
  that arrived each time. `flip` turned (`.paging-flipped` present) on the same rectangle.
- `launch` clicked three levels deep: the url changed at every level, and a column opened each time.
- `expand` clicked: the url unchanged, the row taller.
- Make: the `kids` chip cycled `columns` → `tabs` and `"kids": "tabs"` appeared in
  `made/notes/page.json` on disk; `+ tab` added a page; the down arrow reordered
  `["Today", "Later", "New tab"]` → `["Later", "Today", "New tab"]` in the file's `children`.
- Zero console errors on the hub and all four mechanism pages at 400 / 1280 / 1920 / 3440.

## Navigation is categorized: stable or dynamic (2026-09-05, `ai/2026-09-05/nav-stability/`)

**Stable navigation is navigation where the thing you were reading does not move.** Dynamic
navigation is navigation where something moves — a column appears and the row reflows, a
panel becomes a different height, a page takes the whole screen.

Two numbers say which one a mechanism is, and every mechanism the site has was driven
headless at 1280 and 3440 to get them: **how far the thing you were reading slid sideways**,
and **how far it slid up or down**. The table, the element watched in each case, and the
runner: [`/imagine/paging/navigation/doc/measurements.md`](/imagine/paging/navigation/doc/measurements/).

**The rule for this realm.** The frame is stable; the demonstration inside it may be dynamic.

- The realm's own chrome — the rail, the crumb strip, a tab strip — never moves. All three
  measured **0px, 0px**.
- **A box that swaps its contents is given a size first.** Either a reserved height (every
  panel in the box, the unread ones `visibility: hidden`, so the box is always as tall as the
  tallest) or a size that comes from the screen (a full-height region that scrolls its own
  content). Without one, a swap moved the page below it by **259px**, a tab switch by
  **1720px**, and a toolbar word by **920px**.
- **A link opens ONE column.** A link that opened two at once was the worst sideways number
  measured — **194px at 1280**, because the column you were reading dropped from its 64em
  ceiling (963px) to its 28em floor (421px) in one click. Deep-link on purpose or not at all.
- **A dynamic mechanism is demonstrated, not used as the way around.** `takeover` and a
  column opening are real answers to real problems and both stay; they are what the
  [mechanisms](/imagine/paging/mechanisms/) pages are for. Getting from page to page in this
  realm is the rail.

**The two pieces that make a jumpy thing stable**, both in
`/imagine/paging/navigation/navigation.css` and both meant to be lifted:

```css
/* a box that is always as tall as its tallest panel — no JS, no magic number */
.paging-nav-reserve { display: grid; }
.paging-nav-reserve > * { grid-area: 1 / 1; }
.paging-nav-hidden { visibility: hidden; }

/* a columns host whose columns stop negotiating: each takes the width its word FLOORS at */
.paging-nav-fixed .page.columns .page-column-body:not(.page-column-fill, .page-column-full, .page-column-hug) {
	--page-column-flex: 0 0 var(--page-column-min, 16em);
	--page-column-max: var(--page-column-min, 16em);
}
```

⚠ **The floor, not the ceiling.** Elastic columns fill the row exactly, so pinning them at
their widest overflows the row as soon as a second one opens — and `reveal_column()` then
scrolls the row to show the new column, which moves what you were reading after all. At the
floor they fit and the number is really zero. Measured both ways: at the ceiling, 9px at 1280;
at the floor, 0px at 1280 and 3440.

⚠ **`visibility: hidden`, never `display: none`,** for a reserved panel: a display-hidden
panel is not measured, which is the whole thing being bought. And a reserved box builds every
panel — right for a handful of similar panels, wrong for forty or for anything expensive.
`ext/tabs` cannot wear it as it stands, because it mounts one page at a time.

⚠ **The `--page-column-*` tokens INHERIT.** A columns row nested inside a *column* takes that
column's three tokens: a demo row inside a `full` column rendered a default-width column
1202px wide in a 1202px row. Proposed for `Page.css`, with the diff, in the task log.

**Proven:** the four demos under [`/imagine/paging/navigation/`](/imagine/paging/navigation/)
each measure **0px on both numbers at 1280 and 3440**, against the same gesture on the
unchanged version measuring 134–161px sideways and 252–302px vertically. Zero console errors
on every page at 400 / 1280 / 1920 / 3440.
