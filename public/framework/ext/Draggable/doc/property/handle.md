The element that starts a drag. Defaults to `view` (`initialize()`, Draggable.js:13).
Pass a narrower `View` to make only part of the node a grip — `Sortable`'s `$bar`
in this module's own demo (`page.js`'s `node()`) — or pass **`handle: false`** to
register a pure drop target with nothing to pick it up by.

**Usage** — read once, in `initialize()`, to decide whether to attach any
listeners at all: `if (!this.handle) return;` (Draggable.js:16) is the entire
implementation of a handle-less, drop-only instance.

⚠ **`handle: false`, not `handle: null`.** `??=` fills in `null` and `undefined`
alike, so a `null` handle silently becomes `this.view` and the column you meant
as drop-only grows a grip.
