# Framework — design record

Per-class records live next to their code (`core/App/readme.md`,
`core/Page/readme.md`, `core/Pager/readme.md`, `core/Router/readme.md`). This
file is the cross-cutting one: open questions, alternatives considered, and the
reasoning behind calls that touch more than one class.

Format: **the question → the options → the weighing → a verdict.** A verdict of
*keep* is as valuable as a change — it stops the same idea being re-litigated.

---

## 1. The Router's registry gate — the biggest live trade-off

**Today.** `Router.intercept` only upgrades a click when the target url is
already in `Page.registry`. Anything else falls through to a full page load.

**What that costs, concretely.** A topic eagerly imports its subtree, so
navigation *inside* `/framework/` is instant. Every exit is a full reload:
`/framework/core/View/` → `/michael/` reloads. So does the sidebar's "Home"
link, and every link in `app.nav()`. The framework's headline feature is off
whenever you cross a topic boundary — which is exactly when a reader is most
likely to be exploring.

**Alternative: optimistic interception.**

```js
// intercept: drop the registry check, keep the safety guards
e.preventDefault();
this.go(url.pathname);

// go: fall back to the browser if the import fails
async go(url){
    if (url !== location.pathname) history.pushState({}, "", url);
    if (await this.app.load_page(url) === false)
        window.location.href = url;      // not a page — let the browser have it
}
```

`load_page` returns `false` instead of rendering the error view when the import
fails *and* we have a previous page to fall back from.

| | registry gate (today) | optimistic |
|---|---|---|
| in-topic nav | instant | instant |
| cross-topic nav | **full reload** | instant |
| non-page url (`/readme.md`) | correct, immediate | correct, after a failed import |
| Back/Forward | safe | safe — you only pushState urls that loaded |
| failure mode | conservative | needs the `location.href` fallback to be right |

Mitigate the wasted round-trip the same way the dev server does: skip
interception when the pathname has a file extension.

**Bonus: it deletes the registry.** `Page.registry` now has exactly one
consumer — this check. (`ColumnPager` used it until `leaf()` started reading
`app.page`; `mark_links` never did.) Going optimistic leaves only the
`routes` debug getter, so `Page.registry` could go entirely.

**Verdict: worth doing, and it's the highest-value change left.** It removes a
whole class (`registry`), removes the framework's worst UX seam, and the
fallback is four lines. The reason to hesitate is that "never pushState into a
page you can't redraw" is a genuinely good invariant — but the fallback
preserves it in outcome, just later.

---

## 2. Sidebar: flat list vs. expanded tree

**Today.** The sidebar lists `root.children` — the topic's *first* level only.

Trace `/framework/core/View/`:

| surface | shows |
|---|---|
| sidebar | level 1 — Start, **Core**, Ext, Util, Dev |
| breadcrumbs | the chain — Framework › Core › View |
| left column | level 2 (Core), whose previews are level 3 |
| right column | level 3 content (View) |

Three nav surfaces, each showing a *different* level, all consistently
highlighted by `mark_links`. That's coherent — better than it looks on paper.

**Alternative: a tree sidebar** that expands along the current path. Six lines,
using the override lever the Pager readme documents:

```js
nav(){ div.c("sidebar-nav", () => this.nav_items(this.root.children, 0)); }

nav_items(pages, depth){
    (pages || []).forEach(pg => {
        pg.link().ac("sidebar-link", "depth-" + depth);
        if (pg.children && this.chain.includes(pg))
            this.nav_items(pg.children, depth + 1);
    });
}
```

**The catch nobody notices until it's built:** an expanded sidebar shows the
active branch's children — which is *exactly* what the narrow left column shows.
Turn one on and the other becomes redundant. So this isn't a tweak, it's a fork:

- **(a) flat sidebar + previews-as-nav in the left column** — today. Progressive
  disclosure; you see one level at a time; the columns are the point.
- **(b) tree sidebar + a single content column** — the standard docs layout
  (Vite, Astro, Tailwind). The whole map is always visible; more room for
  content; but the drill-down, the framework's distinctive idea, is gone.

**Verdict: keep (a) as `ColumnPager`; build (b) as a *sibling* subclass
(`DocPager`) if it's wanted.** Not a setting, not a flag — a topic picks with
a `pager()` returning a `DocPager`. This is the three-lever model doing its job: a different
arrangement is a different class, and both can exist. Half-merging them (tree
sidebar *and* two columns) is the one option that's worse than either.

---

