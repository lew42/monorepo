# What the utilities could not say

The ledger of the eight layouts this folder held before the merge; six of those
pages are gone and the accounting below is why it cost nothing to fold them in.

Split out of `readme.md`. Both gaps below are now closed — `.basis` and
`.measure` are in `framework.css`, and the eight layouts ship no CSS at all.

## 4. Which layouts needed CSS

Three rules for the layouts themselves — `layouts.css` also carries the
maximize-view rules (`.layout-full`, `.layout-close`), this section's own
machinery, not a layout's cost. The preview-card rules that used to sit here
moved out entirely, to `core/Page/Page.css` — every index draws that card now,
not just this one, so it belongs to the class that emits it.

| layout | rule |
| --- | --- |
| cards, split, masthead | **none** |
| holy grail, dashboard, sidebar | **none** — `basis`, a `framework.css` utility |
| centered, stack | `.layout-measure` — `max-width: 34em; margin-inline: auto` |

### The gap: there is no utility for a flex basis

`flex-1` names the *fluid* half of a two-column row and nothing names the fixed
half. Every sidebar layout in existence needs both. The workarounds all cost
more than the missing class:

- `.style({ flex: "0 0 19em" })` — inline, the top rung of the escalation
  ratchet, and it hardcodes a number `--sidebar` already holds.
- `grid` with `grid-template-columns` — no utility for an asymmetric template
  either, so it is the same inline style with more syntax.
- `flex.auto` with a `--column` override — makes the columns *equal*, which is
  [flex gap auto](/framework/styles/layouts/flex/auto/), not a sidebar.

**Applied since.** `.basis { flex: 0 0 var(--basis, var(--column)); min-width: 0 }`
shipped in `framework.css` — `div.c("basis").style("--basis", "var(--sidebar)")`
is the whole adjustment now, and `.layout-side`/`.layout-rail` above were exactly
this pattern, named per-layout rather than read generically. Three call sites
turned out to be the bar after all.

**CLOSED — the two per-layout names are gone.** The utility shipped and then
collected no users for months: a later audit found `.basis` had exactly **one**
call site on the whole site, its own doc page, while the five hand-rolled copies
its comment claims to have retired were all still hand-rolled. Adding a utility
does not retire anything; converting the call sites does. So:

| was | is |
| --- | --- |
| `.ac("layout-side")` | `.ac("basis").style("--basis", "var(--sidebar)")` |
| `div.c("layout-rail")` | `div.c("basis")` — `--column` is already the default |

`layouts.css` drops from five rules to three, and **seven of the eight layouts
now ship no CSS at all.** `ext/files`' tree and `ext/tabs`' vertical bar were
converted in the same pass, so "the fixed track beside a fluid one" has one
spelling in the codebase rather than five.

One consequence worth writing down: `.basis` is in `@layer util` and the two
rules it replaced were in `@layer theme`, so the fixed track now out-ranks
component CSS instead of losing to it. That is the right direction — you typed
`basis` on the element — and nothing on the site was relying on the old
precedence, checked at every call site.

### The gap: there is no utility for a centred measure

`max-width` alone leaves the column flush left, and `flex.h-center` has nothing
to centre until a child has a width. This one has a stronger case than the
basis had: every region now hands every page a `60em` measure by default (`paper`
retired — see `core/Page/readme.md`, "The sheet is the default"), and `--column`
is a token for exactly this kind of number. Still open here at a narrower width
(34em) than the page-level default.

### Two things the utilities did better than expected

- **`--column` is a knob, not just a default.** `grid.auto` reads it, so setting
  `--column: 8em` on the tile row turns a card wall into a stat strip with no new
  selector, and `--column: 18em` on `flex.auto` sets a split's stacking point. A
  token override where a rule was expected, twice.
- **`flow` was already the answer for vertical rhythm.** `Page.css` applies it to
  page copy; a form stack is the same thing, so [Stack](/framework/styles/layouts/stack/)
  needed nothing but the measure.

---

## 5. The tint, and why `layouts.css` has no colours in it

**Question.** A layout demo needs its regions to be *visible*. A background and a
border are a look, and rung 4 of the ladder is layout only.

**Options.**

1. A `.layout-box` class in `layouts.css` carrying background/border/radius.
2. An inline token-valued `.style()` per box.
3. Reuse `.page-preview`, which is already a bordered surface.

**Weighing.** (1) reads best at the call site and is exactly the rule the ladder
forbids — and a docs section is the last place to be sloppy about its own rule.
(3) is a nav card pretending to be a region, and its `display: flex` fights being
a container.

**Verdict: (2), factored into `parts.js`.** `box()` writes
`background: var(--wash); border: 1px solid var(--line); border-radius: var(--radius)`
once, and `styles/layers/util/page.js` already tints its demo cells the same way — so
this is the house answer, not a new one. `layouts.css` therefore contains no
colour at all, which is the only reason the "three rules for eight layouts" count
above means anything.

The cost: a reader of `demo(layout)` sees `box("Nav", …)` and not what a box is.
Paid for with a `<details>` on the index holding `parts.js` in full, via
`code.file(import.meta, "parts.js")`.

---

## 7. What I would cut

- **`stack` and `centered` overlap.** Both are `.layout-measure` with different
  contents; `stack` earns its place only because it demonstrates `flow` and
  `textarea.auto`. If the section needs to be seven pages, these merge.
- **The eight `full/` pages.** ~~Two would have made the point (the brief asked for
  two); eight is 24 lines of file for consistency. Kept because an inconsistent
  affordance is worse than a repeated one, and because `full.js` means the
  repetition is three lines with no logic in it.~~ **Cut** — see §3, REVISED. The
  answer was not "fewer of them"; it was that a `route()` needs no file at all, so
  all eight keep the affordance and cost nothing.
- **`tile()` in `parts.js`** is one call site (`dashboard`) and is a one-liner
  over `box()`. It stays because it names the thing the dashboard is *made of*,
  which is what the demo source needs to read as prose.

## 8. Open

- **`--sidebar` is 19em, and at a docs measure that is 39% of the row.** This is
  now the *Sidebar* page's cost alone, and that page is about the token, so it is
  the honest place to pay it. **Holy grail no longer shares it:** its nav rail was
  `flex-1` — fluid, so it split the row's slack and rendered wider than the reading
  — and is now `basis` at the default `--column`. Correct from 900px up.
- **One rule was added for the index's previews:**
  `.preview > * { outline: 1px solid var(--line) }`. A shape preview has no content
  and no colour, so two washed regions with no gap between them read as one wash —
  the outline is what makes `flex` (no gap) distinguishable from one box. It styles
  a class `preview.js` emits, in the module's own sheet, and it is layout-adjacent
  rather than a look: without it the picture is wrong, not plain.
- ~~**`.layout-full` picks `padding: 1.5em`.** Zero would be more honest ("nothing
  around it") and looked wrong — the back link ended up welded to the viewport
  edge. If a `--page-pad` token ever exists, this should read it.~~ **Resolved.**
  The token exists (`core/Page/readme.md`), and `.layout-viewport` sets
  `--page-pad: 1.5em` rather than declaring `padding` — so the one place that
  decides how a page is inset is the one place that decides it.
