This module's own page: a `Doc` over `subject: View`, all 41 methods and all 10
properties named for the API tab, `capturing` and `lifecycle` as the two Docs-tab
notes, and an Overview built from six inline `demo()` calls.

## Six demos, one ladder

Each demo is `demo(fn, caption)` — code above, live render, caption below — and
together they climb from the smallest possible example to the one idea worth
remembering:

1. call a tag, get an element
2. pass a **function**, its output nests inside
3. `.c()` — classes first, then children
4. every method returns the view, so they chain; `this` inside a handler *is* the
   view
5. data in, DOM out — a plain `forEach`, no template language
6. subclass `View`, write `render()` — the class name becomes the CSS class

This is a walkthrough, not a set of variants to compare — which is why it is
inline `content()` rather than an `overview:` rail. A rail earns its keep when a
reader wants two renders side by side (see `core/Page/page.js`'s fourteen tree
shapes); these six are read once, in order.

## The last demo doubles as two members' live example

The `NoteView` subclass is the only demo that shows `classify()`'s class-name
chain and the only one that shows a subclass overriding `render()` — it is not
duplicated on either member's own page, which shows the real source and a caption
instead.

## Improvements

1. **No demo shows `style()`.** It is the second-busiest member in the file
   (roughly as many call sites as `ac`), used for values computed at runtime, and
   a reader skimming only the Overview would never learn it exists. A seventh demo
   — a computed width or colour — would close the gap. *(medium, useful)*
2. **The rail is worth reconsidering once the module has more than one long
   walkthrough to offer.** Today six sequential demos are correctly inline rather
   than in `overview:` — see the section above — but that verdict is about *these*
   six, not a rule against ever adding one here. *(speculative, later)*
