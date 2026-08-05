import { Page, md, p, pre, div, button, h3 } from "/app.js";
// Pager left core — /app.js stopped exporting it. Imported from where it
// actually lives so this page keeps demonstrating the real class.
import { Pager } from "/framework/core/legacy/Pager/Pager.js";

export default new Page({
	meta: import.meta,
	title: "Tabs",
	description: "A Pager is a tab panel.",
	content(){

		md("> **This class has left core.** `Pager`, `TabPager` and `ColumnPager` now live in `framework/core/legacy/` and `/app.js` no longer exports them. An arrangement is a CSS class a page opts into — see [Page](/framework/core/Page/). The examples below still run, against the legacy class, imported directly.");

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
