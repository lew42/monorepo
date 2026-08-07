# Steve's proposal — new/1: a real Router over the flat container

`new/0` proved the flat container and modes-as-data with no Router, by
cheating: every child is a direct import, so the whole tree exists in memory
the instant `/page.js` loads. That cheat is the thing to pay off now. The
question this phase answers is narrow: **can a page declare children it
hasn't imported yet, without reintroducing a null-placeholder Map or a stub
object that abandons the real export?** Yes — one array becomes two, each
holding exactly one kind of thing, and the boundary between them is where
`adopt()` naturally stops recursing. Everything else below is either
unchanged from `new/0` (flat container, modes-as-data, `order` not
re-append) or restored from `new/starter` because a real Router needs it
(the chain diff, `deactivate()`).

---

## 1. App.js, Page.class.js, Router.js

### Method table

| file | method | does | called by |
|---|---|---|---|
| App | `constructor(...args)` | assign, kick off `instantiate()` | userland `new App({...})` |
| App | `instantiate()` | the six-step boot sequence | constructor |
| App | `config()` / `initialize()` | empty hooks, override in site/app.js | `instantiate()` |
| App | `render()` | build `$app`/`$pages`, set captor to `$pages` | `instantiate()` |
| App | `load()` | import root, `adopt()`, build Router, `router.load()` | `instantiate()` |
| App | `inject()` | `$body.append($app)` | `instantiate()` |
| App | `error(error)` | render "Page Load Error" into `$pages` | `load()`'s catch |
| App | `loaded()` | `Promise.all` of stylesheets + loaders | `instantiate()` |
| Page | `constructor(...args)` | assign, `naming()`, `declare()` | userland `new Page({...})`, `child()` |
| Page | `declare()` | split `children` into `children` (loaded) / `unloaded` (names) | constructor |
| Page | `naming()` | derive url/name/title, idempotent `??=` | constructor, `child()` |
| Page | `adopt(app)` | assign `.app`, recurse over **loaded** children only | `App.load()`, itself |
| Page | `chain()` | `[root … me]` via `.parent` | `Router.load_segments/activate/mark` |
| Page | `child(name)` | one segment → a page: memory hit, else import + adopt | `Router.load_segments()` |
| Page | `activate()` | mount myself into `app.$pages`, idempotent | `Router.activate()` only |
| Page | `deactivate()` | no-op hook, override to release a resource | `Router.activate()` only |
| Page | `render()` | build `div.page`, cache as `this.view` | `activate()`, columns' `col_bar`-free content |
| Page | `go()` | `app.router.go(this.url)` | site code, buttons |
| Page | `link()` / `preview()` | plain `<a href>`, no handler | site content(), `previews()` |
| Page | `previews()` | preview cards for loaded **and** named children | site content() |
| Router | `constructor(...args)` | assign, `listen()` | `App.load()` |
| Router | `listen()` | click + popstate listeners | constructor |
| Router | `click(e)` / `link_clicked(e)` | intercept an in-app `<a>`, else let it through | `listen()`'s handler |
| Router | `go(url, opts)` | `load()` then `pushState`/`replaceState`, or full nav on failure | `click()`, `Page.go()` |
| Router | `load(url)` | `load_segments()` then `activate()` if found | `go()`, `App.load()`, popstate |
| Router | `load_segments(url)` | walk `page.child(name)` root→leaf | `load()` |
| Router | `activate(page)` | diff the chain, `deactivate()`/`activate()` the difference, `mark()` | `load()` |
| Router | `chain()` | `[root…me]` of `this.active`, or `[]` | `activate()` |
| Router | `shared_depth(from, to)` | how many leading pages two chains share | `activate()` |
| Router | `mark()` | wipe+reapply `.active-*` + `order`, set `data-mode`, `mark_links()` | `activate()` |
| Router | `mark_links(here)` | `.active`/`.in-path` on every in-app `<a>` | `mark()` |
| Router | `root()` | `app.$app.el` — scope for the two DOM queries above | `mark()`, `mark_links()` |

### App.js

