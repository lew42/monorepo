**Usage** — `tc(cls, force)`. `cls` still splits on spaces and toggles each
independently; `force` is optional. Every live call site in `framework/`
(`ext/demo/stage.js`, `ext/layout/controls.js`, `ux/Tree/Tree.js`,
`ext/Panel/seam.js`, `ext/Panel/grip.js`, `View.js`'s own `ctrl()`, …) is a
UI toggle wired to a click, and none of them pass `force` today.

**Necessity** — yes, as the *public* toggle. It is not a pure alias for
`toggle_class`: this one splits on spaces and returns `this`, so it chains and
takes a list.

**`force`** — omitted, each class flips (today's behavior, unchanged). `true`
adds every class; `false` removes every class — native `classList.toggle(c, force)`
is prior art. An equal-value set (adding a class already there, or removing one
already gone) still returns `this`, since `ac`/`rc` are unconditional.

**Simplicity** — the pair is one method too many. `toggle_class` exists only to be
called from here (`View.js:151`); folding its one line into this loop would delete
a member without touching a call site. Proposed in `readme.md`.