## 3. What a page renders when it's *acting as nav*

**The friction.** `/framework/` wants to be a warm code-first introduction at
full width, and an 18em nav strip when you drill in. The same `body()` has to be
both. Today `col: "narrow"` plus a CSS rule that shrinks `pre`/`.demo-code` in
narrow columns makes it survive, but it's a compromise.

**Alternative: `ColumnPager.column()` renders `pg.nav_body()` for the secondary
column** — title + `previews()` only — falling back to `body()` when a page
doesn't define one.

- Pro: the conflict disappears; landing pages can be as rich as they like.
- Pro: matches how a reader actually uses that column (as a menu).
- Con: content vanishing when you drill in is disorienting unless the breadcrumb
  makes the way back obvious.
- Con: a second render path on `Page` — real API growth, and `Page` is supposed
  to know nothing about layouts.

**Verdict: not yet.** The CSS compromise is holding, and this is the kind of API
you regret. Revisit if a second landing page hits the same wall — two instances
is evidence, one is a preference. If it happens, prefer the inert-data shape the
rest of the framework uses (`nav_content(){ … }` beside `content(){ … }`, read by
whoever wants it) over a new required method.

---

## 4. `p()` backticks vs `md()`

**Today.** `p("...`code`...")` runs `backtick_append` — a hand-rolled quarter of
markdown that only does `<code>`. Bold, links and tables silently render as
literal text, which has bitten these docs repeatedly.

Now that `md()` ships in `/app.js`, could `p()` just parse inline markdown?

**No — and it's worth writing down why.** The factories are created once by
`View.elements()` and exported as `const` bindings from `View.js`. An ext can
patch `View.prototype`, but it cannot reassign another module's `const p`.
`md.js` could export its own `p`, but `app.js` does `export * from App.js` and a
second `p` export would be an ambiguity error.

**Verdict: leave `p()` alone; docs use `md()`.** Changing `p()` would also
silently re-render every existing page in the repo (`michael/`, `alex/`, …).
Recorded so it isn't rediscovered a third time.

---

## 5. Factories always capture — and how to opt out

Creating a view appends it to the current captor. That's the framework's best
idea and its sharpest edge: you cannot build a view *for later* inside a capture
without opting out.

```js
new View({ capture: false })      // what md.file does
```

**Alternative: a `detached()` helper**, which works because `prerender` already
guards on `View.captor` being truthy:

```js
export function detached(fn){
    View.set_captor(null);
    const result = fn();
    View.restore_captor();
    return result;
}

const row = detached(() => tr(() => { td("a"); td("b"); }));   // build, place later
```

Five lines, no new concept, and `capture: false` becomes the single-view special
case of it. **Verdict: add it when something needs it.** Nothing does today —
`md.file` is the only detached construction in the codebase — but this is the
answer when the second one appears.

---

## 6. Naming: `host()`

`page.host()` returns "the nearest ancestor that owns a `pager`" — i.e. the
thing the docs call a **topic**. `host` says nothing; the code reads
`page.host?.() ?? page` and you have to look it up.

```js
page.topic?.() ?? page      // App.load_page
```

**Verdict: rename to `topic()`.** Three call sites (`App.load_page`,
`Page.load_ancestors`, the readmes). Pure clarity, zero behavior. Left undone
here only because it touches published prose in four files — a good standalone
commit.

---

## 7. `window.app`

`Router` and `Pager` both reach `window.app`. Three ways to give them an app:

