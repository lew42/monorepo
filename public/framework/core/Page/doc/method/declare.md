Turn whatever `children:` was into one Map.

**Usage** — one caller: the constructor (`Page.class.js:10`). `ext/Doc` reads
`options.children` with the same splitting rule
(`framework/ext/Doc/Doc.js:114`) so a declared guide and a generated
member page join one rail.

**Necessity** — yes. It is what lets `children: "intro guide api"`,
`children: [somePage]` and `children: { HTML(){ … } }` be the same declaration.

**Simplicity** — right-sized, and the Map is the good part:

> **One Map, in declaration order.** `undefined` = not mine, `null` = declared but
> not resolved, a `Page` = here. Three states, one lookup, and `child()`'s whole
> policy falls out of them.

The one thing a reader should brace for: **the property changes type.** You write
`children: "a b"` and read back a `Map`. That is deliberate — two names for one
thing would be worse — but it means `this.children.length` is `undefined` and
`[...this.children.keys()]` is the idiom everywhere.

A non-array entry (a `Page`, or an options object) goes straight to `add()`,
keyed by `name` if it has one, else `Page.slug(title)` — the same derivation the
array-pair branch below uses, so an inline `{ title: "X", content(){…} }` in an
array lands at `…/x/` with no `name:` line. Two entries deriving the same name
**warn**, on `log_label()`, rather than silently swallowing the earlier one —
the bug this branch had until 2026-08-15 (`ext/Timeline`'s two-card `overview:`
rendered one card, no error).

A top-level POJO is `Object.entries()`'d first: the key is the child's
**title**, `Page.slug(key)` its url segment, and a value that is not a
function, string, plain object, `Page` or `null` **throws** — `JS: md("…")` ran
eagerly under the wrong captor, and a silent one is worse than a stack trace.

