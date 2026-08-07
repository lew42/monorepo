import { Page, p, div, a } from "/app.js";
import { section } from "../../ui.js";
import { this_file, when, cost } from "../recipe.js";

export default new Page({
	meta: import.meta,
	title: "Tabs in a column",

	initialize(){
		/* The FIRST tab, and it owns a child of its own — a lazy, file-backed one.
		 * There is no what/page.js on disk: `what` is inline, and the only file
		 * under it is what/deeper/page.js. The url tree and the file tree are not
		 * the same tree, and nothing had to be told so. */
		this.add("what", {
			title: "What you're looking at",
			children: "deeper",

			content(){
				p("A tab set lives inside column 1. Drilling opens column 2 — and this tab stays selected while it's open, because `deeper` is MY child rather than my sibling.");
				a.c("page-link", "open deeper →").href(this.url + "deeper/");
			}
		});

		this.add("why", {
			title: "Why it composes",
			content(){
				p("`container()` asks two questions in order. `deeper`'s parent is `what`, and `what` claimed no region — so the walk goes one more level up, finds this page's `$pages`, and `deeper` lands as an equal column beside it.");
				p("The tab panel and the column grid are different elements answering different questions. Neither knows the other exists.").ac("note");
			}
		});

		this.add("limits", {
			title: "Where it stops",
			content(){
				p("Drill from any tab but the first and two things go wrong: the bar highlights the first tab (nothing is exactly `.active`, so the fallback fires), and the first tab's panel renders beside the page you opened.");
				a.c("page-link", "drilling-tabs fixes both →").href("/compound/drilling-tabs/");
			}
		});
	},

	content(){
		// My region, and my own content goes in it first — so I am column 1
		// rather than a header above the columns.
		this.$pages = div.c("pages cols", () => {
			div.c("col", () => {

				when("a section has two or three alternate views AND sub-pages you can drill into — a docs page with Guide / API / Examples that still has children.");

				this.$tabs = this.tabs("what why limits");

				section("The file");

				this_file(import.meta);

				cost("only the FIRST tab drills for free. Its href is the group url, so the `.default` panel rule and the first-tab highlight fallback both happen to be right. Any other tab needs the three corrections in `drilling-tabs`.");
			});
		});
	}
});
