# Steve's proposal — Router-less App + Page, flat container

MVP for `public/framework/core/new/0/`. No Router, no lazy loading, no
per-page `$pages`. Everything below earns its place against one question:
**does this method need to exist at all.**

The one structural fact that makes everything else simple: **children are
direct imports, so the whole reachable tree already exists — fully
`.parent`-linked — the instant `/page.js` is imported.** There is nothing
left to load lazily, nothing declared-but-not-loaded, no registry. That one
fact is why Page loses about a third of starter's methods outright (§F) and
why COLUMNS needs almost no JS (§D).

---

## 1. App.js

```js
import { View, div, h1, el } from "../../View/View.js";

/* No Router yet. App itself walks location.pathname → a page, in memory,
 * because children are direct imports (see Page.class.js) — the whole
 * reachable tree already exists as soon as "/page.js" is imported. That one
 * import is therefore the only async step in load(); everything after it
 * is a synchronous array walk. */
export class App {

	constructor(...args){
		this.loaders = [];
		this.assign(...args);
		this.instantiate();
	}

	assign(...args){ return Object.assign(this, ...args); }

	async instantiate(){
		this.config();
		this.render();
		await this.load();
		this.initialize();
		this.inject();
		this.ready.resolve();
	}

	// extension points — empty on purpose, nothing internal calls them yet.
	// A site overrides config() or render() the way starter/site/app.js does.
	config(){}
	initialize(){}

	render(){
		this.$body = View.body();
		this.$app = div.c("app", () => {
			this.$pages = div.c("pages");
		});
		View.set_captor(this.$app);
	}

	// import the root ONCE — it pulls the whole static tree in with it (§A) —
	// adopt it, resolve the current url against it, activate whatever's found.
	async load(){
		let root;
		try { root = (await import("/page.js")).default; }
		catch (error) { return this.error(error); }

		this.root = root.adopt(this);

		const page = this.resolve(location.pathname);
		if (!page) return this.error(new Error(`404 — no page matches "${location.pathname}"`));

		page.activate();
		console.log(`app.load() → ${page.log_label()} activated`);

		await this.loaded;
	}

	// the whole router, for now: one segment at a time, through pages that
	// already exist in memory. No import, no network, no filesystem lookup.
	resolve(pathname){
		const segments = pathname.split("/").filter(Boolean);
		let page = this.root;

		for (const name of segments){
			page = page.child(name);
			if (!page) return null;
		}

		return page;
	}

	inject(){
		this.$body.append(this.$app);
	}

	// Nothing is torn down (§B). Every page that has ever activated stays
	// mounted, so "switching" is: sweep the two marker classes, re-apply them
	// down the NEW chain, set the mode class. CSS does the rest.
	mark(page){
		const chain = page.chain();

		this.$pages.el.querySelectorAll(".active-page, .active-ancestor")
			.forEach(el => el.classList.remove("active-page", "active-ancestor"));

		chain.forEach((p, i) => {
			p.view
				.ac(i === chain.length - 1 ? "active-page" : "active-ancestor")
				.style("order", i);   // DOM stays in mount order; `order` fixes the READ order — §E
		});

		const mode = chain.find(p => p.mode)?.mode;   // nearest ancestor that opted in; undefined = replace
		this.$app.rc("mode-columns mode-full");
		if (mode) this.$app.ac("mode-" + mode);

		console.log(`app.mark(${page.log_label()}) — chain ${chain.map(p => p.url).join(" › ")}, mode: ${mode ?? "replace"}`);
	}

	error(error){
		console.error(error);
		this.$app.empty(() => {
			h1("Page Load Error");
			el.c("pre", "error", error.message);
		});
	}

	stylesheet(meta, url){
		return View.stylesheet(meta, url);
	}

	get ready(){
		if (!this._ready){
			let resolve;
			this._ready = new Promise(res => resolve = res);
			this._ready.resolve = resolve;
		}
		return this._ready;
	}

	get loaded(){
		return Promise.all(View.stylesheets.concat(this.loaders));
	}
}

export default App;
```

