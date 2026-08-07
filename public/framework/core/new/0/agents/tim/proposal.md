# Router-less App + Page — Technical Tim's proposal

Phase 1, API only. Every claim below is checked against a concrete failure
case, because that's the job: find the thing that doesn't throw.

## 1. App.js

```js
export default class App {
    constructor(...args){ this.assign(...args); this.instantiate(); }
    assign(...args){ return Object.assign(this, ...args); }

    async instantiate(){
        this.config();
        this.render();
        await this.load();
        this.initialize();
        this.inject();
        this.ready.resolve();
    }

    config(){}     // empty hook — see F. required by the fixed lifecycle, kept for site overrides

    render(){
        this.$body = View.body();
        this.$app  = div.c("app");
        this.$pages = div.c("pages");   // THE flat container — every page, every depth, forever
        this.$app.append(this.$pages);
        View.set_captor(this.$app);
    }

    async load(){
        this.root = (await import("/page.js")).default;
        const chain = await this.resolve(location.pathname);
        if (!chain) return;                       // resolve() already called error()
        chain.forEach(p => p.app = this);          // decision C — one line, whole chain, greppable
        this.activate(chain);
        await this.loaded;
    }
```

`resolve()` is where decision A lives — see below for the full body, it's load-bearing enough
to earn a real listing rather than a one-liner:

```js
    // "/docs/intro/" -> [root, docs, intro]. Import the FIRST segment directly (its whole
    // subtree comes with it, via its own direct imports); walk the rest in memory.
    async resolve(pathname){
        const segments = pathname.split("/").filter(Boolean);
        if (!segments.length) return [this.root];

        const url = `/${segments[0]}/`;
        let entry;
        try { entry = (await import(Page.module_url(url))).default; }
        catch (e){ return this.error(`no page at "${url}"`, e), null; }

        entry.parent = this.root;                  // adoption — root is always the trunk, see A
        const chain = [this.root, entry];
        let page = entry;

        for (const name of segments.slice(1)){
            page = page.child(name);
            if (!page) return this.error(`"${pathname}" — no child "${name}"`), null;
            chain.push(page);
        }
        return chain;
    }

    // B — mount what's new, retire what's leaving, no chain-diff for its own sake.
    // "leaving" only exists because deactivate() is a real hook (sockets, timers) — if it
    // were a no-op forever, this method would be `chain.forEach(p => p.activate())` and nothing else.
    activate(chain){
        (this.chain || []).filter(p => !chain.includes(p)).forEach(p => p.deactivate());
        chain.forEach(p => p.activate());
        this.mark(chain);
        this.chain = chain;
        this.page = chain.at(-1);
    }

    // wipe + reapply, bounded by chain depth (~3-5), never by site size.
    mark(chain){
        this.$pages.el.querySelectorAll(".active-page, .active-ancestor")
            .forEach(el => el.classList.remove("active-page", "active-ancestor"));

        chain.forEach((page, i) => {
            page.view.ac(i === chain.length - 1 ? "active-page" : "active-ancestor");
            page.view.style("order", i);          // E — visual order, decoupled from DOM order
        });

        this.$app.el.className = "app mode-" + chain.at(-1).resolved_mode();   // D
        this.mark_links();
    }

    mark_links(){ /* unchanged from core/App.js — one pass over $pages, .active / .in-path */ }

    initialize(){}                 // empty hook — see F
    inject(){ this.$body.append(this.$app); }

    error(message, cause){ console.error(message, cause); this.$app.empty(() => { /* … */ }); }

    font(name){ /* unchanged from core/App.js */ }
    stylesheet(meta, url){ return View.stylesheet(meta, url); }
    get ready(){ /* unchanged — lazy promise, pre-existing exception to "no allocating getters" */ }
    get loaded(){ return Promise.all(View.stylesheets.concat(this.loaders)); }
    static stylesheet(meta, url){ return View.stylesheet(meta, url); }
}
```

~85 lines including the two meaty methods written in full. `Page.module_url` is imported
alongside `Page`.

## 2. Page.class.js