```js
import { View, div, h1, el } from "../../View/View.js";
import { Router } from "./Router.js";

export class App {

	constructor(...args){
		this.loaders = [];
		const { promise, resolve } = Promise.withResolvers();
		this.ready = Object.assign(promise, { resolve });

		this.assign(...args);
		this.instantiate();
	}

	assign(...args){ return Object.assign(this, ...args); }
	log_label(){ return "app"; }

	async instantiate(){
		this.config();
		this.render();
		await this.load();
		this.initialize();
		this.inject();
		this.ready.resolve();
	}

	config(){}
	initialize(){}

	render(){
		this.$body = View.body();
		this.$app = div.c("app", () => { this.$pages = div.c("pages"); });
		View.set_captor(this.$pages);   // $pages, not $app — see new/0's readme, item 1
	}

	// The only import that isn't behind a click: the root. Everything below
	// root is now `this.unloaded` (names) until a Router asks for it — that's
	// the whole point of this phase. adopt() still recurses, it just has
	// nothing eager to recurse INTO past the first lazy boundary.
	async load(){
		try {
			this.root = (await import("/page.js")).default.adopt(this);
			this.router = new Router({ app: this });

			if (!(await this.router.load(location.pathname)))
				throw new Error(`404 — nothing matches "${location.pathname}"`);
		}
		catch (error){ return this.error(error); }

		await this.loaded();
	}

	inject(){ this.$body.append(this.$app); }

	error(error){
		console.error(error);
		this.$pages.empty(() => {
			div.c("page active-page", () => {
				h1("Page Load Error");
				el.c("pre", "error", error.message);
			});
		});
	}

	loaded(){ return Promise.all(View.stylesheets.concat(this.loaders)); }

	static stylesheet(meta, url){ return View.stylesheet(meta, url); }
}

export default App;
```

`App` lost `resolve()` and `mark()` from `new/0` — both moved to `Router`
(§C) — and gained nothing back. It's **smaller** than `new/0`'s App despite
the harder problem, because "walk a url" and "reflect the current page in
the DOM" were never App's job; they were the job of whatever stands between
a click and a page, and now something does.

### Page.class.js

```js
import { div, h1, a } from "../../View/View.js";

export class Page {

	constructor(...args){
		this.assign(...args);
		this.naming();
		this.declare();

		console.log(`new ${this.log_label()} — "${this.title}", ${this.children.length} loaded, ${this.unloaded.length} named`);
	}

	assign(...args){ return Object.assign(this, ...args); }
	log_label(){ return `page{${this.url ?? "…"}}`; }

	// Split the ONE constructor argument into TWO monomorphic properties.
	// Input is flexible (a string, an array of Pages, an array of names, or
	// both mixed); output is not — `this.children` is Page[] and nothing
	// else, `this.unloaded` is string[] and nothing else. See §B: this is
	// deliberately not one array of Page|string, and not a Map of Page|null.
	declare(){
		const list = typeof this.children === "string"
			? this.children.trim().split(/\s+/)
			: this.children ?? [];

		this.children = [];
		this.unloaded = [];

		list.forEach(child => typeof child === "string"
			? this.unloaded.push(child)
			: this.children.push(Object.assign(child, { parent: this })));

		return this;
	}

	naming(){
		this.url   ??= this.meta ? new URL(".", this.meta.url).pathname
		             : this.parent && this.name ? this.parent.url + this.name + "/"
		             : undefined;
		this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
		this.title ??= this.name;
		return this;
	}

	// Recurses over LOADED children only. Nothing special was done to stop
	// it at the lazy boundary — `this.unloaded` holds strings, there's
	// nothing there to call .adopt() on, so the recursion just runs out.
	adopt(app){
		this.app = app;
		this.children.forEach(child => child.adopt(app));
		return this;
	}

	chain(){
		const chain = [this];
		for (let page = this; page.parent; ) chain.unshift(page = page.parent);
		return chain;
	}

	// The whole lazy tier. A memory hit costs a .find(); a miss that isn't
	// even declared returns null; a miss that IS declared imports, adopts
	// inline (parent and app are both already mine to give — see §A), and
	// moves the name from `unloaded` to `children`. One method, one place,
	// greppable — the entire "how does a name become a page" mechanism.
	async child(name){
		const known = this.children.find(c => c.name === name);
		if (known) return known;

		if (!this.unloaded.includes(name)) return null;

		const child = (await import(this.url + name + "/page.js")).default;
		child.assign({ name, parent: this, app: this.app }).naming();

		this.children.push(child);
		this.unloaded.splice(this.unloaded.indexOf(name), 1);

		console.log(`${this.log_label()}.child("${name}") → imported, ${this.unloaded.length} still named`);
		return child;
	}

	// Mount myself into the ONE flat container, at whatever depth I am.
	// No parent-climb: Router.activate() already calls entering pages
	// root-to-leaf (see §H), so by the time I run, my ancestors are mounted.
	activate(){
		const view = this.render();
		if (view.el.parentNode !== this.app.$pages.el)
			this.app.$pages.append(view);
		return this;
	}

	// Nothing to undo by default — CSS drops my classes a moment later.
	// Override if I hold a socket, a timer, a <video>.
	deactivate(){ return this; }

	render(){
		if (this.view) return this.view;

		this.view = div.c("page", () => {
			if (this.title) h1.c("page-title", this.title);
			this.content?.();
		})
			.ac(this.name && "page-" + this.name)
			.ac(this.col)        // per-page width while I'm acting as an ancestor — CSS decides what it means
			.ac(this.classes);

		return this.view;
	}

	go(){ return this.app.router.go(this.url); }

	link(text){ return a.c("page-link", text ?? this.title).href(this.url); }
	preview(){ return a.c("page-preview", this.title).href(this.url); }

	// Container placed NOW (captor is still mine); contents land later. Must
	// stay async for the SAME reason it was cut back to sync in new/0 and
	// then had to come back here: a name with no page yet has no title to
	// show without importing it — laziness costs exactly this one await.
	previews(){
		return div.c("page-previews", async $previews => {
			const names = this.children.map(c => c.name).concat(this.unloaded);
			const children = await Promise.all(names.map(name => this.child(name)));
			children.forEach(child => $previews.append(child.preview()));
		});
	}
}

export default Page;
```

