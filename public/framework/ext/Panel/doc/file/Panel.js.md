## Panel.js

The one class the whole module turns on: `Panel extends Item`. A `Panel` with
items is a split, keyed by `data.dir`; a `Panel` with no items is a leaf that
renders `data.template`. Everything else in the directory — the recursive
view, the drag handler, the persistence — reads or mutates one of these
trees; the tree itself changes only through `divide()` and `close()`.

## `get()` reads through to statics

`get(key)` returns `this.data[key] ?? Panel.defaults[key]`. Defaults live on
the class rather than being stamped into `data` at construction, so
`toJSON()` (via `Item`) only ever serializes what somebody actually chose —
see [Decisions](/framework/ext/Panel/docs/decisions/) for the alternative that was rejected.

## `divide()` reads its parent instead of taking a mode

`divide(dir, made, before)` asks whether my parent already runs `dir`. If it
does, `made` becomes a new sibling. If it doesn't, **I** become the split:
a fresh `Panel` receives my content (`data`, `draw`) and my children move
down to it, then `made` lands beside it. One verb, no separate "add a
column" concept — clicking the same split icon twice is this function
called twice, and the second call finds a parent that already agrees with
it.

⚠ `draw` is an **instance property** (what `panel(fn)` hands a leaf), not
part of `data`, so it does not travel through the constructor's `data` copy
in the "I become the split" branch — it is moved by hand (`mine.draw =
this.draw`, then `delete this.draw`).

⚠ **A drop onto the edge you are already beside is a no-op, and has to say so.**
The same-axis branch works out the insertion ref *before* `move()` detaches the
arrival, so when that ref **is** the arrival, `List.insert_before` finds
`indexOf === -1` and pushes it to the far end. Proven: row `[A B C]`, drag `B`
onto `A`'s right edge, and you got `[A C B]` — a drop that meant "leave it
where it is" moved the panel two places. The guard is one comparison:

```js Panel.js
const ref = before ? this : kids[kids.indexOf(this) + 1] ?? null;
return ref === made ? made : made.move(up, ref);
```

## `close()` and `absorb()` are the demotion pair

`close()` removes `this` and, if that leaves its parent holding exactly one
child, calls `absorb()` on the parent — a container holding one child is not
a split any more. `absorb()` pulls that only child's content and children up
into `this` and discards the child. Together they are the exact inverse of
`divide()`'s "I become the split" branch.

⚠ **Focus rides the survivor's content, not its id.** The absorbed child's id
leaves the tree while everything the user can see moves up one level — so
workspace.js's "focus clears when its panel leaves" listener fired on a panel
that never left the screen, and closing a panel's *sibling* silently dropped the
inspector's target. `absorb()` hands focus to the parent now wearing that data,
before the remove that would find it gone:

```js Panel.js
const root = this.root();
if (root.focus === only.id) root.focus = this.id;
```

This is the one place `Panel` reads a property `workspace.js` owns; it is here
because this is the only moment an id is destroyed while its content survives.
`divide()`'s mirror — the focused leaf *becomes* the split — keeps the recorded
verdict and is left alone.

## Improvements

1. **None of the four verbs (`get`, `leaf`, `divide`, `close`) has a doc page
   that shows a worked-through tree diagram.** The prose above and the
   readme both describe the two branches of `divide()` in words; a small
   before/after ASCII or SVG tree would make the "I become the split" branch
   click faster than another paragraph. *(simple, useful)*
2. **`Panel.defaults` is a plain object literal at module scope, not close to
   `get()`.** It reads fine today at 68 lines, but if the file grows, moving
   the two next to each other removes a scroll. *(simple, speculative — not
   worth it at the current size)*
