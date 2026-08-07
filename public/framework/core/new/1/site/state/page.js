import { Page, View, p } from "/app.js";
import { code, section } from "../ui.js";

View.stylesheet(import.meta, "state.css");

export default new Page({
	meta: import.meta,
	title: "State",

	children: "stores accident shared stale scroll",

	content(){
		code(`
Must a reload reproduce it?             → the url. Nothing else survives one.
Must someone else see it?               → the url. It is the only shareable one.
Did the user type or scroll it?         → nothing. You already have it, for free.
Is it this page's, for this session?    → the Page instance.
Do many pages from ONE module share it? → module scope.
Do two unrelated pages share it?        → a module they both import.
Must it NOT survive?                    → deactivate(). Nothing else clears.`,
			"the decision procedure — the whole section in seven lines");

		p("There are six places state can live in this framework and no document said which to reach for. Four of them have identical lifetimes, so survival is not the thing that tells them apart — scope is.");

		section("What each one survives");

		code(`
                       soft nav   Back   reload   new tab   shareable
the url                   ✓        ✓       ✓        ✓          ✓
the memoized view         ✓        ✓       ✗        ✗          ✗
the Page instance         ✓        ✓       ✗        ✗          ✗
module scope              ✓        ✓       ✗        ✗          ✗
sessionStorage            ✓        ✓       ✓        ✗          ✗
localStorage              ✓        ✓       ✓        ✓          ✗`,
			"measured · /state/stores/ runs this table live");

		p("Rows two, three and four are identical. That is the finding: picking between them is never a question about lifetime, and anyone reasoning from \"how long does it last\" will pick at random.").ac("note");

		section("So pick on scope");

		code(`
the memoized view    ONE page's DOM      you get it whether you asked or not
the Page instance    ONE page            everything else about that page
module scope         ONE MODULE          = one page, EXCEPT under route(),
                                           where one module makes many pages`);

		p("That exception is the only thing separating module scope from the Page instance here. Measured: `/dynamic/42/` and `/dynamic/7/` are two distinct Page instances built by one module, so a `let` in that file is shared by both and a property on `this` is not.").ac("note");

		section("The url is not a general-purpose store");

		code(`
it holds        path segments. Strings, in a hierarchy.
it does not     hold a query string — Router drops link.search on every click
                (measured in /async/stream/; the fix is two lines and deferred)`);

		p("So the one store that survives a reload is also the one that can only hold a tree of names. Everything that is not tree-shaped is therefore session-only by default, and that is a real constraint rather than an oversight.").ac("note");

		section("The five investigations");

		this.previews();

		section("Where this came from");

		p("The async seat's territory is content that arrives late. This is the same question one turn later: once it has arrived, where does it live, and what happens to it when you leave. Start with `accident` — it is the store nobody chose.").ac("note");
	}
});
