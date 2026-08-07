# Adoption: `app` arrives on the walk, not at boot

A `Page` is constructed in userland at module scope (`export default new Page(…)`),
so there is no constructor for App to inject into.

- **`add(name, child)`** — the one place `parent` is assigned.
- **`.app`** — assigned in `child()`, on the walk, to the page about to need it.
  Nothing recurses it over the tree at boot.

A Page reads `.app` in exactly two places: `activate()` (for `container()`) and
`go()`. Everything else — `link()`, `preview()`, `previews()`, `render()`,
`chain()`, `naming()` — never touches it.

**The cost:** an eager child you have never navigated to has no `.app`, so
`unvisited.go()` would throw. `link()` is a plain `<a href>` and covers that case,
which is why it is the one used everywhere.

**Never read `window.app` inside `framework/`.** It is a console convenience, it
hard-codes one App per document, and it is `undefined` during boot — `app.js` runs
`window.app = new App()`, so the global is unset while `config()` executes.
