# Router

`Router` turns in-page navigation into no-reload (`pushState`) navigation and
handles back/forward. It's **opt-in** and a **single instance** (`app.router`).

```js
app.router = new Router({ app });   // enable SPA navigation
```

Without it, every link is a normal full-page load (the framework's default —
bare pages, plain `href`s, all still work). Create the router and internal links
upgrade to no-reload.

## Division of labor

- **Router** owns *when & what*: a URL changed → here's the page. It never
  renders — it calls `app.render_url(url)`.
- **App / Pager** own *where & how*: swap the resolved page into `app.pager`,
  manage `activate`/`deactivate`.
- **Page** owns the content and the tree.

## Link interception — one delegated listener

Pages use ordinary `a().href(url)` / `page.link()`; the Router catches clicks at
the `document` level and upgrades them. No per-link wiring. It only upgrades a
click when it's **safe**:

- we're currently showing a re-renderable Page (`app.current instanceof Page`) —
  so Back can redraw it; on a bare page it stays a full navigation;
- the target is a **registered** Page (`Page.registry.has(pathname)`) — a
  synchronous lookup, so checking never triggers an import or side effects.

Everything else — external links, bare pages, unknown routes, ⌘/ctrl/shift/
middle clicks — falls through to a normal full navigation. This is what keeps
history correct: you never `pushState` into a page you can't later redraw, so
Back/Forward never strand you (the bug that bites when SPA and full loads mix).

## API

- `new Router({ app })` — construct + start listening (click + `popstate`).
- `go(url)` — programmatic navigation (`pushState` + `app.render_url`). Used by
  e.g. a ColumnPager's close button.
- `current` — the active page (debug).
- `routes` — sorted list of registered route urls (debug — a natural seed for a
  route-admin/debug UI later).

## Why a class (and a singleton)

Routing is a single, app-wide concern (one history, one URL). Keeping it in its
own object — rather than sprinkled through `Page` — means `Page` stays simple and
the navigation logic has one home to inspect, log, or extend. A previous
"Pager-does-everything" attempt got complicated precisely because routing,
rendering, and page state were fused; here they're three small things.

## Files

- `Router.js` — the class (exported from `/app.js`)
- Loading/resolution model: `michael/loading.md`
