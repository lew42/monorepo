# CLAUDE.md

Lew42 framework site: a no-build, native-ESM web framework and the static site that hosts it.

## Core constraints (do not violate)

- **No bundler, no build step, no transpilation.** Everything in `public/` is served as-is and must run directly in the browser as native ES modules.
- **Static compatibility.** The Node server (`server.js`) is for local dev only. Production is pure static hosting (Cloudflare Workers static assets). Nothing may depend on server-side logic at runtime.
- Import paths must be real URLs — root-absolute (`/app.js`) or relative with explicit `.js` extensions. No bare specifiers.

## Working agreements

**Propose before major surgery. Settle the direction first.** A rename that touches a core class, its callers, and a dozen doc references is not a cleanup — it's a design decision with a large edit attached. Doing the edit first burns time and tokens, and worse, it *presents* a direction as settled when it was never agreed. Ask first, in three lines:

> I'd suggest (a) …, (b) …, (c) …. Should I do it?

Then wait. Small, local, obviously-correct fixes don't need this. Anything that changes an API name, a call order, or where a responsibility lives does. If the direction turns out to be wrong after the code is written, the sunk edit becomes an argument for keeping it — which is exactly the pressure to avoid.

**No black magic.** Black magic is behavior you cannot see from the code that implements it: a property read by a class that never mentions it, a method called by something three files away, an order of operations you have to memorize. It fails the test *"can someone read this file and know what happens?"* Self-evident code is the opposite — WYSIWYG, no hunting, nothing to remember.

When something must be coordinated across files, make the coordination visible at the call site rather than clever. Prefer an explicit method call in the file that wants the behavior over an inert marker interpreted elsewhere.

**A super simple base API that just works, then extend.** The default path should cover most cases with no configuration and no ceremony. Everything beyond that is an override or a subclass — declarative, opt-in, and visible in the file that opts in. Resist adding options, flags, or hooks to the base: an option is API surface forever, and the override lever usually already covers it.

**Too many comments junk up the base classes.** Wall-to-wall explanation in `View`, `Page`, `Pager`, `App` does not instill clarity or confidence — it reads as anxiety, and it buries the code the reader came for. Keep base-class comments to what the code genuinely can't say: a non-obvious *why*, a real gotcha. Design rationale, alternatives weighed, and history belong in the neighboring `readme.md`, which exists precisely for that.

## OOP conventions

**Every constructor is `Object.assign`-based.** `App`, `Page`, and `Font` already are; new classes must be too.

```js
constructor(...args){ this.assign(...args); }
assign(...args){ return Object.assign(this, ...args); }
```

Take `...args` — not named parameters, not a single `config`. Then there is nothing to remember about *which* argument goes where: everything lands on the instance and the class sorts it out internally. Defaults live on the prototype (class field or getter), so an assigned value just overrides them.

The payoff is that options merge with no gymnastics — later args win, so a caller can layer what it must inject on top of whatever the user passed:

```js
// App.config_router — user's config first, then what App has to supply
this.router = new Router(this.router, { app: this });
```

`this.router` may be `undefined`, a POJO of options, or already set; none of those need a branch.

**Never read `window.app` inside `framework/`.** It exists so you can poke at the app from the browser console, and for nothing else. Framework code that reads it hard-codes "there is exactly one App per document" — which rules out a second app, an app in an iframe or test harness, and any instance that isn't the global one. It's also simply wrong during boot: `app.js` does `window.app = new App()`, so the global is still `undefined` while the App's own constructor runs `config()`. Take the app as a constructor arg and read `this.app`.

**Adoption — how `app` and `parent` get where they're going.** You assign what you know; what knows you assigns itself. A `Page` is constructed in userland at module scope (`export default new Page(…)`), so App has no constructor to inject into — instead `App.load_page` assigns `page.app = this` at the moment it renders, exactly as a parent Page assigns `child.parent = this` when it adopts its declared children. No page.js ever mentions `app`.

So there are two ways a property arrives, and they don't conflict: **constructor-assign** for what the caller knows up front, **adoption** for what only the container knows.

**Construct things where someone will look for them.** If a file names a class, that file should generally be where it's constructed. An inert marker in one file, interpreted by `new` in another, is the black-magic shape above.

> ⚠️ **UNDER DISCUSSION — do not treat as settled.** How a topic opts into a layout has changed twice and is being reconsidered. The current code has a topic define `pager(){ return new ColumnPager({ root: this, app: this.app }); }`, which `App.load_page` calls via `host.pager?.() ?? host`, with `Page.host()` walking `.parent` to find the nearest ancestor defining it. That's **three** coordinating places — App, `host()`, and `load_ancestors()`'s loop condition — which is more remembering than this codebase wants. Do not build on it or propagate the pattern until the direction is agreed. Options and the load-order trace: `framework/core/Pager/readme.md`.

