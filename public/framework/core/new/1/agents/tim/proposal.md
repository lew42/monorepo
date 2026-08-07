# new/1 — Technical Tim's proposal

Router-backed, lazy-loading successor to new/0. Keeps the flat container and
mode-as-data; pays new/0's known debt (whole-site eager import) with the
smallest machinery that doesn't reintroduce silent failure.

## 1. API surfaces

### App.js — boot only. No resolve(), no mark(). Router owns navigation.

```js
export class App {
    constructor(...args)     // assign(...args); start()
    assign(...args)          // Object.assign(this, ...args)
    log_label()              // "app" — symmetry with Page.log_label()
    async start()            // render() -> load_root() -> new Router -> router.load(url) -> inject()
    render()                 // $body, $app, $pages; site overrides for chrome (sidebar, $crumbs)
    async load_root()        // import "/page.js"; root.propagate_app(this); return root
    inject()                 // $body.append($app)
    error(error)             // "Page Load Error" view into $pages, chrome survives
    static stylesheet(meta, url)
}
```

```js
async start(){
    console.group(`app.start() ${location.pathname} ${"─".repeat(40)}`);
    this.render();
    try {
        this.root = await this.load_root();
        this.router = new Router({ app: this });
        await this.router.load(location.pathname);
    } catch (error){ this.error(error); }
    this.$body.append(this.$app);
    console.groupEnd();
}
```

The one try wraps root import AND the first navigation, same reasoning new/0
already fixed: `activate()` runs every ancestor's `content()`, and a throw
anywhere in that must still produce `error()`, not a blank page.

### Page.class.js — adoption, lazy resolution, flat mount

```js
export class Page {
    constructor(...args)      // assign(...args); naming(); declare(this.children)
    assign(...args)
    naming()                  // url/name/title/label, every line ??=, idempotent
    log_label()               // page{url} — "…" before adoption
    declare(children)         // split raw input into `names` + attach live Pages via add()
    add(name, child)          // THE one place .parent is set and .app is propagated
    propagate_app(app)        // this.app = app; recurse into ALREADY-RESIDENT children only
    async child(name)         // children.get -> pending.get -> import -> add() -- the lazy resolver
    chain()                   // [root … me], via .parent walk
    mount()                   // ancestors-first, idempotent, appends into app.$pages (FLAT — always app's, never a parent's)
    activate()                // mount() only. "I am entering the chain."
    deactivate()               // no-op default. Override point for a socket/timer/video.
    render()                  // div.page > (h1 title?, content()); memoized this.view
    link(text) / preview()    // plain <a>
    previews()                // live children as cards + unresolved names as {title,url} synthesized links
    go()                      // this.app.router.go(this.url) — the public, history-safe way to navigate to me
    static async import(url)
    static missing(error)
    static module_url(url)
}
```

```js
declare(children = []){
    const list = typeof children === "string" ? children.trim().split(/\s+/) : (children ?? []);

    this.names = new Set();       // declared, not yet resolved — pure strings, no placeholder objects
    this.children = new Map();    // resolved, live Pages only — direct imports AND resolved names, same map
    this.pending = new Map();     // name -> in-flight import Promise, transient

    list.forEach(child => typeof child === "string"
        ? this.names.add(child)
        : this.add(child.name, child));   // direct-import children route through add() too — ONE adoption path
}

add(name, child){
    child.assign({ name, parent: this }).naming();
    child.propagate_app(this.app);

    this.children.set(name, child);
    this.names.delete(name);
    this.pending.delete(name);

    console.log(`${this.log_label()}.add("${name}") → ${child.log_label()}`);
    return child;
}

// this.app assigned once, from the parent's own app, at the moment I'm attached
// to a live tree. Recurses into children that already exist as objects (direct
// imports constructed inside my own module) — it does NOT reach into `names`,
// because there's nothing there yet to reach.
propagate_app(app){
    this.app = app;
    for (const child of this.children.values()) child.propagate_app(app);
    return this;
}

async child(name){
    console.group(`${this.log_label()}.child("${name}")`);

    if (this.children.has(name)){
        console.log("  ↳ memory hit"); console.groupEnd();
        return this.children.get(name);
    }
    if (this.pending.has(name)){
        console.log("  ↳ import already in flight — awaiting it, not starting a second one");
        const page = await this.pending.get(name);
        console.groupEnd();
        return page;
    }
    if (!this.names.has(name)){ console.log("  ↳ not a child of mine"); console.groupEnd(); return null; }

    const url = this.url + name + "/";
    const promise = Page.import(url).then(page => page ? this.add(name, page) : null);
    this.pending.set(name, promise);

    const page = await promise;
    console.log(page ? `  ↳ resolved ${page.log_label()}` : `  ↳ nothing resolves "${name}"`);
    console.groupEnd();
    return page;
}
```

