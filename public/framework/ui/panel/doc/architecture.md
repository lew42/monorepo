# Panel architecture — a template and three rules, not a component

Panel is a titled box: a header row, a body and a footer row on a surface. It has no class and no JavaScript. The module is two files: [`panel.js`](../panel.js) holds the three rules as CSS, and [`page.js`](../page.js) holds the template that is both shown on the page and printed as its source. Copy the markup; the rules do the rest.

## A template, not a `ui.panel()` function

**Decided:** a panel is markup you copy from [`page.js`](../page.js). There is no `ui.panel()` helper.
**Why:** the earlier helper took three slots by position (`panel(null, body, foot)`). Leaving a slot out meant getting the arguments backwards, and the one page that wanted a panel wrote its own anyway.
**Instead:** a helper with positional slots (rejected, above) or named options (more API for three rows of markup).
**Detail:** [ui decisions](/framework/ui/doc/decisions.md) — the template tier.

## Hairlines sit on the rows, not between them

**Decided:** the header draws its bottom border and the footer its top border (`.ui-panel-head`, `.ui-panel-foot` in [`panel.js`](../panel.js)). The body has none.
**Why:** a panel with no header then has no line drawing to nowhere. Omitting the header removes its rule with it.
**Instead:** a divider element between rows, which would need its own removal when a row is dropped.
**Detail:** [ui record](/framework/ui/doc/record.md).

## The raised shadow mixes the ink token

**Decided:** `.ui-panel.raised` uses `color-mix(in srgb, var(--ink) 14%, transparent)`, not an `rgba()` literal.
**Why:** a literal black shadow is invisible on a dark surface and too heavy on a light one. The ink token scales with whatever the theme calls contrast.
**Instead:** a fixed `rgba(0,0,0,0.14)` (rejected: it breaks on one of the two themes).
**Detail:** the note on the `raised` demo in [`page.js`](../page.js). `raised` is a variant, not the default, because most panels sit on a page rather than above one.

## Action rows use `reverse`, not `flex-end`

**Decided:** the footer is `flex gap reverse`, which is `flex-direction: row-reverse`. The primary action sits at the far end.
**Why:** the utility set has `h-center` and `split` but no end alignment, and `reverse` gets the right-aligned row with the gap intact.
**Instead:** `justify-content: flex-end` on the footer, which is one inline declaration. Use it where the DOM order matters.
**⚠ trade-off:** `row-reverse` also reverses the DOM order, so the primary button is first in the source and in the tab order. That suits a confirm dialog. A wizard's *Back / Next* row should use `flex-end` instead.
**Detail:** [ui record](/framework/ui/doc/record.md) (the `reverse` section); the utility itself is `.flex.reverse` in [`framework.css`](/framework/framework.css).

## Not a modal

**Decided:** a panel has no backdrop, no focus trap and no `<dialog>`.
**Why:** a panel is a surface made of a header, a body, a footer and two hairlines. Modal behaviour belongs to a different component.
**Instead:** putting the modal behaviour in the panel, which would make every panel carry a trap it may not need.
**Detail:** [Dialog](/framework/ui/dialog/) is the modal, and it uses the browser's own `<dialog>`.

## Each part pads itself: this module is the frame

**Decided (card merge 8, 2026-10-19):** a **frame** is a `.surface` whose parts touch its edge, and the parts are this module's `.ui-panel-head`, `.ui-panel-body` and `.ui-panel-foot`. Each pads its own inline edge by `--pad-card` (head and foot `0.6em` above and below), so the words in all three line up; the surface itself pads nothing.
**Why:** a box that wore `pad` on every part measured 129px tall for the same words that take 117px with the parts padding themselves, and two boxes drawn the same way (a dialog, a dashboard column) can now share the rules. The name and home call is in [the merge plan](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/card-merge-frames/plan.md).
**Instead:** a new `ux/Frame` with `.ux-frame` (rejected: every rule and the page already live here, so it would be a second name for the same three rows).
