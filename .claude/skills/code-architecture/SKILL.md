---
name: code-architecture
description: Conventions, traps, and house style for writing code in the lew42 framework — a no-build, native-ESM view framework. Load before writing or editing any JS or CSS under public/, before adding a class, method, page.js, or stylesheet, and before naming anything on View/Page/App/Router/Pager. Covers assign-based OOP, the synchronous-capture trap, the CSS ladder and layer order, and the failures that never throw.
---

# Code architecture

No bundler, no build step, no transpile. Everything in `public/` is served as-is
and runs in the browser as native ESM. The whole thesis is that you can read a
class top to bottom and know what happens.

**MVP first, always.** Get the simplest piece working simply before anything
fancy. The base API should cover most cases with no configuration; everything
beyond that is an override or a subclass, opted into visibly by the file that
wants it. An option is API surface forever — the override lever usually already
covers it.

**Code is the documentation.** A short real example beats a paragraph. If you
can't name a thing clearly, the design is wrong, not the name.

---

## 1. Capturing is synchronous — never build DOM after an `await`

The bug this repo has shipped most. `View.captor` is one global with a push/pop
stack, and `append_fn` restores it the instant your function *returns* — for an
`async` function that is its **first `await`**, not its last line. Elements built
after that land wherever the captor drifted, usually `$app`. Nothing throws.

```js
// WRONG — div built after the await; lands in body > div.app, outside the page
async previews(){
    const children = await Promise.all(names.map(n => this.child(n)));
    return div.c("page-previews", () => children.forEach(c => c.preview()));
}

// RIGHT — container captured NOW, filled later, explicit target
previews(){
    return div.c("page-previews", async ($previews) => {
        const children = await Promise.all(names.map(n => this.child(n)));
        children.forEach(c => $previews.append(c.preview()));
    });
}
```

**The mechanical check: a factory call that appears after an `await` is wrong.**
No judgment required — scan for it.

Inside an async callback you must name the target (`$previews.append(…)`); the
ambient captor is long gone. Returning a **promise** is the other blessed form —
`append_promise` awaits it and appends to a view that was placed synchronously,
which is why `content(){ return md.file(import.meta, "readme.md") }` works with no
support from `Page`.

Assume async capturing does not work. Sync-render-then-async-append covers every
case.

---

## 2. Every constructor is `Object.assign`-based

Copy this exactly. New classes must match.

```js
constructor(...args){ this.assign(...args); }
assign(...args){ return Object.assign(this, ...args); }
```

`...args` — never named parameters, never a single `config`. Nothing to remember
about argument order; defaults live on the prototype so an assigned value just
overrides. Later args win, so a caller layers what it must inject on top of
whatever the user passed, with no branch:

```js
this.router = new Router(this.router, { app: this });   // user config, then what App must supply
```

`this.router` may be `undefined`, a POJO, or already a Router. None need a case.
**This is why injecting a dependency costs one object key and no signature
change** — and why a Pager subclass needs no constructor at all:

```js
pager(){ return new ColumnPager({ root: this, app: this.app }); }
```

### Two ways a property arrives

- **Constructor-assign** — what the caller knows up front.
- **Adoption** — what only the container knows. A parent `Page` sets
  `child.parent = this`; `App.load_page` sets `page.app = this` at render time.

A `page.js` never mentions `app` or `parent`. You assign what you know; what
knows you assigns itself. Pages are built in userland at module scope, so there
is no constructor for App to inject into — adoption is not a workaround, it's the
mechanism.

### Never read `window.app` inside `framework/`

It's a console convenience. It is also `undefined` during boot — `app.js` runs
`window.app = new App()`, so the global is unset while the App's own `config()`
executes — and it hard-codes one App per document. Take the app as a constructor
arg, read `this.app`.

---

## 3. Derive inside the class, not at the call site

If a value can be worked out from what the object has, the object works it out.
A default applied by a caller is a rule nobody can find, and the moment there are
two ways to build the thing, they disagree.

```js
// WRONG — the defaulting lives OUTSIDE the class it belongs to
add(name, page){ page.assign({ title: page.title ?? name }); }

new Page({ name: "intro" })       // no title
parent.add("intro", { … })        // title: "intro"     ← same object, two results
```

When a value arrives late, **re-derive — don't duplicate the `??`.** One
idempotent method, called from every path that changes its inputs:

```js
constructor(...args){ this.assign(...args); this.naming(); }
adopt(parent, name){ this.assign({ parent, name }); this.naming(); }

naming(){
    this.url   ??= this.meta && new URL(".", this.meta.url).pathname;
    this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
    this.title ??= this.name;
}
```

Every line `??=`, so it is idempotent and an explicit value always wins.

**The test: build the object a second way — do you get the same object?** If no,
the logic is on the wrong side of the constructor.

---

## 4. No magic getters — if it does work, it's a method

Parens are the only signal a reader gets.

```js
page.chain()      // ✓ walks a tree — the parens say so
page.chain        // ✗ reads like a stored field, hides a tree walk
```

A getter is fine for a **cheap, stable alias** of existing state
(`get page(){ return this.active; }`). Anything that walks, allocates, fetches,
or could return a different value on two consecutive calls is a method.
`App.get loaded()` was the cautionary case — a fresh `Promise.all` built on every
access, invisible at the call site.

**Say a new name out loud before you write it.** A name is the API and the
documentation at once. Short and exactly right beats long and merely complete
(`add()`, `chain()`, `container()`); earn length with rarity (`shared_depth()`,
`load_ancestors()`, `seo_title()`). Before adding a name to `View`, `Page`,
`App`, `Router` or `Pager`, propose it and wait.

**Name a `$prop` after the class it carries.** `this.$sidebar_inner` holds
`div.c("sidebar-inner")` — kebab class read back as snake_case, so you get from
CSS to JS and back without opening the other file. If the two can't match, rename
the *class*, not the property.

---

## 5. Page — the blessed shape

```js
import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,        // derives url; makes link() work while dormant
    title: "Text",
    content(){ p("Body copy."); }
});
```

A Page is **dormant** — creating one renders nothing, so `export default new
Page(…)` is always import-safe. It renders when placed. You always write
`new Page(...)`, never a subclass.

- `render()` — build the DOM (one `div.page`: title + content).
- `activate()` — become THE page (`document.title`, meta). Called on the target
  only, so embedded pages can't clobber the title.
- The tree: a parent declares `children: [a, b]` and adopts them. **Imports flow
  DOWN, `.parent` links point UP.**

`App.load_page` is fully duck-typed — `page.host?.()`, `page.activate?.()`, no
`instanceof` anywhere. A page module's default export may be a Page, a View, a
function, a string, or nothing at all. Don't assume `instanceof Page`.

> How a topic opts into a layout (`pager()` / `host()`) is **under discussion** —
> three coordinating places. Don't propagate the pattern until it settles.

---

## 6. CSS — write as little as possible

A new component starts with **no stylesheet**, and ideally stays that way. Climb
the ladder and **stop at the first rung that works** — do not skip ahead because
a rule "would be cleaner":

1. **Nothing** — the default already handles it.
2. **A utility class** — `flex gap v-center pad h2`.
3. **An existing component's class** — `.page-preview`, `.sidebar-link`.
4. **The module's own `.css` — layout only.** Where things sit, how they size.
   Not color, not borders, not type.
5. **`/styles.css` — skin**, in `@layer site`.

The test for rung 4: *would this rule still be right if the component were
dropped into a completely different site?* Flex sizing yes; `background: #eef0f4`
no. **A component that ships a look has decided something that wasn't its call.**

### The two cascade rules that fail silently

```css
@layer base, theme, site, util;     /* restate ALL FOUR, in every stylesheet */
```

- **The first `@layer` statement fixes the order**, and a name first seen later is
  appended at the **end**. `Page.css`'s link is injected before `framework.css`'s
  (App.js imports Page at module scope, and imports hoist), so a short list there
  silently drops `site` past `util`.
- **Every rule must be inside a layer.** An unlayered rule beats *every* layer at
  any specificity — an unlayered `.page` in `styles.css` once defeated a
  four-class-deep `.column-pager .column.narrow .page`.

### Ownership, and the ratchet

- **A module styles the classes it emits; generic elements (`pre`, `table`, `h2`)
  belong to `framework.css`.** A theme is the exact inverse — it styles only
  generic elements and never names a component class.
- **Prefix a class with its owning component** (`.page-preview`, not `.preview`)
  unless the selector already starts with that component's own class
  (`.column-pager .crumb-sep` is fine). CSS has one namespace and no build step —
  **the class name is the registry.**