## How the site works

1. `public/index.html` is the universal fallback document. It loads one script: `/app.js`.
2. `public/app.js` creates the `App` singleton (`window.app`) and re-exports the framework (`export * from framework/core/App/App.js`).
3. `App.load_page()` calls `Page.load(url)`, which dynamically imports the page module for the current URL via `Page.module_url(window.location.pathname)`:
   - `/` → `/page.js`
   - `/path/` → `/path/page.js` (trailing slash = directory page)
   - `/path/sub` → `/path/sub.page.js` (no slash = sibling file with `.page.js` suffix)

   `Page.module_url` is the exact inverse of the `Page#url` getter; both live in `Page.class.js` so the convention has one home. **`App.path_to_page_url` is a one-line alias for it, not a second implementation** — kept because `arya/lib/Router.js` calls it at runtime and two doc pages describe it (see `framework/readme.md` §8: rename freely inside `framework/`, alias on the way out). Never invert the dependency: `App` imports `Page`, so `Page` importing `App` would close a cycle.
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
export default new Page({ meta: import.meta, title, description, content(){ p("content"); } });
```

- `meta: import.meta` derives `url` (`/docs/page.js` → `/docs/`; `/docs/x.page.js` → `/docs/x`); `link(text?)` works while dormant.
- `render()` = build DOM: one `div.c("page")` (title h1 + content) captured wherever the page is placed; embedded sub-pages render too. `activate()` = become THE page: `document.title`, meta description. `App.load_page()` appends `host.pager?.() ?? host`, then calls `pg.activate?.()` — duck-typed, so non-Page exports (strings, functions, views) still work.
- Constructor is `assign`-based: extra properties pass through as inert data.
- `Page.load(url)` / `page.load_ancestors()` / `Page.module_url(url)` — the loader lives here, not in App (see above).
- Design record + deferred features: `framework/core/Page/readme.md`.

## Pager (`framework/core/Pager/`)

`Pager extends View` is a `div.pager` that shows one page: `show(page)` (manual swap) plus `leaf()` (the page being viewed). A **structure** is a Pager subclass whose `render()` arranges a page tree; a topic opts its whole subtree in by defining `pager(){ return new ColumnPager({ root: this, app: this.app }); }` in its own page.js — an assign-object, so **subclasses need no constructor**.

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

`ext/demo/demo.js` — `demo(fn)` renders `fn`'s source (from `fn.toString()`, de-wrapped and dedented) above the result of running it, boxed together. One source of truth, so an example cannot drift from what it renders. Strings before the function label the box; strings after caption it (`demo(fn, "caption")` — the caption renders inside the box, below the result). The caption uses `View.prototype.md` **if markdown has been imported**, falling back to `p()` backticks — a soft dependency, so `demo/` never imports `markdown/`. The code block uses `View.prototype.syntax` on the same terms.

`ext/syntax/syntax.js` (vendors highlight.js 11.11.1 `es/` — js, css, xml, markdown, json) — importing it installs `View.prototype.syntax()` **and highlights every markdown code fence on the site**; the default export is a `syntax()` element factory.

```js
p().syntax("js", "const x = 1");                 // into an existing view
syntax("js", src);                               // a <pre class="syntax"><code>
syntax.inline("js", "const x = 1");              // a bare <code> for prose
syntax.file(import.meta, "example.js");          // a promise of a highlighted block
```

Fence highlighting works by patching two `View` methods, **both synchronous, so neither can FOUC**: `html_unsafe` (markup written through a View — `.md()`, `md.file()`, multi-block `md()`) and `prerender` (markup a View *adopts* — the single-block branch of `md()` builds its DOM off a `<template>` and never touches `html_unsafe`). A `requestAnimationFrame`/`MutationObserver`/on-ready sweep would run a task later and flash plain code for one frame — that's why this is a patch, not a post-pass. No import coupling either way: `syntax/` doesn't import `markdown/`, it just recognizes the `language-*` class marked emits. An unregistered language degrades to escaped plain text, never throws. Design record: `framework/ext/syntax/readme.md`; the unbuilt textarea-overlay editor is specced in `editor.md`.

## Writing docs — `page.js` vs `readme.md`

Two audiences, two documents, in the same directory. **Do not blur them.**

**A new module is not done until it has a `page.js` and its parent links to it.** Core class, ext addon, util — whatever it is, adding it means three files, not one: the module, a `readme.md` (design record), and a `page.js` (the reader's introduction). Then register it with the parent — `import x from "./x/page.js"` and add it to that page's `children: [...]`, which is what puts it in the sidebar and gives it a preview card. An undocumented module is invisible: nothing crawls the filesystem, so a page nobody imported does not exist. Write the `page.js` in the same commit — it's the moment you still remember which part was confusing.

Keep it **short and code-first**, per the rules directly below — a good ext page is ~40 lines of mostly `demo()`. Resist explaining the whole design there; that's what `readme.md` is for, and `md.details(import.meta, "readme.md")` puts it one click away at the bottom.

**`page.js` — the reader.** It should read like a beautiful introduction: **code first, zero to hero.** They read with clarity and confidence, see all the things, and understand them. The only way there is absolute simplicity: the minimal case first, then build. Someone who gets a simple foundation fast will figure out the rest themselves.

- **Code first — literally.** The first thing under the title is a code block or a `demo()`, not a paragraph. No preamble, no "in this section we will".
- **Prose is a caption, not a preamble.** Reading order is code → result → sentence. `demo(() => { … }, "the sentence")` puts the caption inside the box, so prose can never detach from the example it describes. (`demo("Label", fn)` still labels above.)
- **SIMPLICITY FIRST. Minimalism.** The basic example before the complete one. Cut every sentence that isn't load-bearing.
- **Zero to hero.** A section is a path, not a fan-out: each page ends by naming the next one, and the sequence gets you from nothing to a real thing. `/framework/start/` is the floor — three files, a working site — and every core page builds from there. Aim each page at one payoff demo where it all comes together.
- **Render the example whenever you can**, and the code that produced it must be visible and **visually grouped** with it — never a rendered thing whose source the reader has to hunt for. `demo(fn)` (`ext/demo`) shows `fn`'s real source and then runs it, one box, one source of truth.
- **Prose is markdown.** Use `md("...")`, not `p()` with backticks — `p()`'s backtick handling only does `<code>`, so bold/italic/links/tables silently don't render. Tables via `md()` beat a paragraph listing options.
- Deep architecture, trade-offs, and rejected alternatives do **not** belong here. Link them: `md.details(import.meta, "readme.md")` puts the whole readme in a collapsed `<details>` at the bottom of the page.

**`readme.md` — the maintainer (and future us).** Highly technical: the architectural dilemmas, what was tried, why the current shape won, what's still open. Not immediately relevant to an end user, so it stays out of their way. Keep it honest and specific — it's the design record, and it's what makes a later refactor cheap. Write entries as **question → options → weighing → verdict**, and record *keep* verdicts too — a written-down "we considered this and said no, because…" is what stops an idea being re-litigated. `framework/readme.md` is the cross-cutting one (open proposals live there); per-class records sit next to their class.

## CSS

**Write as little of it as possible.** `framework/framework.css` should contain nothing you would ever want to override, and a new module should add nothing you have to fight later. Docs live in `framework/styles/` — `page.js` + `readme.md` for the strategy, then one child page per layer (`base/`, `theme/`, `theme/guide/`, `util/`) documenting every line with `demo()`s. **None of those pages ships a stylesheet** — that's the proof the utilities are enough, so keep it that way.

**A new component starts with no CSS, and ideally stays that way.** Build it from utilities and existing component classes first; add a stylesheet only when layout genuinely can't be expressed that way, and then put *only layout* in it. The implementor styles it — a component that ships a look has decided something that wasn't its call, and the look is what breaks when it's reused. Fewer styles is always the better version.

**The ladder — stop at the first rung that works.** Do not skip ahead because a rule "would be cleaner".

1. **Nothing.** The default already handles it.
2. **A utility class** — `flex gap v-center pad h2`.
3. **An existing component's class** — `.page-preview`, `.sidebar-link`, `.page-crumb`.
4. **The module's own `.css` — layout only.** Where things sit, how they size, how they respond. Not color, not borders, not type. The test: *would this rule still be right if the component were dropped into a completely different site?* Flex sizing, yes; `background: #eef0f4`, no.
5. **`/styles.css` — skin.** This site's opinion, loaded last.

