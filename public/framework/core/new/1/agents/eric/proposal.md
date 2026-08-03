# new/1 — Eric's proposal

Trade, don't cut: new/0's flat container and mode-as-data survive untouched. What
gets paid for — a real Router, lazy children — buys back two concrete things
lost since new/0: **not importing the whole site to show one page**, and **a real
place for a page to release a socket/timer/video on the way out**. Both are
correctness fixes, not features nobody asked for. Everything else in ColumnPager
that *isn't* layout (sidebar, breadcrumbs, close buttons) is chrome, and chrome
moves to the site, where CLAUDE.md already says it belongs.

## 1. The three files

### App.js

```js
export class App {
    constructor(...args){ this.assign(...args); this.instantiate(); }
    assign(...args){ return Object.assign(this, ...args); }
    log_label(){ return "app"; }

    async instantiate(){
        this.config();
        this.render();
        try { await this.load(); }
        catch (error){ return this.error(error); }
        this.initialize();
        this.inject();
        this.ready.resolve();
    }

    config(){}          // hook — site overrides for router:false, fonts, etc.
    initialize(){}       // hook — runs after load, before first paint

    render(){
        this.$body = View.body();
        this.$app = div.c("app", () => { this.$pages = div.c("pages"); });
        View.set_captor(this.$pages);   // pages auto-append here, not beside chrome
    }

    async load(){
        this.root = await Page.import("/");
        this.root._app = this;                    // the ONE place app is stamped — see A
        this.router = new Router({ app: this });
        await this.router.load(location.pathname);
        await this.loaded();
    }

    loaded(){ return Promise.all(View.stylesheets.concat(this.loaders ??= [])); }
    inject(){ this.$body.append(this.$app); }

    get page(){ return this.router.active; }        // cheap alias, same shape as old app.page

    error(error){
        console.error(error);
        this.$pages.empty(() => div.c("page active-page", () => {
            h1("Page Load Error");
            el.c("pre", "error", error.message);
        }));
    }

    font(name){ /* unchanged from core/App.js — not part of this proposal */ }
    static stylesheet(meta, url){ return View.stylesheet(meta, url); }
    static path_to_page_url(path){ return Page.module_url(path); }   // alias kept, see G
}
```

