# CLAUDE.md

Lew42 framework site: a no-build, native-ESM web framework and the static site that hosts it.

## Core constraints (do not violate)

- **No bundler, no build step, no transpilation.** Everything in `public/` is served as-is and must run directly in the browser as native ES modules.
- **Static compatibility.** The Node server (`server.js`) is for local dev only. Production is pure static hosting (Cloudflare Workers static assets). Nothing may depend on server-side logic at runtime.
- Import paths must be real URLs — root-absolute (`/app.js`) or relative with explicit `.js` extensions. No bare specifiers.

## How the site works

1. `public/index.html` is the universal fallback document. It loads one script: `/app.js`.
2. `public/app.js` creates the `App` singleton (`window.app`) and re-exports the framework (`export * from framework/core/App/App.js`).
3. `App.load_page()` calls `Page.load(url)`, which dynamically imports the page module for the current URL via `Page.module_url(window.location.pathname)`:
   - `/` → `/page.js`
   - `/path/` → `/path/page.js` (trailing slash = directory page)
   - `/path/sub` → `/path/sub.page.js` (no slash = sibling file with `.page.js` suffix)

   `Page.module_url` is the exact inverse of the `Page#url` getter; both live in `Page.class.js` so the convention has one home.
4. Page modules import the framework back from `"/app.js"` (same module instance via the browser's module registry). A page's default export is optional: it may be a View, a function (rendered via capture), or nothing (root-level element calls capture directly).
5. Because the dynamic import path is computed at runtime, pages are naturally lazy-loaded — the filesystem is the router and the "chunk map." New pages are added by creating a `page.js` file; no registration anywhere.

### App lifecycle (`framework/core/App/App.js`)

`constructor` → `config()` → `render()` (creates `this.$body`, `this.$app`, sets captor) → `await load()` (page import + all loaders) → `initialize()` → `inject()` ($app into body) → `ready.resolve()`.

- `this.loaders` collects promises (stylesheets, fonts) that must resolve before injection — pages can add more during their module execution.
- `app.font(name)` loads predefined fonts (Montserrat, Material Icons) via the FontFace API.
- `App.stylesheet(url)` / `View.stylesheet(import.meta, relativeUrl)` appends a `<link>` and tracks its load promise.
- Page load errors are caught and rendered as a "Page Load Error" view.
- `load_page()` is fully duck-typed (`page.host?.()`, `page.activate?.()`) — no `instanceof` — and sets `this.page` *before* rendering, because a mounted Pager reads `app.page` to find its leaf.
- `App.mark_links()` runs after every render: one pass over `$app` adding `.active` (href === current path) and `.in-path` (href is a directory prefix of it) to in-app anchors. **No view should compare `window.location` itself** — sidebars, breadcrumbs, and preview cards all get their active state from this one pass, and CSS decides what each kind of link does with the class.

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
- `Page.load(url)` / `page.load_ancestors()` / `Page.module_url(url)` — the loader lives here, not in App (see above).
- Design record + deferred features: `framework/core/Page/readme.md`.

## Pager (`framework/core/Pager/`)

`Pager extends View` is a `div.pager` that shows one page: `show(page)` (manual swap) plus `leaf()` (the page being viewed). A **structure** is a Pager subclass whose `render()` arranges a page tree; a topic opts its whole subtree in with `pager: ColumnPager`, and `Page.render()` mounts it as `new this.pager({ root: this })` — an assign-object, so **subclasses need no constructor**.

- `ColumnPager` — drill-down: sidebar + breadcrumbs + the last two of `leaf().chain` as columns. `render()` is decomposed into `sidebar/brand/nav/topbar/crumbs/columns/column/col_bar` so a topic can override one piece by subclassing inline.
- `TabPager` — in-page tab bar; its panel *is* a plain `Pager`, driven by `show()`.
- `leaf()` reads `window.app.page` (the App already resolved it). **Layouts are told, they don't ask** — nothing in this tier reads `window.location`.
- Per-page appearance is an inert class string: `new Page({ col: "narrow" })` → `ColumnPager` puts it on the `.column`, CSS does the rest.
- Extension order, cheapest first: **a class for appearance → an overridden method for structure → a new subclass for a different arrangement.** If a change wants a new property on `Pager`, it's usually one of the first two in disguise. Full analysis, variation table, and open questions: `framework/core/Pager/readme.md`.

## Ext (`framework/ext/`)

A fourth tier beside `core/`, `dev/`, `util/`: **opt-in addons, free to patch core.** Core never imports an ext — the arrow only points one way. Vendor dependencies into the ext's own directory; no CDN imports at runtime. Opting in is an import; *this site* opts in for every page, once, in `app.js` (so `md` and `demo` are available from `/app.js` everywhere).

`ext/markdown/md.js` (vendors `marked.esm.js`) — importing it installs `View.prototype.md()`; the default export is an `md()` element factory.

```js
p().md("**inline** markdown");                           // into an existing view
md("Hi.").ac("note");                                    // a real <p>, captured & chainable
md.file(import.meta, "readme.md", { h1: false });        // a promise of a div.md
md.details(import.meta, "readme.md");                    // the same, in a collapsed <details>
```

`md.file` resolves against `import.meta`, not the document (the SPA fallback makes the document url the *route*, so doc-relative fetches miss). It returns a **promise** so `View.append_promise` places it and `App.load_page` can await it before swapping — `content(){ return md.file(...) }` needs no change to `Page`. `{ h1: false }` drops the readme's leading heading, since `Page` already renders `title` as an h1.

`ext/demo/demo.js` — `demo(fn)` renders `fn`'s source (from `fn.toString()`, de-wrapped and dedented) above the result of running it, boxed together. One source of truth, so an example cannot drift from what it renders. Strings before the function label the box; strings after caption it (`demo(fn, "caption")` — the caption renders inside the box, below the result). The caption uses `View.prototype.md` **if markdown has been imported**, falling back to `p()` backticks — a soft dependency, so `demo/` never imports `markdown/`.

## Writing docs — `page.js` vs `readme.md`

Two audiences, two documents, in the same directory. **Do not blur them.**

**`page.js` — the reader.** It should read like a beautiful introduction: **code first, zero to hero.** They feel calm, see all the things, and understand them. The only way there is absolute simplicity: the minimal case first, then build. Someone who gets a simple foundation fast will figure out the rest themselves.

- **Code first — literally.** The first thing under the title is a code block or a `demo()`, not a paragraph. No preamble, no "in this section we will".
- **Prose is a caption, not a preamble.** Reading order is code → result → sentence. `demo(() => { … }, "the sentence")` puts the caption inside the box, so prose can never detach from the example it describes. (`demo("Label", fn)` still labels above.)
- **SIMPLICITY FIRST. Minimalism.** The basic example before the complete one. Cut every sentence that isn't load-bearing.
- **Zero to hero.** A section is a path, not a fan-out: each page ends by naming the next one, and the sequence gets you from nothing to a real thing. `/framework/start/` is the floor — three files, a working site — and every core page builds from there. Aim each page at one payoff demo where it all comes together.
- **Render the example whenever you can**, and the code that produced it must be visible and **visually grouped** with it — never a rendered thing whose source the reader has to hunt for. `demo(fn)` (`ext/demo`) shows `fn`'s real source and then runs it, one box, one source of truth.
- **Prose is markdown.** Use `md("...")`, not `p()` with backticks — `p()`'s backtick handling only does `<code>`, so bold/italic/links/tables silently don't render. Tables via `md()` beat a paragraph listing options.
- Deep architecture, trade-offs, and rejected alternatives do **not** belong here. Link them: `md.details(import.meta, "readme.md")` puts the whole readme in a collapsed `<details>` at the bottom of the page.

**`readme.md` — the maintainer (and future us).** Highly technical: the architectural dilemmas, what was tried, why the current shape won, what's still open. Not immediately relevant to an end user, so it stays out of their way. Keep it honest and specific — it's the design record, and it's what makes a later refactor cheap. Write entries as **question → options → weighing → verdict**, and record *keep* verdicts too — a written-down "we considered this and said no, because…" is what stops an idea being re-litigated. `framework/readme.md` is the cross-cutting one (open proposals live there); per-class records sit next to their class.

## CSS

- `framework/framework.css` — loaded by App before render; defines `@layer base, theme, util` (reset, CSS custom props like `--prim`/`--bg`, utility classes like `flex`, `gap`).
- `/styles.css` — site-level styles, loaded in `app.js`.
- Pages may load their own stylesheets via `View.stylesheet(import.meta, "...")`; these are awaited before the app injects.
- **Every stylesheet must be inside `@layer` — an unlayered rule beats every layer regardless of specificity.** This is the cascade rule that bites: an unlayered `.page { padding: … }` in `styles.css` silently defeated a four-class-deep `.column-pager .column.narrow .page` in `ColumnPager.css`. Component CSS goes in `theme`; site CSS also goes in `theme` and wins by load order (it's linked last).
- A stylesheet that 404s no longer hangs the app (`View.stylesheet` resolves on `error` and warns), but the page renders unstyled — check the console.

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