## 2. Page.class.js

```js
import { div, h1, a } from "../../View/View.js";

/* Children are direct imports — `import intro from "./intro/page.js"` then
 * `children: [intro, api]` — so by the time THIS module's `new Page(...)`
 * runs, every declared child already exists. Adoption (.parent) is plain
 * assignment in the constructor, same as it's always been. `.app` is
 * different: nothing has one at import time (§C), so it arrives later,
 * through adopt(). */
export class Page {

	constructor(...args){
		this.assign(...args);
		this.naming();

		this.children?.forEach(child => child.parent = this);

		console.log(`new ${this.log_label()} constructed — "${this.title}"${this.mode ? `, mode: ${this.mode}` : ""}`);
	}

	assign(...args){ return Object.assign(this, ...args); }

	log_label(){ return `page{${this.url ?? "…"}}`; }

	// unchanged from starter — meta: import.meta derives url/name/title.
	naming(){
		this.url   ??= this.meta ? new URL(".", this.meta.url).pathname
		             : this.parent && this.name ? this.parent.url + this.name + "/"
		             : undefined;
		this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
		this.title ??= this.name;
		return this;
	}

	// App owns this once, right after importing the root (App.load()). Every
	// page in the whole tree already exists by then — imports are eager — so
	// one recursive pass reaches everything there is to reach.
	adopt(app){
		this.app = app;
		this.children?.forEach(child => child.adopt(app));
		return this;
	}

	// [root … me]
	chain(){
		const chain = [this];
		for (let page = this; page.parent; ) chain.unshift(page = page.parent);
		return chain;
	}

	// one path segment -> a child, or null. A plain array lookup — there is
	// no "declared but not loaded" state any more, because there is nothing
	// left to load; every child already exists.
	child(name){
		return this.children?.find(c => c.name === name) ?? null;
	}

	// ancestors first, so a chain is never partially mounted. Idempotent —
	// safe to call on every activate(), including ancestors already there.
	mount(){
		this.parent?.mount();

		this.render();
		if (this.view.el.parentNode !== this.app.$pages.el)
			this.app.$pages.append(this.view);

		return this;
	}

	// THE verb (#4 — becomes go() once a Router exists to call it for you).
	// Mount myself and my ancestors, tell the document, tell App to update
	// the marker classes.
	activate(){
		this.mount();
		document.title = this.title;
		this.app.mark(this);

		console.log(`${this.log_label()}.activate()`);
		return this;
	}

	render(){
		if (this.view) return this.view;

		this.view = div.c("page", () => {
			if (this.title) h1.c("page-title", this.title);
			this.content?.();
		})
			.ac(this.name && "page-" + this.name)
			.ac(this.classes);

		return this.view;
	}

	// href for real semantics (hover, copy, open-in-new-tab); the click
	// handler is what actually navigates today. When a Router exists it
	// either takes the click over globally (delete this handler) or this
	// handler starts calling go() instead of activate() — the anchor itself
	// never has to change shape. §G.
	link(text){
		return a.c("page-link", text ?? this.title)
			.href(this.url)
			.click(e => { e.preventDefault(); this.activate(); });
	}

	preview(){
		return a.c("page-preview", this.title)
			.href(this.url)
			.click(e => { e.preventDefault(); this.activate(); });
	}

	previews(){
		return div.c("page-previews", () => {
			(this.children ?? []).forEach(child => child.preview());
		});
	}
}

export default Page;
```

## 3. CSS — all three modes

Short, because the flat container did the hard part: every page in the
current chain is *already a direct sibling* of every other, so COLUMNS is
"make `.pages` a grid" and nothing more. Starter needed `display: contents`
to dissolve nested wrappers into one grid; there is nothing nested left to
dissolve.