```js
mount(){
    this.parent?.mount();
    if (this.render().el.parentNode !== this.app.$pages.el)
        this.app.$pages.append(this.view);   // FLAT — every depth mounts into app.$pages, never container().$pages
    return this;
}

activate(){ return this.mount(); }   // Router sets document.title + calls mark() — see §Router

deactivate(){
    console.log(`${this.log_label()}.deactivate() — stays mounted, CSS hides it`);
    return this;
}
```

No `container()`. It existed in core/Page to find "who do I mount into" in a
NESTED-container world; new/1 keeps new/0's flat container, so mounting always
targets `this.app.$pages` and the method has no job left.

### Router.js — everything from "a url changed" to "the DOM reflects it"

```js
export class Router {
    constructor(...args)        // assign(...args) — app injected, never window.app; listen()
    assign(...args)
    listen()                    // delegated click + popstate
    click(e) / link_clicked(e)  // filters: defaultPrevented, modifier keys, external, #hash, download, non-<a>
    async go(url)               // load(url) first; pushState only on success, else location.assign — real fallback nav
    async load(url)             // load_segments(url) -> activate(page) | 404 -> app.error()
    async load_segments(url)    // walk segments via page.child(name), IN ORDER, awaiting each
    activate(page)              // chain diff: shared_depth, leaving.forEach(deactivate), entering.forEach(activate), document.title, mark()
    chain()                     // this.active?.chain() ?? []
    shared_depth(from, to)      // how many leading pages two chains share
    mark()                      // wipe + reapply .active-page/.active-ancestor + order; data-mode via findLast; mark_links(); app.$crumbs?.mark(chain) if the site built one
    mark_links(here)
    root()                      // this.app.$app.el — never `document`, $app may still be detached
}
```

```js
activate(page){
    const from = this.chain(), to = page.chain();
    const shared = this.shared_depth(from, to);
    const leaving = from.slice(shared).reverse();   // deepest first
    const entering = to.slice(shared);              // shallowest first

    console.groupCollapsed(`router.activate(${page.log_label()})`);
    leaving.forEach(p => p.deactivate());
    entering.forEach(p => p.activate());

    this.active = page;
    document.title = page.title ?? document.title;
    this.mark();
    console.groupEnd();
}

mark(){
    this.root().querySelectorAll(".active-page, .active-ancestor")
        .forEach(el => el.classList.remove("active-page", "active-ancestor"));

    const chain = this.chain();
    chain.forEach((p, i) => p.view.ac(p === this.active ? "active-page" : "active-ancestor").style("order", i));

    this.app.$app.attr("data-mode", chain.findLast(p => p.mode)?.mode ?? "replace");
    this.mark_links(this.active.url);
    this.app.$crumbs?.mark(chain);   // duck-typed — only if the site built breadcrumb chrome
}
```

`Router.activate(page)` and `page.activate()` intentionally share a name and
mean different levels, same as new/starter: the router's version is the outer
diff ("make THIS the current page"), the page's version is the inner
placement ("I am entering the chain"). `Router.activate` calls `page.activate`
on every entering page — they compose, they don't collide.

## 2. CSS — the three modes

```css
.pages { display: flex; flex: 1 1 auto; min-width: 0; min-height: 0; }

.page {
    display: none;                                 /* not in the chain */
    min-width: 0; min-height: 0; overflow-y: auto;
    padding: 2rem 2.5rem 5rem;
}

/* 1 · REPLACE — the default, unstyled. */
.page.active-page { display: block; flex: 1 1 auto; }

/* 2 · COLUMNS — unchanged from new/0: still four rules, still equal tracks. */
[data-mode="columns"] .pages {
    display: grid; grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);             /* never bare 1fr — see new/0 readme */
}
[data-mode="columns"] .page.active-ancestor { display: block; border-right: 1px solid var(--border, #e2e4e8); }

/* 3 · FULL — chrome hidden, page untouched. Chrome classes are now site-owned,
   not framework classes, so this rule targets whatever the site named them. */
[data-mode="full"] .sidebar, [data-mode="full"] .crumbs { display: none; }
```