### Router.js

```js
export class Router {

	constructor(...args){
		this.assign(...args);
		this.listen();
	}

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

	async go(url, { replace } = {}){
		if (await this.load(url)){
			replace ? history.replaceState({}, "", url) : history.pushState({}, "", url);
		} else {
			location.assign(url);   // hand it to the browser — a real 404, or somewhere outside the tree
		}
	}

	async load(url){
		const page = await this.load_segments(url);
		if (page) this.activate(page);
		return !!page;
	}

	// The walk IS the loader. Each hop calls page.child(name), which imports
	// on a miss — so by the time this returns, every page in the chain
	// already exists, in root-to-leaf order, with .app and .parent both set.
	// Nothing downstream ever sees a partially-loaded chain (§H).
	async load_segments(url){
		let page = this.app.root;

		for (const name of url.split("/").filter(Boolean)){
			page = await page.child(name);
			if (!page) return null;
		}
		return page;
	}

	// Only what changed. `to.slice(shared)` is already root-to-leaf (chain()
	// always is), so calling .activate() over it in order is what makes
	// Page.activate() safe to write with no parent-climb of its own.
	activate(page){
		const from = this.chain();
		const to = page.chain();
		const shared = this.shared_depth(from, to);

		from.slice(shared).reverse().forEach(p => p.deactivate());
		to.slice(shared).forEach(p => p.activate());

		this.active = page;
		this.mark();
		document.title = page.title ?? document.title;
	}

	chain(){ return this.active ? this.active.chain() : []; }

	shared_depth(from, to){
		let i = 0;
		while (from[i] && from[i] === to[i]) i++;
		return i;
	}

	root(){ return this.app.$app.el; }

	// Wipe, then reapply down the NEW chain — a page that left needs only
	// its classes gone, not a lifecycle call (§E). `order` from the index,
	// never re-append (§new/0). data-mode from the same chain, no second walk.
	mark(){
		this.root().querySelectorAll(".active-page, .active-ancestor")
			.forEach(el => el.classList.remove("active-page", "active-ancestor"));

		const chain = this.chain();
		chain.forEach((p, i) => p.view
			.ac(p === this.active ? "active-page" : "active-ancestor")
			.style("order", i));

		this.app.$app.attr("data-mode", chain.findLast(p => p.mode)?.mode ?? "replace");
		this.mark_links(this.active.url);
	}

	mark_links(here){
		this.root().querySelectorAll("a[href]").forEach(link => {
			if (link.origin !== location.origin) return;
			link.classList.toggle("active", link.pathname === here);
			link.classList.toggle("in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		});
	}
}

export default Router;
```

---

## 2. CSS — the three modes, unchanged from new/0, plus one open hook