```css
@layer base, theme, site, util;

@layer theme {

	.app  { display: flex; height: 100%; }
	.main { flex: 1 1 auto; min-width: 0; }
	.pages { display: flex; flex: 1 1 auto; min-width: 0; min-height: 0; }

	/* REPLACE — the default. Only the active leaf is visible, full-bleed.
	   No class for this: it's what's left when neither mode below applies. */
	.page { display: none; }
	.page.active-page {
		display: flex; flex-direction: column;
		flex: 1 1 auto; min-width: 0; overflow-y: auto;
	}

	/* COLUMNS — the whole chain becomes equal grid tracks. `order` (set in
	   App.mark) keeps them root→leaf regardless of mount order — §E. */
	.app.mode-columns .pages {
		display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr);
	}
	.app.mode-columns .page.active-ancestor {
		display: flex; flex-direction: column;
		overflow-y: auto; border-right: 1px solid #e2e4e8;
	}

	/* FULL — REPLACE's visibility, chrome gone. The site's own stylesheet
	   defines .sidebar; this rule only names it (it exists to be overridden
	   the moment a site's chrome has a different class — see CLAUDE.md on
	   themes touching only generic elements, components only their own). */
	.app.mode-full .sidebar { display: none; }
}
```

~20 rules. No `display: contents`, no nested-wrapper dissolving, no
`min-height: auto` flex trap (nothing here is a flex item with hidden
overflow) — three bugs from `new/starter`'s CSS that don't have anywhere to
recur, because the box they lived in (`.page-content` vs `.pages`, nested)
no longer exists. See §F: `.page-content` is cut too.

## 4. site/ tree

Smallest set that exercises all three modes — REPLACE two deep, COLUMNS
three deep (to prove *equal*, not halving, width), FULL as a single page.

```
site/
  app.js                      chrome override: .sidebar + $pages, like starter/site/app.js
  page.js                     /            children: [replace, columns, full]
  replace/
    page.js                   /replace/                    children: [child]
    child/
      page.js                 /replace/child/
  columns/
    page.js                   /columns/                    mode: "columns", children: [child]
    child/
      page.js                 /columns/child/              children: [grandchild]
      grandchild/
        page.js                /columns/child/grandchild/
  full/
    page.js                   /full/                       mode: "full"
```

Two representative files:

```js
// columns/page.js
import { Page } from "/app.js";
import child from "./child/page.js";

export default new Page({
	meta: import.meta,
	title: "Columns",
	mode: "columns",
	children: [child],
	content(){ this.previews(); }
});
```

```js
// full/page.js
import { Page } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Full",
	mode: "full",
	content(){ /* … */ }
});
```

