import { Page, p, div, a } from "/app.js";
import { code, section } from "../../../../../ui.js";
import { recipe } from "../../../../recipe.js";

const nav = () => ({
	meta: import.meta,
	title: "Fan-out",
	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("Batches' sibling, and the reason siblings matter here: click between us and watch column three stay exactly where it was. Neither of us is ever rebuilt.");

		section("Fan-out");

		code(`
emails.on("push", job => job.data.urgent && urgent.push(job.data));

// one producer, several queues, no broker: a handler that pushes.`);

		section("Measured");

		code(`
click Batches, then Fan-out, then Batches again
  ->  0 further module fetches (both are already imported)
  ->  concepts' scroll position unchanged
  ->  DOM order stays chain order: an ancestor is always appended first`);

		p("Pages are built once and only hidden, so a sibling swap costs a class change. That is also why an unsaved form survives navigating away — see the settings screen.").ac("note");

		div.c("row", () => {
			a.c("page-link", "Batches").href("/patterns/docs/guide/concepts/batches/");
			a.c("page-link", "Settings →").href("/patterns/settings/");
		});
	},
});
