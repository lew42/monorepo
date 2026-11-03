# reverse

Boolean, falsy by default. Adds the `.reverse` class
(`this.ac(this.reverse && "reverse")`, `Timeline.js:38`), which flips every
top-level item's positioning to the opposite inset — `right`/`bottom` instead
of `left`/`top` — in both orientations.

Scoped to `.timeline-track > .timeline-item` only. Nested `children` are
positioned inside their own local box, relative to the parent bar's own
`from`, and that box never reads `.reverse` — the parent already flipped
itself, so its interior stays an ordinary top-down/left-to-right layout. See
the readme's Decisions section for why this wasn't done with a `scaleY(-1)`
transform instead (one rule vs. four, but invisible from the file).

The vertical, newest-at-top "AI log rail" shape used `orientation: "v",
reverse: true` together — see `doc/file/ai.js.md`.

## Improvements

Nothing ranked: an 11-character boolean with one call site and a well-tested
CSS scoping rule. No callers set it dynamically, so there's nothing to get
wrong yet.
