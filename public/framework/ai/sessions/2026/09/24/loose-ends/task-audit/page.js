import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Task audit",
	description: "176 tasks from 2026-09-17 to 2026-09-24, one Sonnet minion each, ranked by what is worth finishing.",
	icon: "checklist",

	content(){
		return md.file(import.meta, "report.md", { h1: false });
	},
});
