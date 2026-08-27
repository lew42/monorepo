import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Width",
	group: "The box",
	description: "small, default, large, full — a page's own word for its column track.",

	content(){
		md("In a [columns](/framework/core/Page/overview/columns/) tree a page carries **its own width**, as one word on the page itself:");

		md("```js\nexport default new Page({ title: \"Guides\", width: \"small\", … });\n```");

		md("- **`small`** — a fixed 14em track: rails, lists, item pickers, an index.\n"
			+ "- **(none)** — the default: a 16em floor and a 40em ceiling. Prose, a form, two columns of content.\n"
			+ "- **`large`** — 28–64em: a grid, a table, wide content.\n"
			+ "- **`full`** — the whole host. The ancestors collapse into the crumb strip and come back the moment you navigate anywhere else.");

		md("`column()` stamps the word as `.page-column-<width>` and Page.css turns that into a track, so every value is a token: a page that needs a fifth width retunes `--page-column-max` instead of asking for one.");

		md("**Measured at four viewports**, and what `full` costs you: [`doc/columns.md`](/framework/core/Page/doc/columns/). **Live:** [the Finder](/framework/core/Page/overview/columns/finder/).");
	},
});
