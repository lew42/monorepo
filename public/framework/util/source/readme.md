# source

Four functions for turning running code into readable text: `source(fn)`,
`member(subject, name)`, `patched(fn, name)`, `dedent(src)`. Every example on
this site and every method page in [`ext/doc`](/framework/ext/doc/) goes
through one of these — the reason they're one file is that two callers
already needed to agree, and a second copy is how they'd have drifted.

```js
import { source, member, patched, dedent } from "/framework/util/source/source.js";
```

Each function has its own page under [API](/framework/util/source/api/): the
real source, who calls it, what bites. This file stays conceptual.

## Why `util/`, not inside `ext/demo`

`demo(fn)` was the first caller and would have been a fine home. The test
that moved it: **two callers that must agree.** `demo(fn)` prints a
function's body above its result; `code.fn(fn)` prints the same body alone.
If they disagreed about where a body starts, the same function would print
two ways on one page. `source` is the precedent [`markup`](/framework/util/markup/)
was later measured against.

## Why examples are functions, not strings

The reason every `demo()` on this site takes a callback instead of a code
string — a function body gets highlighting, completion and syntax errors
from the IDE for free, and `fn.toString()` hands the page exactly the text
the IDE checked. One paragraph version; the cost accepted and the "when not
to" case are in [functions-not-strings](/framework/util/source/docs/functions-not-strings/).

## Used by

| function | caller | for |
|---|---|---|
| `source`, `dedent` | [ext/demo](/framework/ext/demo/) | `demo(fn)`'s code pane |
| `source` | [ext/highlight](/framework/ext/highlight/) | `code.fn(fn)` |
| `member`, `patched`, `dedent` | [ext/doc](/framework/ext/doc/) | every method page's source pane and patch banner |

`core/new/1/` — the proving-ground sandbox, not live framework code — has
its own ~13 call sites importing `source` directly for the same reason:
functions as examples, no build step to keep two copies in sync.

## Decisions

- **One copy, in `util/`, imported by every caller.** Not duplicated per call
  site.
- **`source(fn)` and `member(subject, name)` are two entry points, not one
  function with a flag.** They want genuinely different text — `source()`
  strips the wrapper; `member()` must keep a method's signature line, since
  that's the one thing confirming a reader is looking at the right member.
- **`member()` reads a property descriptor, never `subject[name]`** — reading
  a getter executes it. Generalized today (2026-08-15) from "takes a class"
  to "takes any subject that owns the member" — a class, a function with
  properties (`md.file`), or a plain namespace object (`is.arr`) — for
  `ext/doc`, which needed all three shapes. Full account on
  [member's page](/framework/util/source/api/member/).

## Traps

Each is written up on the function it bites, not restated here:
[dedent's CRLF trap](/framework/util/source/api/dedent/),
[source's arrow-finding trap](/framework/util/source/api/source/),
[patched's blind spot](/framework/util/source/api/patched/).

## Open

None outstanding. The class-only assumption `member()` used to carry is gone;
this file's own `page.js` and [`is/page.js`](/framework/util/is/) both
exercise the plain-namespace-object path immediately, so it isn't
theoretical.
