**Usage** — one live caller: `framework/core/Sidebar/Sidebar.js:40`.

**Necessity** — one caller's sugar, and the caller could write
`this.hc("open") ? … ` instead. It survives because visibility is the one piece of
state a component toggles without a class.

**Simplicity** — the trap is worth a line: **it reads the *computed* style**, so a
view already hidden by a stylesheet toggles to *hidden* on the first call, which
looks like nothing happening. Reading the inline `style.display` instead would
make the first call do what a reader expects; reading the computed value is what
makes `toggle()` work on an element that was never touched. Neither is obviously
right, which is the argument for a `.hidden` class instead of all three methods.

