What the rail remembers, and the one function (`rail()`) that both the
preset buttons and the drag grip call to actually resize it. One
`LocalStorageSaver` document under the key `lew42-devbar`, replacing what used
to be two raw `localStorage` keys in two different files (with x-ray not
persisted at all).

## One document, so a flurry of writes coalesces

`set()` assigns into the shared `settings` object and calls `saver.save()`
every time — `ext/Saver`'s job, not this file's, is making sure a knob
flipped twice in one frame still writes once. Every persisted value is
either a class on `<html>` or a custom property, which is why `restore()` is
only ever *writing values back*, never reconstructing UI state from scratch.

`tab` is the one exception to that rule: it is a string the rail reads at
render time rather than a class the DOM already carries, because the open tab
decides which sections are *built* and there is nothing to write it onto until
they are. `restore()` therefore does nothing with it — `refresh()` does.

## `restore()` resolves on a microtask — and that's why there's no flash

```js
if (settings.width) rail(settings.width);
```

`saver.load()` for `LocalStorageSaver` settles on a microtask, and
microtasks drain before the browser's first paint. So even though `restore()`
is `async`, the rail is already the right width by the time anything is
visible — no flash of default size correcting itself. Anything that needs
the restored state must chain onto the returned promise rather than assume
it's already settled; reading `settings.width` synchronously right after
`devbar()` is called would race it.

## `rail()` is the one number two different UIs write

Called from `tools.js`'s preset buttons and `grip.js`'s drag handler alike —
see [sizing](/framework/dev/DevBar/doc/sizing/) for the formula and the
floor-clearing side effect.

## Improvements

1. **`rail()` clamps `px` between `MIN` and `innerWidth - MIN`, silently.**
   A caller that asks for an unreachable width gets a different width back
   with no signal beyond the return value — `tools.js` avoids ever calling it
   with one (`sizes()` disables the button first), but the function itself
   doesn't document that its input can be adjusted. *(simple, useful — one
   line in the doc comment would do it.)*
2. **`knob()` stores class names as a flat array (`settings.knobs`)** rather
   than an object map. Correct for the one knob that exists (`dev-outline`);
   the moment a second knob wants to store more than "on/off" (a numeric
   setting, say), this shape stops fitting and nothing here signals the
   boundary. *(simple, speculative — no second knob exists yet.)*
