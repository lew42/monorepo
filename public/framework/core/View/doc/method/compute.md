**Usage** — **zero call sites in `public/`.** Not the framework, not an ext, not a
sandbox, not a doc page.

**Necessity** — no. `getComputedStyle(view.el)` is the same length and says more.

**Simplicity** — one line, correctly written, and unearned: `View` wraps the
element rather than hiding it, so reaching through `.el` for a DOM API with no
framework meaning is the *intended* move, not a fallback. Adding a method per DOM
call is how a wrapper becomes a facade. Delete.

