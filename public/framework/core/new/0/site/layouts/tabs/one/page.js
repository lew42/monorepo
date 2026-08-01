import { Page, p, input } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "one",

	content(){
		p("Tab one. I am a normal Page — I have a url, I'm in the chain, and I know nothing about tabs.");
		input.c("probe").attr("placeholder", "type here, then switch tabs and come back");
		p("My parent hid me with `display:none` instead of removing me, so whatever you typed survives.").ac("note");
	}
});
