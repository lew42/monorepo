# CLAUDE.md

Lew42 framework site: a no-build, native-ESM web framework and the static site that hosts it.

## Core constraints (do not violate)

- **No bundler, no build step, no transpilation.** Everything in `public/` is served as-is and must run directly in the browser as native ES modules.
- **Static compatibility.** The Node server (`server.js`) is for local dev only. Production is pure static hosting (Cloudflare Workers static assets). Nothing may depend on server-side logic at runtime.
- Import paths must be real URLs — root-absolute (`/app.js`) or relative with explicit `.js` extensions. No bare specifiers.

## How the site works

1. `public/index.html` is the universal fallback document. It loads one script: `/app.js`.
2. `public/app.js` creates the `App` singleton (`window.app`) and re-exports the framework (`export * from framework/core/App/App.js`).
3. `App.load_page()` dynamically imports the page module for the current URL via `App.path_to_page_url(window.location.pathname)`:
   - `/` → `/page.js`
   - `/path/` → `/path/page.js` (trailing slash = directory page)
   - `/path/sub` → `/path/sub.page.js` (no slash = sibling file with `.page.js` suffix)
4. Page modules import the framework back from `"/app.js"` (same module instance via the browser's module registry). A page's default export is optional: it may be a View, a function (rendered via capture), or nothing (root-level element calls capture directly).
5. Because the dynamic import path is computed at runtime, pages are naturally lazy-loaded — the filesystem is the router and the "chunk map." New pages are added by creating a `page.js` file; no registration anywhere.

### App lifecycle (`framework/core/App/App.js`)

`constructor` → `config()` → `render()` (creates `this.$body`, `this.$app`, sets captor) → `await load()` (page import + all loaders) → `initialize()` → `inject()` ($app into body) → `ready.resolve()`.

- `this.loaders` collects promises (stylesheets, fonts) that must resolve before injection — pages can add more during their module execution.
- `app.font(name)` loads predefined fonts (Montserrat, Material Icons) via the FontFace API.
- `App.stylesheet(url)` / `View.stylesheet(import.meta, relativeUrl)` appends a `<link>` and tracks its load promise.
- Page load errors are caught and rendered as a "Page Load Error" view.

## The View system (`framework/core/View/View.js`)

`View` wraps a DOM element (`this.el`) with a chainable API. The central concept is **capturing**:

- A static `View.captor` points at the view currently collecting children. Element factory functions auto-append their result to the captor.
- Passing a function to `append()` (or as an arg to any factory) runs it with the new view as captor (`append_fn` pushes/pops the captor stack), so nested calls build nested DOM:
  ```js
  el("ol", () => {
      el("li", "First");
      el("li", "Second");
  });
  ```
- `View.body()` makes `<body>` the initial captor; `App.render()` switches it to `$app`.

Factories: `el(tag, ...)`, `div(...)`, `p(...)`, plus one per common HTML tag (`h1`, `a`, `button`, …), all exported from `View.js` and re-exported through `/app.js`. Each has a `.c(classes, ...)` variant, e.g. `div.c("nav-item", ...)`.

`append()` dispatches on argument type: views (`.el`), functions (capture), plain objects (`append_pojo` — child views assigned to named properties), arrays (flattened), promises (`append_promise`), everything else goes to `el.append()`. `p()` uses `backtick_append` — backticks in strings become `<code>` elements.

Chainable methods (all return `this`): `ac`/`rc`/`tc`/`hc` (add/remove/toggle/has class), `attr`, `href`, `text`, `html`, `on`/`off`/`click`, `style` (supports `--custom-props`), `hide`/`show`/`toggle`, `empty`, `insert`, `remove`, `replace`, `load(meta, url)` (async import + append, parallel) and `lazy(meta, url)` (same but serialized to preserve order).

Subclass auto-classing: `classify()` converts the class-name chain to kebab-case CSS classes (e.g. `class FooBarView extends View` → `foo-bar`).

`framework/util/is/is.js` is the type-check utility (`is.fn`, `is.pojo`, `is.arr`, `is.dom`, `is.promise`, …) used by the dispatch logic.

## Page (`framework/core/Page/Page.class.js`)

`Page` is a titled, linkable, **dormant** unit of content — creating one renders nothing, so `export default new Page(...)` is always import-safe. It renders when placed (`View.append` calls `.render()`, or `render(target)` directly). The blessed page.js shape:

```js
import { Page, p } from "/app.js";
export default new Page({ meta: import.meta, title, description, theme, content(){ p("content"); } });
```

- `meta: import.meta` derives `url` (`/docs/page.js` → `/docs/`; `/docs/x.page.js` → `/docs/x`); `link(text?)` works while dormant.
- `render()` = build DOM: one `div.c("page")` (title h1 + content) captured wherever the page is placed; embedded sub-pages render too. Override via `new Page({ render(){} })`. `activate()` = become THE page: `document.title`, meta description, body `theme` class. `App.load_page()` appends the default export then calls `pg.activate?.()` — duck-typed, App never imports Page, and non-Page exports (strings, functions, views) still work.
- Constructor is `assign`-based: extra properties pass through as inert data.
- Design record + deferred features (Pagers, routing, `deactivate`): `framework/core/Page/readme.md`.

## Ext (`framework/ext/`)

A fourth tier beside `core/`, `dev/`, `util/`: **opt-in addons, free to patch core.** Nothing in `app.js` imports one — a page opts in by importing the module directly. Vendor dependencies into the ext's own directory; no CDN imports at runtime.

`ext/markdown/md.js` (vendors `marked.esm.js`) — importing it installs `View.prototype.md()`; the default export is an `md()` element factory.

```js
p().md("**inline** markdown");                          // into an existing view
md("Hi.").ac("note");                                   // a real <p>, captured & chainable
md.file(import.meta, "readme.md", { h1: false });        // a promise of a div.md
```

`md.file` resolves against `import.meta`, not the document (the SPA fallback makes the document url the *route*, so doc-relative fetches miss). It returns a **promise** so `View.append_promise` places it and `App.load_page` can await it before swapping — `content(){ return md.file(...) }` needs no change to `Page`. `{ h1: false }` drops the readme's leading heading, since `Page` already renders `title` as an h1. `framework/core/Pager/page.js` is the worked example: the page is nothing but its `readme.md`.

## CSS

- `framework/framework.css` — loaded by App before render; defines `@layer base, theme, util` (reset, CSS custom props like `--prim`/`--bg`, utility classes like `flex`, `gap`).
- `/styles.css` — site-level styles, loaded in `app.js`.
- Pages may load their own stylesheets via `View.stylesheet(import.meta, "...")`; these are awaited before the app injects.

## Dev server & live reload

- `npm install`, then `node server.js` (listens on port 80 by default; `PORT` env to override).
- `Server/Server.js`: Express static over `public/`, then SPA fallback to `index.html`. Paths ending in a file extension 404 instead of falling back.
- Plugin system via `Server.use(...)` and an `Events` base class. `DevSocket` runs a WebSocket server (chokidar file-watching → `LiveReload`).
- Client side, `framework/dev/Socket/Socket.js` connects **only on localhost** (checked in both `App.config_socket` and `Socket.initialize`); on production hosts it stays disabled and no-ops. Keep it that way — this is part of static compatibility.

### Killing a backgrounded dev server (Windows)

**`pkill -f "node server.js"` does not work from Git Bash on Windows.** It silently matches nothing — the detached `node` is a native Windows process, not a bash job — so the server survives and the script reports success anyway.

This matters because an orphaned dev server does not sit idle: once its parent shell exits and the console handle goes away, libuv busy-loops on the dead handle and the process **pins a full CPU core indefinitely**. Several of these accumulated once and burned ~4.7 cores continuously.

If you background a server to smoke-test routes, capture the PID and kill it by PID:

```bash
PORT=8124 node server.js > /tmp/mono.log 2>&1 &
SERVER_PID=$!
# ... run checks ...
taskkill //F //PID $SERVER_PID     # double slashes: MSYS path-mangling escape
```

Or from PowerShell: `Stop-Process -Id <pid> -Force`. To hunt for strays:

```powershell
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Select-Object ProcessId, CommandLine
```

Prefer reusing the already-running dev server on port 80 over starting a throwaway one.

## Deployment (Cloudflare Workers)

- `wrangler.jsonc`: serves `./public` as static assets with `not_found_handling: "single-page-application"` (the production equivalent of the dev server's index.html fallback).
- `main` deploys to https://monorepo.lew42.workers.dev/. Every branch gets a preview at `<branch-with-slashes-as-dashes>-monorepo.lew42.workers.dev`.

## Git workflow

- Never push to `main` (it's protected). Branch names are `<yourname>/<branch-name>` (e.g. `michael/fix-whatever`) — the `/` becomes `-` in the preview URL.
- Always `git switch main` && `git pull` before creating a branch.

## Repo layout notes

- `public/` — the entire deployable site (framework + pages + assets).
- `Server/` — dev-only Node server; never imported by browser code.
- Top-level directories under `public/` named after devs (`alex/`, `arya/`, `castin/`, `edric/`) are personal sandbox pages — transient, don't treat their contents as framework conventions.
