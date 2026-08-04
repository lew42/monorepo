import { View, Page, div, p, a, table, tbody, tr, td } from "/app.js";
import { code, section } from "../ui.js";
import { shell, update, child_label } from "./kit.js";

View.stylesheet(import.meta, "page.css");

/* The kit adopting itself. Two demonstrations, and the difference between them
 * is why this page is not just a screenshot:
 *
 *   live    the kit's shell built from THIS site's real app.root — nineteen
 *           sections, real hrefs, marked by the real mark_links() pass
 *   driven  the same functions walking the same real tree inside a box, so
 *           navigated() can be watched doing its four steps
 */
export default new Page({
	meta: import.meta,
	title: "Kit",
	classes: "kit-page",

	imports: 0,

	content(){
		code(`
import { App } from "/framework/core/new/1/App.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { chrome } from "./kit/kit.js";

export default window.app = new App(chrome({ brand: "new/1", home: "Home" }),
                                    { socket: Socket.singleton() });`, "site/app.js, adopting the whole thing");

		p("Five lines, and there is no `nav` array. The sidebar, the breadcrumbs, the prev/next, the drawer, the skip link and the focus move are all derived from `app.root` and the leaf. The only hand-typed strings are the brand and the word `Home` — and `Home` is there because the root is the one page with no parent to label it.").ac("note");

		section("Against the real tree");

		this.live();

		// counted, not claimed — the council keeps adding seats
		p(`The kit's own \`shell()\`, built from this site's real \`app.root\`: \`${this.app.root.children.size}\` sections, real hrefs, and \`.active\` / \`.in-path\` written by the real \`Router.mark_links()\` pass. Click anything and you leave — that is what a nav is for.`).ac("note");

		section("What navigated() does, in order");

		code(`
function update(app, page){
    nav(app, page);              // 1  the open section — top links are built ONCE
    crumbs(app, page);           //    chain(), all loaded by construction
    steps(app, page);            //    prev/next, from children's declared order

    app.router?.mark_links();    // 2  everything above was built AFTER mark()'s
                                 //    pass, and so was never marked

    app.$kit_toggle.el.checked = false;   // 3  the drawer: you picked something

    focus(app, page);            // 4  last, and never on the first paint
}`, "kit.js");

		this.driven();

		p("Walk it. The nineteen top-level links stay the same DOM nodes throughout — only the open section's sub-list is ever rebuilt, and only when you cross into a different section. `modules imported` is the real cost of walking a lazy tree: the kit itself imports nothing.").ac("note");

		section("Step 2 is not optional");

		code(`
with    mark_links() after the rebuild    crumb /kit/   class "kit-crumb active"
without                                   crumb /kit/   class "kit-crumb"`, "measured, by deleting the line");

		p("`mark()` runs before `navigated()`, so every link the kit builds in step 1 is built after the pass that would have marked it. Same late-render gap `tabs()` hits, and it is structural: derived chrome is always built too late to be marked by the navigation that caused it.").ac("note");

		section("What it does not do");

		code(`
grouping     a derived nav is flat. The site's hand-typed one has a "recipes"
             heading; that is a shape the tree does not have, and the honest
             fix is a page those sections are children of — not a nav feature.

depth 3      the sub-list stops at the open section's own children. One level
             deeper needs an import; the second level is free only because you
             walked through that page to get here.

route()      urls claimed on arrival cannot be listed, so they never appear.
             Correct, and worth saying out loud.`);

		this.files();
	},

	// the real thing: real root, real hrefs, the real marking pass
	live(){
		const host = { root: this.app.root, router: this.app.router };

		div.c("kit-frame", () => shell(host, { brand: "new/1", home: "Home" }));

		host.$pages.append(() => {
			div.c("kit-demo-title", "the page renders here");
			p("In document mode this is `<main id=\"kit-content\">` — the skip link's target, and the captor App hands to every page.").ac("note");
		});

		update(host, this);
		return host;
	},

	/* The same functions, walking the same real tree, inside a box.
	 *
	 * Its links are real urls, so the marking has to be scoped: the real pass
	 * owns `.active` across all of $app and rewrites these the next time you
	 * navigate. activate() puts them back — a page IS told when it re-enters the
	 * chain, and that is the one case a page can answer for itself.
	 */
	driven(){
		const host = { root: this.app.root };
		let $readout, subs = 0, first;

		host.router = { mark_links: () => this.mark(host) };

		const $box = div.c("kit-frame kit-driven", () => shell(host, { brand: "new/1", home: "Home" }));

		const after = () => {
			if (host.$kit_sub !== host.kit_last_sub){ subs++; host.kit_last_sub = host.$kit_sub; }
			first ??= host.$kit_links.el.firstElementChild;

			$readout.empty(() => table.c("kit-readout", () => tbody(() => {
				const row = (k, v) => tr(() => { td(k); td(String(v)).ac("v"); });

				// :scope > a, not children — the open section's sub-list is
				// inserted into this same element, and it is not a top-level link
				row("navigations", host.kit_navigations);
				row("top-level links", host.$kit_links.el.querySelectorAll(":scope > a").length);
				row("…same DOM node", first === host.$kit_links.el.firstElementChild);
				row("sub-list rebuilds", subs);
				row("modules imported", this.imports);
			})));
		};

		$box.click(e => {
			const link = e.target.closest?.("a[href]");
			if (!link || !$box.el.contains(link)) return;

			// beats the Router to it — link_clicked() bails on defaultPrevented
			e.preventDefault();
			this.walk(host, new URL(link.href).pathname, after);
		});

		$readout = div.c("kit-readout-box");
		this.remark = () => this.mark(host);

		this.walk(host, "/", after);
		return $box;
	},

	/* One page's worth of marking, scoped to the kit's own subtree — the same two
	 * classes and the same rule as Router.mark_links(). */
	mark(host){
		const here = host.page?.url;
		if (!here) return;

		host.$kit_app.el.querySelectorAll("a[href]").forEach(link => {
			link.classList.toggle("active", link.pathname === here);
			link.classList.toggle("in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		});
	},

	/* The Router's walk, in miniature, over the REAL tree — so an unvisited
	 * segment really is imported here, exactly as it would be on a click.
	 * `known` is null for a declared-but-unloaded name, which is what a fresh
	 * import looks like from the outside. */
	async walk(host, url, done){
		let page = host.root;

		for (const name of url.split("/").filter(Boolean)){
			const known = page.children.get(name);
			page = await page.child(name);
			if (!page) return done();
			if (!known) this.imports++;
		}

		host.page = page;

		// $pages by name: this runs after an await, so the ambient captor is gone
		host.$pages.empty(() => {
			div.c("kit-demo-url", page.url);
			div.c("kit-demo-title", page.title);

			if (page.children.size)
				div.c("kit-demo-kids", () => page.children.forEach((_, name) =>
					a.c("kit-step", child_label(page, name)).href(page.url + name + "/")));
		});

		update(host, page);
		done();
	},

	// the driven box's links are rewritten by the real pass while this page sits
	// hidden; re-entering the chain is the one moment a page can put them back
	activate(){
		Page.prototype.activate.call(this);
		this.remark?.();
		return this;
	},

	files(){
		return code(`
site/kit/kit.js    chrome() · shell() · update() · nav · crumbs · steps · focus
site/kit/kit.css   one stylesheet, @layer site, every selector starts with .kit-
site/kit/page.js   this page

Reachable at /kit/ once "kit" joins the root's children in site/page.js — one
word, and the only thing this directory needs from anybody.`, "files");
	},
});
