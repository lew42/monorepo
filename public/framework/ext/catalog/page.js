import { Page, md, code, demo, p } from "/app.js";
import { web } from "/framework/ext/demo/web.js";

export default new Page({
	meta: import.meta,
	title: "Catalog",
	description: "previews() as a persistent rail beside the region the children mount in.",
	icon: "view_sidebar",

	content(){

		code.js(`export default new Page({
    meta: import.meta,
    title: "Web",
    children: "html css js http",
    initialize(){ this.catalog(); },
    content(){ p("Nine topics, one rail."); },
});`);

		demo.stage(() => demo.app(web({
			initialize(){ this.catalog(); },
			content(){ p("Nine topics, one rail."); },
		})).style("height", "24em")).ac("wide");

		md("One line. The rail is `previews()` unchanged — the same cards a wall draws, live thumbs and all — turned into a sticky column, and the region beside it is a `$pages` the children mount into. **Click a card**: the child renders on the right and the rail never moves.");

		md("**The page's own `content()` becomes the rail's first card.** That is why the call sits in `initialize()` rather than in `content()`: the intro is a real child at a real url, so it gets a card, a deep link and the marking every other entry has. The region is never blank — the intro renders from the start wearing `default`, the tab panel's contract, and steps aside the moment a real navigation lands. A rail of one hides itself, and below `64em` the column turns back into a strip above the detail.");

		md("The [Page overview](/framework/core/Page/) is a catalog — its demos are the rail — and so is every classdoc Overview tab. The [same arrangement built by hand](/framework/core/Page/overview/catalog/) is five lines of `flex gap basis flex-1`; `catalog()` is those five lines plus the default-fill and marking a permanent page deserves.");

		md("Next: [Layout](/framework/ext/Layout/) — the toolbar that pushes arrangements around.");

		md.details(import.meta, "readme.md", "Design record — why a method, and what it must not grow");
	},
});