Note what `full/page.js` does **not** contain: no `activate(){
this.app.hide_chrome() }`, no override, no super call. `mode: "full"` is
data; App.mark() reads it off the chain and applies one class. This is the
banned pattern (#9) closed by construction, not by convention.

---

## A. What loads what — always import root, walk in memory

**Always import `/page.js`, then walk `location.pathname`'s segments through
the already-imported `.children` arrays.** The alternative — import the
first segment directly (`/docs/page.js` for `/docs/intro/`) and skip the
root — saves importing sibling subtrees the current url doesn't touch, but
it breaks the one invariant COLUMNS depends on: `.parent` is assigned by a
page's *own* constructor over its *own* declared children, so if root's
module never runs, root's constructor never adopts `docs`, and
`docs.parent` is simply never set. `docs.chain()` becomes `[docs, intro]`
instead of `[root, docs, intro]` — not "root hidden by CSS," root genuinely
isn't in the chain, so COLUMNS silently loses a column depending on which
url you loaded first. Because children are *eager* imports (#2), importing
root already imports the entire site's module graph every time regardless —
there is no partial-load version of this design to protect with the
skip-root trick. The cost it would save doesn't exist yet; the correctness
it would cost does. Pick (i).

## B. Activation without a diff — nothing is deactivated, only re-marked

**No.** With visibility pure CSS (`.active-page` / `.active-ancestor`,
nothing else), a page that leaves the chain needs nothing *undone* — it just
needs its classes removed, and that's a query, not a lifecycle hook.
`page.activate()` is `mount()` (render + attach myself and my ancestors,
idempotent) → `document.title = this.title` → `app.mark(this)` (global
sweep: strip both marker classes from everything in `$pages`, re-apply down
the new chain, set the mode class). There is no `deactivate()` at all — not
a no-op kept for symmetry, actually absent. The starter Router's
`shared_depth` diff existed to call `deactivate()` on exactly the pages that
left; once nothing needs deactivating, the diff has no job either. A full
class-sweep on every activation is `$pages.querySelectorAll(...)` over
however many pages have ever been visited — cheap at MVP scale, and it's
the one place "which pages are currently marked" has a single source of
truth instead of being reconstructed from a diff.

## C. app and parent — constructor-assign vs. a second adoption pass

`.parent` is constructor-assign: a child object exists before its parent's
constructor runs (imports are eager, so `import intro from "./intro/page.js"`
has already executed `new Page(...)` by the time the importing module
reaches its own `new Page(...)`), so `this.children.forEach(child =>
child.parent = this)` in the constructor is plain, safe assignment — same
as starter. `.app` cannot work that way: **nothing has an App instance at
module-execution time**, not even the root page, because `app.js` does
`window.app = new App(...)` and the App's own constructor is still running
`config()`/`render()` when it imports `/page.js` in `load()`. So `.app`
needs its own step, after import, once App exists: `App.load()` calls
`root.adopt(this)`, and `Page.adopt(app)` assigns `this.app = app` then
recurses over `this.children`. It's greppable in exactly the way the brief
asks: `adopt(` is defined once, in `Page.class.js`, and called once, in
`App.js`'s `load()` — read either file and you see the whole mechanism, no
hunting. This mirrors CLAUDE.md's "two ways a property arrives" split
exactly (constructor-assign for what's known up front, adoption for what
only the container knows) — it's just that here the *container* is doing
the adopting for its whole tree in one pass, rather than one level at a
time, because eager imports mean the whole tree is already there to adopt.

## D. Where mode lives — a plain property, resolved by scanning the chain you already have

`mode` is a plain assigned property on whichever page declares it (`mode:
"columns"`), and a descendant that declares nothing does **not** search for
it — `App.mark()` already has `page.chain()` in hand (it needs it anyway,
for the marker classes), so mode resolution is `chain.find(p => p.mode)`:
first match scanning root→leaf, no extra traversal, no inheritance, no
getter. This is deliberately the same *shape* as starter's `host()` search
— walking toward the root for the nearest thing that opted in — but it
costs nothing extra because the list already existed for another reason,
and it's a plain method call inside `mark()`, not a property read
(`chain.find` has parens; nothing pretends to be cheap data that isn't).
The class lands on `this.$app` (COLUMNS needs to restyle `.pages`, FULL
needs to hide `.sidebar` — one element, one class, both rules read off it)
rather than on individual page views, because mode is a property of the
*whole current chain's presentation*, not of any single page.

## E. Ordering and scroll — `order`, not re-appending

**CSS `order`, set from the chain index in `App.mark()`.** Re-appending the
whole chain in root→leaf order on every activation would get DOM order
right, but `append()` on an already-attached node is a detach+attach —
every page in the chain would lose its scroll position on every navigation,
including ones that didn't change. `order` is one line
(`p.view.style("order", i)`), touches no node's attachment, and both flex
and grid respect it identically, so it works unchanged whether the chain is
currently in REPLACE, COLUMNS, or FULL. DOM order is left as first-mount
order (irrelevant — it's never read visually again after the first
`order` is applied) and the visible order is entirely a CSS concern, which
is exactly where "which page reads as first" belongs.

## F. What's cut

Everything not load-bearing once (1) children are eager imports and (2)
`$pages` is flat and singular. Two mechanical consequences do most of the
cutting: no lazy loading → no import-failure heuristics; no per-page
`$pages` → no per-page container resolution, no `.page-content` wrapper.

| starter method | kept? | why |
|---|---|---|
| `Page.declare()` / children `Map` | **cut** | children is a plain array now — no "declared but not loaded" state exists to track |
| `Page.add()` | **cut** | no inline pages in this phase (#2 restricts children to imports); `new Page({…})` inline in an array covers it if ever needed |
| `Page.alias()` | **cut** | convenience with one caller that no longer exists (`add()`) |
| `Page.child(name)` | **kept**, simplified | array `.find()`, synchronous — no import, no `route()` fallback |
| `Page.import()` / `Page.missing()` | **cut** | existed to distinguish "no file" from "file threw" across many lazy imports; there is exactly one dynamic import total now (App's root import), and `App.load()`'s own `try/catch` already covers it |
| `Page.container()` | **cut** | every page mounts into `this.app.$pages` directly — nothing to resolve |
| `Page.deactivate()` | **cut** | see §B — nothing needs undoing |
| `Page.$pages` (per-page slot) | **cut** | the whole point of the flat container |
| `Page.go()` | **cut for now** | #4: it's a rename `activate()` earns *when the Router exists to call it* — writing it today names a distinction that doesn't exist yet |
| `Page.seo_title()` | **cut** | one-line site-name prefix with no site-name feature to prefix yet; `document.title = this.title` inline in `activate()` says the same thing without a method whose only job is a `??` |
| `Page.previews()` | **kept**, now sync | children are already-resolved objects, so the `async`/await-then-append dance (and its whole capturing gotcha) disappears — it's a plain `forEach` |
| `Page.mount()` | **new** | recursive "I and my ancestors exist in `$pages`" — split out of `activate()` so `activate()` reads as three steps, not one tangle |
| `Page.adopt()` | **new** | see §C |
| `App.load_root()` | **cut** | folded into `load()` — it wrapped one line and was called once |
| `App.mark_links()` | **cut for now** | compared `window.location` for `.active`/`.in-path` highlighting; not needed to prove the three modes, and CLAUDE.md is explicit that link-marking is a Router-era concern |
| `App.mark()` | **new** | see §B/§D — the sweep-and-reapply that replaces the Router's diff |
| `App.resolve()` | **new** | see §A — App's half of "no Router" |
| `App.config_socket()` / `App.config_router()` | **cut** | no Router; dev socket is a site opt-in constructor arg (`socket: Socket.singleton()`), same as `new/starter` already does — the framework still knows nothing about sockets |
| `App.config()` / `App.initialize()` | **kept, empty** | fixed by the brief (#5) as lifecycle steps, not by their own merit — flagging that if it were my call I'd cut a hook nothing calls yet, but the sequence is a given here, so both stay as the intended override points (a site's `app.js` overriding `render()` for chrome is the same shape) |

## G. `link()` with no url — wire both, change neither shape

**Both, now, so the method's shape never has to change.** `link()` sets a
real `href` (hover, copy-link, open-in-new-tab all keep working with no
Router at all) *and* a click handler that calls `this.activate()` directly
with `preventDefault()`. When the Router lands it has two ways to land
without touching this method: replace the per-link handler's body
(`activate()` → `go()`, one word) or delete the handler entirely in favor
of one delegated listener on `document` — either way `link()` still emits
`a.c("page-link", …).href(this.url)`, which is the part every future phase
needs regardless. The alternative — an `href`-less handler-only link today —
would have to grow an `href` later just to not regress hover/copy/new-tab,
which is the "have to change twice" the question is warning against.

---

## Line-count estimate

| file | lines |
|---|---|
| `App.js` | ~90 |
| `Page.class.js` | ~100 |
| `site/styles.css` (theme layer, all 3 modes) | ~35 |
| `site/` page tree (7 files, combined) | ~90 |

Both core files are *longer* than starter's (41 + 95 → ~90 + ~100) despite
having fewer methods — comments explaining §A–§G's reasoning inline account
for most of the difference. Stripped of comments, `App.js` is closer to 45
lines and `Page.class.js` to 60: smaller than starter on both counts, which
is the actual claim (fewer concepts), not the line count with commentary
attached.