**Layout modules provide layout, not looks.** `ColumnPager.css` says `.column-pager > .sidebar { flex: 0 0 var(--sidebar) }`; what a sidebar *looks* like is `Sidebar.css`. When a component styles content it merely contains, that content stops working anywhere else — this is why `.preview`, `.page-title` and `.crumb` moved out of `ColumnPager.css` into `Page.css`. Leave the styling to the implementor; ship the fewest defaults you can.

**If you ever override a `framework.css` rule, that's a bug report about `framework.css`.** Record it in `framework/styles/readme.md` §6 (the eviction list). The fix is to delete the rule or move it behind a class — not to out-specify it downstream. The `pre` case is the canonical one: four stylesheets independently overrode a padding that was simply wrong (`pre` is a block, `code` is inline, one value fit neither).

**`framework.css`'s `@layer theme` IS the base theme** — the look you get when you load no other, not a set of unavoidable framework styles. Using no theme is a supported, finished-looking outcome. This is why the base is allowed opinions: a theme is what replaces them.

**Base-theme selectors stay flat — one element, no descendant combinators.** The entire override model is *"a later `@layer theme` wins at equal specificity"*, so a `.page > h2` in `framework.css` would out-rank a theme's `h2` no matter when the theme loaded. Low specificity there is a feature to maintain on purpose. (`:where()` wrapping was tried and reverted — see `framework/styles/readme.md` §9. Don't reintroduce it without a real override fight to point at.)

