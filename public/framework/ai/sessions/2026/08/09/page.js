import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "2026-08-09",
	description: "One demo system — five blocks, a recursive gallery, a right contextual panel, and the tasks to build it.",
	icon: "draw",

	content(){
		return md.file(import.meta, "proposal.md");
	},
});
