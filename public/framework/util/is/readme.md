# is

Type-checking helpers. All return booleans.

```js
import is from "/framework/util/is/is.js";
// or, on a site whose app.js re-exports the framework
import { is } from "/app.js";
```

## Helpers

| helper | returns true when |
|--------|------------------|
| `is.arr(v)` | `Array.isArray(v)` |
| `is.obj(v)` | truthy, typeof "object", not an array |
| `is.str(v)` | typeof "string" (empty string → true) |
| `is.num(v)` | typeof "number" (NaN and Infinity → true) |
| `is.bool(v)` | exactly `true` or `false` |
| `is.fn(v)` | typeof "function" (classes → true) |
| `is.def(v)` | not undefined (null → true, it's a value) |
| `is.undef(v)` | exactly undefined |
| `is.class(v)` | constructable function (has prototype); false for arrows |
| `is.pojo(v)` | plain object literal — constructor === Object |
| `is.proto(v)` | is a constructor's `.prototype` object |
| `is.promise(v)` | duck-typed thenable |
| `is.dom(v)` | has nodeType > 0 (browser only) |
| `is.el(v)` | has nodeType === 1 (browser only) |
| `is.mobile()` | mobile user-agent check (browser only) |

## Edge cases worth knowing

- `is.num(NaN)` → **true** — NaN is typeof "number" in JS. Use `Number.isNaN()` if you need to exclude it.
- `is.obj(new Date())` → **true** — anything non-null, non-array, typeof "object" qualifies.
- `is.class(function() {})` → **true** — regular functions are constructable. Only arrow functions return false.
- `is.pojo(Object.create(null))` → **false** — no constructor means `constructor !== Object`.
- `is.def(null)` → **true** — null is a defined value (typeof "object", not undefined).
- `is.proto(Array.prototype)` → **false** — `Array.prototype` is itself an exotic Array, so `is.obj()` returns false for it. Known gap.

## Proposed

Findings from the every-member audit. **Not applied.**

**Seven of the fifteen checks have zero callers.** Counted across all of
`public/`, sandboxes included, excluding `core/new/` and `core/legacy/`:

| used | `is.fn` 12 · `is.def` 9 · `is.arr` 6 · `is.obj` 4 · `is.str` 2 · `is.pojo` 2 · `is.dom` 2 · `is.promise` 1 |
|---|---|
| **unused** | `is.num` · `is.bool` · `is.undef` · `is.class` · `is.proto` · `is.el` · `is.mobile` |

*Options:* (a) keep the set complete — a type-check table with holes in it is
worse than one with spares; (b) delete the seven; (c) delete only the two that
are actively misleading.

*Weighing:* this module's stated bar is **two callers that must agree**
(`framework/util/page.js:20`), and by that bar seven rows fail it and one
(`is.promise`) passes by a single caller. Against that: each is one line, they
are pure, and the whole file is 54 lines — deleting them buys almost nothing in
bytes and costs the property that makes the table useful, which is that you can
guess a name and it exists.

Two of the seven are worse than merely unused. **`is.proto(Array.prototype)` is
`false`** — the readme already records it as a known gap — so the check answers
wrongly on the most obvious input anyone would try. And **`is.mobile()` is a
user-agent sniff**, which the platform has been trying to kill for a decade; a
container query or `pointer: coarse` is the answer to every question it gets
asked.

**Recommendation: (c).** Delete `is.proto` (wrong on `Array.prototype`, no
callers) and `is.mobile` (wrong technique, no callers, browser-only in a file
that is otherwise environment-free). Keep `is.num`, `is.bool`, `is.undef`,
`is.class`, `is.el` — they cost one line each and complete a table whose value
is being complete. Record the deletions in `util/is/page.js`'s table in the same
edit, or the page starts lying.

There was an `is.node.test.js` here. It imported `../../Test/3/Test3.js`, which
does not exist anywhere in the repo, so it threw on import and nothing imported
it — a suite that could never have run and could never have failed. Deleted; every
case it asserted is a row above. If a runner ever lands, this list is the spec.
