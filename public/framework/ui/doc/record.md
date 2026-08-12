# The long record — how the nineteen were built

Written while these lived at `styles/components/`, where they were **samples
proving a claim** (*you almost never need a stylesheet*) rather than a library.
Kept because the reasoning is still the reasoning, and the findings are still open.

**What changed when they moved to `ui/`:** they are a library now, so the look
became CSS classes injected from each component's own `.js` instead of shared
inline style objects (`surface`, `pill`, `muted` → `.ui-surface`, `.ui-pill`,
`.ui-muted`), and three of the nineteen stopped being functions at all. Read §2
below as the argument *for* the position `readme.md` now takes, not as the
current shape. Everything about the ladder, the tooltip line (§4), the nine
findings (§5) and the traps (§6) stands.

---

## 1. Why a separate `component.js` instead of markup in the page?

**Question.** Each component is needed twice — the `demo()` on its own page and
the card on the index wall. Where does it live?

**Options.**

1. Write the markup in `<name>/page.js` and duplicate it for the wall.
2. Export a builder from `<name>/component.js` and import it twice.
3. Put all twelve in one `components.js`.

**Weighing.** (1) is the exact drift `demo()` exists to prevent: the wall would
show a component that no longer matched the page it links to, and nothing would
fail. (3) puts a component's code somewhere other than beside the page that
documents it, and `demo(fn)` prints `fn.toString()`, so a reader following the
source would leave the directory.

**Verdict: (2), one file per component, default-exporting a function.** Identical
to `styles/layouts/`, deliberately — the same problem had the same answer one
directory up, and two shapes for "a thing rendered on its own page and on a
wall" would be one shape too many.

The functions **capture** rather than return: `div.c(…)` auto-appends to whatever
is collecting, and both call sites are capture positions. It also makes the source
`demo()` prints identical to what you would paste into a `page.js`, which is the
whole point of a component library.

---

## 2. The look: a class, a stylesheet, or an inline token value?

**Question.** Seven of the twelve are a padded box with a fill, a hairline and
rounded corners. Rung 4 of the ladder is *the module's own `.css` — layout only*.
So where does `background: var(--surface)` go?

**Options.**

1. A `.card` / `.surface` class in a `components.css`, token-valued.
2. A token-valued style object in `parts.js`, applied with `.style()`.
3. Rung 3 — reuse `.page-preview`, which is already a bordered surface.

**Weighing.** (1) reads best at the call site and is exactly the rule the ladder
forbids. Every value would be a token and no colour would be *named*, which is
tempting — but "would this rule still be right if the component were dropped into
a completely different site?" is a no. A fill is that site's call. And a docs
section is the last place to be sloppy about its own rule.

(3) deserved more than a shrug, because `.page-preview` really is the site's card:
surface, `--line` border, `--radius`, a hover accent, and the `.active` /
`.in-path` states `Router.mark_links()` paints. It was rejected for the states.
`display: flex; align-items: center` fights being a container (`layouts.css` had to
add `.layout-card` to undo exactly that), and worse, a *static* card that lights up
whenever you happen to be on a matching url is a nav card in a costume. Borrowing a
class borrows its behaviour.

**Verdict: (2), factored into `parts.js`.** Three objects — `surface`, `pill`,
`btn` — every value a token, no colour named anywhere in the section. This is the
house answer rather than a new one: `styles/layers/util/page.js` tints its demo
cells this way.

**Since: `surface` and `pill` moved up to `styles/parts.js`.** `layouts/` and
`sections/` want the identical two objects, and both had grown private copies —
four of the `surface` triple across the layout modules, and three different
opacities of `muted`. They are re-exported from this file, so a component still
imports its looks from beside itself. `btn` stays here: it patches one
`framework.css` rule, and only this section has that problem.

The cost: a reader of `demo(component)` sees `surface` and not what a surface is.
Paid for the same way layouts pays for it — a `<details>` on the index holding
`parts.js` in full, via `code.file(import.meta, "parts.js")`.

