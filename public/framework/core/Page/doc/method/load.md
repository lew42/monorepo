Import `<url>page.js` and hand back its default export, or `null`.

**Usage** — two callers: `child()`'s filesystem probe (`Page.class.js:77`) and
`App.load()` fetching the root (`framework/core/App/App.js:60`). Static, because at
the moment it runs there may be no Page to call it on.

**Necessity** — yes. It is the whole of "the filesystem is the router".

**Simplicity** — right-sized, and the `try`/`catch` is the load-bearing part:

> **A module that throws is NOT a module that isn't there.** Swallowing both would
> turn a syntax error in a page you just wrote into a silent 404 — the most
> expensive ten minutes in this codebase. `Page.missing(error)` separates them, and
> a broken file gets a named `console.error`.

`?? null` normalises a `page.js` with no default export into the same "nothing here"
as a missing file. That is the right call for the probe and it does mean a page.js
that forgets `export default` fails exactly like a 404.

