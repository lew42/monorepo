What can be shown of a property **without running anything**.

Most properties have no honest declaration. An instance field assigned in the
constructor — `this.title`, `this.children` — leaves nothing on the prototype at
all, so this returns `null` and the page is the prose alone. That is the correct
answer, not a gap.

Three traps, all silent:

- **⚠ A descriptor, never `subject.prototype[name]`.** Reading an accessor
  *executes* it. `App.get loaded()` builds a `Promise.all` and throws against a bare
  prototype before `toString()` is ever reached.
- **⚠ Intrinsics skip the static fallback.** Every function owns `name`, `length`
  and `prototype`. The fallback answered `name = "View"` — `Function.name` — for a
  documented *instance* property called `name`, and it rendered as a real
  declaration. See [`intrinsic`](/framework/ext/doc/api/intrinsic/).
- **⚠ `subject.prototype` is guarded.** A plain namespace object has none, and
  `getOwnPropertyDescriptor(undefined, name)` throws.

An object or function value returns `null` too: `JSON.stringify` of a function is
`undefined`, and of an object is a wall of nothing anyone wanted to read.
