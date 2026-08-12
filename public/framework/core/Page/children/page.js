import { Page, md, demo, code, h2 } from "/app.js";
import web from "/framework/ext/demo/web.js";

export default new Page({
	meta: import.meta,
	title: "Children",
	description: "The filesystem is the router: how a tree is defined, imported and walked.",
	icon: "account_tree",

	content(){

		code(`docs/
    page.js              /docs/
    intro/page.js        /docs/intro/
    guide/
        page.js          /docs/guide/
        api/page.js      /docs/guide/api/`);

		md("**A directory with a `page.js` in it is a page.** No registry, no route table, nothing to keep in sync — you make a folder, and the url exists.");

		code.js(`import { Page, md } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Intro",
    content(){ md("Hello."); },
});`);

		md("`meta: import.meta` is the line that tells a page its own address — `naming()` reads `new URL(\".\", meta.url).pathname`. Everything else derives from it: `name` is the last segment, `title` falls back to `name`. That file **is** the whole definition; editing a page means editing it.");

		h2("children: the menu, not the registration");

		code.js(`children: "intro guide api"   // child folder names, in menu order`);

		md("Names, not imports — and every one of them **is** imported, at construction. So a menu can read its children's real titles and icons, and [Router](/framework/core/Router/) awaits the whole chain before it shows anything: the menu draws **once**, correct, never names-first-then-titles.");

		md("`child(name)` resolves a segment in three steps: **memory, then `route()`, then a filesystem probe** for `<url><name>/page.js`. So a folder nobody declared still works when you navigate to it — **forgetting to declare costs the menu entry, not the url.**");

		md("Which leaves the line one job, and it is the one a filesystem cannot do: **which children, and in what order.** `api` before `guide` before `intro` is alphabetical, and alphabetical is not a curriculum.");

		md("A browser cannot list a directory. `import()` takes a path; there is no way to ask a static host what is in `/docs/`, so the probe guesses one name at a time. That is also why an index is *declared* rather than crawled — nothing here reads the disk.");

		h2("A child written in place");

		code.js(`children: {
    HTML(){ md("Every element is a word."); },    // a function is content
    CSS: { icon: "palette", content(){ } },       // an object is options
    JS: null,                                     // null is a bare name again
}`);

		md("**The key is the title, and `Page.slug(key)` is the url segment** — the same derivation a page with no folder makes from its own title, so `HTML` is `/html/`. A `title:` inside an object value wins over the key. Every demo tree on this site is one of these: real pages, real urls, nothing on disk.");

		md("⚠ **The value must be deferred.** `JS: md(\"…\")` calls `md()` at *declaration* time, under whatever captor was current — the synchronous-capture trap in value position, so `declare()` throws rather than let the output land somewhere quietly. And **integer-like keys hoist**: `{ 2(){}, 1(){} }` declares `1` first, because JS sorts numeric keys ahead of every other. Numeric names go in the string form.");

		h2("Imports flow down; the tree points back up");

		code.js(`// docs/page.js — a parent never imports a child by hand
export default new Page({ meta: import.meta, children: "intro guide" });

// docs/intro/page.js — and a child never imports its parent
export default new Page({ meta: import.meta, title: "Intro" });`);

		md("`add()` is the one place `parent` is assigned and `child()` is the one place `app` is handed down — **adoption**, on the walk, to the page about to need it. A `page.js` names neither.");

		md("⚠ **Mutual imports break only on deep reloads.** `import` hoists regardless of textual position, so a child importing its parent reads an uninitialized binding: `/docs/` throws while `/docs/intro/` works. Imports flow **down**; the backref arrives by adoption.");

		h2("What a click does");

		demo(() => {
			demo.app(web(), { nav: true }).style("height", "20em");
		}, "The strip on top is `chain()`, the rail is `nav_for()` per child, the box is the region. **Click anything.** This is the Router's walk in miniature — the same class, the same methods, a tree held in memory.");

		md(`1. **\`click()\`** catches an ordinary \`<a href>\` — no component asked to be navigable.
2. **\`load_segments()\`** walks the url one segment at a time, \`await page.child(name)\` per hop. The walk **is** the loader: a miss imports.
3. **\`activate()\`** touches only what changed — deactivate deepest-first, activate shallowest-first, shared leading pages never rebuilt. Your sidebar does not flicker because it is never re-rendered.
4. **\`container()\`** decides where each page mounts: a region my parent set for me, else the nearest ancestor with a \`$pages\`, else the app's.
5. **\`mark()\`** writes \`.active-page\` on the leaf and \`.active-ancestor\` on its chain, then \`.active\` / \`.in-path\` on every anchor.`);

		md("**Step 5 is the whole arrangement system.** A `.page` is hidden unless it is marked, in `@layer util`, so *which* page shows is CSS reading two classes — and every layout on this site is a page opting into a shape, not a component switching one on.");

		h2("Urls with no folder at all");

		code.js(`route(name){
    const entry = catalogue[name];
    return entry && { title: entry.title, content(){ } };
}`);

		md("It runs for **undeclared** names only, so it structurally cannot shadow a `page.js`, and it is tried before the probe, so a dynamic name costs no doomed request. **`route()` is for children that come from data; `children` is for children that come from decisions.**");

		md("Next: [Previews](/framework/core/Page/previews/) — how a tree shows itself: the parent's wall, the child's card.");

		md.details(import.meta, "../doc/declaring.md", "Design record — the reversal, and the CMS question in full");
	}
});
