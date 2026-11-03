Holds a member's function **without calling it** — the function value itself,
never its return value.

## Why not `subject.prototype[name]`

Reading a property executes a getter. `App.loaded` builds a `Promise.all`;
read directly off a bare prototype, where the instance state it expects
doesn't exist, and it throws before `toString()` is ever reached.
`Object.getOwnPropertyDescriptor` is the only way to hold an accessor's
*function* rather than its result — this reads `.value ?? .get ?? .set` off
the descriptor instead of touching the property.

## Generalized today, for `ext/Doc`

Until 2026-08-15 this took a **class**. It now takes any `subject`: a class
(prototype first, then statics), a function with properties (`md.file`), or
a plain namespace object (`is.arr`) — `subject.prototype && …` is guarded
because a plain object has no `.prototype`, and
`getOwnPropertyDescriptor(undefined, name)` throws. One lookup covers all
three, which is what let [`ext/Doc`](/framework/ext/Doc/) drop its
class-only assumption in the same pass.

## Used by

`Doc.api()` in [`Doc.js`](/framework/ext/Doc/files/) — one caller today,
because it is brand new. Every method page on every `Doc`-based module in the
framework (this one included) is `member()` finding the real, running
function.