**A note on where a component's look belongs at all.** The rule is *"the
implementor styles it; ship the fewest defaults you can."* These twelve are
samples, not framework components — nothing imports them — so they get to carry
their own look. A real `core/` component would carry the layout and expose a token.

---

## 3. Inline styles, and the escalation ratchet

Worth being explicit, because "inline is the top rung" and "inline is the house
answer for a tint" look like a contradiction.

They are two different acts. **Supplying a value** the cascade never had an opinion
about (`background: var(--wash)` on a demo box, `gap: 0.4em` on a row) spends
nothing: nothing downstream has to climb over it, because nothing downstream is
trying to style this box. **Overriding a rule** that already matched (`border: none`
on an `input` the theme bordered) spends the whole ladder at once — no layer, no
specificity, nothing is left above it.

By that test the section has **one** escalation, in `tags/component.js`, and it is
recorded as a bug report in §5 rather than as a technique.

---

## 4. Where the line actually is — the tooltip

**Question.** Eleven components needed no selector. Why does the twelfth?

The easy answer is "it's a look", and it's wrong — a fill is a look too, and that
went inline. The real line is sharper, and it is worth writing down because it
predicts the next case:

| what a tooltip needs | why an inline style cannot |
| --- | --- |
| `position: absolute` on the bubble | it is a rule about a **relationship** between two elements — the bubble resolves against a positioned ancestor. An inline style can only speak about the element it is on. |
| `:hover`, `:focus-visible` | a **state**. There is no inline syntax for one. |

So: *one element, one moment* → inline is fine. **A relationship or a state → you
need a selector.** That is the whole of `tooltip.css`, and it is five rules.

**Options considered.**

1. The `title` attribute. Zero CSS, real delay, real UA behaviour.
2. A JS tooltip — a listener that positions a bubble on `mouseenter`.
3. Five rules in `tooltip.css`.

**Weighing.** (1) is rung 1 of the ladder and is on the page for exactly that
reason: if the design does not insist on the bubble, `title` is the right answer
and the stylesheet goes away. It loses only when the bubble must match the design.

(2) is worse than the CSS in every direction: it needs a listener per instance, it
has to re-measure on scroll and resize, it cannot be driven by `:focus-visible`
without duplicating the browser's own heuristic, and it breaks when the page
scrolls under it. Trading five declarative rules for imperative geometry is the
opposite trade this framework makes everywhere else.

**Verdict: (3), and the stylesheet lives at `tooltip/tooltip.css`,** loaded by
`tooltip/component.js` — the module that emits `.tooltip` and `.tooltip-bubble`.
Not a section-level `components.css`, which was the obvious symmetry with
`layouts.css`.

**Why not `components.css`:** a section-level file loads on every page under the
section and quietly becomes the place the *next* rule goes. Beside the one
component that needs it, the cost is visible in the one file that pays it, and the
count in the table on the index page stays honest. `layouts.css` is section-level
because its rules serve the *section's own machinery* (the gallery window, the
maximize view) as much as any one layout; there is no equivalent here.

Two implementation details worth keeping:

- **`visibility` as well as `opacity`.** Opacity alone leaves an invisible box on
  the hit-testing map, swallowing clicks aimed at the line above.
- **One selector list for `:hover`, `:focus-visible` and `.shown`.** The keyboard
  path cannot drift from the pointer path if there is only one rule. `.shown` also
  makes the component screenshot-testable, which is why it is in the reveal list
  rather than being a second rule.

---

## 5. The findings

Ranked by how many of the twelve wanted the thing. **None of these is applied** —
this section may not edit `framework.css`.

### 9 of 12: there is no gap under `1em`

```css
.gap { gap: 1em; }
.gap-2em { gap: 2em; }
```

