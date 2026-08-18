import { Page, demo, div, span, icon, toc } from "/app.js";
import { site } from "../web.js";

/* The Figma's own category names, verbatim and left long on purpose: the strip's real
   overflow (ext/tabs, no edge fade as of tonight) needs something to bite on. */
const CATEGORIES = ["Simple Elements", "Single-Col Widgets", "Multi-Col Sections", "Full Layouts", "SaaS Dashboards"];

export default new Page(demo.layout({
	meta: import.meta,
	title: "Tabbed Toc",
	description: "A category strip over a scanned table of contents — the real `ext/tabs` CSS, the real `toc()` scan, one row.",
	icon: "toc",
	group: "Pages",

	twin: true,
	parts: "header tabs toc footer",

	/* Real-width verification only, same seam `styles/sections/` still uses (layouts/doc/full-view.md).
	   No `full.js` wrapper: `layout()` already IS the one `.page`, and full.js's own doc says
	   "never nest a second one" — so this route hands `this.view` the div directly. */
	route(name){
		if (name !== "full") return false;
		const layout = () => this.layout();
		return { title: this.title + " — full", render(){ return this.view ??= layout(); } };
	},

	note: "**Both halves already existed.** The strip below is `ext/tabs`'s own `.tabs .tab-bar .tab` "
		+ "— `this.tabs()` itself can't run here: it mutates the Page it's called on, and this frame "
		+ "draws three times over (the wall's own thumbnail, then twice for the twin's two live "
		+ "widths), so the bar is the real stylesheet, wired by hand instead. The rail **is** the "
		+ "real `toc()` — it scans the `h2`s beside it and marks the current one itself, same call as "
		+ "[toc](/framework/ext/toc/)'s own page. `flex wrap` is the whole responsive story, the same "
		+ "move as [hero](/framework/styles/layouts/hero/).",

	layout(){

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			if (this.shows("tabs"))
				div.c("tabs", () => div.c("tab-bar", () =>
					CATEGORIES.forEach((label, i) => div.c("tab").ac(i === 0 && "active").text(label))));

			div.c("flex gap wrap flex-1 pad", () => {

				div.c("flow", () => site.sections(5))
					.style({ flex: "1 1 24em", minWidth: "0" });

				if (this.shows("toc"))
					toc().style({
						display: "block", flex: "0 0 14em", minWidth: "0",
						position: "sticky", top: "1em", alignSelf: "flex-start",
					});

			}).style({ "--pad": "1.5em clamp(1em, 3%, 3.5em)", "--gap": "2.5em", minHeight: "0", overflowY: "auto" });

			if (this.shows("footer"))
				div.c("flex split v-center pad wash", () => {
					div.c("flex gap v-center muted", () => { icon("chevron_left"); span("Previous"); });
					div.c("flex gap v-center muted", () => { span("Next: " + CATEGORIES[1]); icon("chevron_right"); });
				});
		});
	},
}));
