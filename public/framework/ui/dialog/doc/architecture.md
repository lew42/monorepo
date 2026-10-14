# Dialog architecture — the browser is the component, the CSS is the trap

Dialog is not a class: it is the native `<dialog>` element, opened with `showModal()`. The module's only code is [`dialog.js`](/framework/ui/dialog/dialog.js), which fixes three silent CSS traps. The demos are in [`page.js`](/framework/ui/dialog/page.js).

## Use the native `<dialog>`, not a div

**Decided:** a modal is `el.c("dialog", …)` opened with `showModal()`.
**Why:** `showModal()` gives a focus trap, Esc to close, a `::backdrop` dim and top-layer stacking for free. A div modal must rebuild each of those, usually wrongly.
**Instead:** a div-based modal, dropped because it re-implements the whole browser feature. Record: [ui/doc/record.md](/framework/ui/doc/record.md).

## No `ui.dialog()` factory

**Decided:** there is no `dialog` helper; callers use `el.c("dialog", …)`.
**Why:** a wrapper around `el.c("dialog")` adds nothing, and its own `.c()` form put the class on the `<dialog>` itself, re-arming the display trap below.
**Instead:** a named factory, rejected for the reason above.

## No layout class on the `<dialog>`

**Decided:** layout (`flex v gap`) goes on an inner `div`; the `<dialog>` carries only the surface and `ui-dialog`.
**Why:** the UA rule `dialog:not([open]) { display: none }` loses to any author `display` at any layer. A layout class keeps a closed dialog on screen, invisibly eating clicks. Found by a timed-out click, not an error.
**Instead:** a `display` class on the dialog itself, which only works while it is open and breaks the closed state. Measured in [ui/doc/record.md](/framework/ui/doc/record.md).

## Restate the ink colour

**Decided:** `.ui-dialog { color: var(--ink) }` in `@layer theme`.
**Why:** the UA sets `color: CanvasText` on dialogs, which blocks inheritance, so a themed page shows black text in dark mode.
**Instead:** rely on inheritance, which the UA blocks.

## Restate `margin: auto` in `@layer util`

**Decided:** `.ui-dialog { margin: auto }` is declared again in `@layer util`.
**Why:** `margin: auto` is the UA's centring, and `.flex > * { margin: 0 }` erases it when a dialog sits in a flex column. The later layer wins that argument.
**Instead:** a centring transform, which is more CSS for the same result.

## Forms close themselves: `method="dialog"`

**Decided:** a confirm that needs no logic uses `<form method="dialog">`; the caller reads `$dialog.el.returnValue` in a `close` listener.
**Why:** submitting closes the dialog and sets `returnValue` from the submitter's `value`, so no click handler is needed per button. `formnovalidate` on Cancel lets it out past required fields.
**Instead:** a click listener per button, which works but repeats code. Demo: [`/framework/ui/dialog/form`](/framework/ui/dialog/form/).

## Open-state demo is drawn, not shown

**Decided:** the `opened` demo draws what `showModal()` shows, inline.
**Why:** a closed `<dialog>` renders nothing, so a rail card or preview must draw the open state to be seen.
**Instead:** a real screenshot, which goes stale.

## More

- [Overview](/framework/ui/dialog/) — the confirm demo, the form variant, the opened-state variant
- [ui/doc/record.md](/framework/ui/doc/record.md) — the measurements behind the CSS traps
- Files: [`dialog.js`](/framework/ui/dialog/dialog.js) (the three CSS fixes), [`page.js`](/framework/ui/dialog/page.js) (show, don't tell)
