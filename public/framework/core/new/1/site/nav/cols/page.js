import { Page, p, a, div } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../ui.js";

const back = () => a.c("page-link", "← cols").href("/nav/cols/");

export default new Page({
	meta: import.meta,
	title: "Columns",

	initialize(){
		this.add("one", () => {
			p("Track 2. I declare nothing — no layout, no parent, no column. `container()` walked up, found the nearest `$pages`, and that div happens to be a grid.");
			a.c("page-link", "two  →").href("/nav/cols/two/");
			back();
		});

		this.add("two", () => {
			p("Track 2 again, not track 3 — `one` and I are siblings, so only one of us is ever in the chain. Depth makes tracks; breadth does not.");
			a.c("page-link", "← one").href("/nav/cols/one/");
			back();
		});
	},

	content(){
		// My region, and the entire arrangement. One utility class on a div.
		this.$pages = div.c("pages cols", () => {
			div.c("col", () => {
				source(import.meta);

				p("`this.$pages = div.c(\"pages cols\")` — that is columns. There is no mode property, nothing resolves one, and no JS runs on navigation.");

				section("Open one");

				this.previews();

				p("My own content is inside a `.col` in my own region, so I am track 1 rather than a header above the tracks. That is a choice this file makes, visibly.").ac("note");

				p("`grid-auto-flow: column` grows one track per visible page, so the count follows the url — nothing declares a column count.").ac("note");

				section("Next");

				a.c("page-link", "tabs  →").href("/nav/tabs/");
			});
		});
	}
});
