# Dialog — the native `<dialog>` element as a modal; the browser does the work, this module fixes three CSS traps

## Use

```js
const $dialog = el.c("dialog", "ui-dialog surface pad", () => { /* content, incl. a close button */ });
button("Open").click(() => $dialog.el.showModal());
```

## Watch out

- Never put a layout class on the `<dialog>` itself — the browser hides a closed one with `dialog:not([open]) { display: none }`, and an author rule at any layer beats that, so a layout class keeps a "closed" dialog on screen, invisibly eating clicks. Put `flex v gap` on an inner `div` instead.
- The UA sets `color: CanvasText`, blocking the theme's ink in dark mode — `dialog.js` restates it.
- `margin: auto` is the browser's own centring; `.flex > * { margin: 0 }` erases it the moment a dialog sits in a flex column, so `dialog.js` restates that too, in `@layer util`.
- There is no `ui.dialog()` — wrapping `el.c("dialog", …)` re-creates the class-on-the-dialog trap it would exist to avoid. `<form method="dialog">` closes the dialog on submit with no listener at all; read `$dialog.el.returnValue` in a `close` listener either way.

## More

- [Overview](/framework/ui/dialog/) — the confirm demo, the form variant, the opened-state variant
- Files: `dialog.js` (the three CSS fixes), `page.js` (show, don't tell)
