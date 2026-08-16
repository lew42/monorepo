# is

Fifteen one-line type checks, all returning booleans, gathered because two call
sites need to agree on the same answer — `View.append()`'s dispatch and
`Page.class.js`'s child normalization both branch on *"is this an array, a
function, a plain object, a promise?"*, and a second copy of that logic is how
the two silently disagree.

```js
import { is } from "/app.js";
// or directly: import is from "/framework/util/is/is.js";
```

Every check has its own page in the [API tab](/framework/util/is/api/) — the
real source, who calls it, and whether it earns its place. This file stays
short on purpose; the table that used to live here is now fifteen pages.

## Used by

Grepped across `public/`, excluding `core/new/` (a proving-ground sandbox) and
this module's own docs:

| check | real callers |
|---|---|
| `is.fn` | [View](/framework/core/View/) `append()` · [Page](/framework/core/Page/) (×3) · [ext/catalog](/framework/ext/catalog/) · [ext/demo](/framework/ext/demo/) |
| `is.def` | [View](/framework/core/View/) — eight call sites |
| `is.str` | [View](/framework/core/View/) · [Page](/framework/core/Page/) |
| `is.arr` | [View](/framework/core/View/) · [Page](/framework/core/Page/) |
| `is.pojo` | [View](/framework/core/View/) · [Page](/framework/core/Page/) |
| `is.obj` | [View](/framework/core/View/) |
| `is.dom` | [View](/framework/core/View/) `append_to()` |
| `is.promise` | [View](/framework/core/View/) `append()` |
| `is.num` `is.bool` `is.undef` `is.class` `is.proto` `is.el` `is.mobile` | none found |

The `alex/` sandbox and a handful of `ai/*/` task demos also call `is.fn` /
`is.def` / `is.arr` on their own copies — real usage, just downstream of the
framework rather than in it. `core/new/1/` imports `source`/`member` but not
`is`.

## Decisions

**Seven checks have zero callers in the framework itself** (table above). The
bar this module sets for itself (`framework/util/page.js`: "two callers that
must agree") isn't met by any of the seven, yet none of them are wrong to
have — each is one line, pure, and the value of the table is that a caller
can guess a name and it exists.

Two are worse than merely unused, and are the actual recommendation:
**`is.proto(Array.prototype)` answers `false`** on the most obvious input
anyone would try ([its trap](/framework/util/is/api/proto/)), and
**`is.mobile()`** is a user-agent sniff, a technique the platform has spent
a decade trying to retire. Delete those two; keep the other five — `is.num`,
`is.bool`, `is.undef`, `is.class`, `is.el` cost one line each and complete a
table whose whole value is completeness. **Not applied** — a recommendation,
not a change; see the audit at `public/framework/audit/modules/util.md`.

## Traps

- **`is.class` does not test for the `class` keyword.** Every ordinary
  function has a `.prototype`, so `is.class(function(){})` is `true` — only
  arrows return `false`. `ext/doc` needed the real question and wrote its own
  stricter check rather than trust this one: [`Doc.is_class`](/framework/ext/doc/api/is_class/).
  Full story on [its page](/framework/util/is/api/class/).
- **`is.num(NaN)` is `true`.** `NaN` really is `typeof "number"`.
- **`is.proto(Array.prototype)` is `false`.** [Full story](/framework/util/is/api/proto/).

## Open

- Should `is.class` be renamed to say what it actually tests (`is.constructable`),
  or should a second, stricter check join it? No caller has needed the
  distinction yet — `Doc.is_class` solved it locally instead of importing this
  module.