What changed from new/0: nothing structural. `.sidebar` was already a site
class; `.crumbs` is new because breadcrumbs move out of ColumnPager (see §F)
into site chrome, and `full` has to hide both now, not just the sidebar.

**Left open, not solved here:** `col: "narrow"` doesn't translate cleanly onto
a grid track (ColumnPager narrowed a flex-basis; a `minmax(0,1fr)` track can't
shrink the same way without breaking equal-width columns for its siblings).
The honest interim answer is `.page.narrow { max-width: 22em; margin-inline: auto; }`
— caps the CONTENT, not the track. A true unequal-track mode is a distinct
future `mode`, not a `col` value; out of scope for phase 1.

## 3. site/ — smallest tree that proves all three things at once

```
site/
  app.js            chrome: sidebar + nav (site-owned data, not framework)
  page.js            /              mode: replace (default)
  about/
    page.js           /about/       mode: replace — proves a plain click-nav round trip
  docs/
    page.js           /docs/        mode: columns, children: "intro guide"   ← LAZY, the whole point
    intro/page.js      /docs/intro/     never imported until Router resolves "intro"
    guide/page.js      /docs/guide/     never imported until Router resolves "guide"
  focus/
    page.js           /focus/       mode: full
  styles.css
  index.html
```

`docs/page.js` is the file that matters: `children: "intro guide"` — two
strings, zero imports. Loading `/` pulls in `app.js`, `page.js`, `about/`,
`docs/`, `focus/` — five modules. `intro/` and `guide/` are not among them.
Clicking into `/docs/intro/` is the first time that module is fetched — the
console line to watch for is `docs{/docs/}.child("intro") → import(...)`
appearing only on that click, never on initial load. That's the new/0 debt
being paid, made visible in the same trace format new/0 already used.

## 4. Decisions A–H

**A — Adoption.** `.parent` is set in `add()`, the one moment a parent and a
just-materialized child (freshly imported, or freshly constructed inline) are
both in the same call frame — true for a lazy name (resolved by `child()`,
which calls `add()`) and for a direct import (routed through `add()` from
`declare()`, so there is exactly one adoption path, not two). `.app` can't
follow the same shape, because a direct-import child is constructed at MODULE
EXECUTION time — often before its own parent has been attached to anything,
meaning `this.app` is `undefined` inside that constructor call. So `.app` is
assigned separately, by `propagate_app()`, which runs once at the moment a
page itself gets attached (in `add()`, or once at the root by `App.load_root`)
and walks into whatever children already exist as objects. This is new/0's
`adopt()`, scoped down from "the whole site" to "whatever's already resident
under me" — same idea, no longer assuming totality. I considered making
`.app` a computed walk (`app(){ return this.parent?.app() ?? this._app }`)
instead of an assigned field — it needs no propagation step at all, and it
can never go stale. I'm not recommending it: every existing consumer in this
codebase (Pager, ColumnPager, core/App) reads `.app` as a plain property, and
turning it into a method silently breaks all of them (`page.app` becomes a
truthy function reference instead of the app). Compatibility with the real
site (item G) outweighs the aesthetic win here.

**B — What `children` is.** Three collections, each meaning exactly one
thing: `names` (Set<string>, declared, unresolved — no object exists), the
resolved store, `children` (Map<string,Page>, live objects only — direct
imports and resolved names land in the same map, indistinguishable once
resolved), and `pending` (Map<string,Promise>, transient, only while an
import is in flight). A name lives in exactly one of the first two at a time;
`add()` is what moves it. This directly answers the Map-of-nulls objection —
that design put three states (absent / declared-unloaded / loaded) into one
nullable slot, so a reader had to know `undefined` meant one thing and `null`
meant another. Here, WHICH collection holds the key is the state; nothing is
ever a sentinel value. It also answers the stub-Page objection without
resurrecting it: nothing is ever constructed speculatively. `children` only
ever holds the actual object a module exported or `import()` resolved — same
identity a caller would get importing it any other way. The one thing I'm
asking for beyond what either prior generation had is `pending`, and I'm
asking for it because it closes a hole neither new/0 (no async gap existed)
nor new/starter (flagged, not fixed) closed: two navigations landing on the
same unresolved name inside the window of one `import()` currently produce
TWO live Page objects for one url, silently — nothing throws, the second
`add()` just overwrites the first in the map while whatever already rendered
the first instance keeps a stale reference. That's the failure class I'm
supposed to be hunting, and it is created BY this design (new/0 could not
have it), so the fix belongs in the same phase as the cause.

