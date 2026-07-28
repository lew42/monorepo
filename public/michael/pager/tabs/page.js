import { Page, Pager, p, pre, div, button, h3 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Tabs",
	description: "A Pager is a tab panel.",
	content(){
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