| method | who calls it |
|---|---|
| `instantiate()` | constructor, once |
| `config()` / `initialize()` | `instantiate()`, empty hooks a site overrides |
| `render()` | `instantiate()` — builds chrome, sets captor to `$pages` |
| `load()` | `instantiate()` — root import, Router construction, first navigation |
| `loaded()` | `load()` — **method**, not the old `get loaded()` getter that allocated a fresh `Promise.all` on every read (CLAUDE.md's own cautionary example) |
| `get page` | anyone wanting "the current page" without reaching through `router.active` |
| `error()` | `instantiate()`'s catch |

### Page.class.js

```js
export class Page {
    constructor(...args){
        this.assign(...args);

        const declared = this.children;      // capture-then-clobber, same device as new/starter
        this.children = new Map();            // name -> Page — RESOLVED PAGES ONLY, always
        this.names = [];                       // name[] — every declared segment, in order

        this.naming();                          // my own url/name first — children may need it
        this.declare(declared);
    }
    assign(...args){ return Object.assign(this, ...args); }

    naming(){
        this.url   ??= this.meta ? new URL(".", this.meta.url).pathname
                     : this.parent && this.name ? this.parent.url + this.name + "/"
                     : undefined;
        this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
        this.title ??= this.name;
        this.label ??= this.title;
        return this;
    }

    log_label(){ return `page{${this.url ?? "…"}}`; }

    get app(){ return this._app ?? this.parent?.app; }      // walks to whoever App stamped
    get chain(){
        const chain = [this];
        for (let p = this; p.parent; ) chain.unshift(p = p.parent);
        return chain;
    }
    container(){ return this.parent ?? this.app; }

    // ── declaring & resolving children ──────────────────────────
    declare(list = []){
        const items = typeof list === "string" ? list.trim().split(/\s+/) : list;
        items.forEach(item => typeof item === "string" ? this.names.push(item) : this.own(item));
        return this;
    }

    own(page){                        // attach an ALREADY-BUILT Page — eager, or just imported
        page.parent = this;
        page.naming();
        this.names.push(page.name);
        this.children.set(page.name, page);
        return page;
    }

    async child(name){
        if (!this.names.includes(name)) return null;                  // never declared → 404
        if (this.children.has(name)) return this.children.get(name);  // eager, or resolved already
        const page = await Page.import(this.url + name + "/");
        return page && this.own(page);
    }

    static async import(url){
        try { return (await import(Page.module_url(url))).default ?? null; }
        catch (error){
            if (!Page.missing(error))
                console.error(`Page.import("${url}") — file exists but failed to load:`, error);
            return null;
        }
    }
    static module_url(url){ return url.endsWith("/") ? url + "page.js" : url + ".page.js"; }
    static missing(error){
        return /Failed to fetch dynamically imported module|error loading dynamically imported module|MIME type|Expected a JavaScript/i
            .test(error?.message ?? "");
    }

    // ── rendering (unchanged shape from new/0 / core) ──────────────
    render(){
        if (this.view) return this.view;
        return this.view = div.c("page", () => {
            if (this.title) h1.c("page-title", this.title);
            this.content?.();
        }).ac(this.name && "page-" + this.name).ac(this.classes);
    }

    // ── entering / leaving — called by Router.transition, already root-to-leaf ──
    activate(){
        const parent = this.container();
        if (this.render().el.parentNode !== parent.$pages.el)
            parent.$pages.append(this.view);
        return this;
    }
    deactivate(){ return this; }     // override to release a socket/timer/video; DOM stays mounted

    go(){ return this.app.router.go(this.url); }

    link(text){ return a.c("page-link", text ?? this.label).href(this.url); }
    crumb(){ return a.c("page-crumb", this.label).href(this.url); }
    preview(){
        return a.c("page-preview").href(this.url).append(() => {
            div.c("page-preview-title", this.title);
            if (this.description) div.c("page-preview-desc", this.description);
        });
    }
    previews(){
        return div.c("page-previews", async $previews => {
            const children = await Promise.all(this.names.map(name => this.child(name)));
            children.forEach(child => child && $previews.append(child.preview()));
        });
    }

    seo_title(){
        const site = this.app?.title;
        return site && site !== this.title ? `${site} — ${this.title}` : this.title;
    }
    describe(text){
        let meta = document.head.querySelector('meta[name="description"]');
        if (!meta){ meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.append(meta); }
        meta.setAttribute("content", text);
    }
}
```

| method | who calls it |
|---|---|
| `naming()` | constructor, and again inside `own()` when a lazy child resolves |
| `declare()` / `own()` | constructor (eager+lazy names) / `own()` again from `child()` (lazy resolve) |
| `child(name)` | `Router.load_segments()` — the only caller |
| `Page.import()` | `App.load()` (root) and `Page.child()` (everyone else) — one static, two callers |
| `activate()` / `deactivate()` | `Router.transition()` only — never called directly by a page or by App |
| `go()` | a page's own click handlers / buttons — the programmatic twin of a link |
| `previews()` | a page's own `content()` |

### Router.js

```js
export class Router {
    constructor(...args){ this.assign(...args); this.listen(); }
    assign(...args){ return Object.assign(this, ...args); }

    listen(){
        document.addEventListener("click", e => this.click(e));
        window.addEventListener("popstate", () => this.load(location.pathname));
    }

    click(e){
        const link = this.link_clicked(e);
        if (!link) return;
        e.preventDefault();
        this.go(link.pathname);
    }

    link_clicked(e){
        if (e.defaultPrevented || e.button) return null;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
        const link = e.target.closest?.("a[href]");
        if (!link || link.target || link.hasAttribute("download")) return null;
        if (link.origin !== location.origin) return null;
        if (link.hash && link.pathname === location.pathname) return null;
        if (/\.\w+$/.test(link.pathname)) return null;
        return link;
    }

    // load first, push second — a failed navigation leaves no history entry
    async go(url){
        if (await this.load(url)) history.pushState({}, "", url);
        else location.assign(url);           // honest fallback, a real reload
    }

    async load(url){
        const page = await this.load_segments(url);
        if (page) this.transition(page);
        return !!page;
    }

    // root-to-leaf, one segment at a time — an ancestor ALWAYS resolves
    // before its child is even requested. See H.
    async load_segments(url){
        let page = this.app.root;
        for (const name of url.split("/").filter(Boolean)){
            page = await page.child(name);
            if (!page) return null;
        }
        return page;
    }

    // the ONLY place activate()/deactivate() are called — never Page, never App
    transition(page){
        const from = this.active?.chain ?? [];
        const to = page.chain;
        const shared = this.shared_depth(from, to);

        from.slice(shared).reverse().forEach(p => p.deactivate());   // leaf-first: release before parents
        to.slice(shared).forEach(p => p.activate());                  // root-first: mount container before child

        this.active = page;
        this.mark();
        document.title = page.seo_title?.() ?? page.title ?? document.title;
        if (page.description) page.describe(page.description);
    }

    shared_depth(from, to){
        let i = 0;
        while (from[i] && from[i] === to[i]) i++;
        return i;
    }

    scope(){ return this.app.$app.el; }   // never `document` — works while $app is still detached

    mark(){
        this.scope().querySelectorAll(".active-page,.active-ancestor")
            .forEach(el => el.classList.remove("active-page", "active-ancestor"));

        this.active.chain.forEach((page, i) =>
            page.view?.ac(page === this.active ? "active-page" : "active-ancestor").style("order", i));

        this.apply_mode();
        this.mark_links();
    }

    apply_mode(){
        this.app.$app.attr("data-mode", this.active.chain.findLast(p => p.mode)?.mode ?? "replace");
    }

    mark_links(){
        const here = this.active.url;
        this.scope().querySelectorAll("a[href]").forEach(link => {
            if (link.origin !== location.origin) return;
            link.classList.toggle("active", link.pathname === here);
            link.classList.toggle("in-path", link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
        });
    }
}
```

| method | who calls it |
|---|---|
| `go(url)` | a click, `page.go()`, popstate's `load()` |
| `load(url)` | `go()`, popstate |
| `load_segments(url)` | `load()` — the walk, one step per `page.child(name)` |
| `transition(page)` | `load()` — diff, mount/release, mark, title. Renamed from new/starter's `activate(page)` so it never collides with `page.activate()` — see C/D |
| `mark()` / `apply_mode()` / `mark_links()` | `transition()`, once per navigation, never per-page |

## 2. CSS

```css
@layer theme {
    .pages { display: flex; flex: 1 1 auto; min-width: 0; min-height: 0; }

    .page {
        display: none;
        min-width: 0; min-height: 0; overflow-y: auto;
        padding: 2rem 2.5rem 5rem;
    }
    .page.active-page { display: block; flex: 1 1 auto; }

    [data-mode="columns"] .pages {
        display: grid; grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);     /* never bare 1fr — see new/0 */
    }
    [data-mode="columns"] .page.active-ancestor { display: block; border-right: 1px solid #e2e4e8; }

    [data-mode="full"] .sidebar { display: none; }
}
```

**Unchanged, character for character, from new/0.** That's the point: this tier
knows nothing about lazy loading, the Router, or chain diffing — `data-mode` and
`.active-page`/`.active-ancestor` are the entire contract, and `Router.mark()`
maintains them the same way `App.mark()` did. The only difference is *who* writes
them (Router, not App) and *when* (once per `transition()`, not once per
`activate()` call — see D). `mode: "columns"` still shows the **whole chain**, not
ColumnPager's last-two-plus-breadcrumbs — see F for why that's a deliberate,
separate thing and not silently folded in here.

## 3. site/

```
site/
  app.js                chrome: Socket, static-ish nav, App override
  page.js                /            replace (default) · children: [about, docs] — both EAGER
  about/
    page.js               /about/      plain page, proves eager import still works unmodified
  docs/
    page.js               /docs/       mode: "columns" · children: "intro guide" — LAZY
    intro/
      page.js              /docs/intro/   never imported until Router walks to it
    guide/
      page.js              /docs/guide/   never imported until Router walks to it
  full/
    page.js               /full/       mode: "full" — chrome hidden, Router-navigated to from anywhere
  styles.css
  server.js
```

`root` declares `docs` **eagerly** (root's own nav needs `docs.title` synchronously
— see G) but `docs` declares `intro`/`guide` **lazily** (nothing needs their titles
until you're already inside `/docs/`, where `previews()` can pay the import cost
asynchronously). Laziness is a per-page-author decision, made where the page is
written — not a global switch. Visiting `/full/` cold imports `page.js`, `about/`
is never touched, and `docs/intro/page.js` is never touched either: exactly the
"25 modules to show one page" problem new/starter measured, gone.

## 4. A–H

**A — adoption.** `.parent` is assigned once, at attachment: eagerly in the
constructor for direct-import children (`own()`, called from `declare()`), lazily
the moment `child()` resolves an import (`own()`, called again). Same method both
times — a reader of `Page.class.js` alone sees the whole mechanism, no need to
find a separate recursive pass. `.app` is **not** adopted at all: `get app()`
walks `.parent` until it finds whoever holds `_app` directly, and only the root
ever gets `_app` set — one line, in `App.load()`. This sidesteps the real bug a
naive eager-adopt-in-constructor would hit: an eager child's constructor can run
*before* its own parent has been adopted (imports resolve children-first), so
stamping `.app` at that moment would capture `undefined`. Deriving it instead of
storing it means there is no ordering constraint to get right, and it costs the
same as the `get chain` getter already in core/Page — a few pointer hops, not a
tree walk.

**B — what `children` is.** Two collections, and neither is the rejected shapes.
`this.children` is a `Map` that holds **only real, resolved `Page` instances** —
never `null`, never a stub — populated immediately for eager children and exactly
once, in `own()`, the moment a lazy import lands. `this.names` is a plain ordered
array of every declared segment string, eager or lazy, filled at `declare()` time
and never touched again. "Is this name known" is `names.includes()`; "is it
resolved" is `children.has()`; the two questions never collapse into one
heterogeneous value. This answers the Map-of-nulls objection (the authoritative
collection is homogeneous — absence, not `null`, means unresolved) and the stub
objection (nothing is ever half-built; a name is a string until the real
module-exported instance replaces it outright, once, and that instance is never
touched again after `own()`).

**C — Router vs App.** App owns boot and the `$pages` handoff; it does not resolve
urls. `App.resolve()` does not survive — `Router.load_segments()` is the same
one-segment-at-a-time walk, now async because a segment may need an import, and
having both would be the exact "two owners" collision the brief warns against.
`Router.transition(page)` (see D for the rename) is the one and only caller of
`page.activate()`/`page.deactivate()`; `Page.class.js` never calls either on
itself or a sibling. Marking (`.active-page`, `order`, `data-mode`, link classes)
moves from `App.mark()` to `Router.mark()`, called once per navigation from
`transition()` — App keeps no navigation state at all beyond `this.root` and
`this.router`.

**D — `activate()` vs `go()`.** Both are public, and they answer different
questions. `go()` — on `Page`, delegating to `router.go(this.url)` — means "take
me here": it's the entry point for a button or any programmatic navigation, and
it's the only path that touches `history`. `activate()` means "place myself in my
container" and is deliberately **not** recursive any more: because
`Router.transition()` already walks `entering` root-to-leaf before calling it,
each page only has to mount itself into `this.container().$pages`, idempotently —
the ancestors-first guarantee new/0 had to build into `mount()` comes for free
from the Router's own walk order. `app.mark()`, `document.title`, and the meta
description move entirely off `activate()` and onto `Router.transition()`,
called exactly once per navigation instead of once per page in a chain — strictly
less work than new/0 paid for the same correctness. The Router's own
chain-diffing method is renamed `transition()`, not `activate()`, specifically so
two different concepts never share one name across two classes.

**E — the chain diff returns, and it should.** new/0 was correct to have no
`deactivate()` — nothing ever left a chain there, so there was nothing to diff.
That stops being true the moment a Router can send you from `/docs/a/` to
`/full/`: real pages genuinely leave the chain, and a page holding a `<video>`,
a `setInterval`, or a socket needs a hook to let go of it. `shared_depth` +
`deactivate()` come back, verbatim from new/starter, and this is the textbook
Eric trade: real complexity (one more list, one more hook call per navigation)
for a real feature (no resource leak on navigation away) — not complexity for its
own sake. Retention is unchanged: `deactivate()` never touches the DOM, `view` is
still memoized forever, visibility is still 100% CSS from the classes `mark()`
maintains.

**F — does `mode` obsolete Pager?** Only the layout third of it. `mode: "columns"`
reproduces ColumnPager's grid in four CSS rules and zero JS, exactly as new/0
proved — but ColumnPager also builds a `Sidebar`, breadcrumbs, and a per-column
close button, and none of those are layout; they're chrome a topic or a site
*wants*, not something CSS can express. So it splits, not collapses:
`pager(){ return new ColumnPager({ root: this }) }`, `Page.host()`, and the
`App`-level `host.pager?.() ?? host` special-case all **die together** — nothing
walks the ancestor chain looking for a layout owner any more, because
`Router.apply_mode()`'s `chain.findLast(p => p.mode)` already is that search, and
it needs no instance. The `Sidebar` view survives unmodified (it was already
decoupled from ColumnPager on purpose) and is built once, by site chrome, fed
`root.names`/`root.children` the same way `previews()` already handles
partially-lazy children. `crumb()` already exists on `Page` and a topic renders
its own breadcrumb strip if it wants one — no class required. `col-bar`'s close
button is **cut**, not migrated: `Pager/readme.md` already flagged it as
"developer chrome... reads as an IDE" and an open question; new/1 is the moment
to answer it, and a working `crumb()` link back to the parent already covers the
"climb out" case without a bespoke `✕`. `Pager.js` (the bare `show()`/`leaf()`
class) and `TabPager` are **untouched** — they're an in-page, composition-based
widget with no url or chain involvement, orthogonal to everything in this
proposal.

**G — migrating `public/`.** `meta: import.meta`, `content()`, `classes`, and
eager `children: [...]` all survive unchanged — that's most of a real page.js.
Three things do not: `pager(){ return new ColumnPager({...}) }` must become
`mode: "columns"` (mechanical, one line, `grep -rn "new ColumnPager"` finds every
site), plus an explicit, visible line added to site chrome if that topic actually
wants a sidebar back — not a shim, because CLAUDE.md already bans silently
absorbing a removed feature behind compatibility code. `col` becomes inert data
unless a site chooses to read it itself; nothing in the base tier consumes it any
more. `Page.registry` and the old Router's synchronous "is this a known page"
click gate are **deleted outright** — a lazy child can't be verified without an
`await`, so the gate becomes new/starter's simpler, already-proven policy: try
every same-origin non-modified click optimistically, and let `load()` itself
report success or fall back to `location.assign()`. `load_ancestors()` also
disappears, for a genuinely happy reason: `Router.load_segments()` is *already* a
top-down walk from `app.root`, so every ancestor is resolved on the way to any
leaf, on every navigation including a cold load — there is no "deep url loaded
directly, ancestors missing" case left to climb out of. That closes all three of
the "coordinating places" CLAUDE.md's readme flagged under Pager as too much to
remember (App's `host.pager?.()`, `Page.host()`, `load_ancestors()`'s loop) — not
because they were patched, but because the thing that made them necessary is
gone. One more, easy to miss: `App.get loaded()` was CLAUDE.md's own cited example
of a bad getter (a fresh `Promise.all` on every read); new/1 makes it `loaded()`,
a method — `await app.loaded` becomes `await app.loaded()`, a one-line,
grep-able rename anywhere it was called.

**H — what the flat container costs once loading is lazy.** Nothing measurable.
`activate()` no longer needs to walk ancestors itself because
`Router.load_segments()` cannot advance past a segment until `child()` on the
*previous* one has resolved — sequential `await` in a `for` loop already
guarantees "every ancestor exists, with `.parent` assigned, before its child is
even requested." A page's view therefore can never "arrive late" mid-render: it
either doesn't exist yet (never imported, never in `$pages`, invisible) or it's
fully resolved and ordered correctly the moment `transition()` places it. The
only residual case — a page's view sitting in `$pages` with stale classes/`order`
from a navigation two clicks ago — is handled the same way new/0 already handled
it: `mark()` wipes every `.active-page`/`.active-ancestor` in scope before
reapplying, unconditionally, every transition, regardless of whether that page
was ever touched by laziness at all.

## 5. Line-count estimate

| file | bare | with logging + comments |
|---|---|---|
| `App.js` | ~70 | ~110 |
| `Page.class.js` | ~85 | ~140 |
| `Router.js` | ~65 | ~115 |
| **total** | **~220** | **~365** |

Bigger than new/0's 149 (bare), because the Router regains real chain-diffing and
lazy resolution that new/0 didn't have to pay for at all. Close to
new/starter's App+Page+Router (`95 + 92 + 41` non-comment) — this proposal spends
about the same budget, on a cleaner split of who owns what.

## 6. What I would NOT do

- **Not** re-add a `Pager`/`ColumnPager` class "to be safe" for sites that want
  more than CSS gives. That's exactly the three-place coordination
  (App/`host()`/`load_ancestors()`) this design deletes for good reason — if a
  real need shows up later, it should cost a subclass then, not a standing
  liability now.
- **Not** a `Map` of `Page | null` for `children`, and **not** a stub `Page`
  that later "absorbs" its module's export. Both were already tried and
  rejected; `names` (strings) + `children` (resolved instances only) is the
  third option, not a compromise between the first two.
- **Not** eagerly recursing `.app` onto the whole tree at boot "just in case."
  It's the exact thing that makes lazy children impossible, and it buys nothing
  the `get app()` walk doesn't already give for free.
- **Not** naming the Router's diff-orchestration method `activate()`. Two
  different concepts sharing one name across two classes is precisely the kind
  of thing a reader has to hold in their head — `transition()` costs nothing and
  removes the ambiguity permanently.
- **Not** keeping `Page.registry` "for compatibility." A synchronous global
  index cannot answer "is this a real page" for a name that hasn't been
  imported — keeping it around only invites someone to lean on it and get a
  wrong answer for exactly the pages laziness was built for.
- **Not** carrying `col-bar`'s close button forward by default because it
  already existed. It was flagged as smelly by the very file it lived in; "it
  was there before" is not a reason to keep it, and `crumb()` already covers the
  one thing it did that matters.
