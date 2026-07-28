# Page Migration Guide

The framework (main) has `class Page` and a pushState `Router`, both exported
from `/app.js`. This guide migrates a page.js to `Page`. Un-migrated pages keep
working exactly as before — the Router simply never upgrades their clicks, so
they get full page loads.

## What you get for migrating

- `document.title` and a meta description, from plain properties.
- An `h1.page-title` rendered for you; a `div.page` wrapper with site styling.
- A body theme class while the page is active (`theme`) — removed when you leave.
- A url derived from `meta: import.meta`, so `link()` / `crumb()` / `preview()`
  never hardcode a path.
- Registration in `Page.registry`, which is what lets the Router turn clicks to
  this page into no-reload (SPA) navigation.
- A place in the page tree (`children` + adoption) — the basis for preview
  cards, breadcrumbs, and Pager layouts.

## The pattern

```js
import { Page, p } from "/app.js";

export default new Page({
	meta: import.meta,          // the page learns its own url — never type a path
	title: "Example page",      // h1.page-title + document.title
	theme: "theme-1",           // body class while active
	content() {
		p("Content");
	},
});
```

No subclassing, ever — the constructor is `Object.assign`-based; extra
properties ride along as inert data.

## Migrating from each old style

### 1. Function export — smallest change

```js
// before
export default function () {
	p("Content");
}

// after
export default new Page({
	meta: import.meta,
	title: "Example page",
	content() {
		p("Content");
	},
});
```

### 2. Object export (`{ link(), render() }`) — methods become properties

```js
// before
export default {
	link() { return a.c("page-link", "/example/").href("/example/"); },
	render() { p("..."); }
};

// after — link() is built in (text defaults to the title)
export default new Page({
	meta: import.meta,
	title: "Example",
	content() { p("..."); }
});
```

Custom `link()` / `preview()` implementations are almost always replaced by the
built-ins (`title` + `description` drive `preview()`). If a page genuinely needs
its own, assigning `preview() { ... }` in the config overrides the prototype.

Parent pages still `import child from "./child/page.js"`, but should also
declare `children: [child]`: adoption wires `child.parent`, the child's module
loads eagerly (so it's registered and link-clicks go SPA), and `child.link()` /
`child.preview()` work while dormant.

### 3. Legacy side-effect page (no default export) — the important one

```js
// before: renders at import time — invisible to the Router
h1("Hello World");
p("...");

// after
export default new Page({
	meta: import.meta,
	title: "Hello World",
	content() {
		p("...");
	},
});
```

Why: ES module imports are cached, so top-level rendering runs only on the
*first* import. The App still shows such pages (the import itself draws them),
but they can't be registered, linked to as Pages, or SPA-navigated.

## Rules

1. **Inert on import**: no rendering at module top level — everything DOM goes
   inside `content()`. (Module-level *non-rendering* work is fine:
   `app.stylesheet(import.meta, "./x.css")`, `customElements.define(...)`.)
2. **Always `meta: import.meta`**. Without it the page has no url, isn't
   registered, and `link()` has nothing to point at.
3. **`theme: "theme-1"`** instead of `app.$body.ac("theme-1")` — added on
   `activate()`, removed on `deactivate()`.
4. **Page CSS loads at module top** via `app.stylesheet(import.meta, "./x.css")`
   — once, awaited before first paint. (The old per-visit add/remove of page
   stylesheets doesn't exist in the new Page.)
5. **Write `content()`, not `render()`** — `render()`/`body()` belong to Page
   (they're what Pagers call). For extra document-level side effects, override
   `activate()` / `deactivate()` and call `super`.

## Router notes

- `app.router` is on by default (`new App({ router: false })` opts out).
  Programmatic navigation: `app.router.go("/path/")`.
- A click is upgraded to SPA navigation only when it's **safe**: the current
  page is a `Page` *and* the target is already in `Page.registry` (a sync
  lookup — checking never triggers an import). Everything else falls through to
  a normal full navigation: external links, `target=`, `download`,
  modifier-clicks, same-page `#hash` links, and pages that aren't loaded yet.
  By design you never `pushState` into a page you can't redraw on Back.
- The registry fills as modules load. Declaring `children: [...]` (or a parent
  importing you) puts whole subtrees in the registry at once — clicks inside a
  loaded tree go SPA; the first visit to a not-yet-loaded page is a full load.
- There is no router-owned page cache and no `Page.from` wrapping. The ES
  module cache means revisiting a url returns the *same Page instance*, but
  `render()` runs again and rebuilds the DOM on every visit.
- There is no `data-no-router` opt-out; links to unregistered pages simply
  aren't intercepted.
- A failed page import renders "Page Load Error" via `App.error()` — there is
  no `ErrorPage` class.

## Old classes → new API

Alex's `Page` / `ErrorPage` / `Router` (previously in this repo, deleted with
this migration — see `git show efb345a`) map to the new system as follows:

| old (deleted) | new |
|---|---|
| `class X extends Page { render() {} }` | `new Page({ meta, title, content() {} })` |
| `this.stylesheet(url)` inside `render()` (auto remove/re-add per visit) | `app.stylesheet(import.meta, url)` at module top (loaded once) |
| `on_activate()` / `on_deactivate()` hooks | override `activate()` / `deactivate()` (call `super`) |
| `app.router.navigate(url)` → promise | `app.router.go(url)` |
| router-owned page cache + `Page.from()` wrapping of fn/object exports | module cache; `App.load_page` duck-types the default export |
| `data-no-router` attribute | — (unregistered targets aren't intercepted) |
| `class ErrorPage` | `App.error()` renders "Page Load Error" |

Reference: `/framework/core/Page/` and `/framework/core/Router/` (doc pages +
readmes).
