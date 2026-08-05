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

**Say a new name out loud before you write it.** A property or method name is the API and the documentation at once, and it's what every future reader has to trust. Before adding a name to a class other people touch — `View`, `Page`, `App`, `Router` — propose it and let it be corrected. This is cheap up front and expensive later: `layout` was a concept invented for what was literally `.ac(this.layout)`, and `derive()` never said *what* it derived. Both had to be unpicked across a dozen files.

The test is whether the name answers **who / what / when / where / why / how** on its own, before the reader opens the method:

- **Short is usually best** — `add()`, `chain()`, `container()`, `label`. A short name that's exactly right beats a long one that's merely complete.
- **Length has to be earned**, by a thing that's rare or genuinely compound: `shared_depth()`, `load_segments()`, `seo_title()`. A rarely-called sub-method can afford syllables; something on the hot path of every page cannot.
- **A scoping prefix is worth the characters when the bare word is contested.** `log_label()` exists precisely so `label` can stay the human-facing one.
- **If you can't name it clearly, that's usually the design talking** — the method probably does two things, or lives on the wrong class.

Aim for clarity when reading, never ambiguity. A reader who has to open the method to learn what the name meant has already paid for a bad name.

**Default to checking in; autonomy has to be granted.** When the user says *"work autonomously"* or *"don't stop"*, they've left the keyboard — a question then costs an hour of nothing happening. In that mode: make the call, state the assumption plainly, and keep going.

Absent that, assume you can ask. Do the investigation first, then give a short summary and the one or two decisions you actually need — rather than executing a plan they've never seen. The asymmetry is the whole point: a question asked while they're at the keyboard costs seconds, the same question asked while they're out costs the session, and a name shipped without agreement costs every reader after it.

**Keep responses short and scannable — but never drop what matters.** Lead with the finding. Use a hierarchy of headings so a long answer can be skimmed instead of read start to finish. Keep explanations simple: detail that probably doesn't change the next decision is noise, and the reader can always ask for more.

The one thing brevity does not license is silence. If something could be important, say it — a single sentence with no elaboration is enough, and lets the reader pull the thread if they want it. Short and complete beats short and tidy.

**Never add a dependency without asking. The short list in `package.json` is a feature.** Three small packages — `chokidar`, `express`, `ws` — and all three serve the dev server only; nothing in `public/` depends on anything. That's what makes `npm install` instant, the repo auditable, and "no build step" true rather than aspirational. Adding a fourth is a decision for the humans, every time, including "just a devDependency" — a devDependency is still something every dev on the team downloads.

**Tooling for the person at the keyboard is not a project dependency — install it globally.** A browser driver, a profiler, a scratch test runner: these are how *you* look at the code, not what the code needs to run. `npm i -g playwright` and resolve it at runtime; don't make the whole team download a browser so one script can drive it. The test is *"would this repo be broken without it?"* — if no, it doesn't belong in `package.json`. The same goes for `scripts`: a work-in-progress prototype doesn't earn an npm script, because scripts read as blessed entry points long after the prototype is gone.

**Don't pollute the repo with your own scratch work.** Launcher scripts, agent transcripts, `.tmp-*` directories, throwaway harnesses, intermediate JSON — anything that exists to *run a process* rather than to be part of the site — goes in the session scratchpad, never in the working tree. `launch-council-3.sh` and `.tmp-council/` both landed at the repo root, both untracked, and both showed up in every `git status` afterwards as noise nobody could safely delete without reading first. Even under `public/`, a directory of raw agent output is scratch — it looked like a deliverable because it was long.

The test is *"would someone cloning this repo need this file?"* If no, it never belonged here. A process's **conclusion** can absolutely be committed — a readme recording what was decided and why is the whole point — but the machinery that produced it, and the raw material it chewed through, are not. Write the conclusion down; throw the rest away.

**No black magic.** Black magic is behavior you cannot see from the code that implements it: a property read by a class that never mentions it, a method called by something three files away, an order of operations you have to memorize. It fails the test *"can someone read this file and know what happens?"* Self-evident code is the opposite — WYSIWYG, no hunting, nothing to remember.

