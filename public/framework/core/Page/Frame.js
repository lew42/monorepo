import { View, div, p, span, a, icon, details, summary, is } from "../View/View.js";

// History and reasons: doc/Frame-notes.md
const SWAPS = ["rail", "rail-right"]; // do NOT add "tabs" — see notes

export default class PageFrame extends View {

	render(){
		const page = this.page;

		if (page.arrangement === "bar-top") this.bar("top");

		div.c("page-frame-body", () => {
			if (page.navigation === "rail") this.rail("left");
			if (page.arrangement === "rail-left") this.panel("left");

			div.c("page-frame-mid", () => {
				// Page with own content AND tabs: content becomes first tab, child replaces it.
				if (page.navigation === "tabs" && page.has_content()) return void this.tabs({ home: () => this.box() });
				if (page.navigation === "tabs") this.tabs();
				this.box();
			});

			if (page.navigation === "rail-right") this.rail("right");
			if (page.arrangement === "rail-right") this.panel("right");
			if (page.arrangement === "main-aside") this.aside();
		});

		if (page.arrangement === "bar-bottom") this.bar("bottom");
	}

	// ⚠ ONE WORD, ONE CLASS, ONE ELEMENT on the page (see notes).
	box(){
		return this.$box = div.c("page-canvas")
			.ac(this.page.surface && "page-surface-" + this.page.surface)
			.append(() => this.reserve());
	}

	// ⚠ Box height reserved; use visibility not display: none (see notes).
	reserve(){
		const page = this.page;

		if (!SWAPS.includes(page.navigation)) return this.content();

		return div.c("page-nav-reserve", () => {
			div.c("page-slot page-frame-own").append(() => this.content());

			// ONE panel for all children (same shape ext/tabs uses).
			const $panel = div.c("page-slot page-frame-panel");
			page.children.forEach((child, name) => this.regions().set(name, $panel));
		});
	}

	content(){
		const page = this.page;

		if (page.navigation === "expand") this.expander();

		return page.render_content();
	}

	// ── the child list ──────

	// Delegates to ext/tabs (never a second implementation).
	tabs(options){
		if (is.fn(this.page.tabs)) return this.page.tabs(undefined, options);
		return p.c("muted", 'navigation: "tabs" needs `import "/framework/ext/tabs/tabs.js"`.');
	}

	// ⚠ RAIL (nav) ≠ PANEL (arrangement); see notes.
	rail(side){
		return div.c("page-rail page-rail-" + side, () => {
			span.c("page-eyebrow", "pages");
			this.rows();
		});
	}

	// One drawing: rows in rail and expand.
	rows(){
		const page = this.page;

		return div.c("page-rows", () => {
			if (!page.children.size) return void p.c("muted page-no-pages", "No pages under this one yet.");

			page.children.forEach((child, name) => {
				const nav = page.nav_for(name);

				a.c("page-row").href(nav.url).append(() => {
					if (nav.icon) icon(nav.icon);
					span.c("page-row-words", nav.label);
				});
			});
		});
	}

	// `expand`: browser's <details> gesture; no address change; row IS the region.
	expander(){
		const page = this.page;

		return div.c("page-expand", () => {
			if (!page.children.size) return void p.c("muted page-no-pages", "No pages under this one yet.");

			page.children.forEach((child, name) => {
				const nav = page.nav_for(name);

				details.c("page-expand-item", () => {
					summary.c("page-expand-head", () => {
						if (nav.icon) icon(nav.icon);
						span(nav.label);
					});

					this.region(name, div.c("page-expand-body"));
				});
			});
		});
	}

	// Core ships boxes, not furniture; arrangement words open regions by key name.
	bar(where){ return this.region("bar", div.c("page-bar page-bar-" + where)); }

	panel(side){ return this.region("panel", div.c("page-panel page-panel-" + side)); }

	aside(){ return this.region("aside", div.c("page-aside")); }

	// Renders child as `default` so routed children mount here; app is shared.
	region(name, $view){
		const page = this.page;
		this.regions().set(name, $view);

		const child = page.children.get(name)?.assign({ app: page.app });
		if (child) $view.append(() => { child.render().ac("default"); });

		return $view;
	}

	regions(){ return this.page.regions ??= new Map(); }
}
