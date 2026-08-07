# Router-less App + Page — Elegant Eric's proposal

The one-line pitch: **the whole tree is already in memory before App exists.**
Direct imports mean `/page.js` pulls in every descendant transitively by the
time `App`'s constructor runs, so "loading a page" stops being an async
operation and becomes a synchronous array walk. That single fact is what pays
for almost everything below — no Router-shaped hole to fill, no diff to
compute, no per-page container to decide. I traded eager-loading the whole
site (a real, named cost — see §A) for deleting an entire async layer. That's
the kind of trade I'll take every time.

## 1. App.js

```js
import { View, div } from "../../../View/View.js";

export default class App {

    constructor(...args){
        this.loaders = [];
        this.assign(...args);
        this.instantiate();
    }

    assign(...args){ return Object.assign(this, ...args); }

    log_label(){ return "app"; }

    async instantiate(){
        console.group(`app.instantiate() ${location.pathname}`);
        this.config();
        this.render();
        await this.load();
        this.initialize();
        this.inject();
        this.ready.resolve();
        console.groupEnd();
    }

    config(){}       // no Router yet — see §F, kept so this lifecycle never grows a step later
    initialize(){}    // ditto

    render(){
        this.$body = View.body();
        this.$app = div.c("app", () => {
            this.$pages = div.c("pages");   // ONE flat container — every page in the chain lands here
        });
        View.set_captor(this.$app);
    }

    async load(){
        const chain = this.resolve();
        chain.forEach((page, i) => page.activate(i === chain.length - 1));
        this.apply_mode(chain);
        await this.loaded;
    }

    // location.pathname -> [root … leaf]. Synchronous: everything this could
    // reach was already imported (transitively) when /page.js loaded — this
    // walks memory, it does not load anything. See §A, §C.
    resolve(url = location.pathname){
        let page = this.root.assign({ app: this });
        const chain = [page];

        for (const name of url.split("/").filter(Boolean)){
            page = page.child(name)?.assign({ app: this });
            if (!page) break;
            chain.push(page);
        }

        console.log(`app.resolve("${url}") → ${chain.map(p => p.url).join(" › ")}`);
        return chain;
    }

    // the mode nearest the leaf wins; none set = replace, and replace writes no class at all. See §D.
    apply_mode(chain){
        this.$pages.rc("mode-columns", "mode-full");
        const owner = chain.findLast(page => page.mode);
        if (owner) this.$pages.ac("mode-" + owner.mode);
    }

    inject(){ this.$body.append(this.$app); }

    get ready(){
        if (!this._ready){
            let resolve;
            this._ready = new Promise(res => resolve = res);
            this._ready.resolve = resolve;
        }
        return this._ready;
    }

    get loaded(){ return Promise.all(View.stylesheets.concat(this.loaders)); }

    static stylesheet(meta, url){ return View.stylesheet(meta, url); }
}
```

`this.root` arrives via the constructor — the site hands it in, because the
site is the only file that knows where `/page.js` lives:

```js
// site/app.js
import root from "/page.js";
export default window.app = new App({ root, /* chrome overrides */ });
```

## 2. Page.class.js

```js
import { div, h1, a } from "../../../View/View.js";

export default class Page {

    constructor(...args){
        this.assign(...args);
        this.naming();
        this.children?.forEach(child => child.parent = this);   // adoption — see §C
        console.log(`${this.log_label()} constructed — children [${(this.children ?? []).map(c => c.name).join(", ")}]`);
    }

    assign(...args){ return Object.assign(this, ...args); }

    naming(){
        this.url   ??= new URL(".", this.meta.url).pathname;
        this.name  ??= this.url.split("/").filter(Boolean).at(-1);
        this.title ??= this.name;
        return this;
    }

    log_label(){ return `page{${this.url}}`; }

    // [root … me]
    chain(){
        const chain = [this];
        for (let p = this; p.parent; ) chain.unshift(p = p.parent);
        return chain;
    }

    // one segment -> my declared child, or null. No filesystem, no route() —
    // my children were imported and adopted before I was even constructed.
    child(name){
        return this.children?.find(child => child.name === name) ?? null;
    }

    // is_leaf comes from App, which is the only thing that knows the whole
    // chain — a Page is never asked to compare itself to location.pathname.
    activate(is_leaf){
        console.log(`${this.log_label()}.activate(${is_leaf ? "leaf" : "ancestor"})`);
        this.render().ac(is_leaf ? "active-page" : "active-ancestor");
        this.view.style("order", this.chain().length - 1);   // §E — visual order without moving the node

        if (this.view.el.parentNode !== this.app.$pages.el)
            this.app.$pages.append(this.view);

        return this;
    }

    render(){
        if (this.view) return this.view;

        this.view = div.c("page", () => {
            div.c("page-content", () => {
                if (this.title) h1.c("page-title", this.title);
                this.content?.();
            });
        }).ac(this.name && "page-" + this.name).ac(this.classes);

        return this.view;
    }

    link(text){ return a.c("page-link", text ?? this.title).href(this.url); }

    preview(){ return a.c("page-preview", this.title).href(this.url); }

    // synchronous — see §F. Every child is already a Page, not a name to resolve.
    previews(){
        return div.c("page-previews", () => {
            (this.children ?? []).forEach(child => child.preview());
        });
    }
}
```

