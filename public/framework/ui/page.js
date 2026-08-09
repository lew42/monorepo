import { Page, md, code } from "/app.js";
import cell, { wall } from "../styles/gallery/gallery.js";
import { renders } from "./renders.js";

const SCALE = { "--column": "18em", "--gap": "1.25em", "--thumb-min": "3.5em", "--thumb-max": "15em" };
const STAGE = "zoom-75 pad";

export default new Page({
	meta: import.meta,
	title: "UI",
	description: "Nineteen components — sixteen functions on one namespace, three copy-paste templates.",
	icon: "widgets",
	classes: "grid",

	children: "table field crumbs pagination card stats badge alert toolbar tags panel tooltip avatar dialog progress menu accordion timeline kbd",

	/* No toc(): the wall renders REAL components and `toc()` collects `h2, h3, .h2,
	   .h3` outside its skip list, so the rail read "View · 3 · 0 · 16" above the real
	   headings. A wrong rail is worse than none. */
	content(){

		// Placed synchronously, redrawn when the nineteen pages land — so the labels
		// sharpen from names to titles and the icons arrive. Same shape as previews().
		wall($gallery => {
			this.cells();

			this.loading?.then(() => {
				$gallery.empty(() => this.cells());
				this.app?.router?.mark_links();
			});
		}).style(SCALE);

		code.js(`import { ui } from "/app.js";

ui.card(() => { h3("View"); p("A DOM element with a chainable API."); });
ui.badge.c("accent", "live");`);

		md("Every cell above is a **live call**, and all sixteen are in `renders.js` beside this file — the whole API on one screen.");

		md("## Sixteen functions, three templates");

		md("`field`, `toolbar` and `progress` are not on the wall and not in `ui`, on purpose: each is four elements and three utility classes, and **encapsulating markup that trivial only makes it harder to change.** Their pages hand you the code with a copy button instead — [Form field](/framework/ui/field/), [Toolbar](/framework/ui/toolbar/), [Progress](/framework/ui/progress/).");

		md("The bar for exporting a function is **logic a user shouldn't have to carry**: a loop over rows, a listener, a group name that has to be unique, a trap that costs an afternoon. Everything else is markup, and markup is better handed over than hidden. [Accordion](/framework/ui/accordion/) is the clearest case of the line — three lines of markup, and a function anyway.");

		this.previews();

		md("## The CSS");

		md("Each component's CSS is a template string in its own `.js`, injected by `css()` — which writes `@layer base, theme, site, util;` for you, because a short layer list silently drops `site` past `util`. Nothing is styled inline except `--gap`, `--column` and `--avatar`, which are knobs rather than declarations. **No component relies on a theme**: every value is a framework token, so one renders unthemed.");

		md("Start at [Data table](/framework/ui/table/) — one declaration of CSS, and it is a bug report.");

		md.details(import.meta, "readme.md", "Design record — the encapsulation rule, and where the CSS lives");
	},

	// One cell per exported component. `nav_for()` supplies the label, icon and
	// url, so this wall and the sidebar cannot disagree.
	cells(){
		Object.keys(renders).forEach(name => cell(this.nav_for(name), renders[name], STAGE));
	},
});