```css
@layer base, theme, site, util;

@layer theme {

	.app { display: flex; height: 100%; }
	.pages { display: flex; flex: 1 1 auto; min-width: 0; min-height: 0; }

	.page {
		display: none;
		min-width: 0; min-height: 0; overflow-y: auto;
		padding: 2rem 2.5rem 5rem;
	}

	/* 1 · REPLACE — the default, no class. */
	.page.active-page { display: block; flex: 1 1 auto; }

	/* 2 · COLUMNS — same four rules as new/0. */
	[data-mode="columns"] .pages {
		display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr);
	}
	[data-mode="columns"] .page.active-ancestor { display: block; border-right: 1px solid #e2e4e8; }

	/* 3 · FULL — chrome hidden, page unchanged from replace. */
	[data-mode="full"] .sidebar { display: none; }
}
```

Nothing here changed from `new/0` — the container is still flat, so the
modes are still four rules. What's **new** is `.ac(this.col)` in
`Page.render()` (was `ColumnPager.column()`'s job, §F): a page can carry
`col: "narrow"` and a site can write `[data-mode="columns"]
.page.active-ancestor.narrow { … }`. I'm not shipping that rule — sizing a
grid track per item is a real CSS problem (`ColumnPager`'s own readme lists
it as still open) and solving it isn't what this phase is for. The class is
there; the rule is a site's to write.

## 3. site/ — smallest tree that proves lazy, Router, and all three modes

```
site/
  app.js                 chrome: sidebar (hand-typed nav, see §G) + $pages, socket
  page.js                /                    children: "replace columns full"   ← ALL lazy
  replace/
    page.js               /replace/            children: [child]                  ← eager
    child/
      page.js               /replace/child/
  columns/
    page.js               /columns/            mode: "columns", children: "child"  ← lazy under a mode
    child/
      page.js               /columns/child/     children: [grandchild]             ← eager under a lazy page
      grandchild/
        page.js               /columns/child/grandchild/
  full/
    page.js               /full/               mode: "full"
```

Loading `/` imports exactly one module — `root`'s `unloaded` is
`["replace","columns","full"]` and none of the three have been touched.
`/columns/child/` costs two dynamic imports (`columns`, then `child`) and
zero for `grandchild`, which arrives for free because `child/page.js`
declared it eagerly — proving the two tiers compose at any point in the
tree, not just at the root.

```js
// columns/page.js — a mode AND a lazy child, together
import { Page } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Columns",
	mode: "columns",
	children: "child",
	content(){ this.previews(); }
});
```

```js
// columns/child/page.js — eager grandchild, imported the moment THIS imports
import { Page } from "/app.js";
import grandchild from "./grandchild/page.js";

export default new Page({
	meta: import.meta,
	title: "Child",
	children: [grandchild],
	content(){ this.previews(); }
});
```

```js
// site/app.js — same shape as new/0's, nav still hand-typed (§G — this
// doesn't get solved here; it gets confirmed as the actual cost of laziness)
import { App } from "/framework/core/new/1/App.js";
import { View, div, a } from "/framework/core/View/View.js";

export default window.app = new App({
	nav: [["/", "Home"], ["/replace/", "Replace"], ["/columns/", "Columns"], ["/full/", "Full"]],

	render(){
		this.$body = View.body();
		this.$app = div.c("app", () => {
			div.c("sidebar", () => {
				div.c("brand", "new/1");
				div.c("nav", () => this.nav.forEach(([url, text]) => a.c("nav-link", text).href(url)));
			});
			this.$pages = div.c("pages");
		});
		View.set_captor(this.$pages);
	},
});
```

---

## A–H

**A. Adoption with lazy children.** `.parent` and `.app` for a lazy child are
both assigned in `Page.child()`, the instant its name resolves — one method,
one line (`child.assign({ name, parent: this, app: this.app })`), and it's
the *only* place a name becomes a page, so a reader who wants to know "where
do lazy children get adopted" has exactly one file and one method to open.
`.app` is safe to hand over inline because the parent asking for the child
is, by construction, already adopted — `load_segments()` only ever reaches
`page.child(name)` by having already resolved `page` itself, root outward.
`Page.adopt(app)`, the recursive pass from `new/0`, **survives unchanged**
for the eager tier — it doesn't need to know the lazy boundary exists,
because `this.children` (post-`declare()`) only ever contains real Pages;
the recursion runs out on its own where the data runs out.

**B. What `children` is.** Two properties, each holding exactly one type:
`this.children` is `Page[]`, always, after the constructor runs — the eager
imports plus whatever names have since resolved. `this.unloaded` is
`string[]`, always — names declared but not yet asked for. The constructor
*argument* `children` can be a string, an array of Pages, or a mixed array;
`declare()` sorts it into the two typed properties in one pass, so the
flexibility lives at the boundary and nowhere else. This directly answers
both rejected shapes: a `Map<name, Page|null>` makes one field carry two
meanings behind one key, so every read needs a mental "is this loaded"
branch; a stub-Page-that-absorbs-its-import needs a second object to stand
in for the first, and then a mutation step to make the stand-in *become*
the real one — which is exactly the "abandons the exported instance"
objection, because the module's actual default export is discarded in favor
of the stub's identity. Two arrays cost one extra property name. In
exchange, `this.children.find(...)` never has to ask "or is this a null,"
and nothing is ever pretending to be a Page before it is one.

**C. Router vs. App.** Router owns everything about *which url is current
and what that implies*: `load`, `load_segments`, `activate`, `mark`,
`mark_links`, `shared_depth`, `chain`. App owns boot and chrome only —
`render()` builds `$app`/`$pages` once, `load()` imports root and hands off.
`App.resolve()` does **not** survive; `Router.load_segments()` is its
replacement, now async because `child()` can import. `App.mark()` doesn't
survive either — `Router.mark()` absorbs it, because `Router.activate()`
already has the chain in hand for the diff, and marking is "what changed
about the diff I just applied," not a separate question. `Router.activate(page)`
and `page.activate()` don't collide — different objects, and the pairing is
deliberate (same shape `new/starter` already used and named this way): one
is "make this the current page" (diff, mark, title), the other is "place
myself in my container." They only ever appear next to each other, in
`Router.activate()`'s own body, which is exactly where a reader wants to see
the relationship.

**D. `activate()` vs. `go()`.** Both public, different audiences.
`page.go()` is what site code calls — a button, a redirect — and it's one
line: `this.app.router.go(this.url)`. `page.activate()` is what *only*
`Router.activate()` calls, and it shrank: no more `document.title`, no more
`app.mark()` — both moved to `Router.activate()`, because only Router knows
which page in the chain is the *target* versus an ancestor merely along for
the ride. `new/0`'s `activate()` set the title and called `app.mark()`
itself because it was also the entry point (no Router to call it from); now
that Router is the entry point and calls `activate()` on every entering page
in the diff (ancestors included), title-setting has to live one level up or
it would fire once per entering page instead of once for the actual target.

**E. The chain diff returns, and it should.** `new/0` was correct to have
none — nothing ever left the chain, because nothing but the demo's own
buttons drove navigation and nothing was ever asked to leave. A Router
changes that: visiting `/columns/` after `/replace/child/` genuinely
removes `replace` and `child` from the chain. `Router.activate()` restores
`shared_depth` + `deactivate()`/`activate()` on exactly the pages that
differ, same shape as `new/starter`. `deactivate()` itself stays a no-op by
default — CSS removing the marker classes a moment later is enough for
anything that's just DOM — but the hook exists for the one case that isn't:
a page holding a socket, a timer, a `<video>`. Two lines now versus a silent
leak discovered later; `new/0`'s own readme flagged this as "the first
thing to add" the moment a Router showed up, and a Router just showed up.

**F. `mode` doesn't obsolete `Pager`; it obsoletes half of `ColumnPager`.**
`ColumnPager` does two unrelated jobs: lay pages out in equal columns (data
+ four CSS rules — `mode: "columns"` fully replaces this), and own chrome
— `Sidebar`, breadcrumbs, the per-column close button, the narrow-viewport
burger (none of that is layout, and none of it survives as a `Pager`
subclass here). The chrome becomes site chrome, built once in `site/app.js`
the same way `new/0`'s sidebar always was, reading `router.active.chain()`
for breadcrumbs instead of hardcoding them. `pager(){ return new
ColumnPager({root:this}) }` is **gone** — no topic instantiates a layout
class, so `Page.host()` (whose entire job was "find the ancestor that
defined one") is gone with it; nothing walks `.parent` looking for a
renderer anymore, because there's no per-topic renderer to find. `Pager`,
`ColumnPager`, `TabPager` themselves aren't deleted from `core/` — they stay
available for **manual, non-url use** (a widget on one page, an admin
picker), which was always `Pager.show()`'s other mode and is untouched by
any of this.

**G. Migrating the real site.** `meta: import.meta`, eager `children:
[imports]`, `content()`, `classes` — **unchanged**, zero edits, because
`declare()` treats an all-Page array exactly like `new/0` did (`this.unloaded`
stays empty). Three real breaks: (1) `pager(){...}` becomes dead code —
nothing calls it, and every topic that has one needs a manual pass to
either drop it (falls back to replace) or add `mode: "columns"` plus wire
its chrome into site/app.js if it wants the sidebar look. (2) `col` needs
one new line in `Page.render()` (`.ac(this.col)`, shown above) since
`ColumnPager.column()` no longer exists to read it — mechanical, not
structural. (3) `core/Router.js`'s click interception gates on
`Page.registry.has(url.pathname)` — a synchronous check that assumes the
whole tree is already imported. That assumption is false the moment any
`unloaded` name exists, so the smallest shim is swapping in *this*
`Router.js` wholesale rather than patching the old one: it has no registry
dependency at all, it just tries the walk and falls back to a full
navigation only if `load_segments()` actually returns null. `Page.registry`
itself can be cut — it can never be a complete index once lazy children
exist, and keeping a collection around that looks complete but isn't is
worse than not having it.

**H. What the flat container costs once loading is lazy.** Nothing,
because the two guarantees it needs were never independent. `mount()`
(now folded into `activate()`) needs to run root-before-leaf; `load_segments()`
*produces* the chain root-before-leaf, because you cannot call
`page.child(name)` before you have `page`, and `page` only ever comes from
the previous hop. `Router.activate()` then iterates `to.slice(shared)` — a
slice of `chain()`, which is already root-to-leaf — in order, so the
"ancestors first" property `new/0`'s `Page.mount()` used to enforce by
climbing `.parent` itself is now enforced for free by the shape of the walk
that produced the chain in the first place. And `order` doesn't care when a
page "arrived" — it's set from the *current* chain's index at `mark()` time,
not from mount sequence, so a late-imported page slotting into `$pages`
wherever the DOM happens to put it is exactly as irrelevant as it was in
`new/0`.

---

## Line-count estimate

| file | lines |
|---|---|
| `App.js` | ~55 |
| `Page.class.js` | ~100 |
| `Router.js` | ~90 |
| `site/styles.css` | ~25 |
| `site/` tree (8 files, combined) | ~90 |

`App` is smaller than `new/0`'s (§C moved two methods out and added none).
`Page` and `Router` are both close to `new/starter`'s originals — this
phase isn't cutting concepts from starter's Router, it's replacing
starter's `Map`-of-nulls `declare()`/`add()`/`alias()` (three methods) with
one `declare()` and folding `App.mark()` into `Router.mark()`.

## What I would NOT do

- **Not a stub Page that "becomes" the real export.** Already rejected, for
  the right reason — it means the module's actual default export gets
  thrown away in favor of an object that was never it.
- **Not a `Map<name, Page|null>`**, and not an array of `Page|string`
  either — same heterogeneity wearing a different container. Two
  monomorphic arrays cost one property name and remove every "is this
  loaded" branch at the call site.
- **Not a parent-climb in `Page.activate()`.** Router already guarantees
  root-to-leaf order for the entering slice; a second mechanism climbing
  `.parent` to guarantee the same thing is redundant today and a source of
  drift the day the two disagree.
- **Not reviving `Page.host()` or `pager()`** "just in case a topic wants
  custom chrome later." There's no per-topic renderer to find anymore —
  custom chrome is a site/app.js concern now, and pulling the search back
  in for one hypothetical case reintroduces the exact ancestor-walk this
  phase removed.
- **Not treating `Page.registry` as a real index.** It can only ever list
  what's been imported. Cut it rather than let it look complete.
- **Not solving `col`'s grid-track sizing in this phase.** It's a CSS
  problem `ColumnPager`'s own readme already flags as open, and it's not
  what proves lazy loading or the Router works.
- **Not branching `previews()` on loaded-vs-named.** Call `child(name)`
  uniformly for both; an already-resolved child costs one microtask through
  the same code path, not a second one.
