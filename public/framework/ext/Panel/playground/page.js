import { Page, View, div, a, span, button, icon, Sidebar } from "/app.js";
import Workspace from "../Workspace/Workspace.js";
import { list, open, create } from "../Workspace/documents.js";
import { dock } from "../tools.js";

View.stylesheet(import.meta, "playground.css");

/* The whole-window Workspace: a left rail (the framework sidebar's own logo + brand
   as the way OUT — no ✕), the document list, `+`; the Workspace itself with its bar
   in the middle; `ext/drawer` docked on the right, its own `ext/grip` IS the `fill`
   viewport's responsive handle — zero code for that part (Workspace/design §3, §6).

   The url carries the document: `route(name)` claims ANY segment instead of 404ing
   (the day page's own pattern, `ai/2026-08-18/page.js`) so `/playground/untitled/`
   resolves to the SAME shell, opened on `untitled`; the root page answers `default`
   the same way, just without a segment. Record: readme.md, doc/decisions.md.
   css: playground.css. */

// Composes `core/Sidebar` — brand, logo, narrow-screen toggle all its own; only
// `menu()` is replaced, with the document list standing in for a page nav. No
// `footer`: an account avatar and a second dark-mode toggle have no home in a tool
// this narrow-purposed, and `menu()` never calls it.
// ⚠ Not `Rail`: View classifies a view by its whole constructor chain, so `Rail` would
// wear `.rail` — Page.css's side-REGION shape (sticky, `align-self: start`, a 22em cap,
// and `:has(> .rail)` turns the row into a size container). The owner saw it as a
// sidebar stopping 129px down. `playground-rail` collides with nothing.
class PlaygroundRail extends Sidebar {
	menu(){
		this.$menu = div.c("sidebar-menu", () => this.documents());

		/* A document deleted from the rail's own block (properties.js announces it): every
		   shell's list redraws — the Router keeps each visited shell alive, and a stale list
		   would come back with it — and the shell standing on the deleted one goes home. */
		document.addEventListener("document-removed", e => {
			this.$menu.empty(() => this.documents());
			if (this.el.isConnected && this.open === e.detail) this.app.router.go(this.base);
		});

		return this.$menu;
	}

	documents(){
		const $nav = div.c("sidebar-nav");

		list().then(names => $nav.empty(() => {
			names.forEach(name => this.entry(name));

			button.c("sidebar-link panel-playground-new")
				.click(() => this.add())
				.append(() => { icon("add"); span.c("sidebar-label", "New"); });
		}));

		return $nav;
	}

	entry(name){
		return a.c("sidebar-link")
			.ac(name === this.open && "active")
			.href(this.base + name + "/")
			.append(() => span.c("sidebar-label", name));
	}

	// Mints a blank document and hands off to the Router — `documents.js` never
	// touches history, and a raw `location.href` would reload the whole app.
	async add(){
		const name = await create();
		this.app.router.go(this.base + name + "/");
	}
}

function build(page, name){
	return div.c("page layout-full panel-playground-page", () => {
		div.c("panel-playground flex", () => {
			new PlaygroundRail({
				brand: "Framework", brand_url: "/framework/", footer: null,
				app: page.app, base: page.url, open: name,
			}).ac("basis").style("--basis", "var(--sidebar)");

			div.c("panel-playground-main flex-1", () => {
				dock();
				new Workspace({ saver: open(name), flow: true, height: "100%" });
			});
		});
	});
}

// The shape `route(name)` hands to `add()` — same builder as the root page, just a
// different document name closed over. `full.js` is the model: `render()`, never
// `content()`, so there is nothing above the layout (no h1, no `.page.flow`).
function shell(page, name){
	return {
		title: page.title,
		render(){ return this.view ??= build(page, name); },
	};
}

export default new Page({
	meta: import.meta,
	title: "Playground",
	description: "The whole-window Workspace — a document, its viewport set, and the drawer as the responsive handle.",
	icon: "space_dashboard",

	// Undeclared names only (`child()` guards it) — a real child would still win.
	route(name){
		return !name.includes(".") && shell(this, name);
	},

	render(){
		return this.view ??= build(this, "default");
	},
});
