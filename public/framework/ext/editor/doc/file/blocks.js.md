The palette: 38 lines, five `Item` subclasses and the registry that lets them
survive a reload. `Block` carries a `words` class string and, if it is a leaf, a
`text` string — both live in `data`, so both serialize, undo and reload with the
rest of the document.

## A block is data, not a component

The readme's own verdict: `words` is a plain class string, so the utility
vocabulary already used across the whole site *is* the block's design, and the
properties panel in `page.js` is `ext/layout`'s existing word registry rather than
a second, parallel one built for this module.

## `leaf()` is one question, not a flag

`data.text !== undefined` — a leaf carries text, a container carries blocks. The
canvas asks this once per node and only a non-leaf is given `$items`, so nothing
can be dropped into a sentence.

## ⚠ Prototype assignment, not class fields

`Section.prototype.words = "…"` runs after the class body, and `Block`'s
constructor reads `this.words` *inside* `super()` — a class field
(`words = "…"` on `Section`) would not exist yet when that constructor ran. Same
trap as `classify()` in `core/View`.

## ⚠ The last line is a side effect the editor depends on

`Item.register(Class, name)` for all five, keyed by their wire name. `page.js`
imports this file only for that line to run — an unregistered type hydrates as a
plain `Item`, preserved on reload but stripped of its behavior, and nothing
warns beyond `Item`'s own "unknown type" path.

## Improvements

1. **`Grid` and `Card` are declared but the palette never demonstrates nesting a
   `Grid`.** Both exist, both register, neither has a place in the demo that shows
   what they're for. *(simple, useful)*
2. **The five classes are otherwise identical** (`extends Block {}`) but for their
   `words`/`text` — a data-driven palette (an array of `{ name, words, text }`)
   would remove four trivial class declarations without losing anything `Item`
   needs. Weighed against: five real exported names read better in an import list
   than five entries in an array literal. *(medium, speculative)*
