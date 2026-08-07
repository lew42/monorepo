# Router

`Router` turns in-page links into no-reload (`pushState`) navigation and handles
back/forward. It's a **single instance** (`app.router`), created by
`App.config_router`:

```js
config_router(){ if (this.router !== false) this.router = new Router(this.router); }
```

So it's on by default; opt out with `new App({ router: false })`, and every link
becomes a normal full-page load (bare pages, plain `href`s all still work).

## Division of labor

- **Router** owns *when*: a URL changed → call `app.load_page(url)`. It never
  renders and holds no page state.
- **App** owns loading + rendering (`load_page`).
- **Page** owns content + the tree.

It is **given** its app — it does not read `window.app`:

```js
// App.config_router
this.router = new Router(this.router, { app: this });
```

That needed no constructor change, because the constructor is
`Object.assign(this, ...args)` and later args win: the user's optional config
merges first, then what App must supply lands on top. Besides not assuming one
App per document, injection is the only thing that *works* during boot —
`app.js` does `window.app = new App()`, so the global is still `undefined` while
`config_router()` runs inside the App constructor. See "OOP conventions" in
`CLAUDE.md` and `framework/readme.md` §7.

## Link interception — one delegated listener

Pages use ordinary `a().href(url)` / `page.link()`; the Router catches clicks at
the `document` level and upgrades them. No per-link wiring. It only upgrades a
click when it's **safe**:

- we're currently on a real Page (`app.page instanceof Page`) — so Back can
  redraw it; on a bare page it stays a full navigation;
- the target is a **registered** Page (`Page.registry.has(pathname)`) — a
  synchronous lookup, so checking never triggers an import or side effects.

Everything else — external links, bare pages, unknown routes, ⌘/ctrl/shift/
middle clicks — falls through to a normal full navigation. This is what keeps
history correct: you never `pushState` into a page you can't redraw, so
Back/Forward never strand you (the bug that bites when SPA and full loads mix).

## API

- `new Router(...args)` — assigns every arg onto the instance (later wins), then
  starts listening (click + `popstate`).
- `go(url)` — programmatic navigation (`pushState` + `app.load_page`). Used by
  e.g. a ColumnPager's close button.
- `routes` — sorted list of registered route urls (debug — a natural seed for a
  route-admin UI later).

## Why a class (and a singleton)

Routing is a single, app-wide concern (one history, one URL). Keeping it in its
own object — instead of inside `App` or `Page` — means the substrate stays simple
and the navigation logic has one home to inspect, log, or extend. A previous
"Pager-does-everything" attempt got complicated precisely because routing,
rendering, and page state were fused; here they're separate small things.

## Files

- `Router.js` — the class (exported from `/app.js`)
- Loading/resolution model: `michael/loading.md`
