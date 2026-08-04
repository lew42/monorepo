import { Page, p, a } from "/app.js";
import { source } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Two",

	content(){
		source(import.meta);

		p("The other one. Nothing distinguishes us except that neither of us was imported until you clicked.");

		a.c("page-link", "← preview()").href("/nav/cards/");
	}
});
