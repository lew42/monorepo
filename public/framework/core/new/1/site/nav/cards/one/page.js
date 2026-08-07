import { Page, p, a } from "/app.js";
import { source } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "One",

	content(){
		source(import.meta);

		p("My title is `One`. Until this file was imported, my card on the page before said `one` — the name my parent declared me by.");

		p("Go back and look: because I am now in memory, that page draws my card from my title instead.").ac("note");

		a.c("page-link", "← preview()").href("/nav/cards/");
	}
});
