Fills in the one default (`handle ??= this.view`) and registers the instance —
**every** instance, grip or drop-only — in `Draggable.registry` before anything
else happens.

**The early return is the whole of `handle: false`.** `if (!this.handle) return;`
skips listener setup entirely, so a drop-only instance can be found by `under()`
but never starts a drag of its own.

⚠ **Own bound references, not `view.on()`.** The DOM removes a listener by
identity, and `on()` registers a wrapper arrow nothing outside it can name again
— so `this.handlers` holds the actual functions `destroy()` later removes.
