import { View, div, a, el, input, label } from "/app.js";

View.stylesheet(import.meta, "kit.css");

/* Site chrome, derived. Everything on screen comes from `app.root` and the leaf;
 * nothing is hand-typed, and no view compares a url.
 *
 *     import { chrome } from "./kit/kit.js";
 *     export default window.app = new App(chrome({ brand: "new/1" }), { socket });
 *
 * Two methods, because App has exactly two seams and this needs both:
 *
 *     render()          builds the shell ONCE — 19 links, a bar, a drawer, main
 *     navigated(page)   updates only what depends on the leaf
 *
 * They are returned as a plain assign-object, so adopting the whole thing is one
 * argument to a constructor that already takes `...args` — and a site that wants
 * one piece different overrides that one method after the spread.
 */
export function chrome(config = {}){
	return {
		render(){ build(this, config); },
		navigated(page){ update(this, page); },
	};
}

/* ── the label rule ───────────────────────────────────────────────────────
 *
 * What a link to a child should SAY, before that child has been imported: a
 * label the parent declared, else the name made readable. Never the child's
 * `title` — a title arrives with the import, and WHICH children are imported
 * depends on the url you arrived at, so a nav built from titles reads
 * differently per entry point.
 *
 * This is the SECOND copy of these three lines in this repo (the first is
 * site/chrome/chrome.js). Both delete themselves the day `Page.child_label()`
 * lands — see agents/chrome/child_label.md. The duplication is the cost of not
 * having it yet, stated rather than hidden.
 */
export function child_label(parent, name){
	return parent.labels?.[name] ?? name.replace(/[-_]/g, " ").replace(/^./, c => c.toUpperCase());
}

/* ── the shell ────────────────────────────────────────────────────────────
 *
 * Captured wherever it is called, so the same function builds the document's
 * chrome and a demonstration of it inside a box. Everything it makes, it hangs
 * on `app` — so there is no hidden state and you can poke at `app.$kit_nav`
 * from the console.
 */
/* An id is a GLOBAL name, and `<label for>` is the only way to reach a checkbox
 * that is not its ancestor. A document can hold more than one shell — a preview,
 * a style guide, this kit's own doc page — and two sharing one id means one
 * burger drives the other's drawer and one skip link jumps to the other's main.
 * Measured, on /kit/, which renders two. Numbering them is the whole fix. */
let shells = 0;

export function shell(app, config = {}){
	const n = ++shells;
	const drawer_id = "kit-drawer-" + n;
	const content_id = "kit-content-" + n;

	// the root's own crumb label — the one string the parent-list rule cannot
	// supply, because the root has no parent to declare it
	app.kit_home = config.home;

	return app.$kit_app = div.c("kit-app", () => {

		// the first tabbable thing there is, and invisible until it has focus
		a.c("kit-skip", config.skip ?? "Skip to content").href("#" + content_id);

		// the drawer's entire state: one checkbox, read by :has()
		app.$kit_toggle = input().attr("type", "checkbox").attr("id", drawer_id).ac("kit-toggle");

		app.$kit_nav = el.c("nav", "kit-nav", () => {
			a.c("kit-brand", config.brand ?? app.root?.title ?? "").href("/");
			app.$kit_links = div.c("kit-links");
		}).attr("aria-label", "Sections");

		label.c("kit-scrim").attr("for", drawer_id);

		div.c("kit-main", () => {
			div.c("kit-bar", () => {
				label.c("kit-burger", "☰").attr("for", drawer_id);
				app.$kit_crumbs = el.c("nav", "kit-crumbs").attr("aria-label", "Breadcrumb");
			});

			// <main>, and the skip link's target. tabindex="-1" because a fragment
			// link moves the sequential starting point, not focus — without it the
			// skip link is decoration.
			app.$pages = el.c("main", "pages kit-pages")
				.attr("id", content_id).attr("tabindex", "-1");

			app.$kit_steps = el.c("nav", "kit-steps").attr("aria-label", "Section");
		});

		/* role="status" implies aria-live="polite". It must exist long before it
		 * speaks — a region built and filled in the same task is not announced —
		 * which is exactly why a page cannot do this for itself. */
		app.$kit_announcer = div.c("kit-announcer").attr("role", "status");
	});
}

// App's render() seam: the shell, plus the two things only the document needs.
function build(app, config){
	app.$body = View.body();
	app.$app = shell(app, config).ac("kit-document");

	// $pages, not $app — a page's view auto-appends to the captor
	View.set_captor(app.$pages);
}

