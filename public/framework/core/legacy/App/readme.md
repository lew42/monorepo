# App

`App` is the substrate: it boots the page, owns the `$app` container, and loads
whatever page.js the URL points at. It's deliberately small, and it treats the
loaded page by **duck typing** — it never requires anything to *be* a particular
class. `Page`, `Pager`, `Router` are optional things that plug into it.

## Lifecycle

`new App(config)` runs `instantiate()`:

```
config()   → sockets + router
render()   → build $app, make it the captor
load()     → load_page() + await stylesheets/fonts
initialize() → subclass hook (empty)
inject()   → put $app in <body>
ready      → resolve the ready promise
```

`config` is `assign`-based, so `new App({ nav(){…} })` rides along as data. Opt
out of the router with `new App({ router: false })`.

## `load_page` — the whole flow

This one method is the loader *and* the navigation handler (the Router calls it
with a url; `popstate` calls it with none):

```js
async load_page(url = location.pathname) {
    let page;
    try { page = await Page.load(url); }        // import (+ ancestors)
    catch (error) { return this.error(error); }

    this.page?.deactivate?.();                  // leave the current page
    this.page = page;                           // before render: a pager reads app.page

    if (page)
        this.$app.empty().append(page.host?.() ?? page);

    page?.activate?.();                         // title / meta / theme
    this.mark_links();                          // .active on links to here
}
```

Read it top to bottom and that's the model:

- **`Page.load(url)`** — the import lives on `Page`, not here. The URL *is* the
  router (`/a/` → `/a/page.js`, `/a/b` → `/a/b.page.js`); that mapping is
  `Page.module_url`, the exact inverse of `Page#url`, so both directions of the
  one convention sit in one file. `Page.load` also climbs to load a deep page's
  ancestors (`load_ancestors`) so `host()` can find the topic that owns its
  layout. See [`../Page/`](../Page/) and `michael/loading.md`.
- **the default export can be anything.** A `Page`, a function, a view, a
  string — App appends it (`View.append` dispatches) and calls `host?.()` /
  `activate?.()` *if they happen to exist*. A page.js can even have **no**
  default export and just render at module top (a "bare page"); App does nothing
  extra. Page is the richest citizen of this open protocol, not a requirement.
  Every optional call is `?.` — there is no `instanceof` in this method.
- **`page.host()`** — self for a plain page; the pager-owning ancestor for a deep
  one. App renders the host (so a deep page shows its topic's columns) and
  activates the leaf (so the title is the leaf's). Both are `Page` methods — App
  doesn't reimplement rendering; `append(page.host())` calls `host.render()`.
- **load-then-swap.** Everything is awaited *before* `empty()`, and `empty()` and
  `append()` run with no await between them, so the browser never paints an empty
  `$app`. No white flash on navigation.

## `mark_links` — the current url, in the DOM

After each render, one pass over `$app`:

```js
a.pathname === here                                  → a.classList.add("active")
a.pathname.endsWith("/") && here.startsWith(...)     → a.classList.add("in-path")
```

Every in-app link — sidebar links, breadcrumbs, preview cards, inline
`page.link()`s — gets marked in one place, and CSS decides what each kind of link
does with it. That's why no view needs to know the current url: previously the
ColumnPager sidebar compared `location.pathname` itself, and preview cards (which
had no such code) simply never lit up.

The rule for `.in-path` is deliberately dumb string math: a directory url that is
a prefix of the current path is an ancestor of it. Style it, or don't.

## What App does *not* do

No `Pager` instance, no registry, no `pushState`. Navigation lives in the
[`Router`](../Router/) (created by `config_router`, opt-out). Layout lives in a
page's [`pager`](../Pager/). Content and the tree live in [`Page`](../Page/).
Delete the router and the site still loads pages; delete the pagers and pages
still render — plainly. The substrate stands on its own.

## Other bits

- `app.font(name)` — load a predefined font (Montserrat, Material Icons), awaited
  before inject.
- `App.stylesheet` / `View.stylesheet` — add a `<link>`, tracked so `load()`
  waits for it.
- `app.ready` — a promise that resolves once the first page is injected.

## Files

- `App.js` — the class (exported, with the View factories + Page, from `/app.js`)
- `page.js` — the navigable doc page
