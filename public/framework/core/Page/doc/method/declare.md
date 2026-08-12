Turn whatever `children:` was into one Map.

**Usage** — one caller: the constructor (`Page.class.js:10`). `ext/classdoc` reads
`options.children` with the same splitting rule
(`framework/ext/classdoc/classdoc.js:114`) so a declared guide and a generated
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

A non-string entry goes straight to `add()`, which is what makes an inline
`new Page(…)` in the list work. A POJO is `Object.entries()`'d first: the key is
the child's **title**, `Page.slug(key)` its url segment, and a value that is not a
function, string, plain object, `Page` or `null` **throws** — `JS: md("…")` ran
eagerly under the wrong captor, and a silent one is worse than a stack trace.

