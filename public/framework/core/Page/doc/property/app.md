The `App` this page belongs to.

**Usage** — read by `container()` for the default mount (`Page.class.js:105`), by
`go()` (`:147`), and by `ext/tabs` for `app.router.mark_links()` and `app.loaders`
(`framework/ext/tabs/tabs.js:50,58`). Handed down in two places, both on the walk:
`child()` (`Page.class.js:72`) and `add()`'s adopt object (`:47`).

**Necessity** — yes, and the *mechanism* is the point. Pages are built in userland
at module scope, so there is no constructor for `App` to inject into — adoption is
not a workaround, it is how a page acquires anything only the container knows.

**Simplicity** — right-sized, and it is why the framework never reads `window.app`:

> `window.app` is a console convenience. It is `undefined` during boot — `app.js`
> runs `window.app = new App()`, so the global is unset while the App's own
> `config()` executes — and it hard-codes one App per document.

It arrives **late**, which is a real state: a page constructed standalone has no
`app` until something adopts it, and `ext/tabs` guards with `this.app?.` for exactly
that reason.

