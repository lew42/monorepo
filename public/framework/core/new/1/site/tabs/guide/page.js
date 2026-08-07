import { Page, p, input } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Guide",

	content(){
		p("Type something, switch tabs, come back:");
		input.c("probe").attr("placeholder", "type here…");
		p("Nothing is ever unmounted or rebuilt, so the DOM node and its form state stay put.").ac("note");
	}
});
