The "plural arranges, singular draws" guide — the one page in this module that
states the `previews()`/`preview()` split as its own sentence and then proves it
with a two-child demo (`Chart`, with an overridden `preview()`; `Notes`, with
none) inside one live `Gallery`.

## The three depths, side by side

`content(){ this.previews() }`, `content(){ this.walls() }`,
`initialize(){ this.catalog() }` are printed as one three-line code block before
any of them is demoed separately — "same cards, different depth" is a claim best
made in one glance, not three separate pages.

## The two warnings are the two traps that recur across the whole site

"Build fresh DOM inside a thumb, never return `this.view`" and "the thumb is
inert, the label is the only real anchor" are both stated here *and* live on
`doc/method/preview_card.md` — deliberately, since a reader who lands on this
guide from a card in the wild should not have to already know to check the API
tab for the warning that explains why their override broke.

## Improvements

1. **No `doc/file/previews/page.js.md` existed.** *(simple, important — done in
   this pass.)*
