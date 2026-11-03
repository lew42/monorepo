# The app is injected; `window.app` is a console convenience

Three ways to give a class the App:

- **`window.app`** — honest for a real singleton, zero plumbing, no import cycle
  (`app.js` imports `Router`, so `Router` cannot import `app.js`), and it is what you
  type in the console.
- **`App.current`** — a namespaced static set in the constructor. Tidier, and a test
  can set it. But it is the *same assumption*: one ambient App per document. It
  relocates the global, it doesn't remove it.
- **Inject it** — `new Router(this.router, { app: this })`, read `this.app`.

**Verdict: inject.** (This entry previously said *"do both, read `App.current`"*.) Both
globals forbid two apps on a page, an app in an iframe or test harness, and any
instance that isn't the global one — a real constraint to accept in the substrate in
exchange for saving one constructor argument. Because every constructor is
`Object.assign(this, ...args)`, injection costs one extra object literal at the call
site and needs no constructor change at all.

`window.app` stays, as a console convenience only. **Nothing under `framework/` may
read it** — it is also `undefined` during boot, since `app.js` runs
`window.app = new App()` and the App's own `config()` executes before the assignment.

## `Page` cannot take `app` in its constructor at all

Pages are built in userland at module scope (`export default new Page(…)`), so there is
no call site to inject at. `Page.child()` assigns it on the walk instead — the same
**adoption** move that already wires `child.parent`, handed to the page about to need
it.

That is the general shape: **constructor-assign for what the caller knows up front,
adoption for what only the container knows.** A `page.js` never mentions `app` or
`parent`.

## Two things this does not buy

- **Two Apps in one document.** The ES module registry is per-realm, so both Apps
  import the *same* `page.js` module and get the *same* `Page` instance, which can only
  hold one `app`. `View.captor` and `View.stylesheets` are statics and would clobber
  each other besides. The real isolation boundary for two apps is an **iframe** —
  separate realm, separate registry, separate statics — and there `window.app` is
  per-frame and correct.
- **Removing the global.** It stays.