```js
export default class Page {
    constructor(...args){
        this.assign(...args);
        this.naming();
        this.children?.forEach(c => c.parent = this);   // adoption — already-built objects, not names
    }

    assign(...args){ return Object.assign(this, ...args); }
    naming(){ /* unchanged from starter — meta -> url -> name -> title -> label, all ??= */ }
    log_label(){ return `page{${this.url ?? "…"}}`; }

    child(name){ return this.children?.find(c => c.name === name); }   // sync — no import, no route()
    chain(){ const c = [this]; for (let p = this; p.parent; ) c.unshift(p = p.parent); return c; }

    // D — nearest self-or-ancestor with a declared `mode` wins. A method, not a getter: it walks.
    resolved_mode(){ return this.mode ?? this.parent?.resolved_mode() ?? "replace"; }

    // B — mount once, retained forever. App decides WHEN; I only decide WHETHER I'm already there.
    activate(){
        if (!this.view) this.render();
        if (this.view.el.parentNode !== this.app.$pages.el)
            this.app.$pages.append(this.view);
        return this;
    }

    deactivate(){}      // empty hook — override to release a socket/timer/video. see B.

    render(){
        return this.view = div.c("page", () => {
            if (this.title) h1.c("page-title", this.title);
            this.content?.call(this, this);
        }).ac(this.classes);
    }

    seo_title(){ /* unchanged */ }
    link(text){ return a.c("page-link", text ?? this.title).href(this.url); }   // G — never changes
    preview(){ return a.c("page-preview", this.title).href(this.url); }

    previews(){ return div.c("page-previews", () => this.children?.forEach(c => c.preview())); }  // now SYNC

    static module_url(url){ return url.endsWith("/") ? url + "page.js" : url + ".page.js"; }
}
```

~50 lines. No `render()` slot for children — there's nowhere to put one, see #3.

## 3. CSS — all three modes

```css
/* base = REPLACE, no class needed: only the leaf's own content shows */
.page:not(.active-page):not(.active-ancestor) { display: none; }
.page.active-ancestor > .page-content { display: none; }

/* FULL — .app.mode-full, set by App.mark() from the leaf's resolved_mode() */
.app.mode-full > .sidebar { display: none; }
.app.mode-full .page.active-ancestor { display: none; }
.app.mode-full .page.active-page { position: fixed; inset: 0; z-index: 10; }

/* COLUMNS — .app.mode-columns. equal width IS the flat container: no nesting to fight. */
.app.mode-columns .pages { display: flex; }
.app.mode-columns .page.active-page,
.app.mode-columns .page.active-ancestor { display: flex; flex: 1 1 0; min-width: 0; }
.app.mode-columns .page.active-ancestor > .page-content { display: block; }
```

13 rules. It's short because the mode class sits on `.app` (reaches chrome siblings, needs no
`:has()`) and `order` is a plain inline style set once per activation — nothing here searches
the DOM or the page tree; JS resolved everything before a single class was written.

## 4. site/ file tree

```
site/
  index.html
  app.js              chrome: sidebar + static nav (see A's dissent — not live Page previews)
  styles.css
  page.js             "/"            no mode declared — root has no ancestors, moot
  about/
    page.js           "/about/"      no mode declared → proves REPLACE is the true zero-config default
  docs/
    page.js           "/docs/"       mode: "columns" — declared once
    intro/page.js      "/docs/intro/" declares nothing — proves resolved_mode() inheritance
    guide/page.js      "/docs/guide/" declares nothing — same proof, second child
  focus/
    page.js           "/focus/"      mode: "full" — no children, whole window, no chrome
```

Six page.js files. `/docs/` importing `intro` and `guide` at its own top pulls the whole
three-page subtree in one dynamic import from `App.resolve()`; `/about/` and `/focus/` prove
the two single-page modes need zero wiring beyond the `mode` property itself.

## 5. A – G

