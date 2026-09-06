# LayoutRules — three, because CSS answers the rest

**The defaults are `accepts: "any"` and `allowed_in: "any"`.** A layout that says nothing
restricts nothing and goes anywhere. The owner: *you don't want to overly restrict, or have to
manage a massive whitelist.*

**The test for a fourth rule is one question: can CSS do it?** If it can, the thing you found is
a defect in `framework.css`, not a rule.

## What CSS already answers — no rule, nothing to declare

| the worry | what already handles it |
|---|---|
| "a 400 layout should look fine at 1000" | the measure **holds and centres** instead of stretching — a one-column layout at 1000 keeps its 40em track |
| padding and gap on a big screen vs a small one | `--pad` / `--gap` / `--flow`, clamped and scaled by one `--size` knob (0.75 · 1 · 1.5), following the box |
| "small columns shouldn't get large content" | column-relative units: `small` is `clamp(14em, 16cqi, 24em)`; the box tells the content how big it is |
| a wall of tiles on a 3440 | `auto-fill` against a real `--column`: as many tracks as fit, never a stretched pair |
| type on a 3440 | one body clamp against the **viewport**, not the box — text does not grow because its column did |

So **content scale is not a checker rule.** It is written-down guidance (readme.md's first
Watch-out, and the `layout` skill's sixth question) plus the size standard. A checker that fires
on content scale is filing a bug report about the CSS.

## The three

### 1 · Width range

```
box is narrower than layout.widths[0]
  → "Rail + main + aside is proven from 1000px. This box is 312px.
     Below its floor it stacks to stack — and stack is what you are looking at."
```

**Why CSS cannot solve it.** A multi-column layout cannot be *scaled* into a 300px column —
three tracks in 300px is three 100px tracks, and no clamp makes that readable. The only correct
answers are **stack to the named fallback** or **refuse**, and choosing between them is the
layout author's decision, not a declaration. This is the owner's own example — a 3440 section
placed inside a column — and it is one `clientWidth` read, so it is the rule that can never be
wrong. Argued at [proportion](/framework/styles/rules/proportion/).

### 2 · Contrast

The element's own text colour resolves to the same value as the fill it is painted on: a dark
island inside a dark band, a `tint` panel on a `tint` page.

**Why CSS cannot solve it.** A colour is legal at every width, and nothing in the cascade knows
that two tokens happened to resolve to the same value *here*. It has to be compared. The
measured census of the pairs is [`styles/stacks/hunt.json`](/framework/styles/stacks/) — 101
invisible pairs across 76 pages — and the checker compares rather than restating it.

⚠ **`rgba(0, 0, 0, 0)` is what a transparent background computes to**, so a "does it end in
`, 0)`" test calls pure black transparent and the rule can never fire on the one pair it exists
for. Found by a negative control on 2026-09-06, one hour after the rule was written. Match the
whole alpha-zero form.

### 3 · Nesting that breaks a mechanism

Two shapes, both real on this site:

- **a `full` inside a `full`** — `width: "full"` collapses its ancestors into the crumb strip;
  doing it twice collapses a row that is already collapsed, and the inner page has no host left
  to be full *of*.
- **a `sticky` inside an inner scroller** — `position: sticky` sticks to its nearest *scrolling*
  ancestor, so a sticky rail inside a box with its own `overflow: auto` sticks to that box and
  never to the page.

**Why CSS cannot solve it.** Both are mechanisms cancelling each other, not sizes. There is no
value of any property that un-collapses a doubly-collapsed row, and `position: sticky` has no
"stick to the outer scroller" keyword. Argued at [nesting](/framework/styles/rules/nesting/).

## How a violation shows

**One class, `.page-layout-warn`**: a dashed outline in `--warn` and a badge with the count, and
each line in the badge links to the rule page that argues it. **A violation cites its rule rather
than restating it** — the docs-point-they-don't-explain law.

**Dev only, and it never blocks.** The gate is the same `dev` constant `Page.class.js` uses
(`localhost` / `127.0.0.1` / `*.localhost`). On the static production host the checker never runs
and the class is never stamped, so a rule that is wrong costs an agent a red outline and never
costs a reader a page.

**Layouts do not stack** (one layout per section; composition is nesting sections), so the
checker only ever compares one layout against one host. That is why it is a function and not an
engine.

⚠ **The box has no size when a page is built.** A page is built detached, so every rect reads 0
at build time and rule 1 would fire on all thirty. `Layout.render_fixture()` puts a
`ResizeObserver` on the box instead — it fires the moment the box gets a size, and again on every
drag of the handle, which is exactly when the width rule needs asking again.