- **If your CSS styles a class you don't emit, `import` the module that emits it.**
  `View.stylesheet()` runs at module scope, so the import *is* the loading edge,
  not an annotation. Comment it or someone deletes it as unused:
  ```js
  /* css: .page, .page-title, .page-previews, .page-preview */
  import "../Page/Page.class.js";
  ```
- **Overriding a `framework.css` rule is a bug report about `framework.css`.**
  Escalation (specificity → a layer → unlayered → `!important` → inline) is a
  one-way ratchet: each rung works once, and spending it raises the cost for
  everyone after you. **Never escalate downstream — de-escalate upstream**
  (a flatter selector, a token). The framework holds the low ground on purpose.
- **Never invent a font-size.** The scale is the whole vocabulary: `h1 h2 h3 h4`
  + body + `code`, each also available as a class (`p.c("h2", …)`).
- **A token needs an existing hardcode to replace**, ideally several. Tokens are
  public API: adding is free, renaming is breaking — alias on the way out.

---

## 7. Failures that never throw

- **Mutual parent/child imports.** `import` is hoisted regardless of textual
  position, and a circular partner reads an uninitialized binding — so it breaks
  *only on deep reloads* (`/a/` throws, `/a/b/` works). One-way imports down,
  adoption for the backref. No exceptions.
- **Chaining onto `code.js()` in argument position** inside a phrasing parent is
  silently discarded — classes, attributes, **and `.on()` handlers**, giving you a
  dead listener with nothing in the console:
  ```js
  p("Call ", code.js("x").ac("wide"), "!")   // .ac() and .on() are LOST
  p.c("wide", "Call ", code.js("x"), "!")    // ✓ class on the sentence
  p(() => code.js("x").ac("wide"))           // ✓ capture form, correct by construction
  ```
- **`classify()` runs inside `super()`, before class fields initialize.** A
  `classes = "docs"` field arrives too late. Name the subclass instead —
  `class DocsPager extends ColumnPager {}` renders `.docs-pager.column-pager.pager`.
- **Resolve module-relative urls against `import.meta`, never the document.** The
  SPA fallback makes the document url the *route*, so a document-relative fetch
  from `/framework/core/x` misses. `md.file(import.meta, …)`,
  `View.stylesheet(import.meta, …)`, `View.load(import.meta, …)`.
- **`p()` only handles backticks.** Bold, links and tables render as literal text.
  Use `md()` for anything with formatting.
- **A stylesheet that 404s no longer hangs the app** — it resolves and warns, and
  the page renders unstyled. Check the console.
- **Windows: `pkill -f "node server.js"` silently matches nothing.** The orphan
  then busy-loops libuv on a dead console handle and pins a full CPU core. Capture
  the PID and `taskkill //F //PID $PID`, or reuse the dev server already on port 80.

---

## 8. Before you add anything

- **Never add an npm dependency without asking** — the three-package list is a
  feature, devDependencies included. Tooling for the person at the keyboard
  (a browser driver, a profiler) is installed **globally**, not in `package.json`.
- **No black magic.** Behavior you can't see from the file that implements it —
  a property read by a class that never mentions it, an inert marker interpreted
  by a `new` three files away. If a file names a class, that file should generally
  construct it.
- **Propose before major surgery.** A rename touching a core class, its callers
  and a dozen doc references is a design decision with a large edit attached. Ask
  in three lines and wait — a sunk edit *presents* an unsettled direction as
  decided. (Unless autonomy was explicitly granted: then make the call, state the
  assumption, keep going.)
- **A new module isn't done until it has a `page.js` and its parent links to it.**
  Nothing crawls the filesystem — an unimported page does not exist.

---

## Deliberately not in this file

Reference you open when you get there, not context you pay for every session:
theming, tokens and light/dark; the `is.*` table; markdown/demo/highlight ext
internals; the unbuilt editor; and the doc-writing split between `page.js` and
`readme.md`, which matters when you add a module rather than when you write code.

Each has a `readme.md` next to its code, and those records are better than a
summary of them would be. Start with `core/<Class>/readme.md`.

**`core/new/1/` is not a sketch — it is where the shipping design was proved.**
Its `Router.js` is line-for-line the one in `core/Router/`, and `children`,
`container()` and `Router.mark()` all arrived from it unchanged. Do not import it
(that would be a second copy of the classes), but **do** read
`core/new/1/readme.md` — it is the long form of the core records, with the
measurements. `core/new/0/` and `core/new/starter/` genuinely are earlier
sketches. `core/legacy/` is the dead Pager tier.