## 3. CSS — all three modes

```css
@layer base, theme, site, util;

@layer theme {
    .pages { display: flex; flex: 1 1 auto; min-width: 0; min-height: 0; }
    .page  { flex: 1 1 auto; min-width: 0; min-height: 0; }
    .page-content { height: 100%; overflow-y: auto; }   /* every page scrolls itself */

    /* REPLACE — the default. Only the leaf is visible; ancestors contribute nothing. */
    .page.active-ancestor { display: none; }

    /* COLUMNS — un-hide the whole chain, lay it out as equal grid tracks. */
    .pages.mode-columns { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); }
    .pages.mode-columns .page.active-ancestor { display: block; }

    /* FULL — inherits REPLACE's ancestor-hiding for free; the only new rule is the chrome. */
    .app:has(.pages.mode-full) > .sidebar { display: none; }
}
```

14 rules, 3 of them mode-specific. It's short because the flat container did
the real work — see §D and §10 in the brief. `FULL` needed exactly one new
rule because it's `REPLACE` plus a hidden sidebar, not a fourth arrangement.

## 4. site/ — smallest tree that exercises all three modes

```
site/
  index.html                 SPA fallback: <script type=module src="/app.js">
  app.js                     imports /page.js, builds the sidebar, `new App({ root })`
  styles.css                 the CSS above + site skin
  page.js                    /              root — children: [about, docs, gallery]
  about/
    page.js                   /about/        plain leaf → REPLACE (root hidden, About alone)
  docs/
    page.js                    /docs/         mode: "columns" — children: [intro]
    intro/
      page.js                    /docs/intro/   plain leaf → chain = [root, docs, intro], 3 equal columns
  gallery/
    page.js                    /gallery/      mode: "full" → chrome hidden, gallery fills the window
```

Four `page.js` files, three routes, three modes — no route is redundant with
another.

## A — what loads what

**(i): import `/page.js` and walk the url in memory.** The deciding fact is
what each candidate does to `.parent`. Candidate (ii) — jump straight to
`/docs/page.js` for `/docs/intro/` — only works as a *dynamic* import chosen
from the url, which constraint 2 already forbids Page from doing; if App did
it instead, `/docs/page.js` would construct with no root import anywhere
above it, so `docs.parent` would be `undefined` and `chain()` would return
`[docs, intro]` — root gone, and COLUMNS (`10`, "the whole chain") would be
short one column with no way to get it back. (i) costs one thing: since every
page.js is a **static** import, the entire site's page tree is constructed
the moment `/page.js` loads — every branch, not just the one on screen. That
is a real cost, but it is exactly the cost that constraint 2 already chose
when it deleted `child()`'s dynamic import; I'm not introducing it, I'm just
naming it. It's also the reason `App.load()` needed no `try/catch` — there is
no import in it to fail. Laziness is Router's problem when Router exists
(constraint 4 already says `activate()` becomes `go()` then); until it does,
eager-and-correct beats lazy-and-broken.

## B — activation without a diff

There is nothing to diff against, because nothing was active before this
call. `starter`'s Router computed `shared_depth(from, to)` because it
survived *between* clicks; this App resolves the chain exactly once, on
boot, and every page it finds is *by construction* either the leaf or an
ancestor of it — nothing else has ever touched `$pages`. So `deactivate()`
has no caller and is cut for this phase (§F). `activate(is_leaf)` does three
things and nothing else: build (or reuse) `this.view`, set its visual
position (§E), and append it to the one container if it isn't there already.
The "already mounted" guard costs one line now for zero benefit — nothing
calls `activate()` twice yet — but it's the line that has to survive
unchanged into `go()`, so I wrote it now rather than as a surprise diff later.

## C — how a page gets `app` and `parent`

`.parent` is asked for nothing — it's plain assignment, in the parent's
constructor, over an array whose entries already exist (children are
imported, and therefore constructed, before the parent that imports them).
`.app` cannot be constructor-assigned, because `app.js` constructs pages
before it constructs `App`. It is adopted exactly where App discovers a page
worth having it: inline in `resolve()`, `page.child(name)?.assign({ app: this })`.
One line, one file — open `App.js`, and the entire answer to "where does
`.app` come from" is the loop you're already reading. Pages that are never
resolved (a sibling shown only as a `.preview()` card) never get `.app` at
all, and don't need it: `preview()`/`link()` only ever read `.url`.

## D — where mode lives