That is the entire vocabulary, both values hardcoded, neither reading a token. `1em`
is right *between* components and far too much *inside* one, so nine of the twelve
write `.style("gap", "0.4em")` — the most repeated declaration in the section by a
distance.

The workarounds all cost more than the missing class:

- `.gap` and then override it — an override, so the ratchet, for a value.
- `.flow` — that is **page** rhythm: one registered token, `--flow`, declared per
  flow root, and a small heading takes `calc(var(--flow) * 1.5)`. So an eyebrow
  label and its title land 48px apart whatever the heading's size. Tried on `card`,
  and it is why `card` is `flex v` and not `pad flow`.
- Do without — the components genuinely look wrong.

**ADOPTED — `framework.css` is `.gap { gap: var(--gap, 1em) }`.** Two forms were
weighed: a class (`.gap-sm { gap: 0.4em }`, matching the existing `.gap-2em` naming)
or making the existing one tunable. The token won — strictly more capable, costs
nothing, and matches how `--column` and `--basis` already work. `div.c("flex
gap").style("--gap", ".4em")` is the whole adjustment, and no second selector
entered the layer. A utility that reads a token is a knob, and this codebase has now
three times found that more useful than a new selector.

### 7 of 12: `surface` — see §2. **Keep.**

### 4 of 12: `.btn` and `.page-link` leave the underline on

```css
.btn, button { padding: 0.25em 1em; cursor: pointer; }
.page-link { font-weight: 600; }
```

Neither touches `text-decoration` or `color`, so an `<a>` wearing either keeps its
UA underline and UA blue. Four call sites here write `{ textDecoration: "none",
color: "inherit" }` — `btn` in `parts.js`.

This one is a straightforward **bug report about `framework.css`**: a class whose
entire purpose is *"make this link look like a button"* has not finished. The site
already knows it — `.page-preview` and `.tab` both set `text-decoration: none`
themselves, and so does `.nav-link` in `/styles.css`. Four independent copies of one
declaration is the same shape as the `pre` padding case that is already on the
eviction list.

### 2 of 12: the status axis is a third done

`--prim --bg --ink --subtle --surface --line --wash`, plus `--error`, which landed
while this section was being written — to replace `#c00` hardcoded in `md.css`,
`demo.css` and `highlight.css`, i.e. for *error boxes*, not for components. Nothing
means *good* or *warning*. So `badge` honestly offers neutral / accent / dark /
outline, `alert` offers two tones, and green-for-passing is not available to a
component, because naming a colour is the thing a component may not do.

**Proposal, not applied:** `--ok` and `--warn` beside `--error`, defined per theme
with `light-dark()` like every other token. Note *how* `--error` earned its place —
three existing hardcodes, exactly the stated bar. That is the argument for the other
two as well and also the reason they can wait: nothing has hardcoded a green yet,
because nothing has been able to. Two components wanting it is not the bar; a diff
view, a test report or a deploy log would settle it immediately, and `--error`
having arrived first is the template for how.

### 2 of 12: there is no small body level, so help text shouts

```css
h4, .h4 { font-size: 0.8em; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
```

`h4` is the scale's small level and it is an **uppercase annotation**. That is
exactly right for a field label and exactly wrong for the error message under it:
`field` first rendered `THAT ADDRESS IS MISSING A DOMAIN.`, which reads as an alarm
rather than as help. Below body there is nothing else, and *"never invent a
font-size"* means a component may not reach for `0.85em` either.

**Verdict for now: use body size.** Slightly large is better than shouting, and
both `field` and `tags` do it. **Not proposed as a new level** — five levels is a
feature and a sixth invites a seventh. The honest options are a `.small` *class*
that borrows nothing from the outline (the same trick `.h1`–`.h4` already play), or
splitting the annotation level into size and case so `h4` without the uppercase is
available. Recorded rather than decided: the scale is the site's most load-bearing
decision and this section is not the place to reopen it.

### 1 of 12: no `justify-content: flex-end`

