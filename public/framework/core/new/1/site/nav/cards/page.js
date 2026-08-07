import { Page, p, a } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "preview()",

	// two lazy children, so the cards below have something to be honest about
	children: "one two",

	initialize(){
		this.add("inline", () => {
			p("I am inline, so I was in memory before the cards were drawn — my card said my title.");
			a.c("page-link", "← preview()").href("/nav/cards/");
		});
	},

	content(){
		source(import.meta);

		p("Three ways a page renders itself as a link. `link(text?)` is one anchor with your words, `preview()` is one card with the page's title, and `previews()` is one card per child.");

		section("The cards");

		this.previews();

		p("Two of those read `one` and `two` — lowercase, the declared names. The third reads a title. The difference is only whether the page is in memory.").ac("note");

		section("Why, and what it costs");

		p("`previews()` is synchronous and must stay that way. Awaiting `child()` here would import every declared child just to read its title, which is the whole thing laziness exists to avoid — measured, the async version fetched all four child modules on a cold load of the root.").ac("note");

		p("So an unresolved child is drawn from what a name already tells us: the segment, and the url it must have. The card says `one` until the page is loaded, and then says `One`. That is the honest cost, and it is visible rather than hidden behind a spinner.").ac("note");

		section("See it flip");

		p("Load `/nav/cards/one/` directly, then come back with the link on that page. The card reads its title, because the page was in memory the first time this one rendered.").ac("note");

		a.c("page-link", "/nav/cards/one/").href("/nav/cards/one/");

		section("Next");

		a.c("page-link", "chain  →").href("/nav/chain/");
	}
});
