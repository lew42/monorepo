The module's own doc page — and, being about `demo()`, it's written almost
entirely out of the thing it documents: every example on the page is a live
`demo()` or `demo.stage()` call, not a hand-typed code block describing one.
`new Doc({ subject: demo, methods: "stage exhibit page tree layout app source",
notes: "record", files: "…" })` is the whole config; `content()` is unchanged
from before this pass except for the wrapper it's inside.

## `subject: demo`, not a class

`demo` is a plain function with seven properties hung directly off it
(`demo.stage`, `.exhibit`, `.page`, `.tree`, `.layout`, `.app`, `.source`) — the
same shape `ext/Doc`'s own readme names for `md.file`/`md.details`. `Doc`'s
member lookup checks `subject.prototype` first (empty, since `demo` isn't a
class) and falls back to `subject` itself, which is what makes all seven
resolve with no special-casing.

## Two members can't be reached — `demo.stage.two` and `demo.source.file`

`Doc`'s member lookup is one level deep (`subject[name]`), and both of these
live a level deeper (`demo.stage.two`, `demo.source.file`). Rather than force
them into `methods:` where they'd fail with a console warning, they're
documented inside `doc/method/stage.md` and `doc/method/source.md` — a real
limitation of `Doc`, not a gap in this module, and the audit says so.

## The `⚠ Replaced at runtime` banner will be wrong on all seven member pages

Every one of `demo`'s seven properties is assigned via `demo.stage = (fn) =>
{…}` — a function expression assigned to a *member expression*, which never
gets its name inferred (`demo.stage.name === ""`, confirmed empirically). `Doc`'s
`patched()` check (`fn.name !== name`) reads that as "this was patched at
runtime" for every single one, because none of them were ever named to begin
with. It's a real, verified bug, filed at the top of the audit's
Recommendations rather than fixed here — the fix touches `demo.js`, `exhibit.js`,
`app.js` and `layout.js`, none of which a documentation pass may edit.

## Improvements

1. **See the audit's #1 recommendation** — the false "patched" banner. Not
   this file's bug, but this file is what makes it visible for the first time.
   *(simple, important — fix lives in the definition sites, not here.)*
2. **The Overview reads as one long page rather than a rail of variant
   cards.** The skill's "variants are pages, not a wall" guidance would
   suggest splitting "the box," "the stage," "the exhibit," "the sugars," "the
   app" into sibling pages via `overview:` — genuinely recursive, since
   `demo.page()` exists precisely for this shape. Not done in this pass: the
   existing single page already leads with code before every paragraph and
   reads well in order, and fragmenting it is a bigger call than a doc pass
   should make unasked. Named in the audit as a real option, ranked, not
   applied. *(medium, useful — a design call, not a doc fix.)*
