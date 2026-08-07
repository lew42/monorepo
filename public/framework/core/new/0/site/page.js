import { Page, p } from "/app.js";
import { code, section, buttons } from "./ui.js";
import about from "./about/page.js";
import docs from "./docs/page.js";
import focus from "./focus/page.js";

export default new Page({
	meta: import.meta,
	title: "new/0",
	children: [about, docs, focus],

	content(){
		code(`
App    boot, the ONE flat container, url -> page, and the marking    90 lines
Page   a node: url, content, children, and how it mounts itself      59`,
			"the whole framework — there is no third class");

		p("No Router. `App` walks `location.pathname` through the imported tree and calls `page.activate()`. Everything you can see below that is CSS.");

		section("The model");

		code(`
import intro from "./intro/page.js";           // children are DIRECT IMPORTS

export default new Page({
    meta: import.meta,
    title: "Docs",
    mode: "columns",                            // the whole UI, as data
    children: [intro],
    content(){ p("…"); }
});`, "a whole page.js");

		p("Because a child is imported, it already exists when its parent constructs — so `.parent` is plain assignment and `child(name)` is an array lookup. Nothing is lazy and nothing is declared-but-unloaded.");

		section("One container, three modes");

		code(`
$pages
  .page.page-docs.active-ancestor     order: 1
  .page.page-intro.active-page        order: 2`, "every page, every depth, one parent");

		p("A page's view is a direct child of `app.$pages` no matter how deep its url is. That's what makes **columns** four CSS rules instead of an arranger: the chain is already a row of siblings.").ac("note");

		section("Pick one");

		this.previews();

		section("…or activate one directly");

		p("`page.activate()` is the verb. With no Router nothing intercepts a click, so these buttons call it themselves — watch the mode change with no reload:");

		buttons(["About", about], ["Docs", docs], ["Focus", focus]);
	}
});
