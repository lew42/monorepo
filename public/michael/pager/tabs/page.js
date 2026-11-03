import { Page, md, p, pre, div, button, h3 } from "/app.js";
import { Pager } from "../legacy/Pager.js";

export default new Page({
	meta: import.meta,
	title: "Tabs",
	description: "A Pager is a tab panel.",
	content(){

		md("> **This class is history.** `Pager`, `TabPager` and `ColumnPager` left core, and the framework tree no longer ships them — an arrangement is a CSS class a page opts into, see [Page](/framework/core/Page/). The demo below still runs: `Pager` is vendored beside these pages, in `michael/pager/legacy/`.");

		p("Because a Pager just swaps pages, a tab strip is a Pager plus buttons that call `show()`. No URLs involved — this is in-app view switching, not routing (that's what keeps it decoupled from the Router).");

		h3("Live");

		const tabs = {
			Overview: new Page({ title: "Overview", content(){ p("The overview tab — a whole Page."); } }),
			Details:  new Page({ title: "Details",  content(){ p("Details tab. Switching tabs is just `panel.show(page)`."); } }),
			Settings: new Page({ title: "Settings", content(){ p("Settings tab. Zero routing, zero history."); } }),
		};

		let panel;
		div.c("flex gap", () => {
			Object.entries(tabs).forEach(([name, pg]) =>
				button.c("btn", name).click(() => panel.show(pg)));
		});
		panel = new Pager().ac("card");
		panel.show(Object.values(tabs)[0]);

		pre(`let panel = new Pager();
button.c("btn", "Overview").click(() => panel.show(overview));
button.c("btn", "Details").click(()  => panel.show(details));
panel.show(overview);   // initial`);
	}
});
