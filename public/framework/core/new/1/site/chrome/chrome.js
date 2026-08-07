import { View, Page, div, span, a, button, code } from "/app.js";
import demo from "/framework/ext/demo/demo.js";

/* Importing highlight ENHANCES the shared `code` factory in place — code.js(),
 * code.fn(), code.css(). This section's pages import `code` from here rather
 * than from /app.js, so the enhancement and the thing it enhances arrive
 * together instead of depending on who happened to import what first. */
import "/framework/ext/highlight/highlight.js";

View.stylesheet(import.meta, "chrome.css");

export { demo, code };

/* A function's real source, highlighted.
 *
 * `String(fn)`, not `code.fn(fn)`: code.fn() runs util/source, which strips the
 * wrapper — and for a function that IS the pattern, the signature is half of
 * what a reader needs. Either way the text is the function that ran, so the
 * page and the code cannot disagree.
 */
export function show_source(fn){ return code.js(String(fn)); }

/* ── the label rule ───────────────────────────────────────────────────────
 *
 * What a link to a child should SAY, before that child has been imported.
 *
 *   1. a label the parent declared    labels: { dynamic: "route()" }
 *   2. the name, made readable        "getting-started" -> "Getting started"
 *
 * Never the child's own `title`. A title exists only once that child has been
 * imported, and WHICH children are imported depends on the url you arrived at
 * — so a nav built from titles reads differently per entry point. That is the
 * bug tabs() already refused, and a sidebar is on screen far longer than a bar.
 *
 * `labels` is inert data on the parent: Page's constructor is assign-based, so
 * this needs nothing from the framework. See agents/chrome/page.js for the
 * one-method version that would let previews() agree with it.
 */
export function child_label(parent, name){
	return parent.labels?.[name] ?? name.replace(/[-_]/g, " ").replace(/^./, c => c.toUpperCase());
}

/* ── nav: the whole of Open #6 ────────────────────────────────────────────
 *
 * Two levels, derived, and it imports nothing: the top level is root.children
 * (names, in declaration order) and the second is the children of whichever of
 * them is in `here`'s chain — a page you have necessarily walked through, so
 * its own children Map already exists.
 */
export function nav(root, here){
	const section = here.chain()[1];   // [root, section, …me] — the one I'm inside

	return div.c("chrome-nav", () => {
		a.c("chrome-brand", root.title).href(root.url);

		root.children.forEach((child, name) => {
			a.c("chrome-nav-link", child_label(root, name)).href(root.url + name + "/");

			if (child && child === section)
				child.children.forEach((_, sub) =>
					a.c("chrome-nav-link chrome-nav-sub", child_label(child, sub))
						.href(child.url + sub + "/"));
		});
	});
}

/* ── crumbs ───────────────────────────────────────────────────────────────
 *
 * chain() is [root … me] and every page in it is loaded by construction — the
 * Router walked through them to get here. So crumbs are the one derived chrome
 * with no lazy-title problem at all: real titles, always, for free.
 *
 * The separator is CSS (.chrome-crumb + .chrome-crumb::before), not an element:
 * a "›" between links is decoration, and as a DOM node it gets read aloud,
 * selected, and copied along with the text.
 */
export function crumbs(page, max = 0){
	const chain = page.chain();
	const shown = max && chain.length > max ? [chain[0], null, ...chain.slice(-2)] : chain;

	return div.c("chrome-crumbs", () => shown.forEach(pg =>
		pg ? a.c("chrome-crumb", pg.title).href(pg.url) : span.c("chrome-crumb-gap", "…")));
}

/* ── topbar: the leaf, and sideways ───────────────────────────────────────
 *
 * The siblings of the current page — movement ACROSS the tree at the depth you
 * are already at, which a vertical sidebar cannot express without expanding
 * every level at once.
 */
export function topbar(page){
	const parent = page.parent;

	return div.c("chrome-topbar", () => {
		span.c("chrome-topbar-title", page.title);

		if (parent)
			div.c("chrome-topbar-sibs", () => parent.children.forEach((_, name) =>
				a.c("chrome-tab", child_label(parent, name)).href(parent.url + name + "/")));
	});
}

/* ── prev / next ──────────────────────────────────────────────────────────
 *
 * The one pattern that spends the ordering guarantee: children is a Map built
 * by declare() in declared order, and add() setting an existing key never moves
 * it, so index order is AUTHORED order — permanently, whether a name has
 * resolved yet or not. Nothing else in the tree needs that promise; this does.
 *
 * At the ends, "up" instead of nothing: a dead end is where a reader most needs
 * a way out, and the parent is always there.
 */
export function prev_next(page){
	const parent = page.parent;
	if (!parent) return div.c("chrome-steps");

	const names = [...parent.children.keys()];
	const at = names.indexOf(page.name);

	const step = (i, dir) => names[i] &&
		a.c("chrome-step " + dir, child_label(parent, names[i])).href(parent.url + names[i] + "/");

	return div.c("chrome-steps", () => {
		div.c("chrome-steps-prev", () => { step(at - 1, "prev") || up(parent); });
		div.c("chrome-steps-next", () => { step(at + 1, "next"); });
	});
}

export function up(parent){
	return a.c("chrome-step up", "↑ " + parent.title).href(parent.url);
}

/* ── jump: everything the tree can offer a search box ─────────────────────
 *
 * Every declared name reachable without an import: the root's children, plus
 * the children of any page already loaded. Loaded pages contribute a real
 * title; unloaded ones contribute their label, which is a name. Nothing here
 * fetches, so nothing here can search what a name does not say.
 */
