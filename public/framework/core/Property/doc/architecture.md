# Property architecture — one live value, one event

Property is a simple event-emitting value container. Main class: [`Property`](../Property.js). Two variants: `Property.Map` for template binding layers, `Property.Of` for mirroring Item keys. All three emit only on actual change (uses `Object.is`).

## Bind fires immediately, then on change

**Decided:** `bind(fn)` calls `fn` with the current value before returning, then calls it again on every `change` event.

**Why:** a template can set up its view with the current state in one go; no separate "render" step.

**Instead:** lazy binding (call only on change; caller must call `fn()` first) wastes the setup step; eager-only (always fire) breaks unbind ordering.

## No bubbling — Property is opt-in

**Decided:** Property never bubbles into its Item; only keys that are explicitly bound become live.

**Why:** unbound keys cost nothing, while bubbling would add a listener to every change and blur which key changed.

**Instead:** bubble by default (simpler to sketch, too noisy), or a ripple flag (adds branching).

## Emit only on actual change

**Decided:** `set(v)` only emits if the new value is not `Object.is()`-equal to the old one.

**Why:** templates don't redraw redundantly; setters can be called on every input without cost.

**Instead:** always emit (simpler, but broken on every keystroke); a silent flag (special case).

## Map uses fallthrough inheritance, not copies

**Decided:** `Property.Map` chains `Object.create` layers; each layer inherits from the layer below. A Property on a layer is created lazily when something writes and rebinds.

**Why:** templates clone and override without copying the whole tree; a write to an inherited bound value gives the layer its own Property ("rebind").

**Instead:** copy values eagerly (breaks shared updates); a lookup table (slower, more memory).

## Property.Of listens only while bound

**Decided:** `Property.Of` mirrors one key of an Item. It listens to the Item only while it has listeners of its own; the first `on` subscribes, the last `off` unsubscribes.

**Why:** the item can have many mirrors; keeping them silent until someone reads saves memory.

**Instead:** always listen (easier, wasteful); never listen (caller must poll).

## Detail

See [`core/Page/doc/templates.md`](/framework/core/Page/doc/templates.md) for binding and [`core/Page/doc/binding.md`](/framework/core/Page/doc/binding.md) for measurements on 1,000 rows.
