import { Page, p, a } from "/app.js";
import { source } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Eager",

	content(){
		source(import.meta);

		p("I was imported at the top of my parent's file, so I arrived with it. Clicking into me cost zero requests — check the network panel.");

		p("`children: [eager]` — my parent holds the object, not my name. `declare()` calls `add(this.name, this)`, which is the one place `parent` is assigned.").ac("note");

		a.c("page-link", "← children").href("/nav/children/");
	}
});