The utilities name `h-center` (`center`) and `split` (`space-between`). A dialog's
action row wants neither. `panel` uses **`.flex.reverse`**, which is the genuinely
pleasant discovery in this section: `row-reverse` right-aligns a row for free, with
`gap` intact.

The trade is real: DOM order reverses too, so the primary action is first in the
source and first in the tab order. For a confirm dialog that is arguably correct;
for a wizard's *Back / Next* it is not.

**Proposal, not applied:** `.flex.end { justify-content: flex-end }`. One
declaration, and a right-aligned action row is the most common row on any form. It
is a smaller gap than the `gap` one only because this section has one dialog in it.

### 1 of 12: no alignment utilities at all

`text-align` has no class, so a numeric table column is one inline declaration per
cell. Not proposed: `text-align` is a *typographic* decision more often than a
layout one, three utilities (`.left .center .right`) is a whole new axis, and one
call site is nowhere near the bar. Recorded so the next person can add a tally mark.

### 1 of 12: an input has no way to be bare

```css
input:not([type="checkbox"], [type="radio"], [type="color"], [type="range"]), select, textarea {
    padding: 0.25em 0.6em;
    border: 1px solid var(--subtle);
}
```

Right for a field standing on its own, and there is no opt-out. `tags` puts a field
*inside* a field, so it has to hand both back — inline, over `@layer theme`, which
is the section's one real escalation (§3).

**Proposal, not applied:** a `.bare` class in `@layer util` —
`border: none; background: none; padding: 0`. In `util` it wins without
specificity games, and it would retire this override plus the same one in every
search box, inline editor and editable table cell after it. The `tags` page also
shows the two versions that need no override at all, because "want the simpler
component" is the honest first answer.

### 1 of 12: `min-width: 0` is on `.basis` and not on `.flex-1`

```css
.basis  { flex: 0 0 var(--basis, var(--column)); min-width: 0; }
.flex-1 { flex: 1; }                              /* as it stood */
```

The index wall's grid cells need `min-width: 0` or a wide child (a table) makes
the whole page scroll sideways — `min-width: auto` is the default for a flex and
grid item, and it resolves to min-content. `.basis` carried the fix; its
counterpart did not.

**ADOPTED — `.flex-1 { flex: 1; min-width: 0 }`.** The same one-line fix, for the
same reason, on the class that names the *fluid* half of a row — the half more
likely to be holding something wide. The asymmetry was the bug, not the fix.

---

## 6. Three traps found while writing this

None is a bug; all three cost real minutes.

- **The index calls no `toc()`, on purpose.** `toc()` collects
  `h2, h3, .h2, .h3` outside its skip list (`.demo, .md-details, .toc, .files,
  .tab-bar, .sidebar, .page-previews`), and the gallery renders **real components** —
  `card`'s `h3`, `stats`'s `.h2`, `panel`'s `.h3`. Those are the insides of an
  example, not sections of the page, so the rail read
  *View · 3 · 0 · 16 · Delete branch?* above the four real headings.

  Everywhere else on the site this cannot happen, because every example is inside a
  `.demo` and `.demo` is skipped. A gallery is the one shape that renders live
  markup *outside* a demo. Options were: add the gallery's class to `toc`'s skip
  list (an ext learning about a docs page — wrong direction); wrap the gallery in
  `.page-previews` purely for the side effect (a class used for what it is *not*,
  which is the black magic the house rules forbid); or drop the rail. **A wrong rail
  is worse than none**, so the rail is dropped and this is written down. If a second
  gallery ever appears, the fix belongs in `toc()` — probably *"skip anything inside
  an element that carries a heading-as-class"*, or a `skip` option on the call.

  **Resolved by construction (Aug 2026).** The wall is `previews()` now, so it *is*
  a `.page-previews` and `toc()` skips it for what it is rather than as a trick.
  The rail could come back; it has not been tried.

