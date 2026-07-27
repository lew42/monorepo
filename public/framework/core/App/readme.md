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
    this.page?.deactivate?.();          // leave the current page
    this.$app.empty();
    const page = this.page = await this.import_page(url);

    if (page instanceof Page) {
        await this.load_topic(page);    // load ancestors → a deep page finds its topic
        this.$app.append(page.host());  // render the topic's layout, or the page itself
        page.activate();                // title / meta / theme
    } else if (page) {
        this.$app.append(page);         // a plain function/view default
    }
    // a bare page (no default export) already rendered itself via import side effects
}
```

Read it top to bottom and that's the model:

- **`import_page`** — `import()` the url's module. The URL *is* the router:
  `/a/` → `/a/page.js`, `/a/b` → `/a/b.page.js`. `import()` is cached, so
  re-loading a page is cheap.
- **the default export can be anything.** A `Page`, a function, a view, a
  string — App appends it (`View.append` dispatches) and calls `.activate?.()`
  *if it happens to have one*. A page.js can even have **no** default export and
  just render at module top (a "bare page"); App does nothing extra. Page is the
  richest citizen of this open protocol, not a requirement.
- **`load_topic`** — the one concession to the drill-down. A deep page (`/a/b/c/`)
  is imported alone, so the ancestor that owns its layout (`pager`) isn't loaded.
  This climbs the url importing ancestors until `page.host()` finds one. A plain
  page, or an already-loaded topic, makes it a no-op. (See `michael/loading.md`.)
- **`page.host()`** — self for a plain page; the pager-owning ancestor for a deep
  one. App renders the host (so a deep page shows its topic's columns) and
  activates the leaf (so the title is the leaf's). Both are `Page` methods — App
  doesn't reimplement rendering; `append(page.host())` calls `host.render()`.

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
