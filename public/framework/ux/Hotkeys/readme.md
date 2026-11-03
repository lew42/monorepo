# Hotkeys — one flat list of every hotkey in the app, filterable, rebindable

[See it live](/framework/ux/Hotkeys/) — the rows below are the real settings UI, not a
picture of it.

A hotkey is either a keyboard key or a mouse button — the owner's own hotkey is his mouse's
thumb button, so a mouse button is just as real a binding as a key, never a special case bolted
on afterward. There is no nested "scope" to open first (no per-panel hotkeys, unlike Blender) —
every action lives in this one list, which is exactly what the owner asked for:
[`doc/decisions.md`](./doc/decisions/) has his own words.

## How a module registers its own action

`ux/Hotkeys` never imports the module that owns an action. Each module registers itself, once,
at the top of its own file:

```js
import Hotkeys from "/framework/ux/Hotkeys/Hotkeys.js";

Hotkeys.register("dictate.push", { label: "Push to talk", default: { type: "button", button: 4 } });

Hotkeys.on("dictate.push", "down", () => start());   // pressed
Hotkeys.on("dictate.push", "up",   () => stop());    // released
```

- `default` is either `{ type: "key", code }` (a `KeyboardEvent.code`, e.g. `"AltRight"`) or
  `{ type: "button", button }` (a `MouseEvent.button`, e.g. `4` is the mouse's forward button,
  `3` is back).
- A key binding can also name modifiers held down: `{ type: "key", code: "KeyM", ctrlKey: true,
  shiftKey: true }` is Ctrl+Shift+M. Any of `ctrlKey`/`shiftKey`/`altKey`/`metaKey` left out
  means that modifier must be UP — a bare `"KeyM"` and the Ctrl+Shift+M one above are two
  separate, non-overlapping bindings, never one firing for the other —
  [`doc/decisions.md`](./doc/decisions/).
- `Hotkeys.bind(name, binding)` saves a new binding, overriding the default — that's what the
  settings UI calls once the owner presses something else. It's remembered per browser.
- `Hotkeys.binding(name)` reads the binding actually in effect right now (the owner's own choice,
  or the default if he never touched it).

## Where the settings UI lives

`row.js` exports one function, `hotkeys_section()` — a plain text filter, then one row per
registered action with its current binding and a "press a key or button…" button. It draws
itself with `dev/DevBar/parts.js`'s `section`/`row`, so it looks like every other settings block
on the site. This page (`page.js`) shows it running live. The next task wires this same function
into the drawer's Settings tab — see that task's own log for the exact spot.

## Watch out

- **Held down fires "down" once, not a flood.** A keyboard auto-repeats `keydown` while a key is
  held; `Hotkeys` drops every repeat (`e.repeat`) so a subscriber's `"down"` fires exactly once
  per real press — [`doc/decisions.md`](./doc/decisions/).
- **The mouse's back/forward buttons never navigate the browser away**, bound or not —
  `mousedown`/`mouseup`/`auxclick` on buttons 3 and 4 always call `preventDefault()` —
  [`doc/decisions.md`](./doc/decisions/).

## More

- [Overview](/framework/ux/Hotkeys/) — the live settings UI
- [`doc/decisions.md`](/framework/ux/Hotkeys/doc/decisions/) — why no nested scopes, why a mouse
  button is first-class, the traps hit building this
- Files: `Hotkeys.js` (the manager, all static methods) · `row.js` (`hotkeys_section()`, the UI)
  · `page.js` (this page)
- [`ux/`](/framework/ux/) — the tier · [`dev/DevBar/parts.js`](/framework/dev/) — the
  `section`/`row` vocabulary this borrows