- **On a column, `h-center` centers *vertically*.** `.flex.h-center` is
  `justify-content: center` and `.flex.v-center` is `align-items: center`, so the
  names describe the *property*, not the visual axis — and `flex.v` swaps which
  axis each property means. The gallery cell wants `flex v h-center` to center a
  component vertically **and** keep it full width; `flex v v-center` centers it
  horizontally and shrinks it to its content, which is how three cells first
  rendered. Worth knowing, and not worth renaming: every other flex utility in the
  set names its property too.
- **`.flex > * { margin: 0 }` is doing more than it looks like.** It is why a `p`
  or an `h3` dropped into any of these components has no stray UA margin, and it is
  why `flex v` + a gap is a complete rhythm system for a component. The `.grid`
  twin exists for the same reason.

- **`flex-1` on an `input` collapses it, and `wrap` cannot save it.** `flex: 1` is
  `flex: 1 1 0%`, so in a tight row the basis is zero and the field shrinks to a
  couple of pixels rather than dropping to the next line — which is exactly what
  `toolbar` did inside a gallery cell. A `min-width` is what gives `wrap` something
  to act on. Not a missing utility, just flexbox: recorded because the symptom
  (a 2px input) looks like a broken component and the cause is one property away.

- **`framework.css` has no rule for `a` at all.** Every styled link on the site is
  styled by the component that emits it — `.page-preview`, `.tab`, `.nav-link`,
  `.page-link` — so a link a component *doesn't* claim is UA blue and underlined.
  `card`'s CTA therefore names its own colour (`var(--prim)`, a token) and a
  preview card's title link takes `color: inherit`. Not a complaint: an unstyled `a` is a
  visible reminder that a link's colour is a decision, and the alternative is a base
  rule every theme then has to fight. It is the other half of the `.btn` finding.

---

## 7. What was dropped

Sixteen candidates, twelve pages. Each of these was built or sketched and cut:

- **Avatar + meta row.** `flex gap v-center`, a circle, a name, a timestamp — and
  the circle is four inline declarations (`width`, `height`, `border-radius`,
  `background`) with nothing to learn from any of them. The row itself is the same
  `flex gap v-center` that `crumbs`, `toolbar` and `badge` already demonstrate.
  It taught nothing a third row would not.
- **Empty state.** An icon, a heading, a sentence, a button, centered. Genuinely
  zero CSS, which is a point already made twice — and its one interesting detail is
  the `h-center` trap, which is recorded in §6 where it is more useful.
- **Progress / meter row.** Cut for **duplication**, not thinness:
  [`elements/forms`](/framework/styles/elements/forms/) already documents `meter`
  and `progress`, including the advice that a bar which must match the design should
  be built from a `div`. A second page repeating that would be a second source of
  truth for one of the two elements.
- **A joined segmented control.** The one that would have needed CSS besides the
  tooltip — a negative margin between buttons and corner suppression on the middle
  ones. It earns nothing: the theme draws borderless buttons, so a `0.15em` gap
  already reads as a group, and `toolbar` shows that instead. **Kept as a verdict:**
  if someone wants a joined control later, the finding is that it needs two rules
  and that a tight gap was enough.
- **A modal backdrop and focus trap.** `<dialog>` and `showModal()` already give
  you the top layer, `::backdrop`, Escape-to-close and the focus trap. A component
  library reimplementing that is not a CSS question, and the parts a `panel` is
  *made of* are what this section is about.

**What I would still cut.** `crumbs` and `pagination` are the same row with
different contents — three shared classes, and both exist mainly to make the
`mark_links()` point and the `.btn` point respectively. If the section needs to be
ten pages, they merge.

---

## 8. Open

- **The gallery cell is a `div`, not an `a`.** Half the components contain links or
  buttons, and an anchor inside an anchor is invalid HTML that swallows the click —
  the same constraint `layouts/readme.md §6` records, arrived at from the other
  side (layouts kept the anchor and banned links *inside*; here the components win
  and the anchor moves to the title). The cost is that the cell loses
  `.page-preview`'s hover and `.active` states. The title link is a `.page-link`, so
  it still marks; the card no longer does. A `.page-preview` variant that is a
  container rather than a link would fix both sections at once, and neither section
  should invent it alone.
