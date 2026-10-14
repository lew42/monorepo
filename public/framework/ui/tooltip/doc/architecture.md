# Tooltip architecture — the bubble is a stylesheet, not a function

The tooltip is a hover bubble made of three plain spans and one stylesheet. There is no JavaScript and no class: the whole component is [`tooltip.js`](../tooltip.js), a single `css()` block in the `theme` layer. The demo is [`page.js`](../page.js), which prints its own template so the code on the page is the code that ran. Read the [overview](/framework/ui/tooltip/) first.

## The bubble is CSS, not `ui.tooltip()`

**Decided:** a tooltip is markup plus a stylesheet. There is no `ui.tooltip()` helper.
**Why:** the two things that make a tooltip work are a relationship and a state. The bubble is positioned against a positioned ancestor, and it appears on `:hover`. An inline class or style can only describe the element it sits on, so neither can be written there.
**Instead:** a `ui.tooltip()` factory that wraps two spans in a span. It would only hide the selectors that do the work.
**Detail:** [the page's "Where the line actually is" section](/framework/ui/tooltip/)

## One selector list for pointer and keyboard

**Decided:** `:hover`, `:focus-visible` and `.shown` open the bubble from a single selector list in `tooltip.js`.
**Why:** a keyboard user and a mouse user must see the same thing. Keeping them in one list means the two paths cannot drift apart. `.shown` lets a screenshot test hold the bubble open.
**Instead:** separate rules for hover and focus. They drift, and the keyboard path is the one nobody checks.
**Detail:** the `tabindex="0"` on the trigger is what makes the focus path exist at all; see the [held-open demo](/framework/ui/tooltip/shown/).

## Hidden with both `opacity` and `visibility`

**Decided:** a closed bubble sets `opacity: 0` and `visibility: hidden`.
**Why:** opacity alone leaves an invisible box that still takes hit tests. It swallows clicks meant for the line above.
**Instead:** opacity only, which is simpler and wrong.

## Colours are the inverted theme pair

**Decided:** the bubble is `background: var(--ink)` with `color: var(--surface)`.
**Why:** the theme already guarantees contrast between those two tokens, so the bubble stays readable in light and dark mode without a literal colour. A component may not name a literal colour.
**Instead:** `color: white` over `var(--bg)`. It read fine in light mode and sat two shades off the page in dark mode.

## The bubble is clipped by any `overflow: hidden` ancestor

**Decided:** the bubble is out of flow, so it is not a layout child and it will be cut off by a clipping ancestor.
**Why:** the bubble has to float over neighbouring text, which only out-of-flow positioning allows.
**Watch out:** a stage or demo box that clips will hide a tooltip at the very top edge. The template in `page.js` wraps itself in `pad` for this reason.

## The native `title` is rung one

**Decided:** when the design does not insist on a styled bubble, use the `title` attribute and ship no CSS at all.
**Why:** the browser gives a real tooltip with a delay, keyboard support and no positioning code.
**Instead:** the styled bubble, which costs the stylesheet above. The [native demo](/framework/ui/tooltip/native/) shows the trade.
**Detail:** the [styles ladder](/framework/styles/) places this rung.
