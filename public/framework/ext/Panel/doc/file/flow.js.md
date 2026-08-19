## flow.js

The recorder and its scrubber. One class (`Flow`), one hook (`record`), one view
(`scrubber`) — a workspace's whole history of gestures, replayable, in memory. The topic
doc is [doc/flow.md](../flow.md); this note is the file.

Imports `Item` and `View` and **nothing else in this module**. `workspace.js` reads this
file for its one hook, so this file may never read `workspace.js` back — the same rule
`random.js` follows, and for the same reason: a mutual import breaks only on a deep reload.

## The whole recorder is three listeners and an array

```js flow.js
["change", "add", "remove"].forEach(event => this.root.on(event, () => this.touch()));
```

Not the six verbs. `divide split close absorb sow move` are the ones with names, but a
PanelDrag goes through none of them and a toolbar chip is a bare `set()` — the three
events `mount()` already binds for save and redraw catch every path there is.

⚠ `record()` runs **after** the first `draw()`, so the baseline frame is what a reader
actually sees: `resolve()` rolls every leaf still saying `"random"`, and those adds are
the seed arriving, not a step somebody took.

## A snapshot is a deep copy, and that is not free-hand

```js flow.js
capture(){ return { at: Date.now(), snapshot: JSON.parse(JSON.stringify(this.root)) }; }
```

⚠ `root.toJSON()` hands back the **live** `data` object and the **live** child Items —
it is written to be handed to `JSON.stringify`, not to be kept. A step recorded from it
rewrites itself on the next `set()`, and every frame in the flow reads as the newest one.

## The swap dresses the root; it never replaces it

```js flow.js
[...root.items].forEach(kid => { delete kid.parent; });
root.items.children = [...fresh.items].map(kid => root.items.adopt(kid));
root.data = fresh.data;
return root.emit("add");
```

`mount()`'s listeners, `focus.js`'s selection and the saver all hold the root **object**,
so a replay cannot hand back a different one. Removing the children through
`items.remove()` one at a time would emit a `remove` each — one full workspace redraw per
panel, refetching every lazy template with it — so the swap is silent and pays with a
single `emit("add")`, which is `roll()`'s idiom in `workspace.js`.

## `replaying`, the one flag

`go()` raises it for the whole synchronous swap and lowers it after; `touch()` returns
early while it is up. Everything in between is synchronous — `hydrate`, the swap, the
emit, the redraw it triggers — so a boolean is a real guard here and not a hope.

## `verb(n)` is one clause on purpose

Panels gained or lost, else the first `data` key that reads differently anywhere in the
tree, walked in parallel. It is a **label**, not an operation log: anything cleverer is
the inverse-operation table this design exists not to have. Read on the strip; measured
output for the six-step drive: `+2 panels · +2 panels · display · grow · +12 panels ·
−2 panels`.

## `Flow.mounted`

Every live flow, pruned to roots still in the document. Nothing on a page reads it — a
page holds the workspace it built — it is the door a headless driver opens. ⚠ Several
workspaces share one page (the Doc page has one plus five demo panels) and an SPA keeps
the page you came from mounted, so "the last one" cannot say which is which.

## Improvements

1. **One watcher per flow** (`this.watcher`), because one page mounts one strip beside
   one workspace. A second reader — a page that wanted a filmstrip beside the scrubber —
   needs a list here. *(simple, speculative)*
2. **`burst` is a trailing debounce at 150ms**, so the last step of a session lands 150ms
   after the gesture. Keying on the verb's *end* instead would be exact, but it would mean
   every verb telling the recorder it had finished — six call sites for a step boundary the
   clock already finds. *(measured: 6 gestures → 6 steps.)*
3. **Nothing writes a flow to disk.** `save()` hands back the array; the file format,
   loading one back and playing it as a tour are the next question, not this one.
   *(speculative)*