- **`stats` at `--column: 9em` wraps to two columns inside a gallery cell** and
  four on its own page. That is `grid auto` doing its job, but it means the gallery
  is not showing quite the same arrangement the page shows. Left alone: a card wall
  that reflowed would be lying about being responsive. (`7em` was the first value
  and it gave 3 + 1 in a cell — an orphan tile. The token is a knob; this is what
  turning it looks like.)
- **Nothing here is imported by the framework**, which is what makes the look
  allowed (§2). If any of these ever graduates into `core/`, the look has to leave
  it — layout in the module, the rest via tokens the implementor sets.

---

## 9. Four more: avatar, dialog, progress, menu

The publishing set — what a site that wants sign-ins, confirmations and menus
reaches for next. The finding is that **three of the four are the browser**:

- **`avatar`** — a circle is `border-radius: 999px` and centred initials are
  `flex v-center h-center`; `--avatar` sizes it, the same knob move as
  `--column`. Exports the single-circle `avatar()` alongside the demo, and
  `sections/testimonials.js` imports it — the first cross-import between the two
  galleries, on purpose.
- **`dialog`** — native `<dialog>` + `showModal()`. Focus trap, Esc, backdrop,
  centring and top-layer stacking all arrive free; the file is the two calls and
  the same `surface` tokens every card wears. One trap recorded on its page: the
  UA sets `color: CanvasText`, which blocks the theme's ink until restated.
  `el("dialog", …)` because `dialog` has no named factory.
- **`progress`** — native `<progress>`/`<meter>`, themed for free because
  `framework.css` already sets `accent-color: var(--prim)`. The vendor
  pseudo-element route (`::-webkit-progress-bar`) is deliberately not taken.
- **`menu`** — a `<details>` dropdown. **The second component to earn a
  stylesheet**, and it passes tooltip's exact test: the panel is positioned
  against its summary (a relationship) and appears on open (a state). Five rules;
  the trigger is `.btn`, whose `display: flex` also removes the UA marker.
  No light-dismiss — the Popover API is the recorded upgrade path.

Dropped from the shortlist: a modal built from divs (re-implements the `<dialog>`
table, wrong), and anything tab-shaped (`Page.tabs()` owns that).

## 10. Three more: accordion, timeline, keys

The set a site adds the week it goes public — a FAQ that collapses, a release
history, and the shortcut hints an app grows into. **All three ship no CSS**, so
the count is nineteen components and two stylesheets.

- **`accordion`** — `<details name="…">`. A shared `name` makes the browser treat
  the group as exclusive, so *one at a time* costs an attribute rather than a
  listener, and the open panel is the DOM's `open` attribute rather than state
  this file holds. Verified in the browser, not assumed: opening the second panel
  closed the first with nothing subscribed.
- **`timeline`** — a rail of dots. The reflex is `::before` with
  `position: absolute`, which is a pseudo-element (unreachable from an inline
  style) *and* a relationship — both halves of §4's test, so it would have earned
  a stylesheet. It doesn't need one: the line is the **inline-start border of an
  empty `flex-1` div** sitting under each dot, in the flow, and omitting it on the
  last row is what makes the run stop. `flex v v-center` centres the rail, which
  is §6's "on a column, `v-center` centres horizontally" trap being useful for once.
- **`kbd`** — the base theme puts `kbd` in the mono list *by meaning* and stops
  there, so the key's box is the component's: six token declarations, and the lip
  under it is one of them (`borderBottomWidth: "2px"`). `flex gap v-center split`
  is the shortcut row, and `split` is the utility that finally had an obvious job.

### The trap that no longer reproduces, and how it was caught

