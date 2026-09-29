import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Loose ends",
	description: "Every open item since 2026-08-08, each with the decision made and why.",
	icon: "checklist",

	content(){
		return md.file(import.meta, "report.md", { h1: false });
	},
});
