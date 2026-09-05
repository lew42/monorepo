import { md, div, a, span } from "/app.js";
import { Paging } from "../../paging.js";

/* ⚠ `route()`, NOT `children:` — a DECLARED child is loaded eagerly and a directory
   with no `page.js` 404s in the console of every page under /imagine/paging/.
   `route()` is asked only for a name somebody navigated to. (The realm's own
   doc/page.js learned this first.) */

const RECORDS = {
	measurements: ["The measurements", "Every gesture, the element watched, the before and after boxes at 1280 and 3440, and the runner that produced them."],
};

export default new Paging({
	meta: import.meta,
	title: "Docs",
	description: "How every number on the Navigation page was taken.",
	icon: "straighten",

	route(name){
		const record = RECORDS[name];
		if (!record) return null;

		const meta = this.meta;

		// ⚠ A `Paging`, not a plain object. `add()` wraps a plain object in a core
		//   `Page`, whose `column_host()` finds /imagine/ and renders it as a COLUMN
		//   inside the realm's middle — `display: contents`, so the record vanishes.
		return new Paging({
			title: record[0],
			description: record[1],
			content(){ return md.file(meta, name + ".md", { h1: false }); },
		});
	},

	content(){
		md("**Every number on [Navigation](/imagine/paging/navigation/) came from driving the real page in a headless browser** and reading one element's rectangle before and after the click. This is the record of which element, and what it read.");

		div.c("page-previews", () => Object.entries(RECORDS).forEach(([name, [title, says]]) => {
			a.c("page-preview").href(this.url + name + "/").append(() => {
				span.c("page-preview-title", title);
				div.c("page-preview-desc", says);
			});
		})).style("--column", "18em");
	},
});
