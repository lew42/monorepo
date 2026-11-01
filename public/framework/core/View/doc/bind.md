# `view.bind`: keep a view in step with data (decision D7)

```js
view.bind(item, "title", v => view.text(v))   // fn runs now, then when "title" changes
view.bind(item, "title")                      // no fn: view.text(value)
view.bind(prop, fn)                           // prop: a Property or Property.of(item, key)
const unbind = view.bind(...)                 // call it to let go early
```

## What it does

- Runs `fn` once right away with the current value (so the view is drawn while it is being built).
- Then runs it only when **that key** changes. Another key changing does nothing, not even a frame request.
- **One draw per animation frame per binding.** A burst of 50 `set`s asks for one frame; in it the binding reads the value *then* and draws if it differs from what it last drew. Reads stay immediate.
- A throwing `fn` is logged with `console.error` and nothing else stops: not the other bindings, not the save.
- A plain `Property` (never saved: hover, selection) binds the same way as a key of an Item.

## Letting go

`View.remove()` unbinds the view and every bound view inside its element; `View.empty()` unbinds the views inside (not itself). So a view that redraws its children with `empty(...)` leaks nothing. A draw already queued when the view leaves does not run.

How: `bind` marks its element (`el._bound_view`) and counts bound views in `View.bound_count`; `remove()`/`empty()` return at once when the count is 0, otherwise walk the element's subtree. There is **no child list**: View deliberately has no tree of its own ([method/remove.md](./method/remove.md)).

## Caveats

- Only `remove()` / `empty()` release a binding. A view whose element is taken off the page another way (`el.remove()`, `innerHTML = ""`, a parent's raw DOM edit) keeps its listener until its item is dropped.
- A removed view is done: removing it unbinds, and putting its element back does not re-bind.
- `fn` receives the value read at the frame, never the event's. An Item's `change` bubbles up from its children, so a child's change of the same key also wakes a parent's binding; the value check means the parent only redraws if its own value differs.
- `fn` runs with `this` = the view. Between a change and the next frame the DOM still shows the old value (one frame, about 16 ms; a hidden tab waits until it is visible).
- `View.frame(cb)` is the scheduler (`requestAnimationFrame`, or a 16 ms timeout where there is none). Tests replace it with a queue.

## Not taken

- **`item.on("change")` by hand** (today): every view repeats the wiring and forgets the unwire.
- **A `children` list on View** to cascade removal: it would put a Set on every view for a feature few use, and contradict "no tree of its own". The DOM walk costs nothing until something is bound.
- **A registry of every bound view** (`Set<View>`): simple, but it keeps views that are dropped without `remove()` alive forever. The element mark is garbage-collected with the element.
- **Signals, `item.props`**: see research D7. `bind` rides on `Property.of`, so either could still come later.

Test: [`bind.test.mjs`](/framework/core/Test/view/?file=core/View/bind.test.mjs) (node, with a stand-in `document` and a hand-flushed frame queue; the same file opens on the test page). Worked example: the model / effort / cost line in `ai/AISession/AISessionDetail.js`.