**A module styles the classes it emits; generic elements belong to `framework.css`.** `md.css` went from 47 lines to two classes by handing `pre`/`code`/`blockquote`/`table` back — markdown emits plain HTML, and HTML's looks aren't markdown's. An ext owning a generic element gives the site two designs for it.

**The type scale is the whole vocabulary: `h1` `h2` `h3` `h4` + body + `code`**, defined once in `framework.css @layer theme`. Page title / section / sub-section / uppercase annotation. Each is also a class (`.h1`–`.h4`, `.code`), so any element can borrow a level without lying about the outline: `p.c("h2", "…")`. Never invent a font-size in a component — pick a level. The scale sets size/weight/tracking only; **margins are rhythm** and belong to whatever arranges the content (`Page.css` spaces `.page > h2`).

**Tokens cascade — a theme overrides them on `.app` or `body.theme-x`, never at `:root`.** `:root` holds defaults only. That rule is what keeps two variants of the same page renderable side by side. The token set is **public API** (sandbox dirs consume `--prim`/`--bg`/`--subtle`): adding is free, renaming is breaking — alias on the way out. No defensive `var(--x, fallback)` on shared geometry like `--sidebar`; the sharing is the point, and a fallback reintroduces the two-numbers-that-drift problem the token exists to solve.

**Adding a token requires an existing hardcode to replace** — ideally several. A token names a decision that already exists; it does not invent one. `--surface` earned its place by replacing `#fff` in four files.

**Theming: a theme defines tokens, a component consumes them, and neither names the other.** That's the whole decoupling — adding a theme touches no component, adding a component touches no theme. Full record: `framework/styles/theme/guide/readme.md`. The rungs, in order: a global token → a component token (`var(--tab-bar-bg, var(--surface))`) → a rule on generic HTML → **never** a rule naming a component class. That last one is a bug report: the component is missing a token.

**A theme styles generic elements and nothing else — the exact inverse of a module.** Modules style only the classes they emit; themes touch only `h1`, `a`, `table`. Same boundary, opposite sides.

**Light and dark are modes of one theme, not two themes.** One file, `color-scheme: light dark` on the theme class, `light-dark(a, b)` per token — so a token cannot exist in one mode and go missing in the other. A theme declares its own `.light`/`.dark`; honoring the axis is a promise, and a theme with no `light-dark()` in it would be lying by accepting the class.

**Theme naming: a theme is a proper noun, an axis is an adjective.** `paper`, `terminal`, `lew42` — names, not descriptions, and they never combine. Axes (`dark`, `compact`) are single dimensions and do: `class="app theme-paper dark compact"`. Not `theme-blue` (a lie after the first redesign), not `theme-big` (a density axis in costume), not `theme-2`. The test: does the variant change the *vocabulary* or only the *values*? Values → an axis or token override. Vocabulary → a new theme. Almost everything is values. (`body.theme-1` in `styles.css` is the legacy anti-pattern; it has real consumers in `alex/` and stays.)

**Naming: a class is prefixed with its owning component** — unless the selector already starts with that component's own class. `.column-pager .crumb-sep` is fine (it can't reach outside); `.page-preview` must be prefixed, because it's styled unscoped on purpose so a card looks like a card anywhere, and an unscoped name has nothing but the name for a namespace. CSS has one global namespace and no build step to hash it, so **the class name is the registry** — a JS selector manifest would just be a second source of truth that drifts.

**If your CSS styles a class you don't emit, `import` the module that emits it.** `View.stylesheet()` runs at module scope, so the import is the *loading edge*, not an annotation — `ColumnPager.css` styled `.page-preview` for months while `ColumnPager.js` never imported `Page`, working only because `App.js` happened to. Comment the import with the class names or someone will delete it as unused:

```js
/* css: .page, .page-title, .page-previews, .page-preview */
import "../Page/Page.class.js";
```

It does not detect renames — it makes the dependency greppable, which is the win. **Core still may not import an ext**, so a core rule styling an ext class (`Page.css`'s `.page > .md`) is undeclarable and must be moved or deleted, not annotated.

Mechanics:

- `framework.css` is loaded by App before render; defines `@layer base, theme, util` (reset, tokens like `--prim`/`--bg`/`--mono`, utilities like `flex`, `gap`).
- Pages and components load their own stylesheets via `View.stylesheet(import.meta, "...")`; these are awaited before the app injects.
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
