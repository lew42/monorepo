import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Report",
	description: "What the notifications lab found, and what is left for the phone.",
	icon: "description",
	content(){ return md.file(import.meta, "report.md"); },
});