The brief warned that a `display` utility on `<details>` or `<dialog>` defeats
the UA's hiding, and the accordion page shipped a section saying so. **It is only
true of `<dialog>`.** Measured in this Chromium: with `display: flex` on a closed
`<details>` the panel stayed hidden (`checkVisibility()` false, the box still
28.8px — collapsed), because a closed panel is hidden through `::details-content`
rather than through a UA `display` rule an author can out-specify. `<dialog>`'s
`dialog:not([open]) { display: none }` *is* such a rule, which is why that half of
the trap is real and stays recorded on `dialog/page.js`.

The section was rewritten to what the probe actually showed. Two things worth
carrying forward: **a doc page that quotes behaviour is a claim, and claims are
checkable** (§6d of the styles record makes the same point about quoted CSS); and
the same probe caught the demo *next to* it failing to demonstrate its own point —
the "no marker" summary had been written without the flex class that removes the
marker, so both rows rendered `display: list-item` and the caption was describing
something that wasn't on screen. **A demo that proves nothing looks exactly like a
demo that proves something.**

### What was skipped, and why

**Empty state** was on the shortlist and is already cut in §7, for a reason that
still holds: it is an icon, a heading, a sentence and a button, centred — zero
CSS, which this section has demonstrated eighteen times, and its one finding (the
`h-center` axis trap) is recorded in §6 where it is more useful. Re-adding it
would overturn a written verdict with no new evidence, which is the thing these
records exist to prevent.

---

## 11. The review — sixteen of nineteen demoted (Aug 2026)

One independent Opus review per module, judged against the bar in `readme.md`.
The table, the one-line case per module and the tally live in
`framework/ai/2026-08-09/proposal.md`; only what it changed is recorded here.

**Kept: `table`, `timeline` (simplified), `keys`.** All three are a loop.
`timeline`'s last-row bookkeeping — an index against `items.length`, a `last`
flag, a class — became two `:last-child` rules, and the unmatched
`ui-timeline-rail` class went with it. Its signature is unchanged and
`sections/changelog.js` was not touched.

**Demoted: the other sixteen.** Each function's body became the copy-paste
template on its own page, rendered by the same `const` its `palette()`,
its `copy()` and its `preview()` use — so the wall still cannot show something a
page doesn't. Nine kept a `<name>.js` holding one `css()` call, because a
relationship or a state needs a selector (§4's test, applied to all nineteen
instead of to one). Seven kept no `.js` at all: `.ui-card`, `.ui-alert-body`,
`.ui-tags`/`.ui-tag`, `.ui-pagination`, `.ui-stats`/`.ui-stat`, `.ui-shortcut`
and `.ui-timeline-rail` were classes styled **nowhere**, so they were dropped
rather than preserved. `.ui-tags-input` moved to `parts.js`, where a general
opt-out belongs.

**Four things the review found that the set had not.** `alert` shadowed
`window.alert`, and `alert("msg")` failed silently by rendering its message as a
material ligature. `menu` collided by name with `ext/layout`'s `menu()`. `dialog`'s
own `.c()` form re-armed the trap the component existed to avoid, by putting the
caller's classes on the `<dialog>`. And **three hardcoded `white`s** —
tooltip's bubble, avatar's circle, badge's two filled tones — all over `var(--bg)`,
all readable, all naming a colour a component may not name; they read
`var(--ink)` / `var(--surface)` now, which is a pair rather than a literal and is
correct in dark mode as well.

**§2's verdict partly reverses.** `.ui-surface` and `.ui-muted` were
`framework.css`'s `.surface` and `.muted` character for character — the class
form of §2 was right, but a *second copy* of it was not. Both are deleted;
every template writes the upstream class. `.ui-pill` stays, having no
counterpart there.

**What did not change.** §5's findings are still open, §6's traps still bite, and
the argument in §2 for a class over an inline style object still stands — the
review narrowed *whose* class, not whether.