When something must be coordinated across files, make the coordination visible at the call site rather than clever. Prefer an explicit method call in the file that wants the behavior over an inert marker interpreted elsewhere.

**A super simple base API that just works, then extend.** The default path should cover most cases with no configuration and no ceremony. Everything beyond that is an override or a subclass — declarative, opt-in, and visible in the file that opts in. Resist adding options, flags, or hooks to the base: an option is API surface forever, and the override lever usually already covers it.

**Every method should read like a friendly sentence.** That's the target, and it's worth rewriting a method two or three times to hit it. Someone new to JS should be able to read a core class top to bottom and follow it without stopping.

Two habits get you there:

- **One line beats two** — unless two are genuinely clearer. `return this.loaded[name] = page.assign({ name, parent: this, app: this.app })` says one thing; splitting it into four statements says four. But never compress at the cost of readability: a clever `.then()` chain or a nested ternary that saves a line and costs a re-read is a bad trade, every time.
- **Encapsulate the fiddly bit and name it.** `this.shared_depth(from, to)` reads; the `while` loop it replaces does not. The method body can be ugly — it's one small thing in one place — but the *call site* should read as prose. `find_common_ancestor(a, b)`, `link_clicked(e)`, `container()` all pass that test.

**No magic getters — if it does work, make it a method.** `page.chain` reads like a stored field you're looking at; `page.chain()` tells you something is happening. The parens are the signal, and they're the only signal a reader gets — a getter hides an allocation, a tree walk, or worse behind syntax identical to a plain property.

A getter is fine for a **cheap, stable alias of existing state** (`get page(){ return this.active; }`). Anything that walks, allocates, fetches, or could return a different value on two consecutive calls is a method. `App.get loaded()` is the cautionary example: it builds a fresh `Promise.all` on *every* access, which is invisible at the call site.

**Too many comments junk up the base classes.** Wall-to-wall explanation in `View`, `Page`, `Router`, `App` does not instill clarity or confidence — it reads as anxiety, and it buries the code the reader came for. Keep base-class comments to what the code genuinely can't say: a non-obvious *why*, a real gotcha. Design rationale, alternatives weighed, and history belong in the neighboring `readme.md`, which exists precisely for that.

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

**Adoption — how `app` and `parent` get where they're going.** You assign what you know; what knows you assigns itself. A `Page` is constructed in userland at module scope (`export default new Page(…)`), so App has no constructor to inject into — instead `Page.child()` assigns `app` to each page as the Router walks to it, exactly as a parent Page assigns `child.parent = this` when it adopts its declared children. No page.js ever mentions `app`.

So there are two ways a property arrives, and they don't conflict: **constructor-assign** for what the caller knows up front, **adoption** for what only the container knows.

**Construct things where someone will look for them.** If a file names a class, that file should generally be where it's constructed. An inert marker in one file, interpreted by `new` in another, is the black-magic shape above.

**Name a `$prop` after the class it carries.** A `$`-prefixed property holds a View, and the property name should be the kebab-case class on that view, read back in snake_case — so `this.$sidebar_inner` is `div.c("sidebar-inner")`, and `this.$page_content` is `div.c("page-content")`. Nothing to remember: you can go from a class in the CSS to the property that holds it, and back, without opening the other file.

```js
this.$main = div.c("main", () => {
    this.$pages = div.c("pages");        // ✓ name and class agree
});

this.$page = div.c("main-inner");        // ✗ which class is this? which prop styles it?
```

The bad line is the real one this rule came from. `$page` sounded like "the page" but held `.main-inner`, so the CSS said `.main-inner` and the JS said `$page`, and neither led to the other. If the two can't match, the class is probably wrong — rename the class, not the property.

**Derive inside the class, not at the call site.** If a value can be worked out from what the object already has, the object works it out. A default applied by a caller is a rule nobody can find and everybody has to remember — and the moment there are two ways to build the thing, they disagree:

```js
// ✗ the defaulting lives OUTSIDE the class it belongs to
add(name, page){ page.assign({ title: page.title ?? name }); }

new Page({ name: "intro" })       // no title
parent.add("intro", { … })        // title: "intro"      ← same object, two results
```

The test is *"if I build this a second way, do I get the same object?"* If no, the logic is on the wrong side of the constructor.

**When a value arrives late, re-derive — don't duplicate the `??`.** Some properties genuinely can't be known at construction: a Page built inline learns its `name` and `url` only when a parent adopts it. That's not a reason to scatter fallbacks at every adoption site. Put the derivation in one named method and call it from both places:

```js
constructor(...args){ this.assign(...args); this.naming(); }
adopt(parent, name){ this.assign({ parent, name }); this.naming(); }

naming(){                       // idempotent, runs whenever inputs change
    this.url   ??= this.meta && new URL(".", this.meta.url).pathname;
    this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
    this.title ??= this.name;
}
```

One place to read, one place to change, and construction and adoption cannot drift apart. The cost of getting this wrong is not a bug you'll see — it's a subtly different object depending on how it was made.

> **RESOLVED.** The Pager tier that used to live here is gone — `pager()`, `Page.host()` and `load_ancestors()` with it. An arrangement is now a **CSS class a page opts into**, driven by two classes `Router.mark()` writes: `.active-page` on the leaf and `.active-ancestor` on everything above it. Read `framework/core/Page/Page.css` (the arrangement contract) and `Router.mark()`. The old tier and its design record are in `framework/core/legacy/Pager/`.

## How the site works

1. `public/index.html` is the universal fallback document. It loads one script: `/app.js`.
2. `public/app.js` creates the `App` singleton (`window.app`) and re-exports the framework (`export * from framework/core/App/App.js`).
3. **The tree is walked, not computed.** `App.load()` imports exactly one module — `/page.js`, the root — and hands the url to `Router.load()`, which walks one segment at a time through `page.child(name)`. A child is `import(this.url + name + "/page.js")`, and **only names the parent declared in `children` are ever fetched** — so a bad url costs no doomed request, and nothing crawls the filesystem.

   Every node is a directory: `/a/b/` → `/a/b/page.js`. The old `.page.js` sibling convention (`/a/b` → `/a/b.page.js`) is **gone**; a file using it is unreachable. `App.path_to_page_url` still exists as a frozen copy of the old rule for two sandbox Routers that call it, and is not the router.