export function jump_list(root){
	const list = [];

	const walk = page => page.children.forEach((child, name) => {
		list.push({ url: page.url + name + "/", label: child_label(page, name), loaded: !!child });
		if (child) walk(child);
	});

	walk(root);
	return list;
}

/* ── widths: three viewports on one screen ────────────────────────────────
 *
 * A stage is a container, so the chrome inside it responds to the BOX. These
 * buttons cap the box — max-width, never width, because a stage fixed at
 * 1400px inside a 260px column pushes the whole page sideways.
 *
 * Real chrome would say `@media`; a demo that queried the window would be
 * lying about which width made it change.
 */
export function widths($stage, sizes = "1400px 900px 500px auto"){
	const $row = div.c("chrome-widths");

	$row.append(() => sizes.trim().split(/\s+/).forEach(w => {
		const $btn = button.c("chrome-btn", w).ac(w === "auto" && "on");

		$btn.click(() => {
			$stage.style("max-width", w === "auto" ? "" : w);
			$row.el.querySelectorAll(".chrome-btn").forEach(b => b.classList.toggle("on", b === $btn.el));
		});
	}));

	return $row;
}

/* ── ChromeShell: a viewport you can put on a page ────────────────────────
 *
 * A miniature App + Router, so a chrome pattern can be shown navigating
 * without navigating the site. It exists to make one claim checkable: chrome()
 * runs ONCE, in render(), and go() only ever touches $pages and the marking.
 *
 *   new ChromeShell({
 *       root: sample(),
 *       chrome(shell){ … built once … },
 *       navigated(shell){ … derived chrome, rebuilt per navigation … },
 *   });
 *
 * `navigated` is deliberately the name this section is asking Router for: a
 * crumb bar, a prev/next and a drawer that closes itself all need the same one
 * line, and today the framework has nowhere to put it.
 */
export class ChromeShell extends View {

	render(){
		this.builds = (this.builds ?? 0) + 1;
		this.navigations = 0;

		this.chrome?.(this);                      // the pattern under test

		// Chrome that nests — a bar above a row — needs pages inside what it
		// built, so it says where by assigning $region. The shell's own child
		// otherwise, which is the flat default, exactly like App.
		this.$pages = div.c("chrome-shell-pages");
		if (this.$region) this.$region.append(this.$pages);

		this.go(this.start ?? this.root.url);
	}

	/* Any anchor inside a miniature is miniature navigation. preventDefault()
	 * here beats the Router to it — Router.link_clicked() bails on
	 * `e.defaultPrevented` — so a fictional url never reaches the real thing.
	 * One handler on the shell, not one per link. */
	initialize(){
		super.initialize();

		this.click(e => {
			const link = e.target.closest?.("a[href]");
			if (!link || !this.el.contains(link)) return;
			e.preventDefault();
			this.go(new URL(link.href).pathname);
		});
	}

	// The walk, exactly as Router does it. Nothing is fetched — a sample tree is
	// built with add() — but the shape is the same, awaits and all.
	async go(url){
		let page = this.root;

		for (const name of url.split("/").filter(Boolean))
			page = await page.child(name);

		if (page) this.show(page);
	}

	show(page){
		this.page = page;
		this.navigations++;

		// $pages by name, never the ambient captor: go() is async, so by the time
		// this runs the captor is long gone.
		this.$pages.empty(() => {
			div.c("chrome-shell-url", page.url);
			div.c("chrome-shell-title", page.title);
			if (typeof page.content === "string") div.c("chrome-shell-body", page.content);

			// so every shell drills down as well as up, whatever chrome it is wearing
			if (page.children.size)
				div.c("chrome-shell-kids", () => page.children.forEach((_, name) =>
					a.c("chrome-step", child_label(page, name)).href(page.url + name + "/")));
		});

		this.mark();
		this.navigated?.(this);
		return this;
	}

	/* Router.mark_links() in miniature — with its two classes renamed.
	 *
	 * It cannot use `.active` / `.in-path`: the real pass runs over every anchor
	 * in $app on every navigation and REMOVES those classes where they don't
	 * match, so a miniature that borrowed them would be silently wiped the next
	 * time you clicked anything. Same rule for any widget with link state.
	 */
	mark(){
		const here = this.page.url;

		this.el.querySelectorAll("a[href]").forEach(link => {
			link.classList.toggle("chrome-active", link.pathname === here);
			link.classList.toggle("chrome-in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		});
	}
}

/* ── the sample tree ──────────────────────────────────────────────────────
 *
 * Not this site's: fictional urls, so nothing here can be confused with a route
 * that exists, and a six-deep branch for the patterns that only break at depth.
 * Built entirely with add(), so child() resolves from memory and no shell ever
 * touches the network.
 */
export function sample(){
	// `labels` is the same inert data a real parent declares: "api" prettifies to
	// "Api", which is the failure mode the declaration exists for.
	const root = new Page({
		url: "/", title: "Home", content: "The sample tree's root.",
		labels: { api: "API" },
	});

	const guide = root.add("guide", { title: "Guide", content: "Three pages, then a long tail." });
	guide.add("install", { title: "Install", content: "Sibling one." });
	const config = guide.add("config", { title: "Config", content: "Sibling two." });
	guide.add("deploy", { title: "Deploy", content: "Sibling three." });

	config.add("env", { title: "Environment" })
		.add("secrets", { title: "Secrets" })
		.add("rotation", { title: "Rotation", content: "Depth 6: /guide/config/env/secrets/rotation/" });

	const api = root.add("api", { title: "API", content: "A second section, three siblings." });
	api.add("view", { title: "View", content: "…" });
	api.add("page", { title: "Page", content: "…" });
	api.add("router", { title: "Router", content: "…" });

	root.add("changelog", { title: "Changelog", content: "A leaf at the top level." });

	return root;
}