`mode` is plain data on a `Page`, the same shape as `classes` — no method, no
getter. Resolution is a **search**, not inheritance: `chain.findLast(page =>
page.mode)`, scanning from the leaf back toward the root, so the
mode nearest the leaf wins if more than one page in the chain sets one. It's
applied as a single class on `$pages` — `mode-columns` / `mode-full`, nothing
for the default — not on the individual page. Two reasons it lives there and
not on each page: mode is a property of the *chain as a whole* ("show it side
by side" is not a fact about one page), and putting it in one place means
`apply_mode()` can always start by clearing both classes before deciding —
no risk of a stale mode class from three navigations ago haunting a page that
never asked for it.

## E — ordering and scroll

CSS `order`, set once per activation, from `chain().length - 1`. The
alternative — re-append the whole chain in order on every resolve — gets DOM
order right by construction, but `Node.append()` on an already-attached node
is a detach-then-attach, and detaching a scrollable element resets its scroll
offset. `order` costs one line (`.style("order", …)`) and means a mounted
page's node, once appended, is **never touched again** structurally — the
`parentNode` guard in `activate()` already refuses to re-append it. Phase 1
never re-activates a page twice, so this doesn't pay off yet — but it's a
one-line tax against a real, specific bug (starter's own scroll bug, see its
readme) rather than a hypothetical one, which is why I'm paying it now
instead of waiting for Router to need it.

## F — what deletes

| starter `Page` method | verdict | why |
|---|---|---|
| `constructor`, `assign`, `log_label`, `naming`, `chain` | **keep** | none of it assumes a Router or a nested container |
| `declare(children)` | **cut** | replaced outright by a plain imported array; nothing left to parse |
| `add(name, child)` | **cut** | existed for inline/dynamic children; nothing constructs a page without a `page.js` in this phase |
| `alias(name, page)` | **cut** | it aliased `add()`'s dynamic map. A direct import (`import intro from "./intro/page.js"`) *is* the alias now |
| `child(name)` | **keep, gutted** | one `Array.find`, synchronous — the filesystem-then-`route()` fallback chain is gone with it |
| `static async import(url)` / `static missing(error)` | **cut** | no dynamic import exists in Page anymore to fail in a way that needs disambiguating |
| `container()` | **cut** | this whole method existed to answer "whose `$pages`?" — with one flat container the answer is always `this.app.$pages`, so the question stops being askable |
| `activate()` | **keep, rewritten** | no `container()` call, no keep/hide branching — see §B |
| `deactivate()` | **cut for this phase** | nothing has ever left the chain yet — see §B. Returns with Router, which is the first thing that can produce a "leaving" page |
| `render()` | **keep, thinned** | drops `this.$pages ??= div.c("pages")` — there is no per-page slot to default |
| `seo_title()` | **cut, deferred** | not part of the App-Page interaction or the three modes; free to add back later without touching anything designed here |
| `link()`, `preview()`, `previews()` | **keep** | see §G for `link()`; `previews()` becomes fully synchronous — a real, unplanned bonus of constraint 2 |
| `go()` | **cut** | it called `this.app.router.go(...)`, and there is no router |

`config()` / `initialize()`: **keep, empty.** Constraint 5 already pins this
lifecycle in place; the question is whether an empty hook is worth keeping
around with nothing to call. Cutting them now doesn't remove code, it moves a
future decision — the day Router lands, it needs *somewhere* in this
sequence to wire up, and `config()` is exactly the slot core/App.js already
used for `config_router()`. Two empty one-line methods today are cheaper than
reopening the lifecycle signature later; that's the trade.

## G — `link()` with no Router

A plain `<a href>`, no click handler, full stop: `a.c("page-link", text ??
this.title).href(this.url)`. Without a Router, clicking it is a real
navigation — full page load, browser does the work, `App` boots again and
`resolve()` lands on the right chain. That's not a stub waiting to be
replaced; it's *correct* for this phase. The reason it "does not have to
change twice": when Router arrives, it intercepts clicks with **one
delegated listener on `document`**, the way starter's did — `Page.link()`
never gets touched, because it was never the thing deciding whether to
intercept. Anything I could add to `link()` now (a `data-nav` attribute, a
placeholder `onclick`) would be exactly the kind of coordination CLAUDE.md
already calls out — a marker in one file, interpreted by something three
files away that doesn't exist yet.

## Line-count estimate

| file | lines |
|---|---|
| `App.js` | ~55 |
| `Page.class.js` | ~60 |
| mode CSS (theme layer, above) | ~14 |
| `site/app.js` (chrome + `new App({ root })`) | ~30 |
| each `site/**/page.js` | ~10–20 |

## Dissent — two costs I'm naming, not solving

**`:has()` in the CSS.** Every other selector here is one class, flat, no
combinators past a child selector — the style CLAUDE.md asks for. `.app:has(.pages.mode-full)`
is a relational selector, and it's the one piece of this design I'd want a
second pair of eyes on. I chose it because the alternative was reintroducing
`app.hide_chrome()`/`show_chrome()`, which constraint 9 explicitly bans — and
because it's *readable* CSS (open the file, see exactly what triggers it),
not indirection through JS. But it's one step cleverer than the rest of this
proposal, and I'd rather flag that than have it found later.

**No error path for a broken page.** Eager static imports mean there is no
`await import()` left in `App` for a `try/catch` to guard — so a syntax error
in any `page.js` anywhere in the tree now fails at *module-load* time,
surfaced only as a blank page and a browser console error, not the
`error()`-rendered "Page Load Error" view core/App.js used to give you. I
didn't solve this; I'm naming it because it's a real regression in developer
experience, not an oversight, and it's the honest price of the eager-import
trade in §A.