4. Page modules import the framework back from `"/app.js"` (same module instance via the browser's module registry). A default export may be a `Page`, a POJO of options, a function or a string — `Page.add()` wraps whatever it gets. **A POJO key shadows a `Page` method of the same name**, so a `render()` key must return a view or `activate()` throws; `content()` is the seam you actually want.
5. Pages are lazy because the walk is lazy: a `children` entry is a *name* until someone navigates to it. New pages are a `page.js` **plus a `children` entry on the parent** — declaring is the registration, and an undeclared page is a 404.

### App lifecycle (`framework/core/App/App.js`)

`constructor` → `config()` → `render()` (creates `this.$body`, `this.$app`, sets captor) → `await load()` (page import + all loaders) → `initialize()` → `inject()` ($app into body) → `ready.resolve()`.

- `this.loaders` collects promises (stylesheets, fonts) that must resolve before injection — pages can add more during their module execution.
- `app.font(name)` loads predefined fonts (Montserrat, Material Icons) via the FontFace API.
- `App.stylesheet(url)` / `View.stylesheet(import.meta, relativeUrl)` appends a `<link>` and tracks its load promise.
- Page load errors are caught and rendered as a "Page Load Error" view, into `$pages` and never `$app` — emptying `$app` would delete the chrome, so the one page that most needs navigation would be the one page without it.
- Navigation is duck-typed throughout (`page.activate?.()`, `is.fn(this.route)`) — no `instanceof` anywhere.
- **`Router.mark_links()`** runs after every navigation: one pass over `$app` adding `.active` (href === current path) and `.in-path` (href is a directory prefix of it) to in-app anchors. **No view should compare `window.location` itself** — sidebars, breadcrumbs and preview cards all get their active state from this one pass, and CSS decides what each kind of link does with the class. (It lived on `App` once; `framework/readme.md` said it should stay there and it moved anyway. It is on `Router`.)
- **Two instance methods exist only for consumers outside `framework/`** — `app.stylesheet()` and `App.path_to_page_url()`. The rewrite dropped both and 404'd `alex/`, `arya/` and `castin/`, which call `app.stylesheet()` at module scope. Rename freely in here; alias on the way out.

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

**Capturing is synchronous. Never build DOM after an `await`.** `View.captor` is one global with a push/pop stack, and `append_fn` restores it the instant your function *returns* — which for an `async` function is at its first `await`, not when it finishes. Every factory call after that point auto-appends to whatever the captor has since become, usually `$app`. Nothing throws; the elements simply appear somewhere else in the document.

```js
// WRONG — the div is built after an await, so it lands wherever the captor now is
async previews(){
    const children = await Promise.all(names.map(name => this.child(name)));
    return div.c("page-previews", () => children.forEach(child => child.preview()));
}
```

That exact method put `.page-previews` in `body > div.app` — a sibling of `.main`, outside the page entirely.

**The reliable shape: capture the container synchronously, then append into it asynchronously.** The container is placed while the captor is still correct; the data arrives later and goes into a view that already knows where it lives.

```js
// RIGHT — the div exists and is placed NOW; contents land inside it later
previews(){
    return div.c("page-previews", async ($previews) => {
        const children = await Promise.all(names.map(name => this.child(name)));
        children.forEach(child => $previews.append(child.preview()));
    });
}
```

Note the explicit `$previews.append(…)` — inside an async callback you must name the target, because the ambient captor is long gone. Returning a **promise** is the other blessed form, since `append_promise` awaits it and appends to `this`, a view that was placed synchronously — that's how `md.file()` works and why `content(){ return md.file(...) }` needs no support from `Page`.

Assume async capturing does not work. It has never been battle-tested, and there is no reason to test it: sync-render-then-async-append covers every case and is WYSIWYG at the call site.

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

- `meta: import.meta` derives `url` (`/docs/page.js` → `/docs/`); `link(text?)` works while dormant. A page adopted by a parent derives `url` from `parent.url + name` instead, so an inline page never writes a path.
- `render()` = build DOM once, cached in `this.view`: one `div.c("page")` (title h1 + content). `activate()` = place it in its container and become THE page. **An overridden `render()` owes three things**, all silent when missed: return/assign `this.view`, carry the `.page` class, and never nest a second `.page` inside.
- Constructor is `assign`-based: extra properties pass through as inert data (`icon`, `col`, `classes`).
- `children` declared two ways: `"a b c"` (lazy names) or `[pageA, pageB]` (imported). **Imports flow DOWN, `.parent` links point UP** — a mutual import breaks only on deep reloads.
- `add(name, child)`, `child(name)`, `route(name)` for urls you can't list in advance, `tabs(names)`, `previews()`.
- Design record + deferred features: `framework/core/Page/readme.md`.

## Arrangement — the tier that replaced Pager

`Pager`, `ColumnPager` and `TabPager` are **dead code in `framework/core/legacy/`**. Nothing exports them; `/app.js` never did after the rewrite. Do not cite them as current.

An arrangement is now **a CSS class a page opts into**, resolved against two classes `Router.mark()` writes on every navigation:

- `.active-page` — the leaf. `.active-ancestor` — everything above it. That is the entire contract.
- `.page` is `display: none` by default; the leaf shows, and an ancestor shows only when it actually **contains** the leaf (`:has(.page.active-page)`) — so "replace" is what you get for free and nesting is what you opt into.
- A page claims a region for its children with `this.$pages = div.c("pages")` in an overridden `render()`. `.pages > .default` is what that region shows when none of its children is active — the index-route problem.
- Opt-in looks: `.paper` (one page), `.papers` (a region's children), `col: "narrow"`.
- `Page.tabs(names)` is the one built-in navigation structure: a `.tab-bar` over a `.tab-panel`. **Only the first tab is imported**, so the bar can show one real title; the rest stay names until clicked. The first tab owns the parent's url. It has no overflow handling — right for ~5 children, unusable for twenty, and nothing will warn you.

## Ext (`framework/ext/`)

A fourth tier beside `core/`, `dev/`, `util/`: **opt-in addons, free to patch core.** Core never imports an ext — the arrow only points one way. Vendor dependencies into the ext's own directory; no CDN imports at runtime. Opting in is an import; *this site* opts in for every page, once, in `app.js` (so `md` and `demo` are available from `/app.js` everywhere).

`ext/markdown/md.js` (vendors `marked.esm.js`) — importing it installs `View.prototype.md()`; the default export is an `md()` element factory.

```js
p().md("**inline** markdown");                           // into an existing view
md("Hi.").ac("note");                                    // a real <p>, captured & chainable
md.file(import.meta, "readme.md", { h1: false });        // a promise of a div.md
md.details(import.meta, "readme.md");                    // the same, in a collapsed <details>
```

`md.file` resolves against `import.meta`, not the document (the SPA fallback makes the document url the *route*, so doc-relative fetches miss). It returns a **promise** so `View.append_promise` places it and the Router can await it before swapping — `content(){ return md.file(...) }` needs no change to `Page`. `{ h1: false }` drops the readme's leading heading, since `Page` already renders `title` as an h1.

`ext/demo/demo.js` — `demo(fn)` renders `fn`'s source (from `fn.toString()`, de-wrapped and dedented) above the result of running it, boxed together. One source of truth, so an example cannot drift from what it renders. Strings before the function label the box; strings after caption it (`demo(fn, "caption")` — the caption renders inside the box, below the result). The caption uses `View.prototype.md` **if markdown has been imported**, falling back to `p()` backticks — a soft dependency, so `demo/` never imports `markdown/`. The code block uses `code.js()` on the same terms.

`ext/highlight/highlight.js` (vendors highlight.js 11.11.1 `es/` — js, css, xml, markdown, json) — importing it **enhances core's `code` factory in place** and **highlights every markdown code fence on the site**. `code()` and `code.c()` are untouched; the ext adds siblings:

```js
code.js("const x = 1");                          // also .html .css .md .json
code.fn(() => { … });                            // a FUNCTION, stringified, never run
code.lang("json", src);                          // the general form
code.file(import.meta, "example.js");            // a promise of a highlighted block
```

**`code.fn()` is the one that matters.** A code example written as a string is dead text in the editor — no highlighting, completion, formatting, or syntax errors. Written as a function it's live code the IDE checks, and the page shows exactly what was checked. It stringifies via `util/source` (shared with `demo()`, so the two can't drift) and **never calls** the function — that's the whole difference from `demo(fn)`, which stringifies *and* runs.

**Block-aware, from the captor — three contexts, not two.** A block parent (`div`, `section`, `td`, …) gets `<pre class="code-block"><code>`; a phrasing parent (`p`, `li`, `span`, `a`) gets a bare `<code class="code-inline">`; a `<pre>` parent gets a bare `<code>` with **no** `code-inline`, because that class carries `white-space: nowrap` and would collapse a multi-line block onto one line. The tag list mirrors `ext/markdown`'s `block_tags` deliberately. Because arguments are evaluated *before* the factory that receives them, `p("Call ", code.js("x"))` sees the grandparent as captor and guesses wrong — so a `code-block` landing in a phrasing parent is unwrapped at `append`. Guess from the captor, correct at append.

**Sharp edge:** that correction discards the `<pre>` it was chained onto, so anything chained in *argument position* inside a phrasing parent is silently lost — `.ac()`, `.attr()`, and `.on()` handlers alike. Listeners can't be moved (`View.on()` keeps no registry). Argument position is for plain `code.js(src)`; to chain, put the class on the sentence (`p.c("wide", "Call ", code.js("x"))`) or use the capture form (`p(() => code.js("x").ac("wide"))`), which is correct by construction. Full analysis in `ext/highlight/readme.md`.

Fence highlighting works by patching two `View` methods, **both synchronous, so neither can FOUC**: `html_unsafe` (markup written through a View — `.md()`, `md.file()`, multi-block `md()`) and `prerender` (markup a View *adopts* — the single-block branch of `md()` builds its DOM off a `<template>` and never touches `html_unsafe`). A `requestAnimationFrame`/`MutationObserver`/on-ready sweep would run a task later and flash plain code for one frame — that's why this is a patch, not a post-pass. The pass skips anything already carrying `.hljs`, because every View that *adopts* an element re-scans its whole subtree — idempotent is not the same as free. No import coupling either way: `highlight/` doesn't import `markdown/`, it just recognizes the `language-*` class marked emits. An unregistered language degrades to escaped plain text, never throws. Design record: `framework/ext/highlight/readme.md`; the unbuilt textarea-overlay editor is specced in `editor.md`.

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
5. **`/styles.css` — skin.** This site's opinion, in `@layer site`.

**Escalation is a one-way ratchet: specificity → a layer → unlayered → `!important` → inline.** Each rung works once, and spending it raises the cost for everyone after you. So: **never escalate downstream, de-escalate upstream.** When site CSS can't beat framework CSS, lower the framework (a flatter selector, a token, `:where()` around the one offending rule) — never raise the site. The framework holds the low ground on purpose so nobody downstream has to climb. This is the method behind "override = bug report"; the worked example is `--code-bg` in `framework/styles/readme.md` §13.

**Layout modules provide layout, not looks.** A layout says `.thing > .sidebar { flex: 0 0 var(--sidebar) }`; what a sidebar *looks* like is `Sidebar.css`. When a component styles content it merely contains, that content stops working anywhere else — this is why `.page-preview` and `.page-title` live in `Page.css`, not in whatever happens to contain them. Leave the styling to the implementor; ship the fewest defaults you can.

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

**If your CSS styles a class you don't emit, `import` the module that emits it.** `View.stylesheet()` runs at module scope, so the import is the *loading edge*, not an annotation — a layout stylesheet styled `.page-preview` for months while its own JS never imported `Page`, working only because `App.js` happened to. Comment the import with the class names or someone will delete it as unused:

```js
/* css: .page, .page-title, .page-previews, .page-preview */
import "../Page/Page.class.js";
```

It does not detect renames — it makes the dependency greppable, which is the win. **Core still may not import an ext**, so a core rule styling an ext class (`Page.css`'s `.page > .md`) is undeclarable and must be moved or deleted, not annotated.

Mechanics:

- `framework.css` defines the tokens, the base theme and the utilities.
- **The layer order is `@layer base, theme, site, util;` and every stylesheet must restate it IN FULL.** The first `@layer` statement fixes the order and a name first seen later is appended at the *end*, so one short list drops `site` past `util`. This is not theoretical: `Page.css`'s `<link>` is appended *before* `framework.css`'s (App.js imports Page at module scope, and imports hoist above App.js's own `View.stylesheet()` call), so `Page.css` establishes the order for the whole site.
- Component CSS goes in `theme`. Site CSS goes in `site`, which beats `theme` at any specificity — so `/styles.css` never has to escalate. `util` stays last: you typed `.pad` on purpose.
- Pages and components load their own stylesheets via `View.stylesheet(import.meta, "...")`; these are awaited before the app injects.
- **Every stylesheet must be inside `@layer` — an unlayered rule beats every layer regardless of specificity.** This is the cascade rule that bites: an unlayered `.page { padding: … }` in `styles.css` silently defeated a four-class-deep component rule.
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