**C — Router vs App.** App owns boot: render the container once, import root,
inject. Router owns everything from "a url changed" to "the DOM reflects it":
resolving segments, diffing chains, activating/deactivating, marking. new/0's
`App.resolve()` was synchronous only because the whole tree was already
resident — the moment resolution can await an import, it's navigation logic,
not boot logic, so it moves to Router as `load_segments()` and App loses
`resolve()` entirely. `Router.activate(page)` and `page.activate()` do not
collide — they're intentionally the same word at two levels (outer diff,
inner placement), exactly as new/starter already argued, and I'm keeping that
call rather than renaming one of them to manufacture false distinctness.

**D — activate() vs go().** Both public, different audiences. `go()` is what
you call to navigate somewhere — it drives history and is the only entry
point that's actually safe to wire to a button or call from userland
(`page.go()`, unchanged from core/Page today). `activate()` is what Router
calls on every page newly entering the chain, ancestors included — it now
does mounting ONLY. `app.mark()` moves out of `page.activate()` into
`Router.activate(page)`, because marking needs a chain DIFF (old vs new),
which a single page — even the leaf — has no way to compute about itself.
Concretely this also fixes a latent bug in new/0's shape: if `app.mark()`
stayed inside `page.activate()`, and `Router.activate` calls `.activate()` on
every ENTERING ancestor (not just the leaf), every ancestor would re-run
`mark()` too, each with a still-incomplete chain. Pulling `mark()` out to run
once, after all entering pages are placed, is required correctness, not
tidiness.

**E — Chain diff returns.** Yes, and it has to be `shared_depth` +
`deactivate()`, not new/0's stateless wipe-and-reapply. Wipe-and-reapply only
ever touched CSS classes, which is fine when nothing holds a resource — true
in new/0, where there was no async gap for a page to be "away" from user
attention. A Router creates real elapsed time between navigations, and new/0's
own readme already named the exact failure this leaves open if skipped: a
page holding a socket, a timer, or a `<video>` leaks on every navigation away,
and nothing throws — the tab just gets slower. `mark()` still does a full
class wipe-and-reapply for display state (cheap, and it's the right way to
handle CSS), but resource release has to be exact and targeted, which is
what `leaving.forEach(p => p.deactivate())` gives — only pages that actually
left the chain get the call, never pages still active.

**F — Does mode obsolete Pager?** Half of ColumnPager, yes; the other half,
no — because ColumnPager is doing two unrelated jobs. The LAYOUT half (equal
drill-down columns) is exactly what `mode: "columns"` already replaces with
four CSS rules and zero JS, per new/0's own measurement. The CHROME half
(Sidebar, breadcrumbs, topbar/burger, per-column close button) was never
layout — CLAUDE.md already says a layout module provides layout, not looks,
and ColumnPager violated that by construction, not by accident (it had to,
because `pager()` was the only extension seam that existed). Once mode
carries the layout decision, chrome doesn't need a per-topic construction
seam at all: it can be built ONCE, globally, in `site/app.js`'s `render()`
override — same place new/0's plain sidebar already lives — and updated by
`Router.mark()` reading the current chain, the same way `mark_links()`
already updates link classes without owning them. That deletes `pager()` and
`Page.host()` outright: nothing needs to ask "who owns my layout" when layout
is resolved once, for the whole app, from chain data — the exact machinery
CLAUDE.md flags as "three coordinating places… more remembering than this
codebase wants" is the thing being removed, not replaced. `ColumnPager` the
CLASS survives as an opt-in, explicitly-constructed `Pager` for the rare case
a site wants genuinely different per-topic chrome — nobody calls it
automatically, a topic that wants one builds it in its own `render()`
override, same tier as any other chrome decision. `TabPager` is unaffected:
tabs are a same-page, no-navigation arrangement that `mode` (which is
resolved per CHAIN, i.e., per URL) structurally cannot express, so it stays
exactly what it is — a `Pager` a site constructs explicitly wherever it wants
one.

