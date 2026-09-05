# Decisions — the record

Built 2026-09-04 (`/framework/ai/2026-09-04/paging-core/`). Every verdict here is revisable;
the ⚠ ones are the two that were found by measuring rather than by thinking.

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
