Crosshair mode, as a promise. It resolves to the picked element's **context** —
the object every other part of this feature passes around — or to `null` if you
pressed Escape. The gathering, the readme climb and what a turn is told are all
one topic: [picking](/framework/ext/Ask/doc/picking/).

## It is a promise, so `await` it and carry on

```js
const about = await pick({ app });
if (about) $chip.text(about.label);
```

There is no callback and no event. `Picker.stop()` resolves the promise with
`context(el)` — itself a promise — so the `await` waits for the fetches too, and
what you get back is already complete.

⚠ **DOM built after that `await` needs a callback**, like any other await in this
codebase: `chat()`'s picker does `picked = await pick({ app }); show();`, where
`show()` rebuilds inside `$chip.empty(() => …)` and the callback re-establishes the
captor.

## Why it takes `app`

`page_url()` matches the element's nearest `.page` ancestor back to the `Page`
object that rendered it, because the element itself carries no address — core
stamps it `.page` and `.page--<name>` and nothing more. Walking `app.root` is how
it finds the object, and the object has the real `url`.

`window.app` is the fallback, and it is safe here only because a pick always
happens long after boot. Pass the app you have (`this.app` in a page, the arg the
dev rail is handed) rather than relying on it.

## The picker's own chrome is not pickable

`Picker.prototype.skip` is `".ask-pick-ui, .chat"` — the overlay itself, and the
chat panel you launched from. It is a prototype default, so a caller can replace
it: `pick({ skip: ".ask-pick-ui, .my-panel" })`.