- `window.app` — honest for a real singleton, zero plumbing, no import cycle
  (`app.js` imports `Router`, so `Router` can't import `app.js`), and it's what
  you type in the console.
- `App.current` — a namespaced static, set in the constructor. Tidier, and a
  test can set it. But it is the *same assumption*: one ambient App per
  document. It relocates the global, it doesn't remove it.
- **Inject it** — `new Router(this.router, { app: this })`, read `this.app`.

**Verdict (superseded — this entry previously said "do both, read
`App.current`"): inject the app.** Both globals encode "there is exactly one App
per document," which forbids two apps on a page, an app in an iframe or test
harness, and any instance that isn't the global one. That's a real constraint to
accept in the substrate in exchange for saving one constructor argument.

`window.app` stays — as a **console convenience only**. Nothing under
`framework/` may read it. See the OOP conventions in `CLAUDE.md`: because every
constructor is `Object.assign(this, ...args)`, injection costs one extra object
literal at the call site and needs no constructor change at all.

**Done.** `Router` takes `{ app: this }` from `config_router`; `Pager.leaf()` and
`ColumnPager.close()` read `this.app`. Nothing under `framework/` reads the
global now.

The `Pager` half looked like the hard one — it's a `View` constructed by
`Page.render()`, and `Page` held no app either. The resolution was to notice that
**`Page` can't take `app` in its constructor at all**: pages are built in
userland at module scope (`export default new Page(…)`), so there is no call site
to inject at. `App.load_page` assigns it at *render* time instead — the same
adoption move that already wires `child.parent`. `Page` never uses `app` itself;
it is purely a conduit to the layout tier, which is worth knowing before someone
"cleans up" the forwarding.

Two things this does **not** buy, recorded so they aren't claimed later:

- **Two Apps in one document.** The ES module registry is per-realm, so both
  Apps import the *same* `page.js` module and get the *same* `Page` instance,
  which can only hold one `app`. `Page.registry`, `View.captor` and
  `View.stylesheets` are statics and would clobber each other besides. The real
  isolation boundary for two apps is an **iframe** — separate realm, separate
  registry, separate statics — and there `window.app` is per-frame and correct.
- **Removing the global.** `window.app` stays, as a console convenience.

---

## 8. Odds and ends

- **`Font` lives in `App.js`.** ~30 lines of an unrelated concern (a `FontFace`
  wrapper plus a hardcoded Google Fonts registry) sitting in the substrate.
  `app.font("Montserrat")` is a good API; the implementation belongs in
  `util/font/`. Also note the two registered fonts are CDN urls — the one place
  in the framework that breaks the "vendor the dependency" rule that `ext/`
  is held to.
- **Three aliases for one function.** `View.stylesheet` (static),
  `App.stylesheet` (static), `app.stylesheet` (instance). Same for
  `View.meta_path` / `App.meta_path`. It is tempting to call the extras noise —
  **don't delete them.** `arya/lib/Page.js` calls `app.stylesheet()`, the
  instance one. See below.

- **The framework has external consumers now.** Removing a public static is a
  breaking change, and `grep public/` before a merge does not see the branches
  about to land. `App.path_to_page_url` was moved to `Page.module_url` while it
  had one caller; the merge then brought in `arya/lib/Router.js`, which calls it
  on every page load, plus two doc pages describing it in prose. It's back as a
  one-line alias — one implementation, two names, and the second name is load-
  bearing. The rule this buys: **rename freely inside `framework/`, alias on the
  way out.** A dev's `lib/` is a downstream package that happens to share a repo.
- **`instantiate()` is an unawaited async call in the constructor.** `new App()`
  returning before load is what makes `window.app = new App()` read well, and
  `app.ready` covers the wait — but a throw anywhere outside `load_page`'s own
  try/catch becomes a silent unhandled rejection. One `.catch(e => this.error(e))`
  in the constructor fixes it.
- **`.page` is styled by the site, emitted by core.** `Page` renders
  `div.page`; the only rule for it lives in `/styles.css`. Someone using the
  framework without this site's stylesheet gets an unstyled page. A minimal
  `.page` default in `framework.css` would fix it — the risk is that this
  site's rule and the framework's then both exist and drift.
- **`mark_links` belongs on `App`, not `Router`.** It's rendering-after-
  navigation, and it must keep working with `new App({ router: false })`.
  Settled; recorded so it doesn't drift to the Router later.
- **`.col-bar` is developer chrome.** The url + `✕` strip duplicates the
  breadcrumbs. Quieted rather than removed (see `ColumnPager.css`); the real
  options are to drop the path and keep only the close affordance, or to move
  "close" into the breadcrumb itself.

---

## Fixed since the last pass

- **A 404'd stylesheet froze the app forever.** `View.stylesheet`'s promise only
  resolved on `load`; a `<link>` that 404s fires `error`. `App.load()` awaits
  every stylesheet before `inject()`, so one typo'd url meant a permanently
  blank page. Now resolves (not rejects) on error, with a console warning — a
  missing stylesheet degrades to "unstyled", not "gone".
- **`target="_blank"` and `download` links were hijacked** by the Router and
  navigated in-place.
- **In-page `#hash` links re-rendered the page** instead of scrolling.
- **`styles.css` was unlayered**, so it beat every `@layer theme` rule in the
  framework regardless of specificity — a four-class-deep component rule lost to
  a one-class site rule. Now wrapped in `@layer theme`. Worth knowing generally:
  unlayered CSS outranks *all* layers, so "just add a layer" is not cosmetic.
