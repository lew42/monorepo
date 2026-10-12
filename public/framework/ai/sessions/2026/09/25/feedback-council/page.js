import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Feedback council",
	description: "Five checkers, 44 owner asks: which were done properly.",
	icon: "fact_check",

	content(){
		return md.file(import.meta, "verdicts.md", { h1: false });
	},
});
