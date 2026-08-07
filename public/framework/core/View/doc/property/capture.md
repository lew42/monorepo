Whether this view hands itself to the current captor when constructed.

`true` on View's **prototype** — not a class field, which would shadow whatever a
subclass declared. Pass `{ capture: false }` to build something that must stay
out of the tree it is built inside: `View.stylesheet()` does exactly that for its
`<link>`, so importing a module mid-capture cannot drop a stylesheet into the
page.

⚠ Like everything `prerender()` reads, it is read inside `super()` — a subclass
class field `capture = false` initializes too late to be seen. A constructor
argument or a prototype assignment, never a field.
