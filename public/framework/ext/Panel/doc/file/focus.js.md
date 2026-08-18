## focus.js

The selection: which panel you last pointed at, and every way that gets given up.
Focus is **not document state** — it rides the root panel as an id, exactly the
way the vocabulary does, and never reaches `toJSON`.

```js focus.js
export const focused = item => { const root = item.root(); return root.find(root.focus); };
```

`view()` writes the `focus` class from `root.focus` on every draw, `focus()`
moves it, and `selection()` installs the three ways it is lost. One panel wears
it; clicking any panel takes it.

## `inspects()` — the entry that reads the selection is never handed it

A template declaring `focus: true` (the `properties` inspector) is the one thing
that reads `focused()`, so `view()`'s click test refuses to focus it — an
inspector clicked into would start inspecting itself.

## Two document events, and an import in neither direction

`panel-focus` says the selection moved, carrying the panel or `null`;
`panel-unfocus` is anyone asking for it back. Both are dispatched on the
**document**, because an `Item` event only reaches something holding the root and
nothing outside a workspace ever does — which is how `tools.js`'s rail and
`ext/DesignTool` follow the selection with no import either way. The full model:
[Focus, and the panel that reads it](/framework/ext/Panel/doc/focus/).

## `selection(root, $root)` — the three ways focus is lost

```js focus.js
root.on("remove", () => queueMicrotask(() => { … }));   // its panel left the tree
listen("keydown", e => { if (e.key === "Escape") drop(); });
listen("panel-unfocus", drop);
```

⚠ **In a microtask**, because `move()` is a remove followed by an insert — a drag
of the focused panel would otherwise unfocus it mid-flight.

⚠ **A click cannot be the toggle.** `view()`'s focus test answers to a click
anywhere in a panel's body, so using what is *inside* a panel would be how you
let go of it. Escape and the event are the two doors out.

⚠ **`listen()` unbinds itself** once `$root` leaves the document: the root
outlives every DOM it draws, so nothing else is ever going to remove them.
