import { Page, View, p, div, table, thead, tbody, tr, th, td } from "/app.js";
import { section, file, code } from "../ui.js";

View.stylesheet(import.meta, "arrangements.css");

// same three lines on every demo child — where you are, a way down, a way back
function level(page){
	div.c("motion-level", () => {
		page.children.forEach(child => child && child.link("↓ " + child.title));
		page.parent.link("↑ " + page.parent.title);
	});
}

export default new Page({
	meta: import.meta,
	title: "Motion per arrangement",
	classes: "motion",

	initialize(){
		this.add("first", {
			title: "First column",
			classes: "motion motion-col",
			content(){ level(this); p("A column slides in from the right. The column beside me did not move, and did not resize."); },

			initialize(){
				this.add("second", {
					title: "Second column",
					classes: "motion motion-col",
					content(){ level(this); p("Two columns, one grid, one `@starting-style` rule."); },
				});
			},
		});

		this.add("one", { title: "Tab one", classes: "motion motion-tab", content(){ p("A tab drops in from above — a smaller move, because a tab switch is a smaller idea than a drill-down."); } });
		this.add("two", { title: "Tab two", classes: "motion motion-tab", content(){ p("Same rule, same file, different panel."); } });

		this.add("cover", {
			title: "Covering the window",
			classes: "motion motion-cover full",
			content(){ level(this); p("Scales up over the site and fades back down on the way out. `.full` is already `position: fixed`, so its exit costs nothing — once the positioning stops being keyed on `.active-page`."); },
		});
	},

	content(){
		code.js(`
classes: "motion motion-col"      // a column that slides in
classes: "motion motion-tab"      // a tab that drops in
classes: "motion motion-cover"    // a full page that scales up`);

		p("Three inert class strings. Nothing in `Page`, `Router` or `App` reads any of them — which is the same deal `.cols` and `.full` already have, and the reason motion needs no new page property.").ac("note motion-verdict");

		section("Tabs");

		this.$tabs = this.tabs("one two").ac("motion-tabs");

		section("Columns");

		div.c("motion-level", () => this.first.link("↓ First column"));

		this.$pages = div.c("pages cols motion-cols");

		section("Full");

		div.c("motion-level", () => this.cover.link("↗ Cover the window"));

		file(import.meta, "arrangements.css");

		section("What each arrangement costs");

		table.c("motion-table", () => {
			thead(tr(th("arrangement"), th("entry"), th("exit"), th("why")));
			tbody(() => {
				tr(td("replace"), td("free"), td("one line"), td("the leaver is still in the flex row; .pages needs position: relative"));
				tr(td("columns"), td("free"), td("don't"), td("a leaving grid item takes a third track and resizes the rest"));
				tr(td("tabs"), td("free"), td("one line"), td("a block panel stacks the leaver above the arriver"));
				tr(td("full"), td("free"), td("one word"), td("already position: fixed — but only while it is .active-page"));
			});
		});

		p("Entry motion is free in every arrangement, everywhere, with no framework change. Exit motion costs between nothing and one line, and the amount depends entirely on how that arrangement removes a page from layout.").ac("note");

		section("The one-word diff");

		code.css(`
/* site/styles.css today — the positioning is keyed on being the leaf */
.page.full.active-page,
.page.full.active-ancestor { position: fixed; inset: 0; z-index: 10; … }

/* the moment it stops being the leaf it stops being fixed, drops back into
   whatever grid it nominally lives in, and fades out from THERE */

.page.full { position: fixed; inset: 0; z-index: 10; … }

/* a .full page that is display: none is not rendered, so the qualifiers buy
   nothing today — and cost the exit animation everything */`);

		section("Next");

		p("`/motion/release/` — the page that leaves is not always finished.").ac("note");
	},
});
