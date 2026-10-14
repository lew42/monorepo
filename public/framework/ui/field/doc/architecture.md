# Field architecture — a template, not a function

The field is a `ui/` template: a `<label>` that wraps one control, a heading and a note. It is markup you copy from its [page](/framework/ui/field/), so the page's code is the code that ran. Entry: [`page.js`](../page.js).

## No `ui.field()` function
**Decided:** there is no field function; the page shows the three elements and two utility classes to copy.
**Why:** every real form wants a fourth part (a checkbox row, a unit suffix, two controls side by side, a counter), and each would need an option, which is API surface forever.
**Instead:** a `field({ hint, suffix, … })` helper, which gives every form a new option to learn and keep.

## The label wraps the control
**Decided:** the `<label>` contains the control, so there is no `for`/`id` pair to keep in sync.
**Why:** one element is one click target and cannot come out of step with its input.
**Instead:** a sibling `<label for>` with generated ids, which needs a unique id per field.

## Gap inside a field is 0.4em
**Decided:** a field sets `--gap: calc(var(--gap) * 0.4)` on its own column.
**Why:** `gap`'s default is right between fields and far too loose inside one.
**Instead:** keep the default and accept loose fields, or a named `.field` class (a new class name the page does not need).

## Errors use body size, not `h4`
**Decided:** an error message is body text in the prime colour, not an `h4`.
**Why:** the theme's `h4` is uppercase, so an error reads as an alarm; body text reads as help.
**Instead:** a smaller font size, which breaks the rule that sizes come from the type scale.

## Invalid state is `aria-invalid`, not a class
**Decided:** an invalid field sets `aria-invalid="true"` plus the prime colour on the border and message; there is no `.error` class.
**Why:** `aria-invalid` is what a screen reader announces, and the colour is for everyone else.
**Instead:** an `.error` class, which would style a state nothing else needs to read.

## Controls are already styled by the base layer
**Decided:** a field relies on the base layer for control sizing, so swapping `input` for `select` changes one line.
**Why:** the base layer already makes text controls fill their container (`width: 100%`), so a field adds no width rules.
**Instead:** a per-control class in each field, which would repeat the base rule.
⚠ The page claims the base layer also pads and borders every text control. The code in `styles/layers/base/page.js` sets the width; I did not find the padding and border rule in the base layer, so check the claim before relying on it.

## Detail
- [The page](/framework/ui/field/) — the live demos and the copyable markup.
- [Breadcrumbs](/framework/ui/crumbs/) — the next `ui/` template.