**A — resolve by first segment, not by walking root's children.** Given fixed #2 (direct
imports), importing ANY page.js transitively imports its entire declared subtree — there is no
lazy tier left. So option (i) — import root, walk everything in memory — means root's own
`children` array has to list every top-level topic, which imports every topic's whole subtree,
which means **visiting any single page loads the entire site**, unconditionally. That is
exactly the "25 modules to show one page" cost starter's own readme measured and built
name-string children to avoid — reintroduced in full by (i). Option (ii) avoids it: `/docs/`'s
subtree loads only when the pathname starts with `docs`; `/about/` and `/focus/` never touch it.
The cost is that `docs.parent` isn't set by anyone's constructor — nobody imports `docs` from
`root`, so adoption can't happen the normal way. I pay for that with ONE explicit line in
`App.resolve()` (`entry.parent = this.root`), not a hidden convention — it's adoption exactly
as CLAUDE.md already describes it, just performed by the loader instead of a parent's
constructor, because in this design nothing constructs a Page besides its own module and
App. **Dissent, load-bearing:** this same reasoning means a page can never cheaply preview a
*deep* descendant it doesn't already fully own — `root` importing `docs` just to render one
preview card drags in `docs`'s whole subtree regardless of intent, because constraint #2 makes
"import a page" and "import its entire subtree" the same operation. Any topic-listing UI
(home page nav, breadcrumular previews of siblings) has to use inert `[url, title]` data, the
same pattern starter's `site/app.js` `nav` array already uses — not live `Page` objects — or
it silently re-inherits the full-site-load cost this design exists to avoid. This isn't a
style preference; it's a structural consequence of #2 that every future page.js author needs
to know.

**B — activation is "am I mounted", not a diff; but `deactivate()` earns App a diff anyway.**
With CSS-only visibility and permanent retention, marking WHO looks active is a stateless
wipe-and-reapply over the current chain — no shared-prefix arithmetic needed, because nothing
is ever detached and re-adding a class a page already has is a no-op. `Page.activate()` is
therefore just "append myself if I'm not already there." The one thing that isn't free: a page
that owns a real resource (a socket, a video, a timer) needs to be told when it leaves the
chain, and there's no way to know that without comparing the old chain to the new one — so
App keeps exactly one field (`this.chain`) and one `.filter()` for that reason alone. Delete
`deactivate()` as a concept and this comparison has no reason to exist; keep it (as a
documented, currently-empty hook, same as starter) and the one line pays for itself the first
time a page needs to tear something down. That's a live failure-that-never-throws: skip the
diff, and a page holding a `MediaStream` or a `setInterval` leaks silently on every navigation
away from it — nothing errors, the tab just gets slower.

**C — `app` arrives by explicit assignment, all at once, right before it's used.** A Page is
built at module-import time, before any App exists (`window.app` is genuinely `undefined`
during boot — CLAUDE.md already says not to trust it). So `app` cannot be constructor-injected;
it has to be adopted, like `.parent`. `App.load()` does it in one loop over the *resolved
chain* right after `resolve()` returns and right before `activate()` runs — `chain.forEach(p =>
p.app = this)` — one line, one file, greppable by searching `.app =` in App.js and finding
exactly one hit. Pages outside the current chain (a sibling listed as a static nav link, an
unvisited topic) never get `.app` at all, and that's fine: constraint #1 bans link
interception, so nothing in this design ever calls a method on an unactivated Page from
inside the running app — the only thing ever done with one is render an `<a href>`, which
needs `.url` and `.title`, both already resolved by `naming()` at construction, never `.app`.

**D — `mode` is data, `resolved_mode()` is a method, and they can't share a name.** The
prompt's own vocabulary (`mode: "columns"`) is worth keeping for the property a page actually
declares; the resolved, walked value needs its own name or the getter/method distinction
collapses into ambiguity about which one you're reading. `resolved_mode()` walks `.parent`
until it finds a declared `mode`, defaulting to `"replace"` at the root — nearest declaration
wins, same override semantics as CSS itself, so a leaf page can independently declare `mode:
"full"` and take over regardless of an ancestor's `"columns"`. This is neither a DOM search
nor an inheritance mechanism in the OOP sense — it's a plain recursive read of a link that was
set once, at adoption, and never changes; cheap, correct regardless of insertion order, and
immune to the ordering problem in E. I considered resolving mode via CSS general-sibling
combinators (`.mode-columns ~ .page`), which the flat container makes tempting — and rejected
it, because E's answer (CSS `order`, not DOM re-append) means DOM order stops equaling visual
chain order the moment a retained-but-inactive page from an earlier visit sits between two
currently-active siblings. A sibling combinator keyed on raw DOM position would then silently
select the wrong pages — a failure that never throws, just paints three columns as four. JS
resolving off `.parent` sidesteps that entirely, so D and E don't fight each other.