**G — Migrating the real site.** `meta: import.meta`, `content()`, `classes`,
direct-import `children: [x]`, root-absolute imports, and the SPA fallback are
all unchanged — a page.js using only those keeps working verbatim, and
migrating to lazy `children: "x y"` is opt-in per topic, not required, so this
is an incremental migration, not a rewrite. `col` survives as a plain inert
class (render() does `.ac(this.col)` unconditionally, same trick new/starter
already used for `layout` → `classes`) even though the mechanism reading it
changes. The one real, non-shimmable break is `pager(){ return new
ColumnPager(...) }` and anything calling `Page.host()` — nothing calls
`host.pager?.()` anymore, because layout is no longer per-topic-constructed.
I am deliberately NOT proposing a compatibility shim that keeps `pager()`
silently working (auto-detecting it and constructing the ColumnPager for the
caller) — that resurrects the exact three-place coordination CLAUDE.md
already flags as unsettled and told future work not to propagate. The correct
migration is loud: a Page that still defines `pager()` gets one console.warn
at construction and is otherwise treated as an ordinary page (mode:
"replace"), so a stale file is visibly wrong on the page it affects, not
silently wrong everywhere.

**H — What the flat container costs once loading is lazy.** `mount()`'s
ancestors-first recursion needs no change, because by the time ANY page's
`.activate()` runs, `Router.load_segments()` has already walked and awaited
every segment from root to leaf in order — the whole chain exists as
adopted, `.parent`-linked objects before `Router.activate()` calls
`.activate()` on any of them. `mount()` is walking already-materialized
objects either way; only how they got materialized changed. `order` doesn't
break either, for the same reason — it's only ever assigned across the
resolved chain, never a partially-loaded one. The one genuinely new problem:
`previews()` and any sidebar wanting to list an UNRESOLVED name has no `.url`
to link to, because no Page object exists yet for it. The fix reuses a seam
that already exists rather than inventing one: represent an unresolved name
as a plain `{title: name, url: this.url + name + "/"}` POJO — `Sidebar.link()`
already duck-types between a real Page and exactly this shape
(`page.link ? page.link() : a(page.title).href(page.url)`), so nothing new
has to be written for it to render correctly. This is worth being precise
about because it superficially resembles the stub-Page idea rejected in B and
is not the same thing: it's a disposable rendering value, never inserted into
`children`, never given identity, discarded the instant the `<a>` is built —
not an object that later "absorbs" a real import.

## 5. Line-count estimate

| file | new/0 | new/1 estimate | why it moves |
|---|---|---|---|
| `App.js` | 90 | ~55 | loses `resolve()`, `mark()`, `mark_links()` — all move to Router |
| `Page.class.js` | 59 | ~115 | gains `names`/`pending`, `add()`, `propagate_app()`, async `child()` |
| `Router.js` | — (didn't exist) | ~100 | new/starter's Router (68) + new/0's `mark()`/`mark_links()`/data-mode folded in |
| **total** | 149 | **~270** | the cost of lazy loading + real navigation, paid once |

## 6. What I would NOT do

- **A stub `Page` that later absorbs its module's export.** Already rejected
  by the repo owner; restated here because it's the thing every "just use one
  Map" instinct reaches for next. It abandons the exported instance and can
  double-fire construction side effects (the `console.log` in `naming()`,
  most visibly).
- **A Map of `name -> Page | null`.** Compiles to less code than three
  collections, and is exactly the heterogeneity that was already flagged:
  one slot meaning three different things, distinguished by `undefined` vs
  `null` vs truthy.
- **Reviving new/0's whole-tree recursive `adopt()` at boot.** It's sitting
  right there, it already works, and using it silently defeats the entire
  point of new/1 — it only ever worked because the whole tree was resident.
- **A computed `.app` getter that walks `.parent` on every read.** Cleaner in
  isolation, never stale, needs no propagation step — and breaks every
  existing `.app`-as-property read in Pager/ColumnPager/App on this repo the
  moment it ships. Not worth the elegance given item G.
- **A shim that keeps `pager()` silently working.** Tempting because it's the
  smallest diff for the real site. It's also exactly the pattern CLAUDE.md
  has already flagged as unsettled machinery not to propagate. Break it
  loudly instead.
- **Deferring the `pending` in-flight-import guard to "phase 2."** The race
  is real, silent, and specific to what this phase introduces (the async gap
  new/0 never had). If it's not in the design now, it ships broken and stays
  broken, because nothing about it throws to force a fix later.
- **Solving unequal-width columns (`col: "narrow"`) as a grid-track problem
  right now.** It's a real gap but not one the minimal site in §3 needs
  solved, and grid-track sizing per named page is a design question on its
  own, not a corollary of lazy loading.
