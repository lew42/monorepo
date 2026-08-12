**Usage** — 7 live call sites: `framework/ext/demo/demo.js:99,100`,
`framework/ext/demo/responsive.js:69,70`, `framework/ext/layout/layout.js:53`,
`framework/ext/layout/controls.js:28`, and `View.js:388` inside `ctrl()`. Every one
is a UI toggle wired to a click.

**Necessity** — yes, as the *public* toggle. It is not a pure alias for
`toggle_class`: this one splits on spaces and returns `this`, so it chains and
takes a list.

**Simplicity** — the pair is one method too many. `toggle_class` exists only to be
called from here (`View.js:176`); folding its one line into this loop would delete
a member without touching a call site. Proposed in `readme.md`.