**E — `order`, not re-append, because COLUMNS is exactly the case starter's readme deferred.**
Starter's own readme already found this bug and chose not to fix it — "`show()` appends,
and appending an already-mounted node MOVES it... invisible here (one panel shown at a time)
but it would matter for any layout that shows several at once." COLUMNS is precisely that
layout: several pages visible simultaneously, in chain order, regardless of the order they
were originally visited in. Re-appending on every activation would get that order right at
the cost of resetting every visible page's scroll (each `.page-content` is its own scroll
container per the base CSS, and reattachment resets it) — a straight regression against
"retention is the default" and per-page scroll survival, both established values of this
codebase. Setting `order: i` from the chain index costs one line in `App.mark()`, touches only
the pages currently in the chain, and decouples visual position from DOM insertion order
completely — so a page revisited out of its original order still lands in the right column.

**F — deleted: `declare()`, `add()`, `alias()`, old `child()`, `Page.import()`,
`Page.missing()`, `container()`, `go()`, `App.load_root()`, `App.path_to_page_url`.** Kept,
mostly unchanged: `assign()`, `naming()`, `log_label()`, `chain()`, `render()` (minus its
per-page `$pages` slot), `seo_title()`, `preview()`, and on App: `render()`, `inject()`,
`ready`, `loaded`, `font()`, `stylesheet()`, `error()`. `config()` and `initialize()` stay as
empty hooks — not because they configure a Router (they don't), but because #5 names them as
fixed lifecycle steps, and an empty, documented hook that a site can override without
reimplementing the whole lifecycle costs nothing (the same argument that already justifies
core `App.initialize(){}`). The one method that changes *meaning*, not just body:
`previews()` used to be `async` purely because `child(name)` could hit a dynamic import —
with children as direct imports, `child()` is a synchronous array lookup, so `previews()`
collapses to one plain `.forEach()` and the entire "capture sync, append async" dance
CLAUDE.md documents as a landmine doesn't apply to this method anymore. That's not a stylistic
win, it's a whole documented failure class (async captor drift) becoming structurally
impossible for this one call site, for free, as a side effect of constraint #2 — worth
knowing so nobody "fixes" `previews()` back to async out of habit.

**G — `link()` never needs to know a Router exists, in either direction.** The premise of the
question — click handler now, href later — assumes `link()` has to make a choice. It doesn't:
in both starter and core, link interception is a delegated `document`-level listener owned by
Router, never anything Page attaches itself. `link()`'s only job, with or without a Router, is
to hand back a same-origin `<a href="…">` — `Router.link_clicked()` in starter operates on
`e.target.closest("a[href]")` and needs nothing else from the anchor. So `.href(this.url)` is
simultaneously the Phase-1 answer (a plain link, full page load, exactly what #1 mandates) and
the eventual Phase-2 answer (SPA-upgraded for free the moment a Router starts listening) —
zero lines change on this file when the Router lands. The "does not have to change twice"
option was already sitting in the existing code; the two-option framing was the trap.

## 6. Line counts

| file | starter | this proposal |
|---|---:|---:|
| App.js | 41 | ~85 (two methods, `resolve()` + `mark()`, are written in full because that's where the design lives) |
| Page.class.js | 95 | ~50 |
| CSS (3 modes) | — | 13 rules |
| site/ page.js files | — | 6, ~15–25 lines each |

App grows because it now does what Router used to (segment walk, chain-diff-for-deactivate,
mode/order marking) with none of Router's own machinery (no listen(), no popstate, no
pushState, no click interception) — net framework code is smaller across the three files
combined than starter's App+Page+Router (228 lines) even though App.js alone is bigger than
starter's App.js was.
