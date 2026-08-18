import { Page, View, div, h1 } from "/app.js";

/* css: .layouts — the page's own gutter. The rail and the wall are ext/catalog's
   browse(), and its stylesheet is browse.css. */
View.stylesheet(import.meta, "layouts.css");

/* Record: readme.md. ⚠ Declared, not derived from each child's `group:`, which two of
   these cannot express: Words is grandchildren (see browse.js's entry()), and
   `space/` belongs to another effort. */
const BANDS = {
	Words:     "flex/gap flex/v flex/split flex/basis flex/auto grid/auto",
	Pages:     "document docs landing hero home pricing stack toc-studio apidoc bold-editorial",
	Apps:      "shell dashboard split overlay gallery sidebar masonry feed carousel mail chat",
	Reference: "model fit flex grid 400 space wire anatomy set screens spec",
};

const paths = Object.values(BANDS).flatMap(band => band.split(" "));

export default new Page({
	meta: import.meta,
	title: "Layouts",
	description: "Every whole-page layout, the class strings they are built from, and the pages that explain both — one filterable wall.",
	icon: "dashboard_customize",

	children: paths.filter(path => !path.includes("/")).join(" "),

	/* ⚠ Page.render() emits the h1 OUTSIDE content(), so this replaces the view rather
	   than patching it, the way Doc.render() does, and content() draws the title itself.
	   ⚠ A bare `page` now — no `full`, and no wrapper. `full` zeroed the gutter and a
	     `flex v gap pad` wrapper put it back, which meant the browse row underneath was
	     a child of the WRAPPER and so sat in the page's `main` track: measured
	     2026-08-17, the rail-beside-wall row got 684px of a 3440 screen at every width,
	     and its container query read 684 and drew a mobile strip on an ultrawide. The
	     shell's own grid pays the inset, and `.browse` claims `wide` (browse.css).
	   ⚠ No `fill`/`solo`: that is a region height plus scrolling, which this page does
	     not need — the region scrolls and the rail sticks. */
	render(){
		return this.view ??= div.c("page", () => this.content())
			.ac(this.name && "page-" + this.name);
	},

	/* ⚠ `--column: 22em`. A thumb is the page at `zoom-25`, so the card's width times
	   FOUR is the width the layout lays out at — 22em lands it on ~1450px, a real
	   desktop. A narrower card would show every layout in its tablet form. */
	content(){
		h1.c("h3", this.title);
		this.browse(BANDS, { "--column": "22em", "--gap": "2em", "--stage-max": "14em" });
	},

	/* The layouts nav, as plain entries — handed to whichever layout draws one, so a
	   thumbnail's rail is the same rail. Adoption, not an import: a child reaches UP
	   through `this.parent`, and a mutual import here would break deep reloads only. */
	rail(){
		return [...this.children]
			.filter(([, page]) => page?.layout)
			.map(([name]) => this.nav_for(name));
	},
});
