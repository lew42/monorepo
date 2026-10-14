# Accordion architecture — the browser closes the others, so there is no JS

The accordion is a set of native `<details>` elements that share one `name` attribute. It is a pattern, not a class: there is no `ui.accordion()` and no instance to hold state. Entry points: [`accordion.js`](../accordion.js) (two CSS rules) and the [Overview page](/framework/ui/accordion/), whose demos are the reference. Start with the [readme](../readme.md).

## Exclusivity is the `name` attribute

**Decided:** panels that share a `name` attribute open one at a time; the browser closes the others.
**Why:** the open panel is the DOM's own `open` attribute, so there is no listener, no state, and no arrow that can disagree with the panel under it.
**Instead:** a JS accordion keeps an `open` index in memory. It needs listeners, must be kept in sync, and is lost on rebuild.
**Detail:** [the demo](/framework/ui/accordion/).

## The name is visible, not minted

**Decided:** every accordion names its group yourself, e.g. `attr("name", "faq")`.
**Why:** a readable name can be seen, shared on purpose, or removed when you want all panels open at once.
**Instead:** a module-scope counter minting `ui-accordion-3`. It hid the group and made every accordion a separate, invisible identity.
**Detail:** [the demo](/framework/ui/accordion/).

## No helper function

**Decided:** the component is markup: `details.c("ui-accordion-item pad", …)` with a `name`.
**Why:** the whole behaviour is one attribute, so a helper would only hide it.
**Instead:** a `ui.accordion(items)` builder. It adds an API to learn and still needs the same attribute.
**Detail:** [the demo](/framework/ui/accordion/).

## Only relationships live in CSS

**Decided:** `accordion.js` holds two rules in `@layer theme`: a hairline between items (`+` sibling) and a margin under each answer.
**Why:** both are relationships between elements, which an inline style cannot express.
**Instead:** a border on every item, which would put a rule above the first one too.
**Detail:** [the demo](/framework/ui/accordion/).

## The summary keeps its marker

**Decided:** the summary stays `display: list-item`, so the browser draws the disclosure triangle.
**Why:** the triangle is free, accessible, and turns on open with no code.
**Instead:** a flex summary for a badge at the far end. It removes the triangle, so put the flex on an inner `div` when you need both.
**Detail:** [the markers demo](/framework/ui/accordion/markers/).

## Deliberately not built

**Decided:** no animation, no nesting, no remembering the open panel across a reload.
**Why:** a height transition needs its own stylesheet (`interpolate-size`). Nesting reads as a file tree, which [Sidebar](/framework/core/Sidebar/) already is. Remembered state would need storage, and the markup is rebuilt on reload.
**Instead:** for animation, a separate stylesheet; for nesting, Sidebar; for memory, store the open name yourself.
**Detail:** [the demo's "deliberately doesn't do" section](/framework/ui/accordion/).
