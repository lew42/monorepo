An optional extra class for this view, added at construction.

**Usage** — read once, by `classify()` (`View.js:54`), which adds it as a CSS class
after the class-name chain and after `classes`. Nothing in `framework/` sets it on a
plain `View`; the property that matters downstream is `Page.name`, a different
property on a different class.

**Necessity** — marginal. It is a second way to do what `classes` already does, one
class at a time, and it is not split on spaces — so `name: "a b"` adds a class
literally called `a b`.

**Simplicity** — three lines in `classify()` for a property with no caller. The
honest reading is that `classes` covers it and this is a leftover from when a View
carried an identity. Left out of §Proposed only because it costs nothing and
deleting it would be the fourth thing in one edit.