/* ── App's navigated() seam ───────────────────────────────────────────────
 *
 * FOUR STEPS, AND THE ORDER IS LOAD-BEARING. Getting it wrong throws nothing;
 * it just quietly leaves focus on <body>, or a fresh crumb trail unmarked.
 *
 *   1  derived chrome   crumbs, prev/next and the nav's open section
 *   2  mark_links()     everything step 1 built was built AFTER mark()'s pass
 *                       and so was never marked — the same late-render gap
 *                       tabs() hits, for the same reason
 *   3  transient chrome the drawer: you picked something, it is done
 *   4  focus            LAST. Steps 1 and 3 can destroy the node that currently
 *                       has focus — the crumb you clicked, the nav link inside
 *                       the drawer — and focus would fall to <body>.
 */
function update(app, page){
	nav(app, page);
	crumbs(app, page);
	steps(app, page);

	app.router?.mark_links();

	if (app.$kit_toggle) app.$kit_toggle.el.checked = false;

	focus(app, page);
}

/* The 19 top-level links are built ONCE. Only the open section's sub-list is
 * derived, and it is rebuilt only when you cross into a different section — so
 * walking three pages inside one section touches no nav DOM at all.
 */
function nav(app, page){
	if (!app.$kit_links.el.children.length)
		app.$kit_links.append(() => app.root.children.forEach((_, name) =>
			a.c("kit-link", child_label(app.root, name)).href(app.root.url + name + "/")));

	const section = page.chain()[1];
	if (section === app.kit_section) return;

	app.kit_section = section;
	app.$kit_sub?.remove();
	app.$kit_sub = null;

	const anchor = section && app.$kit_links.el.querySelector(`a[href="${section.url}"]`);
	if (!anchor) return;

	// built detached-ish and then moved: at navigated() time the captor is $pages,
	// and this belongs in the nav
	app.$kit_sub = div.c("kit-sub", () => section.children.forEach((_, name) =>
		a.c("kit-link kit-sub-link", child_label(section, name)).href(section.url + name + "/")));

	anchor.after(app.$kit_sub.el);
}

/* chain() is [root … me] and every page in it is loaded by construction, so
 * crumbs are the one derived chrome with no lazy-title problem: real titles,
 * always, free. The root is the exception — it has no parent to label it — so
 * it is the one string the kit takes as config.
 */
function crumbs(app, page){
	const chain = page.chain();

	app.$kit_crumbs.empty(() => chain.forEach((pg, i) =>
		a.c("kit-crumb", i ? pg.title : app.kit_home ?? pg.title).href(pg.url)));
}

/* Prev/next spends the one ordering guarantee `children` makes: declare() sets
 * keys in declared order and add() setting an existing key never moves it, so
 * index order is authoring order permanently — resolved or not.
 */
function steps(app, page){
	app.$kit_steps.empty(() => {
		const parent = page.parent;
		if (!parent) return;

		const names = [...parent.children.keys()];
		const at = names.indexOf(page.name);
		const step = (i, dir) => names[i] &&
			a.c("kit-step " + dir, child_label(parent, names[i])).href(parent.url + names[i] + "/");

		// a dead end is where a reader most needs a way out, and the parent is always there
		div.c("kit-step-slot", () => { step(at - 1, "prev") || up(parent); });
		div.c("kit-step-slot", () => { step(at + 1, "next"); });
	});
}

function up(parent){ return a.c("kit-step up", "↑ " + parent.title).href(parent.url); }

/* The keyboard, moved. Three attributes and a focus() — and they are three
 * attributes the framework should be setting itself: `Page.render()` doing it
 * covers tab defaults too (rendered, never activated), which this cannot see.
 * When that lands, delete the setAttribute lines and keep the focus().
 */
function focus(app, page){
	app.kit_navigations = (app.kit_navigations ?? 0) + 1;

	// arriving somewhere is not navigating to it: moving focus on the first paint
	// drops a keyboard user past the skip link before they have touched a key
	if (app.kit_navigations === 1) return;

	const view = page.view?.el;

	/* The leaf's own view — but only if it really is in OUR main region. A page
	 * rendered somewhere else (a tab default, another shell) is not ours to move
	 * the keyboard into. */
	if (view && app.$pages.el.contains(view)){

		// a focusable element with no role and no name is announced BY ITS TEXT,
		// and a page's text is the whole page
		if (!view.hasAttribute("tabindex")){
			view.setAttribute("tabindex", "-1");
			view.setAttribute("role", "region");
			view.setAttribute("aria-label", page.title ?? page.name ?? "");
		}

		/* Nothing is announced here, deliberately: focus landing on a named
		 * region already reports the navigation, and reports it better than a
		 * live region saying the same word a second time. Announce only what
		 * focus cannot say. */
		return view.focus();
	}

	// no destination of ours: <main> takes the keyboard, and the announcer says
	// the name that "main" cannot
	app.$pages.el.focus();
	announce(app, page.title);
}

export function announce(app, text){ app.$kit_announcer?.text(text ?? ""); }

export { build, update, nav, crumbs, steps, focus };
