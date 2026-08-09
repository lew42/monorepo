**Usage** — 6 live call sites: `framework/ext/demo/demo.js:112,113`,
`framework/ext/demo/responsive.js:58,59`, `framework/ext/layout/layout.js:41`, and
`View.js:388` inside `ctrl()`. Every one is a UI toggle wired to a click.

**Necessity** — yes, as the *public* toggle. It is not a pure alias for
`toggle_class`: this one splits on spaces and returns `this`, so it chains and
takes a list.

**Simplicity** — the pair is one method too many. `toggle_class` exists only to be
called from here (`View.js:175`); folding its one line into this loop would delete
a member without touching a call site. Proposed in `readme.md`.

